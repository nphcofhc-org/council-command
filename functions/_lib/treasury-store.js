const BALANCE_ROW_ID = "primary";
const ACCOUNT_MAP = new Map([
  ["lendingclub", "LendingClub"],
  ["lending_club", "LendingClub"],
  ["lending club", "LendingClub"],
  ["cashapp", "Cash App"],
  ["cash_app", "Cash App"],
  ["cash app", "Cash App"],
  ["paypal", "PayPal"],
]);

function normalizeAccount(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  return ACCOUNT_MAP.get(raw) || "";
}

function normalizeType(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "credit" || raw === "deposit" || raw === "inflow" || raw === "incoming") return "credit";
  if (raw === "debit" || raw === "withdrawal" || raw === "outflow" || raw === "outgoing") return "debit";
  return "";
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function clampText(value, max = 255) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.slice(0, max);
}

function normalizeAmount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(Math.abs(numeric) * 100) / 100;
}

function normalizeBalance(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100) / 100;
}

export async function ensureTreasuryTables(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_treasury_live_balances (
        id TEXT PRIMARY KEY,
        lending_club REAL NOT NULL DEFAULT 0,
        cash_app REAL NOT NULL DEFAULT 0,
        paypal REAL NOT NULL DEFAULT 0,
        as_of_label TEXT,
        source TEXT,
        updated_at TEXT NOT NULL,
        updated_by TEXT
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_treasury_live_transactions (
        id TEXT PRIMARY KEY,
        posted_date TEXT NOT NULL,
        account TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT,
        provider TEXT,
        raw_json TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_treasury_live_transactions_posted_date
       ON portal_treasury_live_transactions (posted_date DESC, created_at DESC)`,
    )
    .run();
}

export function normalizeLiveTransaction(raw, fallbackProvider = "") {
  const account = normalizeAccount(raw?.account || raw?.sourceAccount || raw?.accountName || fallbackProvider);
  const type = normalizeType(raw?.type || raw?.direction || raw?.flow);
  const amount = normalizeAmount(raw?.amount || raw?.gross || raw?.value);
  const postedDate = normalizeDate(raw?.postedDate || raw?.date || raw?.createdAt || raw?.occurredAt);
  const description = clampText(raw?.description || raw?.memo || raw?.title || raw?.name, 320);
  const category = clampText(raw?.category || raw?.kind || "Uncategorized", 120);
  const provider = clampText(raw?.provider || fallbackProvider, 80);
  const sourceId = clampText(raw?.id || raw?.transactionId || raw?.externalId, 160);

  if (!account || !type || amount === null || !postedDate || !description) return null;

  const txId = sourceId || `${provider || account}-${postedDate}-${type}-${Math.round(amount * 100)}-${description.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;

  return {
    id: txId,
    postedDate,
    account,
    type,
    amount,
    description,
    category,
    provider: provider || null,
    rawJson: JSON.stringify(raw ?? {}),
  };
}

export function normalizeLiveBalances(raw) {
  if (!raw || typeof raw !== "object") return null;
  const lendingClub = normalizeBalance(raw.lendingClub ?? raw.lending_club ?? raw.lendingclub);
  const cashApp = normalizeBalance(raw.cashApp ?? raw.cash_app ?? raw.cashapp);
  const paypal = normalizeBalance(raw.paypal ?? raw.payPal);

  if (lendingClub === null && cashApp === null && paypal === null) return null;

  return {
    lendingClub: lendingClub ?? 0,
    cashApp: cashApp ?? 0,
    paypal: paypal ?? 0,
  };
}

export async function upsertLiveBalances(db, input, updatedBy = null) {
  const now = new Date().toISOString();
  const asOfLabel = clampText(input?.asOfLabel, 160) || null;
  const source = clampText(input?.source, 120) || null;

  await db
    .prepare(
      `INSERT INTO portal_treasury_live_balances (
        id, lending_club, cash_app, paypal, as_of_label, source, updated_at, updated_by
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
      ON CONFLICT(id) DO UPDATE SET
        lending_club = excluded.lending_club,
        cash_app = excluded.cash_app,
        paypal = excluded.paypal,
        as_of_label = excluded.as_of_label,
        source = excluded.source,
        updated_at = excluded.updated_at,
        updated_by = excluded.updated_by`,
    )
    .bind(BALANCE_ROW_ID, input.lendingClub, input.cashApp, input.paypal, asOfLabel, source, now, updatedBy || null)
    .run();

  return {
    lendingClub: input.lendingClub,
    cashApp: input.cashApp,
    paypal: input.paypal,
    asOfLabel,
    source,
    updatedAt: now,
    updatedBy: updatedBy || null,
  };
}

export async function insertLiveTransactions(db, entries) {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) return { inserted: 0 };

  const now = new Date().toISOString();
  const statements = list.map((entry) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO portal_treasury_live_transactions (
          id, posted_date, account, type, amount, description, category, provider, raw_json, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
      )
      .bind(
        entry.id,
        entry.postedDate,
        entry.account,
        entry.type,
        entry.amount,
        entry.description,
        entry.category || null,
        entry.provider || null,
        entry.rawJson || "{}",
        now,
      ),
  );

  const results = await db.batch(statements);
  const inserted = results.reduce((count, row) => count + (row?.meta?.changes ? 1 : 0), 0);
  return { inserted };
}

export async function readLiveTreasuryState(db, limit = 400) {
  await ensureTreasuryTables(db);

  const max = Math.max(1, Math.min(2000, Math.trunc(Number(limit) || 400)));
  const [balanceRow, txRows] = await Promise.all([
    db
      .prepare(
        `SELECT lending_club, cash_app, paypal, as_of_label, source, updated_at, updated_by
         FROM portal_treasury_live_balances
         WHERE id = ?1`,
      )
      .bind(BALANCE_ROW_ID)
      .first(),
    db
      .prepare(
        `SELECT id, posted_date, account, type, amount, description, category, provider, created_at
         FROM portal_treasury_live_transactions
         ORDER BY posted_date DESC, created_at DESC
         LIMIT ${max}`,
      )
      .all(),
  ]);

  const balances = balanceRow
    ? {
      lendingClub: Number(balanceRow.lending_club || 0),
      cashApp: Number(balanceRow.cash_app || 0),
      paypal: Number(balanceRow.paypal || 0),
      asOfLabel: balanceRow.as_of_label ? String(balanceRow.as_of_label) : null,
      source: balanceRow.source ? String(balanceRow.source) : null,
      updatedAt: balanceRow.updated_at ? String(balanceRow.updated_at) : null,
      updatedBy: balanceRow.updated_by ? String(balanceRow.updated_by) : null,
    }
    : null;

  const transactions = Array.isArray(txRows?.results)
    ? txRows.results.map((row) => ({
      id: String(row.id),
      date: String(row.posted_date),
      account: String(row.account),
      type: String(row.type),
      amount: Number(row.amount || 0),
      description: String(row.description || ""),
      category: String(row.category || "Uncategorized"),
      provider: row.provider ? String(row.provider) : null,
      createdAt: row.created_at ? String(row.created_at) : null,
    }))
    : [];

  return {
    balances,
    transactions,
    hasLiveData: Boolean(balances) || transactions.length > 0,
  };
}
