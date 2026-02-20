import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";
import { readMemberProfile, upsertMemberProfile } from "../../_lib/member-profile-store";

function normalizeOrg(value) {
  return String(value || "").trim();
}

export async function onRequest({ request, env }) {
  if (!["GET", "PUT"].includes(request.method)) {
    return methodNotAllowed(["GET", "PUT"]);
  }

  if (!env.DB) {
    return json({ error: 'Missing D1 binding "DB".' }, { status: 503 });
  }

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated || !session.email) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }

  if (request.method === "GET") {
    const profile = await readMemberProfile(env.DB, session.email);
    return json({
      found: profile.found,
      data: profile.data,
      updatedAt: profile.updatedAt,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = {
    firstName: String(body?.firstName || "").trim(),
    lastName: String(body?.lastName || "").trim(),
    organization: normalizeOrg(body?.organization),
  };

  if (!payload.firstName || !payload.lastName || !payload.organization) {
    return json({ error: "First name, last name, and organization are required." }, { status: 400 });
  }

  const saved = await upsertMemberProfile(env.DB, session.email, payload);
  if (!saved.ok) {
    return json({ error: "Failed to save profile." }, { status: 500 });
  }

  return json({
    saved: true,
    data: saved.data,
    updatedAt: saved.updatedAt,
  });
}
