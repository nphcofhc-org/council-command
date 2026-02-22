import { json } from "../../_lib/http";
import {
  ensureContentTable,
  readSection,
  requireCouncilAdmin,
  requireDb,
  requireMethods,
  writeSection,
} from "../../_lib/content-store";

const SECTION_KEY = "chapter_dues_tracker";

const DEFAULT_CHAPTERS = [
  "Alpha Phi Alpha Fraternity, Inc.",
  "Alpha Kappa Alpha Sorority, Inc.",
  "Kappa Alpha Psi Fraternity, Inc.",
  "Omega Psi Phi Fraternity, Inc.",
  "Delta Sigma Theta Sorority, Inc.",
  "Phi Beta Sigma Fraternity, Inc.",
  "Zeta Phi Beta Sorority, Inc.",
  "Sigma Gamma Rho Sorority, Inc.",
  "Iota Phi Theta Fraternity, Inc.",
];

function t(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function normalizeDate(value) {
  const raw = t(value, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}

function defaultEntries() {
  return DEFAULT_CHAPTERS.map((chapter, index) => ({
    id: `dues-${index + 1}`,
    chapter,
    paidDate: "",
  }));
}

function sanitizeEntries(input) {
  const raw = Array.isArray(input) ? input : [];
  const rows = raw
    .slice(0, 40)
    .map((entry, index) => ({
      id: t(entry?.id || `dues-${index + 1}`, 64) || `dues-${index + 1}`,
      chapter: t(entry?.chapter, 200),
      paidDate: normalizeDate(entry?.paidDate),
    }))
    .filter((row) => row.chapter);

  const byChapter = new Map(rows.map((row) => [row.chapter.toLowerCase(), row]));
  const defaults = defaultEntries();
  const merged = defaults.map((row) => {
    const hit = byChapter.get(row.chapter.toLowerCase());
    return hit ? { ...row, ...hit, chapter: row.chapter } : row;
  });
  const defaultNames = new Set(defaults.map((row) => row.chapter.toLowerCase()));
  const extras = rows.filter((row) => !defaultNames.has(row.chapter.toLowerCase()));
  return [...merged, ...extras];
}

function sanitizePayload(input) {
  return {
    entries: sanitizeEntries(input?.entries),
  };
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
      return json({
        found: false,
        data: { entries: defaultEntries() },
        updatedAt: null,
        updatedBy: null,
      });
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
