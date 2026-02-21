function clampText(value, max = 400) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.slice(0, max);
}

function toDataUrl(contentType, bytes) {
  const arr = new Uint8Array(bytes);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    const part = arr.subarray(i, i + chunk);
    binary += String.fromCharCode(...part);
  }
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

function extractUploadKeyFromUrl(flyerUrl) {
  const raw = String(flyerUrl || "").trim();
  if (!raw) return "";
  if (raw.startsWith("/api/uploads/social/")) {
    return decodeURIComponent(raw.replace("/api/uploads/social/", "").split("?")[0]);
  }
  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/api/uploads/social/")) {
      return decodeURIComponent(parsed.pathname.replace("/api/uploads/social/", ""));
    }
  } catch {
    // ignore malformed URL
  }
  return "";
}

async function readImageAsDataUrl(env, flyerUrl) {
  const key = extractUploadKeyFromUrl(flyerUrl);
  if (key && env.RECEIPTS_BUCKET) {
    const obj = await env.RECEIPTS_BUCKET.get(key);
    if (!obj) throw new Error("Uploaded flyer file was not found.");
    const contentType = String(obj.httpMetadata?.contentType || "").toLowerCase();
    if (!contentType.startsWith("image/")) {
      throw new Error("Autofill currently supports image flyers. Please use JPG/PNG/WEBP.");
    }
    const buffer = await obj.arrayBuffer();
    if (buffer.byteLength > 8 * 1024 * 1024) {
      throw new Error("Flyer image is too large for autofill (max 8MB).");
    }
    return toDataUrl(contentType, buffer);
  }

  const res = await fetch(String(flyerUrl), {
    method: "GET",
    headers: {
      "user-agent": "NPHC-Council-Command/1.0",
      accept: "image/*",
    },
  });
  if (!res.ok) throw new Error(`Unable to fetch flyer URL (${res.status}).`);
  const contentType = String(res.headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("image/")) {
    throw new Error("Autofill currently supports image URLs only (JPG/PNG/WEBP).");
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > 8 * 1024 * 1024) {
    throw new Error("Flyer image is too large for autofill (max 8MB).");
  }
  return toDataUrl(contentType, buffer);
}

function parseJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function sanitizeAutofillFields(input) {
  const obj = input && typeof input === "object" ? input : {};
  return {
    eventName: clampText(obj.eventName, 180),
    eventDate: normalizeDate(obj.eventDate),
    startTime: clampText(obj.startTime, 60),
    endTime: clampText(obj.endTime, 60),
    location: clampText(obj.location, 220),
    organization: clampText(obj.organization, 180),
    chapterName: clampText(obj.chapterName, 180),
    caption: clampText(obj.caption, 1200),
    hashtags: clampText(obj.hashtags, 260),
    chapterHandle: clampText(obj.chapterHandle, 140),
    description: clampText(obj.description, 1600),
    eventLinkUrl: clampText(obj.eventLinkUrl, 600),
    confidence: Number.isFinite(Number(obj.confidence)) ? Math.max(0, Math.min(1, Number(obj.confidence))) : null,
    notes: clampText(obj.notes, 300),
  };
}

export async function analyzeFlyerWithOpenAI({ env, flyerUrl, formType }) {
  const apiKey = String(env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Flyer autofill is not configured yet. Missing OPENAI_API_KEY.");
  }

  const imageDataUrl = await readImageAsDataUrl(env, flyerUrl);
  const systemPrompt = [
    "You extract structured event details from a flyer image.",
    "Return strict JSON with keys:",
    "eventName, eventDate, startTime, endTime, location, organization, chapterName, caption, hashtags, chapterHandle, description, eventLinkUrl, confidence, notes.",
    "Use empty string if unknown. Use YYYY-MM-DD for eventDate when possible.",
    "confidence must be 0..1.",
    `Context form type: ${String(formType || "general")}.`,
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract details for autofill." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text.slice(0, 220)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = parseJsonObject(content);
  if (!parsed) {
    throw new Error("Could not parse autofill response.");
  }
  return sanitizeAutofillFields(parsed);
}
