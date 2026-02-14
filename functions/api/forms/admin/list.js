import { json } from "../../../_lib/http";
import {
  ensureFormsTables,
  listSubmissions,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  sanitizeFormKey,
  sanitizeStatus,
} from "../../../_lib/forms-store";

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireCouncilAdmin(request, env);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const formKey = sanitizeFormKey(url.searchParams.get("formKey") || "");
  const status = sanitizeStatus(url.searchParams.get("status") || "");
  const limit = Number(url.searchParams.get("limit") || "50");

  const rows = await listSubmissions(env.DB, {
    formKey: formKey || null,
    status: status || null,
    createdBy: null,
    limit,
    offset: 0,
  });

  return json({ ok: true, rows });
}

