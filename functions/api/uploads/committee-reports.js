import { json } from "../../_lib/http";
import {
  ensureUploadsTable,
  insertUpload,
  requireAuthenticated,
  requireDb,
  requireMethods,
  requireReceiptsBucket,
} from "../../_lib/uploads-store";

function sanitizeFilename(value) {
  const raw = String(value || "").trim();
  if (!raw) return "attachment";
  return raw.replace(/[^\w.\- ()]/g, "_").slice(0, 140);
}

function inferExtFromType(contentType) {
  const t = String(contentType || "").toLowerCase();
  if (t.includes("pdf")) return "pdf";
  if (t.includes("png")) return "png";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  if (t.includes("webp")) return "webp";
  if (t.includes("heic") || t.includes("heif")) return "heic";
  if (t.includes("gif")) return "gif";
  if (t.includes("word")) return "docx";
  return "bin";
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["POST"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  const bucketMissing = requireReceiptsBucket(env);
  if (bucketMissing) return bucketMissing;

  await ensureUploadsTable(env.DB);

  const auth = await requireAuthenticated(request, env);
  if (!auth.ok) return auth.response;

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  const files = form.getAll("files");
  if (!files.length) return json({ error: "No files uploaded." }, { status: 400 });
  if (files.length > 5) return json({ error: "Upload up to 5 files." }, { status: 400 });

  const uploaded = [];
  for (const item of files) {
    if (!(item instanceof File)) continue;
    if (!Number.isFinite(item.size) || item.size <= 0) continue;
    if (item.size > 100 * 1024 * 1024) {
      return json({ error: "Max 100MB per file." }, { status: 400 });
    }

    const originalFilename = sanitizeFilename(item.name);
    const ext = originalFilename.includes(".") ? originalFilename.split(".").pop() : inferExtFromType(item.type);
    const objectKey = `committee-report-${crypto.randomUUID()}.${String(ext || "bin").toLowerCase()}`;
    const createdAt = new Date().toISOString();

    await env.RECEIPTS_BUCKET.put(objectKey, item.stream(), {
      httpMetadata: {
        contentType: item.type || "application/octet-stream",
      },
      customMetadata: {
        owner: auth.session.email || "",
        original: originalFilename,
        createdAt,
      },
    });

    await insertUpload(env.DB, {
      objectKey,
      createdAt,
      ownerEmail: auth.session.email,
      originalFilename,
      contentType: item.type || "",
      sizeBytes: item.size,
    });

    uploaded.push({
      key: objectKey,
      filename: originalFilename,
      contentType: item.type || "application/octet-stream",
      size: item.size,
      viewUrl: `/api/uploads/committee-reports/${encodeURIComponent(objectKey)}`,
    });
  }

  return json({ ok: true, files: uploaded });
}

