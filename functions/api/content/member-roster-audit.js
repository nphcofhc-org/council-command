import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "member_roster_audit";

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function normalizeEmail(value) {
  return t(value, 200).toLowerCase();
}

function sanitizeEntry(raw) {
  const email = normalizeEmail(raw?.email);
  if (!email || !email.includes("@")) return null;
  const displayName = t(raw?.displayName, 120) || email;
  const designation = t(raw?.designation, 120);
  const status = t(raw?.status, 20).toLowerCase() === "remove" ? "remove" : "current";
  return {
    email,
    displayName,
    designation: designation || undefined,
    status,
  };
}

function sanitizePayload(input) {
  const list = Array.isArray(input?.entries) ? input.entries : [];
  const entries = [];
  const seen = new Set();
  for (const raw of list.slice(0, 2000)) {
    const row = sanitizeEntry(raw);
    if (!row) continue;
    if (seen.has(row.email)) continue;
    seen.add(row.email);
    entries.push(row);
  }
  return { entries };
}

export async function onRequest(context) {
  const { request, env } = context;

  const methodResponse = requireMethods(request, ["GET", "PUT"]);
  if (methodResponse) return methodResponse;

  const dbMissing = requireDb(env);
  if (dbMissing) return dbMissing;

  await ensureContentTable(env.DB);

  if (request.method === "GET") {
    const payload = await readSection(env.DB, SECTION_KEY);
    if (!payload.found) {
      return json({ found: false, data: { entries: [] }, updatedAt: null, updatedBy: null });
    }
    return json({
      found: true,
      data: sanitizePayload(payload.data || {}),
      updatedAt: payload.updatedAt,
      updatedBy: payload.updatedBy,
    });
  }

  const auth = await requireCouncilAdmin(request, env);
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const saved = await writeSection(env.DB, SECTION_KEY, sanitizePayload(body || {}), auth.session.email);
  return json(saved);
}
