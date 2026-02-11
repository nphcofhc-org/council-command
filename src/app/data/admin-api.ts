export type CouncilSession = {
  authenticated: boolean;
  email: string | null;
  isCouncilAdmin: boolean;
};

export type ComplianceState = {
  checkedItems: Record<string, boolean>;
  updatedAt: string | null;
  updatedBy: string | null;
};

const SESSION_ENDPOINT = "/api/admin/session";
const COMPLIANCE_ENDPOINT = "/api/admin/compliance";

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
