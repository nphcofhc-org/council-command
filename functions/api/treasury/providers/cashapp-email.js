import { json, methodNotAllowed } from "../../../_lib/http";
import treasuryData from "../../../_lib/treasury-data.json";
import {
  ensureTreasuryTables,
  insertLiveTransactions,
  normalizeLiveTransaction,
  readLiveTreasuryState,
  upsertLiveBalances,
} from "../../../_lib/treasury-store";

function readToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const headerToken = (request.headers.get("x-treasury-token") || "").trim();
  if (headerToken) return headerToken;
  const url = new URL(request.url);
  return String(url.searchParams.get("token") || "").trim();
}

function extractAmount(text) {
  const raw = String(text || "");
  const m = raw.match(/\$([0-9]+(?:\.[0-9]{1,2})?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function inferType(subject, body) {
  const text = `${String(subject || "")}\n${String(body || "")}`.toLowerCase();
  if (
    text.includes("you paid") ||
    text.includes("payment sent") ||
    text.includes("refund sent") ||
    text.includes("withdrawal")
  ) return "debit";
  if (
    text.includes("you received") ||
    text.includes("payment received") ||
    text.includes("deposit") ||
    text.includes("cash out failed reversal")
  ) return "credit";
  return "";
}

function parseInboundEmail(body) {
  const subject = String(body?.subject || "").trim();
  const emailBody = String(body?.body || body?.text || "").trim();
  const amount = Number(body?.amount);
  const normalizedAmount = Number.isFinite(amount) && amount > 0 ? amount : extractAmount(`${subject}\n${emailBody}`);
  const type = String(body?.type || "").trim().toLowerCase() || inferType(subject, emailBody);
  const parsedType = type === "credit" || type === "debit" ? type : "";
  const date = String(body?.date || body?.receivedAt || new Date().toISOString());
  const description = `${subject || "Cash App email"}${emailBody ? ` · ${emailBody.slice(0, 120)}` : ""}`.slice(0, 300);
  const category = String(body?.category || (parsedType === "debit" ? "Expense" : "Deposit") || "Deposit");

  if (!normalizedAmount || !parsedType) return null;

  return normalizeLiveTransaction(
    {
      id: String(body?.id || body?.messageId || ""),
      account: "Cash App",
      type: parsedType,
      amount: normalizedAmount,
      date,
      description,
      category,
      provider: "cashapp_email",
      raw: body,
    },
    "Cash App",
  );
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!env.DB) return json({ error: 'Missing D1 binding "DB".' }, { status: 503 });

  const expectedToken = String(env.TREASURY_INGEST_TOKEN || "").trim();
  if (!expectedToken) return json({ error: "Missing TREASURY_INGEST_TOKEN secret." }, { status: 503 });

  const providedToken = readToken(request);
  if (!providedToken || providedToken !== expectedToken) {
    return json({ error: "Unauthorized ingest token." }, { status: 401 });
  }

  let payload = {};
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const tx = parseInboundEmail(payload);
  if (!tx) {
    return json({
      ok: true,
      skipped: true,
      reason: "Unable to parse amount/type from email payload.",
      expectedShape: {
        subject: "You received $30",
        body: "Cash App payment details...",
        date: "2026-02-21T20:05:00Z",
      },
    });
  }

  await ensureTreasuryTables(env.DB);
  const { inserted } = await insertLiveTransactions(env.DB, [tx]);

  let balancesUpdated = false;
  let cashAppBalance = null;
  if (inserted > 0) {
    const live = await readLiveTreasuryState(env.DB, 1);
    const fallbackBalances = treasuryData?.TREASURY?.balances || {};
    const current = live?.balances || {
      lendingClub: Number(fallbackBalances?.lendingClub || 0),
      cashApp: Number(fallbackBalances?.cashApp || 0),
      paypal: Number(fallbackBalances?.paypal || 0),
    };
    const delta = tx.type === "credit" ? tx.amount : -tx.amount;
    cashAppBalance = Number((Number(current.cashApp || 0) + delta).toFixed(2));

    await upsertLiveBalances(
      env.DB,
      {
        lendingClub: Number(current.lendingClub || 0),
        cashApp: cashAppBalance,
        paypal: Number(current.paypal || 0),
        asOfLabel: `Live sync from Cash App email ingest · ${new Date().toLocaleString("en-US")}`,
        source: "cashapp_email",
      },
      "cashapp-email",
    );
    balancesUpdated = true;
  }

  return json({
    ok: true,
    insertedTransactions: inserted,
    balancesUpdated,
    cashAppBalance,
  });
}
