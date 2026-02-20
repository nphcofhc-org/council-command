CREATE TABLE IF NOT EXISTS council_compliance_state (
  key TEXT PRIMARY KEY,
  checked_items_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS portal_content_state (
  section_key TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS portal_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  event_type TEXT NOT NULL,
  path TEXT,
  user_agent TEXT,
  ip_mask TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_portal_activity_created_at ON portal_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_portal_activity_email ON portal_activity_log(email);

CREATE TABLE IF NOT EXISTS portal_member_profiles (
  email TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  notify_consent INTEGER NOT NULL DEFAULT 0,
  notify_consent_at TEXT,
  notice_version TEXT,
  updated_at TEXT NOT NULL
);
