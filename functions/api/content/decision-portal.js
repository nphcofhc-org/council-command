import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "decision_portal";

function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeLinks(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const raw of input.slice(0, 10)) {
    const label = t(raw?.label, 80);
    const url = t(raw?.url, 2048);
    if (!label || !url) continue;
    out.push({
      id: t(raw?.id, 60) || `lnk-${out.length + 1}`,
      label,
      url,
    });
  }
  return out;
}

function sanitizeOptions(input) {
  // We keep the underlying vote ids fixed for now.
  const defaults = [
    { id: "block", label: "Neighborhood Block Party", description: "" },
    { id: "unity", label: "Unity BBQ", description: "" },
  ];

  if (!Array.isArray(input)) return defaults;

  const byId = new Map();
  for (const raw of input) {
    const id = t(raw?.id, 12).toLowerCase();
    if (id !== "block" && id !== "unity") continue;
    byId.set(id, {
      id,
      label: t(raw?.label, 120) || (id === "block" ? defaults[0].label : defaults[1].label),
      description: t(raw?.description, 900),
    });
  }

  return [
    byId.get("block") || defaults[0],
    byId.get("unity") || defaults[1],
  ];
}

function sanitizeContent(input) {
  const decisionKey = t(input?.decisionKey, 120) || "2026-block-party-vs-unity-bbq";
  const isOpen = input?.isOpen === true || t(input?.isOpen, 16).toLowerCase() === "true";

  return {
    decisionKey,
    title: t(input?.title, 140) || "Decision Portal",
    subtitle: t(input?.subtitle, 240) || "Confidential voting and decision support",
    summary: t(input?.summary, 2000),
    options: sanitizeOptions(input?.options),
    links: sanitizeLinks(input?.links),
    isOpen,
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
    if (!payload.found) {
      return json({
        found: false,
        data: null,
        updatedAt: null,
        updatedBy: null,
      });
    }

    return json({
      found: true,
      data: sanitizeContent(payload.data || {}),
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

  const saved = await writeSection(env.DB, SECTION_KEY, sanitizeContent(body || {}), auth.session.email);
  return json(saved);
}

