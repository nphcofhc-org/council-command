import { getSessionState } from "../../../_lib/auth";
import { json, methodNotAllowed } from "../../../_lib/http";

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

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) return json({ error: "Unauthenticated." }, { status: 401 });
  if (!session.isCouncilAdmin) return json({ error: "Forbidden: council admin access required." }, { status: 403 });

  const dbResponse = requireDatabase(env);
  if (dbResponse) return dbResponse;

  await ensureTables(env.DB);

  const url = new URL(request.url);
  const decisionKey = String(url.searchParams.get("decisionKey") || "").trim();
  if (!decisionKey) return json({ error: "Missing decisionKey." }, { status: 400 });

  const rows = await env.DB
    .prepare(
      `SELECT voter_email, choice, weights_json, created_at, updated_at
       FROM decision_votes
       WHERE decision_key = ?1
       ORDER BY updated_at DESC`,
    )
    .bind(decisionKey)
    .all();

  const votes = (rows?.results || []).map((row) => {
    let weights = null;
    try {
      weights = JSON.parse(row.weights_json || "null");
    } catch {
      weights = null;
    }
    return {
      voterEmail: row.voter_email,
      choice: row.choice,
      weights,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });

  return json({
    decisionKey,
    count: votes.length,
    votes,
  });
}

