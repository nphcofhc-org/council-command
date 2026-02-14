import { json } from "../../_lib/http";
import { getSessionState } from "../../_lib/auth";
import { ensureForumTables, readTopic, requireDb, requireMethods } from "../../_lib/forum-store";

function t(value, max = 100) {
  return String(value || "").trim().slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureForumTables(env.DB);

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = t(url.searchParams.get("id"), 80);
  if (!id) return json({ error: "Missing id." }, { status: 400 });

  const data = await readTopic(env.DB, id);
  if (!data.found) return json({ error: "Not found." }, { status: 404 });

  return json({ ok: true, topic: data.topic, posts: data.posts });
}

