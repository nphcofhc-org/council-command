const EMAIL_HEADER_CANDIDATES = [
  "cf-access-authenticated-user-email",
  "x-cf-access-authenticated-user-email",
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

export function parseCouncilAdminEmails(rawValue) {
  if (!rawValue) return [];
  return String(rawValue)
    .split(",")
    .map((part) => normalizeEmail(part))
    .filter(Boolean);
}

export function getSessionState(request, env) {
  const email = getAuthenticatedEmail(request);
  const allowlist = parseCouncilAdminEmails(env.COUNCIL_ADMIN_EMAILS || "");
  const isAuthenticated = email.length > 0;
  const isCouncilAdmin = isAuthenticated && allowlist.includes(email);

  return {
    email,
    isAuthenticated,
    isCouncilAdmin,
  };
}
