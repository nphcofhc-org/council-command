import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";
import { recordActivity } from "../../_lib/activity-store";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, skipped: true });

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) return json({ ok: true, skipped: true });

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const path = String(body?.path || "").trim();
  const eventType = String(body?.eventType || "page_view").trim() || "page_view";
  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("cf-connecting-ip") || "";

  await recordActivity(env.DB, {
    email: session.email || "",
    path,
    eventType,
    userAgent,
    ip,
  });

  return json({ ok: true });
}

export async function onRequest({ request, env, next }) {
  if (request.method === "POST") {
    return onRequestPost({ request, env, next });
  }
  return methodNotAllowed(["POST"]);
}
