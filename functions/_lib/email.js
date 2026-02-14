import { json } from "./http";

function asBoolEnv(value) {
  const s = String(value || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

export function isEmailEnabled(env) {
  return asBoolEnv(env?.EMAIL_ENABLED);
}

function toFrom(env) {
  const fromEmail = String(env?.EMAIL_FROM || "").trim() || "no-reply@portal.nphcofhudsoncounty.org";
  const fromName = String(env?.EMAIL_FROM_NAME || "").trim() || "NPHC Hudson County Portal";
  return { email: fromEmail, name: fromName };
}

function safeSubject(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, 180);
}

function toPlainText(value) {
  return String(value || "").replace(/\r\n/g, "\n").slice(0, 48_000);
}

export async function sendEmail(env, { to, subject, text, replyTo }) {
  if (!isEmailEnabled(env)) return { ok: false, skipped: true, reason: "EMAIL_ENABLED is not set." };

  const provider = String(env?.EMAIL_PROVIDER || "mailchannels").trim().toLowerCase();
  if (provider !== "mailchannels") {
    return { ok: false, skipped: true, reason: `Unsupported EMAIL_PROVIDER "${provider}".` };
  }

  const from = toFrom(env);
  const payload = {
    personalizations: [
      {
        to: (to || []).map((email) => ({ email })),
      },
    ],
    from,
    subject: safeSubject(subject),
    content: [{ type: "text/plain", value: toPlainText(text) }],
    ...(replyTo ? { reply_to: { email: String(replyTo).trim() } } : {}),
  };

  const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    return { ok: false, skipped: false, reason: `Email send failed (${res.status}). ${detail}`.trim() };
  }

  return { ok: true };
}

export function requireEmailConfigured(env) {
  if (!isEmailEnabled(env)) {
    return json(
      { error: 'Email is not enabled. Set EMAIL_ENABLED=true in Cloudflare Pages env vars.' },
      { status: 503 },
    );
  }
  return null;
}

