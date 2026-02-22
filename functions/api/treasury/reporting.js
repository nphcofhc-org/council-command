import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";
import { getSessionState } from "../../_lib/auth";

const SECTION_KEY = "treasury_reporting_tools";

function t(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function asBool(value) {
  if (value === true) return true;
  if (value === false) return false;
  const s = String(value || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

function asAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function asDate(value) {
  const s = t(value, 20);
  if (!s) return "";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function statementSortKey(entry) {
  return String(entry.periodEnd || entry.statementDate || entry.periodStart || entry.createdAt || "");
}

function sanitizeStatement(input, idx = 0) {
  const accountRaw = t(input?.account, 40);
  const account = accountRaw === "Cash App" ? "Cash App" : "LendingClub";
  const periodStart = asDate(input?.periodStart);
  const periodEnd = asDate(input?.periodEnd);
  const statementDate = asDate(input?.statementDate);
  const label = t(input?.label, 140) || `${account} Statement${periodEnd ? ` (${periodEnd})` : ""}`;
  const url = t(input?.url, 2000);
  const notes = t(input?.notes, 2000);
  const openingBalance = asAmount(input?.openingBalance);
  const closingBalance = asAmount(input?.closingBalance);
  const id = t(input?.id, 80) || `stmt-${Date.now()}-${idx}`;
  const createdAt = t(input?.createdAt, 40) || new Date().toISOString();
  const reconciled = asBool(input?.reconciled);

  return {
    id,
    account,
    label,
    periodStart,
    periodEnd,
    statementDate,
    url,
    notes,
    openingBalance,
    closingBalance,
    reconciled,
    createdAt,
  };
}

function sanitizeOnePager(input, idx = 0) {
  const id = t(input?.id, 80) || `pager-${Date.now()}-${idx}`;
  return {
    id,
    title: t(input?.title, 160) || "Treasury One-Pager",
    year: t(input?.year, 10),
    body: t(input?.body, 24000),
    generatedAt: t(input?.generatedAt, 40) || new Date().toISOString(),
  };
}

function sanitizePayload(input) {
  const raw = input && typeof input === "object" ? input : {};
  const statements = Array.isArray(raw.statements) ? raw.statements : [];
  const onePagers = Array.isArray(raw.onePagers) ? raw.onePagers : [];

  const nextStatements = statements
    .slice(0, 100)
    .map((entry, idx) => sanitizeStatement(entry, idx))
    .sort((a, b) => (statementSortKey(a) < statementSortKey(b) ? 1 : statementSortKey(a) > statementSortKey(b) ? -1 : 0));

  const nextOnePagers = onePagers
    .slice(0, 50)
    .map((entry, idx) => sanitizeOnePager(entry, idx))
    .filter((entry) => entry.body.length > 0)
    .sort((a, b) => (String(a.generatedAt) < String(b.generatedAt) ? 1 : String(a.generatedAt) > String(b.generatedAt) ? -1 : 0));

  return {
    statements: nextStatements,
    onePagers: nextOnePagers,
  };
}

async function requireTreasuryAdmin(request, env) {
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return { ok: false, response: json({ error: "Unauthenticated." }, { status: 401 }) };
  }
  if (!session.isTreasuryAdmin) {
    return { ok: false, response: json({ error: "Forbidden: treasury admin access required." }, { status: 403 }) };
  }
  return { ok: true, session };
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET", "PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureContentTable(env.DB);

  const auth = await requireTreasuryAdmin(request, env);
  if (!auth.ok) return auth.response;

  if (request.method === "GET") {
    const payload = await readSection(env.DB, SECTION_KEY);
    if (!payload.found) {
      return json({
        found: false,
        data: { statements: [], onePagers: [] },
        updatedAt: null,
        updatedBy: null,
      });
    }
    return json({
      found: true,
      data: sanitizePayload(payload.data || {}),
      updatedAt: payload.updatedAt,
      updatedBy: payload.updatedBy,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const sanitized = sanitizePayload(body || {});
  const saved = await writeSection(env.DB, SECTION_KEY, sanitized, auth.session.email);
  return json(saved);
}
