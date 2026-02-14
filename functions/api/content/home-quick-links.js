import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireSiteEditor,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "home_quick_links";

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeRow(value) {
  const raw = Number(value);
  return raw === 2 ? 2 : 1;
}

function sanitizeLinks(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 24)
    .map((raw, idx) => ({
      id: t(raw?.id || `ql-${idx + 1}`, 64) || `ql-${idx + 1}`,
      icon: t(raw?.icon, 64) || "Link",
      label: t(raw?.label, 60),
      shortLabel: t(raw?.shortLabel, 20),
      url: t(raw?.url, 400),
      row: sanitizeRow(raw?.row),
    }))
    .filter((l) => l.label && l.url);
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
      data: sanitizeLinks(payload.data || []),
      updatedAt: payload.updatedAt,
      updatedBy: payload.updatedBy,
    });
  }

  const auth = await requireSiteEditor(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const links = sanitizeLinks(body);
  const saved = await writeSection(env.DB, SECTION_KEY, links, auth.session.email);
  return json(saved);
}
