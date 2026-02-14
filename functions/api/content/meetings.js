import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireSiteEditor,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "meetings_page";

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeList(input, limit, mapFn) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, limit).map(mapFn).filter(Boolean);
}

function sanitizePayload(input) {
  return {
    upcomingMeetings: sanitizeList(input?.upcomingMeetings, 60, (raw, idx) => ({
      id: t(raw?.id || `upcoming-${idx + 1}`, 64) || `upcoming-${idx + 1}`,
      title: t(raw?.title, 160),
      date: t(raw?.date, 40),
      time: t(raw?.time, 40),
      location: t(raw?.location, 160),
      type: t(raw?.type, 80),
    })).filter((m) => m.title && m.date),
    meetingRecords: sanitizeList(input?.meetingRecords, 200, (raw, idx) => ({
      id: t(raw?.id || `record-${idx + 1}`, 64) || `record-${idx + 1}`,
      date: t(raw?.date, 40),
      title: t(raw?.title, 160),
      agendaFile: t(raw?.agendaFile, 400),
      minutesFile: t(raw?.minutesFile, 400),
      status: t(raw?.status, 40),
    })).filter((r) => r.date && r.title),
    delegateReports: sanitizeList(input?.delegateReports, 300, (raw, idx) => ({
      id: t(raw?.id || `report-${idx + 1}`, 64) || `report-${idx + 1}`,
      meetingCycle: t(raw?.meetingCycle, 80),
      chapter: t(raw?.chapter, 160),
      submittedBy: t(raw?.submittedBy, 120),
      dateSubmitted: t(raw?.dateSubmitted, 40),
      status: t(raw?.status, 60),
    })).filter((d) => d.meetingCycle && d.chapter),
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET", "PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureContentTable(env.DB);

  if (request.method === "GET") {
    const payload = await readSection(env.DB, SECTION_KEY);
    if (!payload.found) return json({ found: false, data: null, updatedAt: null, updatedBy: null });
    return json({ found: true, data: sanitizePayload(payload.data || {}), updatedAt: payload.updatedAt, updatedBy: payload.updatedBy });
  }

  const auth = await requireSiteEditor(request, env);
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
