import type { LeadershipContent } from "./leadership";
import type { MemberDirectory } from "./member-directory";

export type CouncilSession = {
  authenticated: boolean;
  email: string | null;
  isCouncilAdmin: boolean;
  isSiteEditor: boolean;
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

const SESSION_ENDPOINT = "/api/admin/session";
const COMPLIANCE_ENDPOINT = "/api/admin/compliance";
const LEADERSHIP_ENDPOINT = "/api/content/chapter-leadership";
const MEMBER_DIRECTORY_ENDPOINT = "/api/content/member-directory";

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
    isSiteEditor: Boolean(data?.isSiteEditor),
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
