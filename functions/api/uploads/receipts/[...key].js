import { json } from "../../../_lib/http";
import {
  ensureUploadsTable,
  readUpload,
  requireAuthenticated,
  requireDb,
  requireMethods,
  requireReceiptsBucket,
} from "../../../_lib/uploads-store";

function toSafeFilename(value) {
  const raw = String(value || "").trim();
  if (!raw) return "file";
  return raw.replace(/[\r\n"]/g, "_").slice(0, 140);
}

export async function onRequest(context) {
  const { request, env, params } = context;

  const methodResponse = requireMethods(request, ["GET"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  const bucketMissing = requireReceiptsBucket(env);
  if (bucketMissing) return bucketMissing;

  await ensureUploadsTable(env.DB);

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  const keyParts = Array.isArray(params?.key) ? params.key : [params?.key].filter(Boolean);
  const objectKey = keyParts.join("/");
  if (!objectKey) return json({ error: "Missing key." }, { status: 400 });

  const meta = await readUpload(env.DB, objectKey);
  if (!meta.found) return json({ error: "Not found." }, { status: 404 });

  const owner = String(meta.row.ownerEmail || "").toLowerCase();
  const email = String(auth.session.email || "").toLowerCase();
  if (!auth.session.isCouncilAdmin && owner && owner !== email) {
    return json({ error: "Forbidden." }, { status: 403 });
  }

  const obj = await env.RECEIPTS_BUCKET.get(objectKey);
  if (!obj) return json({ error: "Not found." }, { status: 404 });

  const headers = new Headers();
  headers.set("cache-control", "private, no-store");
  headers.set("content-type", meta.row.contentType || obj.httpMetadata?.contentType || "application/octet-stream");
  headers.set("content-disposition", `inline; filename="${toSafeFilename(meta.row.originalFilename)}"`);

  return new Response(obj.body, { status: 200, headers });
}

