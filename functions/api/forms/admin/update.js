import { json } from "../../../_lib/http";
import {
  ensureFormsTables,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  sanitizeStatus,
  updateSubmission,
} from "../../../_lib/forms-store";

function t(value, max = 1200) {
  return String(value || "").trim().slice(0, max);
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureFormsTables(env.DB);

  const auth = await requireCouncilAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = t(body?.id, 80);
  const status = sanitizeStatus(body?.status);
  const reviewNotes = t(body?.reviewNotes, 4000);

  if (!id) return json({ error: "Missing id." }, { status: 400 });
  if (!status) return json({ error: "Missing status." }, { status: 400 });

  const updated = await updateSubmission(env.DB, {
    id,
    status,
    reviewNotes,
    reviewedBy: auth.session.email,
  });

  return json(updated);
}

