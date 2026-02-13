import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";

async function ensureTables(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS decision_votes (
        id TEXT PRIMARY KEY,
        decision_key TEXT NOT NULL,
        voter_email TEXT NOT NULL,
        choice TEXT NOT NULL,
        weights_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_decision_votes_unique
       ON decision_votes(decision_key, voter_email)`,
    )
    .run();
}

function requireDatabase(env) {
  if (!env.DB) {
    return json(
      {
        error:
          'Missing D1 binding "DB". Add a D1 binding named DB in Cloudflare Pages settings.',
      },
      { status: 503 },
    );
  }
  return null;
}

function t(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeChoice(value) {
  const raw = t(value, 40).toLowerCase();
  if (raw === "block" || raw === "unity") return raw;
  return "";
}

function sanitizeWeights(input) {
  const clamp = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return null;
    const i = Math.trunc(v);
    if (i < 1) return 1;
    if (i > 5) return 5;
    return i;
  };

  return {
    impact: clamp(input?.impact),
    unity: clamp(input?.unity),
    feasibility: clamp(input?.feasibility),
    recommendation: t(input?.recommendation, 120),
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return json({ error: "Unauthenticated." }, { status: 401 });
  }

  const dbResponse = requireDatabase(env);
  if (dbResponse) return dbResponse;

  await ensureTables(env.DB);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const decisionKey = t(body?.decisionKey, 120);
  if (!decisionKey) return json({ error: "Missing decisionKey." }, { status: 400 });

  const choice = sanitizeChoice(body?.choice);
  if (!choice) return json({ error: "Invalid choice." }, { status: 400 });

  const weights = sanitizeWeights(body?.weights || {});
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // Upsert: one vote per user per decision. Re-submitting updates the same row.
  await env.DB
    .prepare(
      `INSERT INTO decision_votes (id, decision_key, voter_email, choice, weights_json, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(decision_key, voter_email) DO UPDATE SET
         choice = excluded.choice,
         weights_json = excluded.weights_json,
         updated_at = excluded.updated_at`,
    )
    .bind(id, decisionKey, session.email, choice, JSON.stringify(weights), now, now)
    .run();

  return json({
    ok: true,
    decisionKey,
    choice,
    updatedAt: now,
  });
}

