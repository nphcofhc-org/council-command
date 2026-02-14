import { json } from "../../_lib/http";
import {
  ensureFormsTables,
  insertSubmission,
  requireAuthenticated,
  requireDb,
  requireMethods,
  sanitizeFormKey,
} from "../../_lib/forms-store";

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["POST"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const formKey = sanitizeFormKey(body?.formKey);
  if (!formKey) {
    return json({ error: "Invalid formKey." }, { status: 400 });
  }

  const payload = body?.payload ?? {};

  try {
    const saved = await insertSubmission(env.DB, {
      formKey,
      payload,
      createdBy: auth.session.email,
    });
    return json({ ok: true, ...saved });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Failed to submit form." }, { status: 400 });
  }
}

