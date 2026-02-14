import { json, methodNotAllowed } from "./http";

export function requireDb(env) {
  if (!env.DB) {
    return json(
      { error: 'Missing D1 binding "DB". Add a D1 binding named DB in Cloudflare Pages settings.' },
      { status: 503 },
    );
  }
  return null;
}

export function requireMethods(request, allowed) {
  if (!allowed.includes(request.method)) {
    return methodNotAllowed(allowed);
  }
  return null;
}

export async function ensureForumTables(db) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_forum_topics (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT,
        updated_at TEXT NOT NULL,
        locked INTEGER NOT NULL DEFAULT 0
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS portal_forum_posts (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT
      )`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_forum_topics_updated_at
       ON portal_forum_topics (updated_at DESC)`,
    )
    .run();

  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_portal_forum_posts_topic_created_at
       ON portal_forum_posts (topic_id, created_at ASC)`,
    )
    .run();
}

function t(value, max = 4000) {
  return String(value || "").trim().slice(0, max);
}

export function sanitizeTitle(value) {
  return t(value, 140);
}

export function sanitizeBody(value) {
  return t(value, 10_000);
}

export async function listTopics(db, { limit = 60 } = {}) {
  const lim = Math.max(1, Math.min(200, Math.trunc(Number(limit) || 60)));
  const rows = await db
    .prepare(
      `SELECT
        t.id,
        t.title,
        t.created_at as createdAt,
        t.created_by as createdBy,
        t.updated_at as updatedAt,
        t.locked as locked,
        (SELECT COUNT(1) FROM portal_forum_posts p WHERE p.topic_id = t.id) as postCount
       FROM portal_forum_topics t
       ORDER BY t.updated_at DESC
       LIMIT ?1`,
    )
    .bind(lim)
    .all();

  return (rows?.results || []).map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt,
    createdBy: r.createdBy,
    updatedAt: r.updatedAt,
    locked: Boolean(r.locked),
    postCount: Number(r.postCount || 0),
  }));
}

export async function readTopic(db, topicId) {
  const topic = await db
    .prepare(
      `SELECT
        id,
        title,
        created_at as createdAt,
        created_by as createdBy,
        updated_at as updatedAt,
        locked as locked
       FROM portal_forum_topics
       WHERE id = ?1`,
    )
    .bind(topicId)
    .first();

  if (!topic) return { found: false, topic: null, posts: [] };

  const posts = await db
    .prepare(
      `SELECT
        id,
        topic_id as topicId,
        body,
        created_at as createdAt,
        created_by as createdBy
       FROM portal_forum_posts
       WHERE topic_id = ?1
       ORDER BY created_at ASC`,
    )
    .bind(topicId)
    .all();

  return {
    found: true,
    topic: {
      id: topic.id,
      title: topic.title,
      createdAt: topic.createdAt,
      createdBy: topic.createdBy,
      updatedAt: topic.updatedAt,
      locked: Boolean(topic.locked),
    },
    posts: (posts?.results || []).map((p) => ({
      id: p.id,
      topicId: p.topicId,
      body: p.body,
      createdAt: p.createdAt,
      createdBy: p.createdBy,
    })),
  };
}

export async function createTopic(db, { title, body, createdBy }) {
  const id = crypto.randomUUID();
  const postId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO portal_forum_topics (id, title, created_at, created_by, updated_at, locked)
       VALUES (?1, ?2, ?3, ?4, ?5, 0)`,
    )
    .bind(id, title, now, createdBy || null, now)
    .run();

  await db
    .prepare(
      `INSERT INTO portal_forum_posts (id, topic_id, body, created_at, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(postId, id, body, now, createdBy || null)
    .run();

  return { id, createdAt: now };
}

export async function createPost(db, { topicId, body, createdBy }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const topic = await db
    .prepare(`SELECT locked FROM portal_forum_topics WHERE id = ?1`)
    .bind(topicId)
    .first();

  if (!topic) throw new Error("Topic not found.");
  if (Number(topic.locked || 0) === 1) throw new Error("This topic is locked.");

  await db
    .prepare(
      `INSERT INTO portal_forum_posts (id, topic_id, body, created_at, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(id, topicId, body, now, createdBy || null)
    .run();

  await db
    .prepare(`UPDATE portal_forum_topics SET updated_at = ?2 WHERE id = ?1`)
    .bind(topicId, now)
    .run();

  return { id, createdAt: now };
}

