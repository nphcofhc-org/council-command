import { json } from "../../_lib/http";
import {
  ensureFormsTables,
  listSubmissions,
  requireAuthenticated,
  requireDb,
  requireMethods,
  sanitizeFormKey,
} from "../../_lib/forms-store";

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const rawKey = url.searchParams.get("formKey") || "";
  const formKey = rawKey ? sanitizeFormKey(rawKey) : "";

  const rows = await listSubmissions(env.DB, {
    formKey: formKey || null,
    status: null,
    createdBy: auth.session.email,
    limit: 50,
    offset: 0,
  });

  return json({ ok: true, rows });
}

