type DecisionVoteChoice = "block" | "unity";

export type DecisionVote = {
  choice: DecisionVoteChoice;
  weights: {
    impact: number | null;
    unity: number | null;
    feasibility: number | null;
    recommendation: string;
  } | null;
  createdAt: string | null;
  updatedAt: string | null;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

export async function fetchMyDecisionVote(decisionKey: string): Promise<{ found: boolean; vote: DecisionVote | null }> {
  const res = await fetch(`/api/decision/my-vote?decisionKey=${encodeURIComponent(decisionKey)}`, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return {
    found: Boolean(data?.found),
    vote: data?.vote ? (data.vote as DecisionVote) : null,
  };
}

export async function submitDecisionVote(input: {
  decisionKey: string;
  choice: DecisionVoteChoice;
  weights: { impact: number; unity: number; feasibility: number; recommendation: string };
}): Promise<{ ok: boolean; updatedAt: string }> {
  const res = await fetch("/api/decision/vote", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return { ok: Boolean(data?.ok), updatedAt: String(data?.updatedAt || "") };
}

export async function fetchDecisionVotesAsAdmin(decisionKey: string): Promise<{
  decisionKey: string;
  count: number;
  votes: Array<{ voterEmail: string; choice: DecisionVoteChoice; weights: unknown; createdAt: string; updatedAt: string }>;
}> {
  const res = await fetch(`/api/decision/admin/votes?decisionKey=${encodeURIComponent(decisionKey)}`, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as any;
}

