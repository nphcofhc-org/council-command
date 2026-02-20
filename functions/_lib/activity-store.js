function clampText(value, max = 255) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.slice(0, max);
}

function maskIp(rawIp) {
  const value = String(rawIp || "").trim();
  if (!value) return "";

  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  }
  if (value.includes(":")) {
    const parts = value.split(":").filter(Boolean);
    if (parts.length > 2) return `${parts.slice(0, 2).join(":")}::`;
  }
  return value.slice(0, 24);
}

export async function ensureActivityTable(db) {
  if (!db) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        event_type TEXT NOT NULL,
        path TEXT,
        user_agent TEXT,
        ip_mask TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_portal_activity_created_at ON portal_activity_log(created_at)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_portal_activity_email ON portal_activity_log(email)`).run();
}

export async function recordActivity(db, input) {
  if (!db) return;
  await ensureActivityTable(db);

  const now = new Date().toISOString();
  const email = clampText(input?.email, 320).toLowerCase() || null;
  const eventType = clampText(input?.eventType || "page_view", 40) || "page_view";
  const path = clampText(input?.path || "", 240) || null;
  const userAgent = clampText(input?.userAgent || "", 500) || null;
  const ipMask = maskIp(input?.ip || "");

  await db
    .prepare(
      `INSERT INTO portal_activity_log (email, event_type, path, user_agent, ip_mask, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    )
    .bind(email, eventType, path, userAgent, ipMask || null, now)
    .run();
}

export async function readActivityMetrics(db) {
  if (!db) {
    return {
      pageViews24h: 0,
      pageViews7d: 0,
      distinctUsers7d: 0,
      activeUsers15m: 0,
      topPages7d: [],
      recentActivity: [],
    };
  }

  await ensureActivityTable(db);

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since15m = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const [views24h, views7d, users7d, activeUsers, topPages, recent] = await Promise.all([
    db
      .prepare(`SELECT COUNT(*) AS count FROM portal_activity_log WHERE event_type = 'page_view' AND created_at >= ?1`)
      .bind(since24h)
      .first(),
    db
      .prepare(`SELECT COUNT(*) AS count FROM portal_activity_log WHERE event_type = 'page_view' AND created_at >= ?1`)
      .bind(since7d)
      .first(),
    db
      .prepare(`SELECT COUNT(DISTINCT email) AS count FROM portal_activity_log WHERE email IS NOT NULL AND created_at >= ?1`)
      .bind(since7d)
      .first(),
    db
      .prepare(`SELECT COUNT(DISTINCT email) AS count FROM portal_activity_log WHERE email IS NOT NULL AND created_at >= ?1`)
      .bind(since15m)
      .first(),
    db
      .prepare(
        `SELECT path, COUNT(*) AS hits
         FROM portal_activity_log
         WHERE event_type = 'page_view'
           AND created_at >= ?1
           AND path IS NOT NULL
         GROUP BY path
         ORDER BY hits DESC
         LIMIT 8`,
      )
      .bind(since7d)
      .all(),
    db
      .prepare(
        `SELECT email, event_type, path, created_at
         FROM portal_activity_log
         ORDER BY created_at DESC
         LIMIT 30`,
      )
      .all(),
  ]);

  return {
    pageViews24h: Number(views24h?.count || 0),
    pageViews7d: Number(views7d?.count || 0),
    distinctUsers7d: Number(users7d?.count || 0),
    activeUsers15m: Number(activeUsers?.count || 0),
    topPages7d: Array.isArray(topPages?.results)
      ? topPages.results.map((row) => ({
        path: String(row?.path || ""),
        hits: Number(row?.hits || 0),
      }))
      : [],
    recentActivity: Array.isArray(recent?.results)
      ? recent.results.map((row) => ({
        email: row?.email ? String(row.email) : null,
        eventType: String(row?.event_type || ""),
        path: row?.path ? String(row.path) : null,
        createdAt: row?.created_at ? String(row.created_at) : null,
      }))
      : [],
  };
}
