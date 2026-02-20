type AssistMode = "facilitator" | "summary" | "minutes";

const MEETING_ASSIST_ENDPOINT = "/api/meeting/assist";

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // noop
  }
  return `Request failed (${response.status})`;
}

export async function requestMeetingAssist(mode: AssistMode, meetingContext: string): Promise<string> {
  const response = await fetch(MEETING_ASSIST_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      mode,
      meetingContext,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json();
  const text = String(data?.text || "").trim();
  if (!text) throw new Error("AI returned no text.");
  return text;
}
