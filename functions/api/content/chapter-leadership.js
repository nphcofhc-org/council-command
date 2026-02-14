import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";

const SECTION_KEY = "chapter_leadership";

function requireDb(env) {
  if (!env.DB) {
    return json(
      { error: 'Missing D1 binding "DB". Add a D1 binding named DB in Cloudflare Pages settings.' },
      { status: 503 },
    );
  }
  return null;
}

async function ensureTable(db) {
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

function sanitizeText(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeMember(raw, fallbackPrefix, index) {
  const id = sanitizeText(raw?.id || `${fallbackPrefix}-${index + 1}`, 64) || `${fallbackPrefix}-${index + 1}`;
  const name = sanitizeText(raw?.name, 120);
  const title = sanitizeText(raw?.title, 120);
  const chapter = sanitizeText(raw?.chapter, 160);
  const email = sanitizeText(raw?.email, 160);
  const imageUrlRaw = sanitizeText(raw?.imageUrl, 2048);
  const imageUrl = imageUrlRaw || null;

  return { id, name, title, chapter, email: email || undefined, imageUrl };
}

function sanitizeList(list, prefix) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 40).map((entry, index) => sanitizeMember(entry, prefix, index));
}

function sanitizeContent(input) {
  return {
    executiveBoard: sanitizeList(input?.executiveBoard, "eb"),
    additionalChairs: sanitizeList(input?.additionalChairs, "ch"),
  };
}

async function readContent(db) {
  const row = await db
    .prepare(
      `SELECT payload_json, updated_at, updated_by
       FROM portal_content_state
       WHERE section_key = ?1`,
    )
    .bind(SECTION_KEY)
    .first();

  if (!row) {
    return {
      found: false,
      data: {
        executiveBoard: [],
        additionalChairs: [],
      },
      updatedAt: null,
      updatedBy: null,
    };
  }

  let parsed = { executiveBoard: [], additionalChairs: [] };
  try {
    parsed = JSON.parse(row.payload_json || "{}");
  } catch {
    parsed = { executiveBoard: [], additionalChairs: [] };
  }

  return {
    found: true,
    data: sanitizeContent(parsed),
    updatedAt: row.updated_at || null,
    updatedBy: row.updated_by || null,
  };
}

async function writeContent(db, email, payload) {
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
    .bind(SECTION_KEY, JSON.stringify(payload), now, email || null)
    .run();

  return {
    found: true,
    data: payload,
    updatedAt: now,
    updatedBy: email || null,
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET" && request.method !== "PUT") {
    return methodNotAllowed(["GET", "PUT"]);
  }

  const dbMissingResponse = requireDb(env);
  if (dbMissingResponse) return dbMissingResponse;

  await ensureTable(env.DB);

  if (request.method === "GET") {
    const content = await readContent(env.DB);
    return json(content);
  }

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }
  if (!session.isSiteEditor) {
    return json({ error: "Forbidden: site editor access required." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = sanitizeContent(body);
  const saved = await writeContent(env.DB, session.email, payload);
  return json(saved);
}
