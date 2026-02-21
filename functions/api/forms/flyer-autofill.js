import { json } from "../../_lib/http";
import { requireAuthenticated, requireMethods } from "../../_lib/forms-store";
import { analyzeFlyerWithOpenAI } from "../../_lib/flyer-autofill";

function firstFlyerUrl(raw) {
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const url = String(item || "").trim();
      if (url) return url;
    }
    return "";
  }
  return String(raw || "").trim();
}

export async function onRequest({ request, env }) {
  const methodResponse = requireMethods(request, ["POST"]);
  if (methodResponse) return methodResponse;

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const flyerUrl = firstFlyerUrl(body?.flyerUrl || body?.flyerUrls);
  const formType = String(body?.formType || "general").trim().slice(0, 80);

  if (!flyerUrl) {
    return json({ error: "A flyerUrl is required for autofill." }, { status: 400 });
  }

  try {
    const fields = await analyzeFlyerWithOpenAI({ env, flyerUrl, formType });
    return json({ ok: true, fields });
  } catch (err) {
    return json(
      {
        error: err instanceof Error ? err.message : "Flyer autofill failed.",
      },
      { status: 400 },
    );
  }
}
