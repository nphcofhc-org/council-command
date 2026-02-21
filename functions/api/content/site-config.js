import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireSiteEditor,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "site_config";

function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeConfig(input) {
  const presidentMessage = Array.isArray(input?.presidentMessage)
    ? input.presidentMessage.map((p) => t(p, 1200)).filter(Boolean).slice(0, 10)
    : [];

  const instagramPostUrls = Array.isArray(input?.instagramPostUrls)
    ? input.instagramPostUrls
      .map((u) => t(u, 2048))
      .filter((u) => /^https?:\/\//i.test(u))
      .slice(0, 12)
    : [];

  const variantRaw = t(input?.alertVariant, 32).toLowerCase();
  const alertVariant = ["meeting", "warning", "urgent", "info"].includes(variantRaw) ? variantRaw : "warning";
  const alertEnabled = input?.alertEnabled === true || t(input?.alertEnabled, 16).toLowerCase() === "true";

  return {
    councilName: t(input?.councilName, 200),
    subtitle: t(input?.subtitle, 260),
    footerText: t(input?.footerText, 260),
    footerSubtext: t(input?.footerSubtext, 260),
    presidentName: t(input?.presidentName, 120),
    presidentTitle: t(input?.presidentTitle, 120),
    presidentChapter: t(input?.presidentChapter, 160),
    presidentImageUrl: t(input?.presidentImageUrl, 2048),
    presidentMessage,
    presidentClosing: t(input?.presidentClosing, 260),
    bannerImageUrl: t(input?.bannerImageUrl, 2048),
    instagramHandle: t(input?.instagramHandle, 120),
    instagramPostUrls,
    alertEnabled,
    alertVariant,
    alertTitle: t(input?.alertTitle, 140),
    alertMessage: t(input?.alertMessage, 1200),
    alertLinkLabel: t(input?.alertLinkLabel, 60),
    alertLinkUrl: t(input?.alertLinkUrl, 2048),
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
      data: sanitizeConfig(payload.data || {}),
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

  const saved = await writeSection(env.DB, SECTION_KEY, sanitizeConfig(body || {}), auth.session.email);
  return json(saved);
}
