import { json, methodNotAllowed } from "./http";
import { getSessionState } from "./auth";

export async function ensureContentTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_content_state (
        section_key TEXT PRIMARY KEY,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by TEXT
      )`,
    )
    .run();
}

export function requireDb(env) {
  if (!env.DB) {
    return json(
      { error: 'Missing D1 binding "DB". Add a D1 binding named DB in Cloudflare Pages settings.' },
      { status: 503 },
    );
  }
  return null;
}

export async function requireCouncilAdmin(request, env) {
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return { ok: false, response: json({ error: "Unauthenticated." }, { status: 401 }) };
  }
  if (!session.isCouncilAdmin) {
    return { ok: false, response: json({ error: "Forbidden: council admin access required." }, { status: 403 }) };
  }
  return { ok: true, session };
}

export function requireMethods(request, allowed) {
  if (!allowed.includes(request.method)) {
    return methodNotAllowed(allowed);
  }
  return null;
}

export async function readSection(db, sectionKey) {
  const row = await db
    .prepare(
      `SELECT payload_json, updated_at, updated_by
       FROM portal_content_state
       WHERE section_key = ?1`,
    )
    .bind(sectionKey)
    .first();

  if (!row) {
    return { found: false, data: null, updatedAt: null, updatedBy: null };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(row.payload_json || "null");
  } catch {
    parsed = null;
  }

  return {
    found: true,
    data: parsed,
    updatedAt: row.updated_at || null,
    updatedBy: row.updated_by || null,
  };
}

export async function writeSection(db, sectionKey, payload, email) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO portal_content_state (section_key, payload_json, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(section_key) DO UPDATE SET
         payload_json = excluded.payload_json,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(sectionKey, JSON.stringify(payload), now, email || null)
    .run();

  return {
    found: true,
    data: payload,
    updatedAt: now,
    updatedBy: email || null,
  };
}

