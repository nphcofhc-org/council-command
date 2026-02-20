const ACCESS_OVERRIDES_SECTION_KEY = "access_overrides";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function parseOverrideFlag(value) {
  if (value === true || value === false) return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function sanitizeEntry(raw) {
  const email = normalizeEmail(raw?.email);
  if (!email) return null;

  return {
    email,
    isCouncilAdmin: parseOverrideFlag(raw?.isCouncilAdmin),
    isTreasuryAdmin: parseOverrideFlag(raw?.isTreasuryAdmin),
    isSiteEditor: parseOverrideFlag(raw?.isSiteEditor),
    isPresident: parseOverrideFlag(raw?.isPresident),
    note: String(raw?.note || "").trim(),
    updatedAt: String(raw?.updatedAt || "").trim() || null,
    updatedBy: String(raw?.updatedBy || "").trim() || null,
  };
}

async function ensureContentTable(db) {
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

export async function readAccessOverrides(db) {
  if (!db) return [];
  await ensureContentTable(db);

  const row = await db
    .prepare(
      `SELECT payload_json
       FROM portal_content_state
       WHERE section_key = ?1
       LIMIT 1`,
    )
    .bind(ACCESS_OVERRIDES_SECTION_KEY)
    .first();

  if (!row?.payload_json) return [];

  try {
    const parsed = JSON.parse(row.payload_json || "{}");
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    return entries.map(sanitizeEntry).filter(Boolean);
  } catch {
    return [];
  }
}

export async function writeAccessOverrides(db, entries, updatedBy) {
  if (!db) return { entries: [], updatedAt: null, updatedBy: null };
  await ensureContentTable(db);

  const sanitized = Array.isArray(entries) ? entries.map(sanitizeEntry).filter(Boolean) : [];
  const now = new Date().toISOString();
  const payload = { entries: sanitized };

  await db
    .prepare(
      `INSERT INTO portal_content_state (section_key, payload_json, updated_at, updated_by)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(section_key) DO UPDATE SET
         payload_json = excluded.payload_json,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(ACCESS_OVERRIDES_SECTION_KEY, JSON.stringify(payload), now, updatedBy || null)
    .run();

  return {
    entries: sanitized,
    updatedAt: now,
    updatedBy: updatedBy || null,
  };
}

export function applyAccessOverrides(baseSession, email, overrides) {
  const normalized = normalizeEmail(email);
  const entry = Array.isArray(overrides)
    ? overrides.find((item) => normalizeEmail(item?.email) === normalized)
    : null;

  if (!entry) return baseSession;

  const pick = (current, overrideValue) =>
    overrideValue === true || overrideValue === false ? overrideValue : current;

  return {
    ...baseSession,
    isCouncilAdmin: pick(baseSession.isCouncilAdmin, entry.isCouncilAdmin),
    isTreasuryAdmin: pick(baseSession.isTreasuryAdmin, entry.isTreasuryAdmin),
    isSiteEditor: pick(baseSession.isSiteEditor, entry.isSiteEditor),
    isPresident: pick(baseSession.isPresident, entry.isPresident),
  };
}
