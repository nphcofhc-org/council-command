import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "home_updates";

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeUpdates(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 30)
    .map((raw, idx) => ({
      id: t(raw?.id || `update-${idx + 1}`, 64) || `update-${idx + 1}`,
      date: t(raw?.date, 40),
      title: t(raw?.title, 140),
      type: t(raw?.type, 60),
    }))
    .filter((u) => u.date && u.title && u.type);
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
    if (!payload.found) {
      return json({ found: false, data: [], updatedAt: null, updatedBy: null });
    }
    return json({
      found: true,
      data: sanitizeUpdates(payload.data || []),
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

  const updates = sanitizeUpdates(body);
  const saved = await writeSection(env.DB, SECTION_KEY, updates, auth.session.email);
  return json(saved);
}

