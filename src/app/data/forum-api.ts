export type ForumTopic = {
  id: string;
  title: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  locked: boolean;
  postCount: number;
};

export type ForumPost = {
  id: string;
  topicId: string;
  body: string;
  createdAt: string;
  createdBy: string | null;
};

export type ForumTopicDetail = {
  topic: Omit<ForumTopic, "postCount">;
  posts: ForumPost[];
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // noop
  }
  return `Request failed (${response.status})`;
}

export async function fetchForumTopics(limit = 60): Promise<ForumTopic[]> {
  const res = await fetch(`/api/forum/topics?limit=${encodeURIComponent(String(limit))}`, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.topics) ? data.topics : [];
}

export async function createForumTopic(input: { title: string; body: string }): Promise<{ topicId: string }> {
  const res = await fetch("/api/forum/topics", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return { topicId: String(data?.topicId || "") };
}

export async function fetchForumTopic(topicId: string): Promise<ForumTopicDetail> {
  const res = await fetch(`/api/forum/topic?id=${encodeURIComponent(topicId)}`, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return {
    topic: data?.topic,
    posts: Array.isArray(data?.posts) ? data.posts : [],
  };
}

export async function createForumPost(input: { topicId: string; body: string }): Promise<{ postId: string }> {
  const res = await fetch("/api/forum/post", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return { postId: String(data?.postId || "") };
}

