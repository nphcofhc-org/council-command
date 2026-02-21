import { json, methodNotAllowed } from "./http";
import { getSessionState } from "./auth";

export const FORM_KEYS = [
  "budget_submission",
  "reimbursement_request",
  "social_media_request",
  "committee_report",
  "event_submission",
  "event_proposal_budget_request",
  "event_post_report_financial_reconciliation",
];

export function requireDb(env) {
  if (!env.DB) {
    return json(
      { error: 'Missing D1 binding "DB". Add a D1 binding named DB in Cloudflare Pages settings.' },
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

export async function ensureFormsTables(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_form_submissions (
        id TEXT PRIMARY KEY,
        form_key TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT,
        status TEXT NOT NULL,
        reviewed_at TEXT,
        reviewed_by TEXT,
        review_notes TEXT
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_form_submissions_form_key_created_at
       ON portal_form_submissions (form_key, created_at DESC)`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_form_submissions_form_key_status
       ON portal_form_submissions (form_key, status)`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_form_submissions_created_by_created_at
       ON portal_form_submissions (created_by, created_at DESC)`,
    )
    .run();
}

export function sanitizeFormKey(value) {
  const key = String(value || "").trim().toLowerCase();
  return FORM_KEYS.includes(key) ? key : "";
}

export function sanitizeStatus(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.slice(0, 60);
}

export function safeJsonStringify(payload, maxBytes = 48_000) {
  const encoded = JSON.stringify(payload ?? {});
  if (encoded.length > maxBytes) {
    throw new Error("Submission is too large. Remove attachments and submit links instead.");
  }
  return encoded;
}

export async function insertSubmission(db, { formKey, payload, createdBy }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const payloadJson = safeJsonStringify(payload);

  await db
    .prepare(
      `INSERT INTO portal_form_submissions (
        id, form_key, payload_json, created_at, created_by, status
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(id, formKey, payloadJson, now, createdBy || null, "Submitted")
    .run();

  return { id, createdAt: now, status: "Submitted" };
}

export async function listSubmissions(db, { formKey, status, createdBy, limit = 50, offset = 0 }) {
  const lim = Math.max(1, Math.min(200, Math.trunc(Number(limit) || 50)));
  const off = Math.max(0, Math.trunc(Number(offset) || 0));

  const where = [];
  const params = [];

  if (formKey) {
    where.push("form_key = ?1");
    params.push(formKey);
  }

  if (status) {
    where.push(`status = ?${params.length + 1}`);
    params.push(status);
  }

  if (createdBy) {
    where.push(`created_by = ?${params.length + 1}`);
    params.push(createdBy);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const stmt = db
    .prepare(
      `SELECT id, form_key, payload_json, created_at, created_by, status, reviewed_at, reviewed_by, review_notes
       FROM portal_form_submissions
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${lim} OFFSET ${off}`,
    )
    .bind(...params);

  const rows = await stmt.all();
  const results = Array.isArray(rows?.results) ? rows.results : [];

  return results.map((r) => {
    let payload = null;
    try {
      payload = JSON.parse(r.payload_json || "null");
    } catch {
      payload = null;
    }
    return {
      id: r.id,
      formKey: r.form_key,
      payload,
      createdAt: r.created_at,
      createdBy: r.created_by,
      status: r.status,
      reviewedAt: r.reviewed_at,
      reviewedBy: r.reviewed_by,
      reviewNotes: r.review_notes,
    };
  });
}

export async function updateSubmission(db, { id, status, reviewNotes, reviewedBy }) {
  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE portal_form_submissions
       SET status = ?2,
           review_notes = ?3,
           reviewed_at = ?4,
           reviewed_by = ?5
       WHERE id = ?1`,
    )
    .bind(id, status, reviewNotes || null, now, reviewedBy || null)
    .run();

  return { ok: true, id, status, reviewedAt: now, reviewedBy: reviewedBy || null, reviewNotes: reviewNotes || null };
}

export async function readSubmissionById(db, id) {
  const row = await db
    .prepare(
      `SELECT id, form_key, payload_json, created_at, created_by, status, reviewed_at, reviewed_by, review_notes
       FROM portal_form_submissions
       WHERE id = ?1`,
    )
    .bind(id)
    .first();

  if (!row) return { found: false, row: null };

  let payload = null;
  try {
    payload = JSON.parse(row.payload_json || "null");
  } catch {
    payload = null;
  }

  return {
    found: true,
    row: {
      id: row.id,
      formKey: row.form_key,
      payload,
      createdAt: row.created_at,
      createdBy: row.created_by,
      status: row.status,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
    },
  };
}
