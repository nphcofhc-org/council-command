import { json } from "../../_lib/http";
import { ensureContentTable, requireDb, requireMethods, readSection, requireSiteEditor, writeSection } from "../../_lib/content-store";

const SECTION_KEY = "member_directory";

function sanitizeText(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function normalizeEmail(value) {
  return sanitizeText(value, 200).toLowerCase();
}

function sanitizeEntry(raw) {
  const email = normalizeEmail(raw?.email);
  const displayName = sanitizeText(raw?.displayName, 120);
  const designation = sanitizeText(raw?.designation, 120);
  if (!email || !email.includes("@") || !displayName) return null;
  return {
    email,
    displayName,
    designation: designation || undefined,
  };
}

function sanitizeDirectory(input) {
  const list = Array.isArray(input?.entries) ? input.entries : [];
  const entries = [];
  const seen = new Set();
  for (const raw of list.slice(0, 500)) {
    const e = sanitizeEntry(raw);
    if (!e) continue;
    if (seen.has(e.email)) continue;
    seen.add(e.email);
    entries.push(e);
  }
  return { entries };
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodError = requireMethods(request, ["GET", "PUT"]);
  if (methodError) return methodError;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;
  await ensureContentTable(env.DB);

  if (request.method === "GET") {
    const result = await readSection(env.DB, SECTION_KEY);
    if (!result.found) {
      return json({ found: false, data: { entries: [] }, updatedAt: null, updatedBy: null });
    }
    return json({ found: true, data: sanitizeDirectory(result.data || {}), updatedAt: result.updatedAt, updatedBy: result.updatedBy });
  }

  const gate = await requireSiteEditor(request, env);
  if (!gate.ok) return gate.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = sanitizeDirectory(body);
  const saved = await writeSection(env.DB, SECTION_KEY, payload, gate.session.email);
  return json(saved);
}

