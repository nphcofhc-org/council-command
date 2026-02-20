import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";
import { readAccessOverrides, writeAccessOverrides } from "../../_lib/access-controls";
import { readActivityMetrics } from "../../_lib/activity-store";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function requirePresident(request, env) {
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return { ok: false, response: json({ error: "Unauthenticated." }, { status: 401 }) };
  }
  if (!session.isPresident) {
    return { ok: false, response: json({ error: "Forbidden: president access required." }, { status: 403 }) };
  }
  return { ok: true, session };
}

async function readKnownUsers(db, fallbackEmail) {
  if (!db) return fallbackEmail ? [fallbackEmail] : [];

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

  const sectionKeys = ["member_directory", "chapter_leadership"];
  const rows = await db
    .prepare(
      `SELECT section_key, payload_json
       FROM portal_content_state
       WHERE section_key IN (?1, ?2)`,
    )
    .bind(sectionKeys[0], sectionKeys[1])
    .all();

  const emails = new Set();
  if (fallbackEmail) emails.add(normalizeEmail(fallbackEmail));

  for (const row of rows?.results || []) {
    let parsed = null;
    try {
      parsed = JSON.parse(row?.payload_json || "{}");
    } catch {
      parsed = null;
    }
    if (!parsed) continue;

    if (row.section_key === "member_directory") {
      const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
      for (const entry of entries) {
        const email = normalizeEmail(entry?.email);
        if (email) emails.add(email);
      }
      continue;
    }

    const boards = Array.isArray(parsed.executiveBoard) ? parsed.executiveBoard : [];
    const chairs = Array.isArray(parsed.additionalChairs) ? parsed.additionalChairs : [];
    for (const entry of [...boards, ...chairs]) {
      const email = normalizeEmail(entry?.email);
      if (email) emails.add(email);
    }
  }

  return Array.from(emails).sort();
}

export async function onRequest({ request, env }) {
  if (!["GET", "PUT"].includes(request.method)) {
    return methodNotAllowed(["GET", "PUT"]);
  }

  if (!env.DB) {
    return json({ error: 'Missing D1 binding "DB".' }, { status: 503 });
  }

  const auth = await requirePresident(request, env);
  if (!auth.ok) return auth.response;

  if (request.method === "GET") {
    const [overrides, metrics, knownUsers] = await Promise.all([
      readAccessOverrides(env.DB),
      readActivityMetrics(env.DB),
      readKnownUsers(env.DB, auth.session.email),
    ]);

    return json({
      overrides,
      metrics,
      knownUsers,
      viewer: auth.session.email || null,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entries = Array.isArray(body?.entries) ? body.entries : null;
  if (!entries) {
    return json({ error: "Expected payload shape: { entries: [...] }" }, { status: 400 });
  }

  const saved = await writeAccessOverrides(env.DB, entries, auth.session.email || null);
  return json({
    saved: true,
    entries: saved.entries,
    updatedAt: saved.updatedAt,
    updatedBy: saved.updatedBy,
  });
}
