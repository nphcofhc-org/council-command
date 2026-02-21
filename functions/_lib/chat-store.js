function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export async function ensureChatTable(db) {
  if (!db) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_chat_messages (
        id TEXT PRIMARY KEY,
        body TEXT NOT NULL,
        media_url TEXT,
        created_at TEXT NOT NULL,
        created_by TEXT
      )`,
    )
    .run();

  await db
    .prepare(`CREATE INDEX IF NOT EXISTS idx_portal_chat_messages_created_at ON portal_chat_messages(created_at DESC)`)
    .run();
}

export async function listChatMessages(db, limit = 120) {
  await ensureChatTable(db);
  const lim = Math.max(1, Math.min(250, Math.trunc(Number(limit) || 120)));
  const rows = await db
    .prepare(
      `SELECT
        m.id,
        m.body,
        m.media_url AS mediaUrl,
        m.created_at AS createdAt,
        m.created_by AS createdBy,
        p.first_name AS firstName,
        p.last_name AS lastName
       FROM portal_chat_messages m
       LEFT JOIN portal_member_profiles p
         ON LOWER(p.email) = LOWER(m.created_by)
       ORDER BY m.created_at DESC
       LIMIT ?1`,
    )
    .bind(lim)
    .all();

  return (rows?.results || [])
    .map((row) => {
      const fullName = `${t(row?.firstName, 80)} ${t(row?.lastName, 80)}`.trim();
      return {
        id: String(row?.id || ""),
        body: t(row?.body, 8000),
        mediaUrl: t(row?.mediaUrl, 1800),
        createdAt: String(row?.createdAt || ""),
        createdBy: normalizeEmail(row?.createdBy),
        displayName: fullName || "",
      };
    })
    .reverse();
}

export async function insertChatMessage(db, input) {
  await ensureChatTable(db);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const body = t(input?.body, 8000);
  const mediaUrl = t(input?.mediaUrl, 1800);
  const createdBy = normalizeEmail(input?.createdBy);
  if (!body) throw new Error("Message text is required.");
  if (!createdBy) throw new Error("Authenticated user is required.");

  await db
    .prepare(
      `INSERT INTO portal_chat_messages (id, body, media_url, created_at, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(id, body, mediaUrl || null, now, createdBy)
    .run();

  return { id, createdAt: now };
}
