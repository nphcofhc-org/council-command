import { json } from "../../_lib/http";
import { getSessionState } from "../../_lib/auth";
import {
  createTopic,
  ensureForumTables,
  listTopics,
  requireDb,
  requireMethods,
  sanitizeBody,
  sanitizeTitle,
} from "../../_lib/forum-store";

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET", "POST"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureForumTables(env.DB);

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }

  if (request.method === "GET") {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "60");
    const topics = await listTopics(env.DB, { limit });
    return json({ ok: true, topics });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = sanitizeTitle(body?.title);
  const postBody = sanitizeBody(body?.body);
  if (!title) return json({ error: "Title is required." }, { status: 400 });
  if (!postBody) return json({ error: "Body is required." }, { status: 400 });

  const created = await createTopic(env.DB, {
    title,
    body: postBody,
    createdBy: session.email,
  });

  return json({ ok: true, topicId: created.id, createdAt: created.createdAt });
}

