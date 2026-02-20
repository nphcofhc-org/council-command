import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireSiteEditor,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "member_alerts";

function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function asBool(value) {
  if (value === true) return true;
  if (value === false) return false;
  const s = String(value || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function oneOf(value, allowed, fallback) {
  const v = String(value || "").trim().toLowerCase();
  return allowed.includes(v) ? v : fallback;
}

function sanitizeContent(input) {
  const alertId = t(input?.alertId, 80) || `alert-${Date.now()}`;
  return {
    enabled: asBool(input?.enabled),
    style: oneOf(input?.style, ["banner", "alert"], "banner"),
    severity: oneOf(input?.severity, ["info", "important", "urgent"], "info"),
    title: t(input?.title, 180),
    message: t(input?.message, 2000),
    ctaLabel: t(input?.ctaLabel, 60),
    ctaUrl: t(input?.ctaUrl, 800),
    alertId,
  };
}

const DEFAULT_ALERTS = {
  enabled: false,
  style: "banner",
  severity: "info",
  title: "",
  message: "",
  ctaLabel: "",
  ctaUrl: "",
  alertId: "",
};

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
        data: DEFAULT_ALERTS,
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

  const auth = await requireSiteEditor(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incoming = sanitizeContent(body || {});
  // Generate a new alertId when content changes while enabled.
  if (incoming.enabled && !incoming.alertId) {
    incoming.alertId = `alert-${Date.now()}`;
  }

  const saved = await writeSection(env.DB, SECTION_KEY, incoming, auth.session.email);
  return json(saved);
}
