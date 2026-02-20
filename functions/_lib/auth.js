import { applyAccessOverrides, readAccessOverrides } from "./access-controls";

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

function normalizeTitle(value) {
  return String(value || "").trim().toLowerCase();
}

const EXEC_TREASURY_ACCESS_TITLES = new Set(["president", "treasurer", "financial secretary"]);

async function readLeadershipFromDb(db) {
  if (!db) return null;
  try {
    const row = await db
      .prepare(
        `SELECT payload_json
         FROM portal_content_state
         WHERE section_key = 'chapter_leadership'
         LIMIT 1`,
      )
      .first();

    if (!row?.payload_json) return null;
    const parsed = JSON.parse(row.payload_json || "{}");
    const executiveBoard = Array.isArray(parsed?.executiveBoard) ? parsed.executiveBoard : [];
    const additionalChairs = Array.isArray(parsed?.additionalChairs) ? parsed.additionalChairs : [];
    return { executiveBoard, additionalChairs };
  } catch {
    return null;
  }
}

function buildLeadershipAccessMaps(leadership) {
  const leadershipEmails = new Set();
  const treasuryAccessEmails = new Set();
  const presidentEmails = new Set();

  const add = (emailRaw) => {
    const email = normalizeEmail(emailRaw);
    if (email) leadershipEmails.add(email);
    return email;
  };

  for (const member of leadership?.executiveBoard || []) {
    const email = add(member?.email);
    const title = normalizeTitle(member?.title);
    if (email && title === "president") {
      presidentEmails.add(email);
    }
    if (email && EXEC_TREASURY_ACCESS_TITLES.has(title)) {
      treasuryAccessEmails.add(email);
    }
  }

  return { leadershipEmails, treasuryAccessEmails, presidentEmails };
}

export function getAuthenticatedEmail(request) {
  for (const headerName of EMAIL_HEADER_CANDIDATES) {
    const value = request.headers.get(headerName);
    if (value) return normalizeEmail(value);
  }
  return "";
}

function getCookieValue(cookieHeader, key) {
  const raw = String(cookieHeader || "");
  const parts = raw.split(";");
  const target = String(key || "").trim().toLowerCase();
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (String(k || "").trim().toLowerCase() !== target) continue;
    return rest.join("=").trim();
  }
  return "";
}

function decodeJwtPayload(token) {
  const t = String(token || "");
  const parts = t.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getEmailFromAccessCookie(request) {
  const cookie = request.headers.get("cookie") || "";
  // Primary Access session cookie name.
  const token = getCookieValue(cookie, "CF_Authorization") || getCookieValue(cookie, "cf_authorization");
  if (!token) return "";
  const payload = decodeJwtPayload(token);
  return normalizeEmail(payload?.email || payload?.sub || "");
}

function getAccessJwt(request) {
  for (const headerName of JWT_HEADER_CANDIDATES) {
    const value = request.headers.get(headerName);
    if (value) return String(value);
  }
  return "";
}

function getEmailFromAccessJwt(request) {
  const token = getAccessJwt(request);
  if (!token) return "";
  const payload = decodeJwtPayload(token);
  return normalizeEmail(payload?.email || payload?.sub || "");
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
    email = getEmailFromAccessJwt(request);
  }
  if (!email) {
    try {
      const identity = await getAccessIdentityViaCdnCgi(request);
      if (identity?.email) email = identity.email;
    } catch {
      // ignore
    }
  }
  if (!email) {
    email = getEmailFromAccessCookie(request);
  }
  const allowlist = parseCouncilAdminEmails(env.COUNCIL_ADMIN_EMAILS || "");
  const siteEditorRaw =
    env.SITE_ADMIN_EMAILS ||
    env.SITE_EDITOR_EMAILS ||
    "";
  const fallbackPresidentEmail = "president.nphcofhc@gmail.com";
  const siteEditors = (() => {
    const parsed = parseSiteEditorEmails(siteEditorRaw);
    if (parsed.length > 0) return parsed;
    // Safe default: if the allowlist isn't configured, only allow the president.
    return [fallbackPresidentEmail];
  })();
  const isAuthenticated = email.length > 0;
  const isFallbackPresident = isAuthenticated && email === fallbackPresidentEmail;
  let isCouncilAdmin = isAuthenticated && (allowlist.includes(email) || isFallbackPresident);
  let isTreasuryAdmin = isFallbackPresident;
  let isPresident = isFallbackPresident;

  // Prefer DB-backed leadership/role checks as the source of truth.
  // If no leadership data is configured yet, fall back to env allowlists to avoid lockouts.
  if (isAuthenticated && env.DB) {
    const leadership = await readLeadershipFromDb(env.DB);
    if (leadership) {
      const maps = buildLeadershipAccessMaps(leadership);
      const hasLeadershipEntries = maps.leadershipEmails.size > 0;
      const hasTreasuryEntries = maps.treasuryAccessEmails.size > 0;
      const hasPresidentEntries = maps.presidentEmails.size > 0;

      if (hasLeadershipEntries) {
        isCouncilAdmin = maps.leadershipEmails.has(email) || isFallbackPresident;
      }
      if (hasTreasuryEntries) {
        isTreasuryAdmin = maps.treasuryAccessEmails.has(email) || isFallbackPresident;
      }
      if (hasPresidentEntries) {
        isPresident = maps.presidentEmails.has(email) || isFallbackPresident;
      }
    }
  }
  // Site editors are a tighter allowlist used for content updates.
  // This is intentionally separate from COUNCIL_ADMIN_EMAILS.
  const isSiteEditor = isAuthenticated && siteEditors.includes(email);
  // Site administrators should always retain council admin access.
  if (isSiteEditor) {
    isCouncilAdmin = true;
  }

  let resolved = {
    email,
    isAuthenticated,
    isCouncilAdmin,
    isTreasuryAdmin,
    isSiteEditor,
    isPresident,
  };

  if (isAuthenticated && env.DB) {
    try {
      const overrides = await readAccessOverrides(env.DB);
      resolved = applyAccessOverrides(resolved, email, overrides);
      // Keep role relationships coherent after overrides.
      if (resolved.isSiteEditor) resolved.isCouncilAdmin = true;
      if (resolved.isPresident) {
        resolved.isCouncilAdmin = true;
        resolved.isTreasuryAdmin = true;
        resolved.isSiteEditor = true;
      }
    } catch {
      // ignore override resolution errors
    }
  }

  if (isFallbackPresident) {
    resolved.isCouncilAdmin = true;
    resolved.isTreasuryAdmin = true;
    resolved.isSiteEditor = true;
    resolved.isPresident = true;
  }

  return resolved;
}
