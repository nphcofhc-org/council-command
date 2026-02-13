import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "resources_page";

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeList(input, limit, mapFn) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, limit).map(mapFn).filter(Boolean);
}

function sanitizeForms(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 40).map((rawCat, idx) => {
    const category = t(rawCat?.category || `Category ${idx + 1}`, 80) || `Category ${idx + 1}`;
    const forms = sanitizeList(rawCat?.forms, 60, (raw, fIdx) => ({
      id: t(raw?.id || `form-${idx + 1}-${fIdx + 1}`, 64) || `form-${idx + 1}-${fIdx + 1}`,
      name: t(raw?.name, 140),
      description: t(raw?.description, 600),
      link: t(raw?.link, 2048),
    })).filter((f) => f.name && f.link);
    return { category, forms };
  });
}

function sanitizePayload(input) {
  return {
    sharedForms: sanitizeForms(input?.sharedForms),
    nationalOrgs: sanitizeList(input?.nationalOrgs, 80, (raw, idx) => ({
      id: t(raw?.id || `org-${idx + 1}`, 64) || `org-${idx + 1}`,
      name: t(raw?.name, 160),
      website: t(raw?.website, 2048),
      founded: t(raw?.founded, 60),
    })).filter((o) => o.name && o.website),
    trainingResources: sanitizeList(input?.trainingResources, 200, (raw, idx) => ({
      id: t(raw?.id || `resource-${idx + 1}`, 64) || `resource-${idx + 1}`,
      title: t(raw?.title, 160),
      description: t(raw?.description, 800),
      type: t(raw?.type, 80),
      updated: t(raw?.updated, 60),
      fileUrl: t(raw?.fileUrl, 2048) || undefined,
    })).filter((r) => r.title && r.type),
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

