function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanText(value, max = 120) {
  return String(value || "").trim().slice(0, max);
}

export async function ensureMemberProfileTable(db) {
  if (!db) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_member_profiles (
        email TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        organization TEXT NOT NULL,
        notify_consent INTEGER NOT NULL DEFAULT 0,
        notify_consent_at TEXT,
        notice_version TEXT,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  // Backward-compatible column migration for existing tables.
  try {
    await db.prepare(`ALTER TABLE portal_member_profiles ADD COLUMN notify_consent INTEGER NOT NULL DEFAULT 0`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE portal_member_profiles ADD COLUMN notify_consent_at TEXT`).run();
  } catch {}
  try {
    await db.prepare(`ALTER TABLE portal_member_profiles ADD COLUMN notice_version TEXT`).run();
  } catch {}
}

export async function readMemberProfile(db, emailRaw) {
  if (!db) return { found: false, data: null, updatedAt: null };
  const email = normalizeEmail(emailRaw);
  if (!email) return { found: false, data: null, updatedAt: null };

  await ensureMemberProfileTable(db);

  const row = await db
    .prepare(
      `SELECT first_name, last_name, organization, notify_consent, notify_consent_at, notice_version, updated_at
       FROM portal_member_profiles
       WHERE email = ?1
       LIMIT 1`,
    )
    .bind(email)
    .first();

  if (!row) return { found: false, data: null, updatedAt: null };

  return {
    found: true,
    data: {
      firstName: cleanText(row.first_name),
      lastName: cleanText(row.last_name),
      organization: cleanText(row.organization, 180),
      notifyConsent: Number(row.notify_consent || 0) === 1,
      notifyConsentAt: row.notify_consent_at ? String(row.notify_consent_at) : null,
      noticeVersion: cleanText(row.notice_version || "v1", 20) || "v1",
    },
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function upsertMemberProfile(db, emailRaw, payload) {
  if (!db) return { ok: false };
  const email = normalizeEmail(emailRaw);
  if (!email) return { ok: false };

  const firstName = cleanText(payload?.firstName);
  const lastName = cleanText(payload?.lastName);
  const organization = cleanText(payload?.organization, 180);
  const notifyConsent = payload?.notifyConsent === true;
  const noticeVersion = cleanText(payload?.noticeVersion || "v1", 20) || "v1";
  if (!firstName || !lastName || !organization || !notifyConsent) return { ok: false };

  await ensureMemberProfileTable(db);

  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO portal_member_profiles (email, first_name, last_name, organization, notify_consent, notify_consent_at, notice_version, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(email) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         organization = excluded.organization,
         notify_consent = excluded.notify_consent,
         notify_consent_at = excluded.notify_consent_at,
         notice_version = excluded.notice_version,
         updated_at = excluded.updated_at`,
    )
    .bind(email, firstName, lastName, organization, 1, now, noticeVersion, now)
    .run();

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      organization,
      notifyConsent: true,
      notifyConsentAt: now,
      noticeVersion,
    },
    updatedAt: now,
  };
}
