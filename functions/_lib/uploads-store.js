import { json, methodNotAllowed } from "./http";
import { getSessionState } from "./auth";

export function requireMethods(request, allowed) {
  if (!allowed.includes(request.method)) return methodNotAllowed(allowed);
  return null;
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

export function requireReceiptsBucket(env) {
  if (!env.RECEIPTS_BUCKET) {
    return json(
      { error: 'Uploads are not configured. Add an R2 binding named "RECEIPTS_BUCKET" in Cloudflare Pages settings.' },
      { status: 503 },
    );
  }
  return null;
}

export async function requireAuthenticated(request, env) {
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return { ok: false, response: json({ error: "Unauthenticated." }, { status: 401 }) };
  }
  return { ok: true, session };
}

export async function ensureUploadsTable(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_uploads (
        object_key TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        owner_email TEXT,
        original_filename TEXT,
        content_type TEXT,
        size_bytes INTEGER
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_uploads_owner_created_at
       ON portal_uploads (owner_email, created_at DESC)`,
    )
    .run();
}

export async function insertUpload(db, row) {
  await db
    .prepare(
      `INSERT INTO portal_uploads (
        object_key, created_at, owner_email, original_filename, content_type, size_bytes
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(
      row.objectKey,
      row.createdAt,
      row.ownerEmail || null,
      row.originalFilename || null,
      row.contentType || null,
      Number.isFinite(row.sizeBytes) ? row.sizeBytes : null,
    )
    .run();
}

export async function readUpload(db, objectKey) {
  const row = await db
    .prepare(
      `SELECT object_key, created_at, owner_email, original_filename, content_type, size_bytes
       FROM portal_uploads
       WHERE object_key = ?1`,
    )
    .bind(objectKey)
    .first();

  if (!row) return { found: false, row: null };
  return {
    found: true,
    row: {
      objectKey: row.object_key,
      createdAt: row.created_at,
      ownerEmail: row.owner_email,
      originalFilename: row.original_filename,
      contentType: row.content_type,
      sizeBytes: row.size_bytes,
    },
  };
}

