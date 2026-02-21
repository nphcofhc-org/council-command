import { json, methodNotAllowed } from "../../_lib/http";
import {
  ensureTreasuryTables,
  insertLiveTransactions,
  normalizeLiveBalances,
  normalizeLiveTransaction,
  upsertLiveBalances,
} from "../../_lib/treasury-store";

function readProvidedToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return (request.headers.get("x-treasury-token") || "").trim();
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  if (!env.DB) {
    return json({ error: 'Missing D1 binding "DB".' }, { status: 503 });
  }

  const expectedToken = String(env.TREASURY_INGEST_TOKEN || "").trim();
  if (!expectedToken) {
    return json({ error: 'Missing TREASURY_INGEST_TOKEN secret.' }, { status: 503 });
  }

  const providedToken = readProvidedToken(request);
  if (!providedToken || providedToken !== expectedToken) {
    return json({ error: "Unauthorized ingest token." }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const source = String(body?.source || body?.provider || "manual_ingest").trim().slice(0, 80);
  const balancesInput = normalizeLiveBalances(body?.balances);
  const incomingTransactions = Array.isArray(body?.transactions) ? body.transactions : [];
  const normalizedTransactions = incomingTransactions
    .map((raw) => normalizeLiveTransaction(raw, source))
    .filter(Boolean);

  if (!balancesInput && normalizedTransactions.length === 0) {
    return json({
      error: "Nothing to ingest. Provide balances and/or valid transactions.",
      expectedShape: {
        balances: { lendingClub: 0, cashApp: 0, paypal: 0, asOfLabel: "Optional label" },
        transactions: [
          {
            id: "optional-stable-id",
            account: "Cash App | PayPal | LendingClub",
            type: "credit | debit",
            amount: 30,
            date: "2026-02-21",
            description: "Donor contribution",
            category: "Deposit",
          },
        ],
      },
    }, { status: 400 });
  }

  await ensureTreasuryTables(env.DB);

  let savedBalances = null;
  if (balancesInput) {
    savedBalances = await upsertLiveBalances(
      env.DB,
      {
        ...balancesInput,
        asOfLabel: String(body?.balances?.asOfLabel || body?.asOfLabel || "").trim(),
        source,
      },
      "treasury-ingest",
    );
  }

  const { inserted } = await insertLiveTransactions(env.DB, normalizedTransactions);

  return json({
    ok: true,
    source,
    insertedTransactions: inserted,
    receivedTransactions: normalizedTransactions.length,
    balancesUpdated: Boolean(savedBalances),
    balances: savedBalances,
  });
}
