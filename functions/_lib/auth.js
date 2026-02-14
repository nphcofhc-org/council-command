const EMAIL_HEADER_CANDIDATES = [
  "cf-access-authenticated-user-email",
  "x-cf-access-authenticated-user-email",
];
const JWT_HEADER_CANDIDATES = [
  "cf-access-jwt-assertion",
  "x-cf-access-jwt-assertion",
];

function normalizeEmail(value) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

export function getAuthenticatedEmail(request) {
  for (const headerName of EMAIL_HEADER_CANDIDATES) {
    const value = request.headers.get(headerName);
    if (value) return normalizeEmail(value);
  }
  return "";
}

function getAccessJwt(request) {
  for (const headerName of JWT_HEADER_CANDIDATES) {
    const value = request.headers.get(headerName);
    if (value) return String(value);
  }
  return "";
}

async function getAccessIdentityViaCdnCgi(request) {
  const url = new URL(request.url);
  const cookie = request.headers.get("cookie") || "";

  // If there is no Access cookie and no Access JWT header, don't bother.
  const hasAccessSignals = cookie.toLowerCase().includes("cf_authorization=") || Boolean(getAccessJwt(request));
  if (!hasAccessSignals) return null;

  // Cloudflare Access exposes identity for the current session at this endpoint.
  const identityUrl = `${url.origin}/cdn-cgi/access/get-identity`;
  const res = await fetch(identityUrl, {
    method: "GET",
    headers: {
      accept: "application/json",
      cookie,
    },
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data || typeof data !== "object") return null;

  // Common shape: { email: "user@domain" }
  const email = normalizeEmail(data.email);
  if (email) return { email };

  // Fallback: sometimes nested.
  const nestedEmail = normalizeEmail(data?.identity?.email);
  if (nestedEmail) return { email: nestedEmail };

  return null;
}

export function parseCouncilAdminEmails(rawValue) {
  if (!rawValue) return [];
  return String(rawValue)
    .split(",")
    .map((part) => normalizeEmail(part))
    .filter(Boolean);
}

export function parseSiteEditorEmails(rawValue) {
  return parseCouncilAdminEmails(rawValue);
}

export async function getSessionState(request, env) {
  let email = getAuthenticatedEmail(request);
  if (!email) {
    try {
      const identity = await getAccessIdentityViaCdnCgi(request);
      if (identity?.email) email = identity.email;
    } catch {
      // ignore
    }
  }
  const allowlist = parseCouncilAdminEmails(env.COUNCIL_ADMIN_EMAILS || "");
  const siteEditors = parseSiteEditorEmails(env.SITE_EDITOR_EMAILS || "");
  const isAuthenticated = email.length > 0;
  const isCouncilAdmin = isAuthenticated && allowlist.includes(email);
  // Site editors are a tighter allowlist used for content updates.
  // This is intentionally separate from COUNCIL_ADMIN_EMAILS.
  const isSiteEditor = isAuthenticated && siteEditors.includes(email);

  return {
    email,
    isAuthenticated,
    isCouncilAdmin,
    isSiteEditor,
  };
}
