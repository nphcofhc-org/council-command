import { getSessionState } from "../../_lib/auth";
import { json, methodNotAllowed } from "../../_lib/http";

function coerceText(value, max = 12000) {
  return String(value || "").trim().slice(0, max);
}

function buildPrompt(mode, payload) {
  const meetingContext = coerceText(payload?.meetingContext, 20000);

  if (mode === "minutes") {
    return [
      "Create formal meeting minutes from the provided meeting data.",
      "Include: attendance snapshot, motions submitted, motion second status, vote outcomes, floor votes, and open actions.",
      "Use concise professional language and bullet points where useful.",
      "",
      "MEETING DATA:",
      meetingContext,
    ].join("\n");
  }

  if (mode === "summary") {
    return [
      "Create an executive summary for the chair from the provided meeting data.",
      "Include: decisions, unresolved items, vote highlights, and next actions.",
      "Keep it concise and readable for leadership distribution.",
      "",
      "MEETING DATA:",
      meetingContext,
    ].join("\n");
  }

  return [
    "Act as a meeting facilitation copilot for the chair.",
    "Based on the meeting data, provide: (1) what to say next, (2) procedural prompts, (3) decisions to close, (4) unresolved items.",
    "Use short actionable bullets.",
    "",
    "MEETING DATA:",
    meetingContext,
  ].join("\n");
}

function extractOutputText(responseJson) {
  const direct = coerceText(responseJson?.output_text, 30000);
  if (direct) return direct;

  const output = Array.isArray(responseJson?.output) ? responseJson.output : [];
  const chunks = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const piece of content) {
      if (piece?.type === "output_text" && piece?.text) chunks.push(String(piece.text));
    }
  }
  return coerceText(chunks.join("\n\n"), 30000);
}

async function requireCouncilLeadership(request, env) {
  const session = await getSessionState(request, env);
  if (!session.isAuthenticated) {
    return { ok: false, response: json({ error: "Unauthenticated." }, { status: 401 }) };
  }
  if (!session.isCouncilAdmin) {
    return { ok: false, response: json({ error: "Forbidden: council leadership access required." }, { status: 403 }) };
  }
  return { ok: true, session };
}

export async function onRequestPost({ request, env }) {
  const auth = await requireCouncilLeadership(request, env);
  if (!auth.ok) return auth.response;

  const apiKey = String(env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return json(
      {
        error: "AI is not configured yet. Add OPENAI_API_KEY in Cloudflare Pages Variables/Secrets.",
      },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const mode = String(body?.mode || "facilitator").trim().toLowerCase();
  const allowed = new Set(["facilitator", "summary", "minutes"]);
  if (!allowed.has(mode)) {
    return json({ error: "Invalid mode. Use facilitator, summary, or minutes." }, { status: 400 });
  }

  const meetingContext = coerceText(body?.meetingContext, 20000);
  if (!meetingContext) {
    return json({ error: "Missing meetingContext." }, { status: 400 });
  }

  const prompt = buildPrompt(mode, { meetingContext });
  const model = String(env.OPENAI_MODEL || "gpt-4.1-mini").trim();

  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions:
        "You are assisting a council chair during governance meetings. Be accurate, neutral, concise, and procedural.",
      input: prompt,
      max_output_tokens: 900,
    }),
  });

  const upstreamJson = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return json(
      {
        error: coerceText(upstreamJson?.error?.message || "AI request failed.", 500),
      },
      { status: 502 },
    );
  }

  const text = extractOutputText(upstreamJson);
  if (!text) {
    return json({ error: "AI returned no text output." }, { status: 502 });
  }

  return json({
    ok: true,
    mode,
    text,
  });
}

export async function onRequest({ request, env, next }) {
  if (request.method === "POST") {
    return onRequestPost({ request, env, next });
  }
  return methodNotAllowed(["POST"]);
}
