export type MemberProfile = {
  firstName: string;
  lastName: string;
  organization: string;
  notifyConsent: boolean;
  notifyConsentAt?: string | null;
  noticeVersion?: string | null;
};

export const DIVINE_NINE_ORGANIZATIONS = [
  "Alpha Phi Alpha Fraternity, Inc.",
  "Alpha Kappa Alpha Sorority, Inc.",
  "Kappa Alpha Psi Fraternity, Inc.",
  "Omega Psi Phi Fraternity, Inc.",
  "Delta Sigma Theta Sorority, Inc.",
  "Phi Beta Sigma Fraternity, Inc.",
  "Zeta Phi Beta Sorority, Inc.",
  "Sigma Gamma Rho Sorority, Inc.",
  "Iota Phi Theta Fraternity, Inc.",
] as const;

const DEFAULT_PROFILE: MemberProfile = {
  firstName: "",
  lastName: "",
  organization: "",
  notifyConsent: false,
  notifyConsentAt: null,
  noticeVersion: "v1",
};

const PROFILE_ENDPOINT = "/api/profile/me";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // noop
  }
  return `Request failed (${response.status})`;
}

function normalizeProfile(input: any): MemberProfile {
  return {
    firstName: String(input?.firstName || "").trim(),
    lastName: String(input?.lastName || "").trim(),
    organization: String(input?.organization || "").trim(),
    notifyConsent: input?.notifyConsent === true,
    notifyConsentAt: input?.notifyConsentAt ? String(input.notifyConsentAt) : null,
    noticeVersion: input?.noticeVersion ? String(input.noticeVersion) : "v1",
  };
}

export async function fetchMyMemberProfile(): Promise<{ found: boolean; data: MemberProfile; updatedAt: string | null }> {
  const response = await fetch(PROFILE_ENDPOINT, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    found: Boolean(data?.found),
    data: data?.data ? normalizeProfile(data.data) : DEFAULT_PROFILE,
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
  };
}

export async function saveMyMemberProfile(profile: MemberProfile): Promise<{ data: MemberProfile; updatedAt: string | null }> {
  const response = await fetch(PROFILE_ENDPOINT, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(normalizeProfile(profile)),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  return {
    data: normalizeProfile(data?.data || profile),
    updatedAt: data?.updatedAt ? String(data.updatedAt) : null,
  };
}

export function isProfileComplete(profile: MemberProfile | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(profile.firstName && profile.lastName && profile.organization && profile.notifyConsent);
}
