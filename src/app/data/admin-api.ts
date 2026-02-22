import type { LeadershipContent } from "./leadership";
import type { MemberDirectory } from "./member-directory";

export type CouncilSession = {
  authenticated: boolean;
  email: string | null;
  isCouncilAdmin: boolean;
  isTreasuryAdmin: boolean;
  isSiteEditor: boolean;
  isPresident: boolean;
};

export type AccessOverrideEntry = {
  email: string;
  isCouncilAdmin: boolean | null;
  isTreasuryAdmin: boolean | null;
  isSiteEditor: boolean | null;
  isPresident: boolean | null;
  note: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export type SiteMaintenanceMetrics = {
  pageViews24h: number;
  pageViews7d: number;
  distinctUsers7d: number;
  activeUsers15m: number;
  topPages7d: Array<{ path: string; hits: number }>;
  recentActivity: Array<{
    email: string | null;
    eventType: string;
    path: string | null;
    createdAt: string | null;
  }>;
};

export type SiteMaintenancePayload = {
  overrides: AccessOverrideEntry[];
  metrics: SiteMaintenanceMetrics;
  knownUsers: string[];
  viewer: string | null;
};

export type ComplianceState = {
  checkedItems: Record<string, boolean>;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type LeadershipContentResponse = {
  found: boolean;
  data: LeadershipContent;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type ChapterDuesEntry = {
  id: string;
  chapter: string;
  paidDate: string;
};

export type ChapterDuesTrackerResponse = {
  found: boolean;
  data: {
    entries: ChapterDuesEntry[];
  };
  updatedAt: string | null;
  updatedBy: string | null;
};

export type MembershipRosterAuditEntry = {
  email: string;
  displayName: string;
  designation?: string;
  status: "current" | "remove";
};

export type MembershipRosterAuditResponse = {
  found: boolean;
  data: {
    entries: MembershipRosterAuditEntry[];
  };
  updatedAt: string | null;
  updatedBy: string | null;
};

const SESSION_ENDPOINT = "/api/admin/session";
const COMPLIANCE_ENDPOINT = "/api/admin/compliance";
const LEADERSHIP_ENDPOINT = "/api/content/chapter-leadership";
const MEMBER_DIRECTORY_ENDPOINT = "/api/content/member-directory";
const MEMBER_ROSTER_AUDIT_ENDPOINT = "/api/content/member-roster-audit";
const CHAPTER_DUES_ENDPOINT = "/api/content/chapter-dues";
const SITE_MAINTENANCE_ENDPOINT = "/api/admin/site-maintenance";
const ANALYTICS_TRACK_ENDPOINT = "/api/analytics/track";

const DEFAULT_DUES_CHAPTERS = [
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

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // noop
  }
  return `Request failed (${response.status})`;
}

export async function fetchCouncilSession(): Promise<CouncilSession> {
  const response = await fetch(SESSION_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    authenticated: Boolean(data?.authenticated),
    email: data?.email ? String(data.email) : null,
    isCouncilAdmin: Boolean(data?.isCouncilAdmin),
    isTreasuryAdmin: Boolean(data?.isTreasuryAdmin),
    isSiteEditor: Boolean(data?.isSiteEditor),
    isPresident: Boolean(data?.isPresident),
  };
}

export async function fetchComplianceState(): Promise<ComplianceState> {
  const response = await fetch(COMPLIANCE_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    checkedItems: (data?.checkedItems && typeof data.checkedItems === "object")
      ? Object.fromEntries(
        Object.entries(data.checkedItems).map(([key, value]) => [key, Boolean(value)]),
      )
      : {},
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function saveComplianceState(checkedItems: Record<string, boolean>): Promise<ComplianceState> {
  const response = await fetch(COMPLIANCE_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ checkedItems }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    checkedItems: (data?.checkedItems && typeof data.checkedItems === "object")
      ? Object.fromEntries(
        Object.entries(data.checkedItems).map(([key, value]) => [key, Boolean(value)]),
      )
      : {},
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function fetchLeadershipContent(): Promise<LeadershipContentResponse> {
  const response = await fetch(LEADERSHIP_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    found: Boolean(data?.found),
    data: {
      executiveBoard: Array.isArray(data?.data?.executiveBoard) ? data.data.executiveBoard : [],
      additionalChairs: Array.isArray(data?.data?.additionalChairs) ? data.data.additionalChairs : [],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function saveLeadershipContent(content: LeadershipContent): Promise<LeadershipContentResponse> {
  const response = await fetch(LEADERSHIP_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(content),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    found: Boolean(data?.found),
    data: {
      executiveBoard: Array.isArray(data?.data?.executiveBoard) ? data.data.executiveBoard : [],
      additionalChairs: Array.isArray(data?.data?.additionalChairs) ? data.data.additionalChairs : [],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export type MemberDirectoryResponse = {
  found: boolean;
  data: MemberDirectory;
  updatedAt: string | null;
  updatedBy: string | null;
};

export async function fetchMemberDirectory(): Promise<MemberDirectoryResponse> {
  const response = await fetch(MEMBER_DIRECTORY_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    found: Boolean(data?.found),
    data: {
      entries: Array.isArray(data?.data?.entries) ? data.data.entries : [],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function saveMemberDirectory(directory: MemberDirectory): Promise<MemberDirectoryResponse> {
  const response = await fetch(MEMBER_DIRECTORY_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(directory),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    found: Boolean(data?.found),
    data: {
      entries: Array.isArray(data?.data?.entries) ? data.data.entries : [],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

function normalizeRosterAuditEntry(raw: any): MembershipRosterAuditEntry | null {
  const email = raw?.email ? String(raw.email).trim().toLowerCase() : "";
  if (!email || !email.includes("@")) return null;
  const displayName = String(raw?.displayName || "").trim() || email;
  const designation = String(raw?.designation || "").trim();
  const status = String(raw?.status || "").trim().toLowerCase() === "remove" ? "remove" : "current";
  return {
    email,
    displayName,
    designation: designation || undefined,
    status,
  };
}

export async function fetchMembershipRosterAudit(): Promise<MembershipRosterAuditResponse> {
  const response = await fetch(MEMBER_ROSTER_AUDIT_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const rows = Array.isArray(data?.data?.entries) ? data.data.entries : [];
  return {
    found: Boolean(data?.found),
    data: {
      entries: rows.map(normalizeRosterAuditEntry).filter(Boolean) as MembershipRosterAuditEntry[],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function saveMembershipRosterAudit(entries: MembershipRosterAuditEntry[]): Promise<MembershipRosterAuditResponse> {
  const response = await fetch(MEMBER_ROSTER_AUDIT_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ entries }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const rows = Array.isArray(data?.data?.entries) ? data.data.entries : [];
  return {
    found: Boolean(data?.found),
    data: {
      entries: rows.map(normalizeRosterAuditEntry).filter(Boolean) as MembershipRosterAuditEntry[],
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

function normalizeDuesEntry(raw: any, fallbackIndex = 0): ChapterDuesEntry | null {
  const chapter = String(raw?.chapter || "").trim();
  if (!chapter) return null;
  return {
    id: String(raw?.id || `dues-${fallbackIndex + 1}`).trim() || `dues-${fallbackIndex + 1}`,
    chapter,
    paidDate: String(raw?.paidDate || "").trim(),
  };
}

function defaultChapterDuesEntries(): ChapterDuesEntry[] {
  return DEFAULT_DUES_CHAPTERS.map((chapter, index) => ({
    id: `dues-${index + 1}`,
    chapter,
    paidDate: "",
  }));
}

function mergeChapterDuesEntries(rows: ChapterDuesEntry[]): ChapterDuesEntry[] {
  const defaults = defaultChapterDuesEntries();
  const byChapter = new Map(rows.map((row) => [row.chapter.trim().toLowerCase(), row]));
  const merged = defaults.map((row) => {
    const hit = byChapter.get(row.chapter.trim().toLowerCase());
    return hit ? { ...row, ...hit, chapter: row.chapter } : row;
  });
  const defaultNames = new Set(defaults.map((row) => row.chapter.trim().toLowerCase()));
  const extras = rows.filter((row) => !defaultNames.has(row.chapter.trim().toLowerCase()));
  return [...merged, ...extras];
}

export async function fetchChapterDuesTracker(): Promise<ChapterDuesTrackerResponse> {
  const response = await fetch(CHAPTER_DUES_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const rawEntries = Array.isArray(data?.data?.entries) ? data.data.entries : [];
  const entries = mergeChapterDuesEntries(
    rawEntries.map((row: any, index: number) => normalizeDuesEntry(row, index)).filter(Boolean) as ChapterDuesEntry[],
  );

  return {
    found: Boolean(data?.found),
    data: { entries },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function saveChapterDuesTracker(entries: ChapterDuesEntry[]): Promise<ChapterDuesTrackerResponse> {
  const response = await fetch(CHAPTER_DUES_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      entries: mergeChapterDuesEntries(
        entries.map((row, index) => normalizeDuesEntry(row, index)).filter(Boolean) as ChapterDuesEntry[],
      ),
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const rawEntries = Array.isArray(data?.data?.entries) ? data.data.entries : [];
  return {
    found: Boolean(data?.found),
    data: {
      entries: mergeChapterDuesEntries(
        rawEntries.map((row: any, index: number) => normalizeDuesEntry(row, index)).filter(Boolean) as ChapterDuesEntry[],
      ),
    },
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

function normalizeOverrideEntry(raw: any): AccessOverrideEntry | null {
  const email = raw?.email ? String(raw.email).trim().toLowerCase() : "";
  if (!email) return null;

  const toFlag = (value: any): boolean | null => {
    if (value === true || value === false) return value;
    return null;
  };

  return {
    email,
    isCouncilAdmin: toFlag(raw?.isCouncilAdmin),
    isTreasuryAdmin: toFlag(raw?.isTreasuryAdmin),
    isSiteEditor: toFlag(raw?.isSiteEditor),
    isPresident: toFlag(raw?.isPresident),
    note: String(raw?.note || "").trim(),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : null,
    updatedBy: raw?.updatedBy ? String(raw.updatedBy) : null,
  };
}

export async function fetchSiteMaintenancePayload(): Promise<SiteMaintenancePayload> {
  const response = await fetch(SITE_MAINTENANCE_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const overridesRaw = Array.isArray(data?.overrides) ? data.overrides : [];
  const overrides = overridesRaw.map(normalizeOverrideEntry).filter(Boolean) as AccessOverrideEntry[];
  const metricsRaw = data?.metrics || {};

  return {
    overrides,
    metrics: {
      pageViews24h: Number(metricsRaw?.pageViews24h || 0),
      pageViews7d: Number(metricsRaw?.pageViews7d || 0),
      distinctUsers7d: Number(metricsRaw?.distinctUsers7d || 0),
      activeUsers15m: Number(metricsRaw?.activeUsers15m || 0),
      topPages7d: Array.isArray(metricsRaw?.topPages7d)
        ? metricsRaw.topPages7d.map((row: any) => ({
          path: String(row?.path || ""),
          hits: Number(row?.hits || 0),
        }))
        : [],
      recentActivity: Array.isArray(metricsRaw?.recentActivity)
        ? metricsRaw.recentActivity.map((row: any) => ({
          email: row?.email ? String(row.email) : null,
          eventType: String(row?.eventType || ""),
          path: row?.path ? String(row.path) : null,
          createdAt: row?.createdAt ? String(row.createdAt) : null,
        }))
        : [],
    },
    knownUsers: Array.isArray(data?.knownUsers) ? data.knownUsers.map((v: any) => String(v).trim().toLowerCase()).filter(Boolean) : [],
    viewer: data?.viewer ? String(data.viewer).trim().toLowerCase() : null,
  };
}

export async function saveSiteMaintenanceOverrides(entries: AccessOverrideEntry[]): Promise<{
  saved: boolean;
  entries: AccessOverrideEntry[];
  updatedAt: string | null;
  updatedBy: string | null;
}> {
  const response = await fetch(SITE_MAINTENANCE_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ entries }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const savedEntries = Array.isArray(data?.entries) ? data.entries.map(normalizeOverrideEntry).filter(Boolean) as AccessOverrideEntry[] : [];
  return {
    saved: Boolean(data?.saved),
    entries: savedEntries,
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
    updatedBy: data?.updatedBy ? String(data.updatedBy) : null,
  };
}

export async function trackPortalActivity(path: string, eventType = "page_view"): Promise<void> {
  try {
    await fetch(ANALYTICS_TRACK_ENDPOINT, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        path: String(path || "").trim(),
        eventType: String(eventType || "page_view").trim() || "page_view",
      }),
    });
  } catch {
    // telemetry should never block UI
  }
}
