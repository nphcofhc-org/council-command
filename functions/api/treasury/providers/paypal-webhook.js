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

function parsePayPalEvent(input) {
  const eventType = String(input?.event_type || "").trim();
  const resource = input?.resource || {};
  const amountRaw = resource?.amount?.value ?? resource?.amount?.total ?? resource?.seller_receivable_breakdown?.gross_amount?.value;
  const currency = String(resource?.amount?.currency_code || resource?.amount?.currency || "USD").trim().toUpperCase();
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const isRefund = eventType.includes("REFUND");
  const type = isRefund ? "debit" : "credit";
  const date = String(resource?.create_time || resource?.update_time || input?.create_time || new Date().toISOString());
  const descriptionParts = [
    eventType || "PAYPAL_EVENT",
    resource?.status ? `status:${String(resource.status)}` : "",
    resource?.id ? `id:${String(resource.id)}` : "",
    resource?.custom_id ? `custom:${String(resource.custom_id)}` : "",
    currency ? `currency:${currency}` : "",
  ].filter(Boolean);
  const description = descriptionParts.join(" · ").slice(0, 300);

  return normalizeLiveTransaction(
    {
      id: String(input?.id || resource?.id || ""),
      account: "PayPal",
      type,
      amount,
      date,
      description,
      category: isRefund ? "Refund" : "Deposit",
      provider: "paypal_webhook",
      raw: input,
    },
    "PayPal",
  );
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!env.DB) return json({ error: 'Missing D1 binding "DB".' }, { status: 503 });

  const expectedToken = String(env.TREASURY_INGEST_TOKEN || "").trim();
  if (!expectedToken) return json({ error: "Missing TREASURY_INGEST_TOKEN secret." }, { status: 503 });

  const providedToken = readToken(request);
  if (!providedToken || providedToken !== expectedToken) {
    return json({ error: "Unauthorized webhook token." }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const tx = parsePayPalEvent(body);
  if (!tx) {
    return json({ ok: true, skipped: true, reason: "Event did not include a supported amount payload." });
  }

  await ensureTreasuryTables(env.DB);
  const { inserted } = await insertLiveTransactions(env.DB, [tx]);

  let balancesUpdated = false;
  let nextBalance = null;
  if (inserted > 0) {
    const live = await readLiveTreasuryState(env.DB, 1);
    const fallbackBalances = treasuryData?.TREASURY?.balances || {};
    const current = live?.balances || {
      lendingClub: Number(fallbackBalances?.lendingClub || 0),
      cashApp: Number(fallbackBalances?.cashApp || 0),
      paypal: Number(fallbackBalances?.paypal || 0),
    };
    const delta = tx.type === "credit" ? tx.amount : -tx.amount;
    nextBalance = Number((Number(current.paypal || 0) + delta).toFixed(2));

    await upsertLiveBalances(
      env.DB,
      {
        lendingClub: Number(current.lendingClub || 0),
        cashApp: Number(current.cashApp || 0),
        paypal: nextBalance,
        asOfLabel: `Live sync from PayPal webhook · ${new Date().toLocaleString("en-US")}`,
        source: "paypal_webhook",
      },
      "paypal-webhook",
    );
    balancesUpdated = true;
  }

  return json({
    ok: true,
    insertedTransactions: inserted,
    balancesUpdated,
    paypalBalance: nextBalance,
  });
}
