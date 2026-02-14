import { json } from "../../_lib/http";
import { getSessionState } from "../../_lib/auth";
import {
  createPost,
  ensureForumTables,
  requireDb,
  requireMethods,
  sanitizeBody,
} from "../../_lib/forum-store";

function t(value, max = 100) {
  return String(value || "").trim().slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["POST"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureForumTables(env.DB);

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topicId = t(body?.topicId, 80);
  const postBody = sanitizeBody(body?.body);
  if (!topicId) return json({ error: "topicId is required." }, { status: 400 });
  if (!postBody) return json({ error: "Body is required." }, { status: 400 });

  try {
    const created = await createPost(env.DB, {
      topicId,
      body: postBody,
      createdBy: session.email,
    });
    return json({ ok: true, postId: created.id, createdAt: created.createdAt });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Failed to post." }, { status: 400 });
  }
}

