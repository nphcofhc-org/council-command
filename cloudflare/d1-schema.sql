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
