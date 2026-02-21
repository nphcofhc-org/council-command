import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";
import { ensureChatTable, insertChatMessage, listChatMessages } from "../../_lib/chat-store";

function requireDb(env) {
  if (!env.DB) {
    return json({ error: 'Missing D1 binding "DB".' }, { status: 503 });
  }
  return null;
}

async function requireAuth(request, env) {
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated || !session.email) {
    return { ok: false, response: json({ error: "Unauthenticated." }, { status: 401 }) };
  }
  return { ok: true, session };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!["GET", "POST"].includes(request.method)) {
    return methodNotAllowed(["GET", "POST"]);
  }

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;
  await ensureChatTable(env.DB);

  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  if (request.method === "GET") {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "120");
    const rows = await listChatMessages(env.DB, limit);
    return json({ ok: true, rows });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const saved = await insertChatMessage(env.DB, {
    body: body?.body,
    mediaUrl: body?.mediaUrl,
    createdBy: auth.session.email,
  });

  return json({ ok: true, ...saved });
}
