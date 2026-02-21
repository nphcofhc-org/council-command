export type ChatMessage = {
  id: string;
  body: string;
  mediaUrl: string;
  createdAt: string;
  createdBy: string;
  displayName: string;
};

const CHAT_ENDPOINT = "/api/chat/messages";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function fetchChatMessages(limit = 120): Promise<ChatMessage[]> {
  const url = new URL(CHAT_ENDPOINT, window.location.origin);
  url.searchParams.set("limit", String(limit));
  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = await response.json();
  return Array.isArray(data?.rows) ? (data.rows as ChatMessage[]) : [];
}

export async function postChatMessage(input: { body: string; mediaUrl?: string }): Promise<{ id: string; createdAt: string }> {
  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = await response.json();
  return {
    id: String(data?.id || ""),
    createdAt: String(data?.createdAt || ""),
  };
}
