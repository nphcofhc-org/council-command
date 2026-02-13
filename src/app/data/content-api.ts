import type { QuickLink, SiteConfig, Update } from "./types";

type ContentResponse<T> = {
  found: boolean;
  data: T;
  updatedAt: string | null;
  updatedBy: string | null;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

export function fetchSiteConfigOverride(): Promise<ContentResponse<SiteConfig | null>> {
  return getJson("/api/content/site-config");
}

export function saveSiteConfigOverride(config: SiteConfig): Promise<ContentResponse<SiteConfig>> {
  return putJson("/api/content/site-config", config);
}

export function fetchQuickLinksOverride(): Promise<ContentResponse<QuickLink[]>> {
  return getJson("/api/content/home-quick-links");
}

export function saveQuickLinksOverride(links: QuickLink[]): Promise<ContentResponse<QuickLink[]>> {
  return putJson("/api/content/home-quick-links", links);
}

export function fetchUpdatesOverride(): Promise<ContentResponse<Update[]>> {
  return getJson("/api/content/home-updates");
}

export function saveUpdatesOverride(updates: Update[]): Promise<ContentResponse<Update[]>> {
  return putJson("/api/content/home-updates", updates);
}

