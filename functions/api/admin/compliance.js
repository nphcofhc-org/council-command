import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";

const STATE_KEY = "global";

function sanitizeCheckedItems(input) {
  if (!input || typeof input !== "object") return {};

  const out = {};
  let count = 0;
  for (const [rawKey, rawValue] of Object.entries(input)) {
    const key = String(rawKey).trim();
    if (!key) continue;
    out[key] = Boolean(rawValue);
    count += 1;
    if (count >= 500) break;
  }
  return out;
}

async function ensureTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS council_compliance_state (
        key TEXT PRIMARY KEY,
        checked_items_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT
      )`,
    )
    .run();
}

async function readState(db) {
  const row = await db
    .prepare(
      `SELECT checked_items_json, updated_at, updated_by
       FROM council_compliance_state
       WHERE key = ?1`,
    )
    .bind(STATE_KEY)
    .first();

  if (!row) {
    return {
      checkedItems: {},
      updatedAt: null,
      updatedBy: null,
    };
  }

  let checkedItems = {};
  try {
    checkedItems = JSON.parse(row.checked_items_json || "{}");
  } catch {
    checkedItems = {};
  }

  return {
    checkedItems: sanitizeCheckedItems(checkedItems),
    updatedAt: row.updated_at || null,
    updatedBy: row.updated_by || null,
  };
}

async function writeState(db, email, checkedItems) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO council_compliance_state (key, checked_items_json, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(key) DO UPDATE SET
         checked_items_json = excluded.checked_items_json,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(STATE_KEY, JSON.stringify(checkedItems), now, email || null)
    .run();

  return {
    checkedItems,
    updatedAt: now,
    updatedBy: email || null,
  };
}

function requireCouncilAdmin(request, env) {
  const session = getSessionState(request, env);
  if (!session.isAuthenticated) {
    return {
      ok: false,
      response: json({ error: "Unauthenticated." }, { status: 401 }),
    };
  }
  if (!session.isCouncilAdmin) {
    return {
      ok: false,
      response: json({ error: "Forbidden: council admin access required." }, { status: 403 }),
    };
  }

  return { ok: true, session };
}

function requireDatabase(env) {
  if (!env.DB) {
    return json(
      {
        error:
          'Missing D1 binding "DB". Add a D1 binding named DB in Cloudflare Pages settings.',
      },
      { status: 503 },
    );
  }
  return null;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET" && request.method !== "PUT") {
    return methodNotAllowed(["GET", "PUT"]);
  }

  const auth = requireCouncilAdmin(request, env);
  if (!auth.ok) return auth.response;

  const dbResponse = requireDatabase(env);
  if (dbResponse) return dbResponse;

  await ensureTable(env.DB);

  if (request.method === "GET") {
    const state = await readState(env.DB);
    return json(state);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const checkedItems = sanitizeCheckedItems(body?.checkedItems);
  const saved = await writeState(env.DB, auth.session.email, checkedItems);
  return json(saved);
}
