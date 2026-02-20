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
        updated_at TEXT NOT NULL
      )`,
    )
    .run();
}

export async function readMemberProfile(db, emailRaw) {
  if (!db) return { found: false, data: null, updatedAt: null };
  const email = normalizeEmail(emailRaw);
  if (!email) return { found: false, data: null, updatedAt: null };

  await ensureMemberProfileTable(db);

  const row = await db
    .prepare(
      `SELECT first_name, last_name, organization, updated_at
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
  if (!firstName || !lastName || !organization) return { ok: false };

  await ensureMemberProfileTable(db);

  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO portal_member_profiles (email, first_name, last_name, organization, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(email) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         organization = excluded.organization,
         updated_at = excluded.updated_at`,
    )
    .bind(email, firstName, lastName, organization, now)
    .run();

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      organization,
    },
    updatedAt: now,
  };
}
