import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireSiteEditor,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "programs_page";

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function mediaType(value) {
  return String(value || "").trim().toLowerCase() === "video" ? "video" : "image";
}

function sanitizeList(input, limit, mapFn) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, limit).map(mapFn).filter(Boolean);
}

function sanitizePayload(input) {
  return {
    upcomingEvents: sanitizeList(input?.upcomingEvents, 100, (raw, idx) => ({
      id: t(raw?.id || `event-${idx + 1}`, 64) || `event-${idx + 1}`,
      title: t(raw?.title, 160),
      date: t(raw?.date, 40),
      location: t(raw?.location, 160),
      description: t(raw?.description, 1200),
      type: t(raw?.type, 80),
      registration: t(raw?.registration, 60),
    })).filter((e) => e.title && e.date),
    archivedEvents: sanitizeList(input?.archivedEvents, 200, (raw, idx) => ({
      id: t(raw?.id || `archive-${idx + 1}`, 64) || `archive-${idx + 1}`,
      title: t(raw?.title, 160),
      date: t(raw?.date, 40),
      attendees: t(raw?.attendees, 60),
      status: t(raw?.status, 60),
    })).filter((e) => e.title && e.date),
    eventHighlights: sanitizeList(input?.eventHighlights, 24, (raw, idx) => ({
      id: t(raw?.id || `highlight-${idx + 1}`, 64) || `highlight-${idx + 1}`,
      title: t(raw?.title, 160),
      mediaType: mediaType(raw?.mediaType),
      mediaUrl: t(raw?.mediaUrl, 2048),
      thumbnailUrl: t(raw?.thumbnailUrl, 2048) || undefined,
    })).filter((h) => h.title && h.mediaUrl),
    eventFlyers: sanitizeList(input?.eventFlyers, 200, (raw, idx) => ({
      id: t(raw?.id || `flyer-${idx + 1}`, 64) || `flyer-${idx + 1}`,
      title: t(raw?.title, 160),
      type: t(raw?.type, 80),
      date: t(raw?.date, 40),
      fileUrl: t(raw?.fileUrl, 2048) || undefined,
    })).filter((f) => f.title && f.date),
    signupForms: sanitizeList(input?.signupForms, 200, (raw, idx) => ({
      id: t(raw?.id || `form-${idx + 1}`, 64) || `form-${idx + 1}`,
      title: t(raw?.title, 160),
      description: t(raw?.description, 600),
      deadline: t(raw?.deadline, 80),
      status: t(raw?.status, 60),
      formUrl: t(raw?.formUrl, 2048) || undefined,
    })).filter((f) => f.title && f.deadline),
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
