import { json } from "../../_lib/http";
import { getSessionState } from "../../_lib/auth";
import {
  ensureContentTable,
  readSection,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "roll_call_attendance";
const MAX_RECORDS = 500;
const MAX_NOTES = 4000;
const MIN_QUORUM = 1;
const MAX_QUORUM = 9;
const ALLOWED_STATUS = new Set(["", "present", "absent", "excused", "na"]);

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function toDateISO(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const ms = Date.parse(raw);
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function normalizeMeetingKind(value) {
  const raw = String(value || "").trim().toLowerCase();
  return raw === "exec" ? "exec" : "general";
}

function sanitizeStatus(value) {
  const raw = String(value || "").trim().toLowerCase();
  return ALLOWED_STATUS.has(raw) ? raw : "";
}

function sanitizeStatusMap(input, maxEntries = 40) {
  if (!input || typeof input !== "object") return {};
  const out = {};
  for (const [rawKey, rawValue] of Object.entries(input)) {
    if (Object.keys(out).length >= maxEntries) break;
    const key = String(rawKey || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 64);
    if (!key) continue;
    out[key] = sanitizeStatus(rawValue);
  }
  return out;
}

function sanitizeRecord(input, idx) {
  const meetingKey = t(input?.meetingKey || `meeting-${idx + 1}`, 80);
  const dateISO = toDateISO(input?.dateISO);
  const meetingLabel = t(input?.meetingLabel, 220);
  if (!meetingKey || !dateISO) return null;
  return {
    meetingKey,
    meetingKind: normalizeMeetingKind(input?.meetingKind),
    meetingLabel,
    dateISO,
    officerStatus: sanitizeStatusMap(input?.officerStatus, 20),
    orgStatus: sanitizeStatusMap(input?.orgStatus, 20),
    notes: t(input?.notes, MAX_NOTES),
  };
}

function sanitizePayload(input) {
  const records = Array.isArray(input?.records) ? input.records : [];
  const quorumRaw = Number(input?.quorumMinimum);
  const quorumMinimum = Number.isFinite(quorumRaw)
    ? Math.max(MIN_QUORUM, Math.min(MAX_QUORUM, Math.trunc(quorumRaw)))
    : 5;

  return {
    quorumMinimum,
    records: records.slice(0, MAX_RECORDS).map(sanitizeRecord).filter(Boolean),
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET", "PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureContentTable(env.DB);

  // Roll call is internal to authenticated council portal users.
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }

  if (request.method === "GET") {
    const payload = await readSection(env.DB, SECTION_KEY);
    if (!payload.found) return json({ found: false, data: null, updatedAt: null, updatedBy: null });
    return json({
      found: true,
      data: sanitizePayload(payload.data || {}),
      updatedAt: payload.updatedAt,
      updatedBy: payload.updatedBy,
    });
  }

  const auth = await requireCouncilAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const saved = await writeSection(env.DB, SECTION_KEY, sanitizePayload(body || {}), auth.session.email);
  return json(saved);
}

