import { useEffect, useMemo, useState } from "react";
import { Download, Printer, Scale } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCouncilSession } from "../hooks/use-council-session";
import { fetchDecisionVotesAsAdmin, fetchMyDecisionVote, submitDecisionVote } from "../data/decision-api";
import { fetchDecisionPortalOverride } from "../data/content-api";
import type { DecisionPortalContent } from "../data/types";

type VoteChoice = "block" | "unity";

type StoredVote = {
  choice: VoteChoice;
  timestamp: string;
};

const LOGO_URL =
  "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20of%20HC%20LOGO%20Black.PNG";

const STORAGE_KEY = "nphcDecisionPortalVotes";
const DEFAULT_DECISION_KEY = "2026-block-party-vs-unity-bbq";

const DEFAULT_CONTENT: DecisionPortalContent = {
  decisionKey: DEFAULT_DECISION_KEY,
  title: "2026 Summer Signature Event Decision",
  subtitle: "Review the brief, then submit your confidential vote.",
  summary:
    "Use this page to review the committee comparison and submit a confidential vote.\n\n" +
    "Recommended reading:\n" +
    "- Signature Event Comparison (interactive report)",
  options: [
    { id: "block", label: "Neighborhood Block Party", description: "" },
    { id: "unity", label: "Unity BBQ", description: "" },
  ],
  links: [
    { id: "lnk-interactive", label: "Open Interactive Report", url: "#/reports/signature-event-comparison" },
  ],
  isOpen: true,
};

const unityScores = { impact: 3, unity: 5, feasibility: 4 };
const blockScores = { impact: 5, unity: 4, feasibility: 3 };

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export function DecisionPortalPage() {
  const { session } = useCouncilSession();

  const [impact, setImpact] = useState(5);
  const [unity, setUnity] = useState(3);
  const [feasibility, setFeasibility] = useState(4);

  const [votes, setVotes] = useState<StoredVote[]>([]);
  const [confirmation, setConfirmation] = useState<string>("");
  const [hasServerVote, setHasServerVote] = useState<boolean>(false);
  const [content, setContent] = useState<DecisionPortalContent>(DEFAULT_CONTENT);

  const decisionKey = content.decisionKey || DEFAULT_DECISION_KEY;
  const blockOption = content.options.find((o) => o.id === "block") || DEFAULT_CONTENT.options[0];
  const unityOption = content.options.find((o) => o.id === "unity") || DEFAULT_CONTENT.options[1];
  const links = useMemo(() => {
    // Hide the legacy PDF link for this decision (we only want the interactive report in the portal UI).
    return (content.links || []).filter((l) => String(l?.url || "").trim() !== "/docs/event-comparison-report-nphc-2026.pdf");
  }, [content.links]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setVotes(
          parsed
            .map((v) => ({
              choice: v?.choice === "block" ? "block" : v?.choice === "unity" ? "unity" : null,
              timestamp: typeof v?.timestamp === "string" ? v.timestamp : null,
            }))
            .filter((v) => v.choice && v.timestamp) as StoredVote[],
        );
      }
    } catch {
      // Ignore invalid local data.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchDecisionPortalOverride()
      .then((res) => {
        if (cancelled) return;
        if (!res.found || !res.data) return;
        setContent(res.data);
      })
      .catch(() => {
        // ignore - keep defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session.authenticated) return;
    void fetchMyDecisionVote(decisionKey)
      .then((res) => {
        setHasServerVote(Boolean(res.found));
      })
      .catch(() => {
        // ignore
      });
  }, [session.authenticated, decisionKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  }, [votes]);

  const weighted = useMemo(() => {
    const wImpact = clampInt(impact, 1, 5);
    const wUnity = clampInt(unity, 1, 5);
    const wFeas = clampInt(feasibility, 1, 5);

    const unityTotal =
      unityScores.impact * wImpact +
      unityScores.unity * wUnity +
      unityScores.feasibility * wFeas;
    const blockTotal =
      blockScores.impact * wImpact +
      blockScores.unity * wUnity +
      blockScores.feasibility * wFeas;

    return {
      unityTotal,
      blockTotal,
      recommendation:
        blockTotal > unityTotal ? "Higher Weighted: Neighborhood Block Party" : "Higher Weighted: Unity BBQ",
    };
  }, [impact, unity, feasibility]);

  const submitVote = (choice: VoteChoice) => {
    const payload = { choice, timestamp: new Date().toISOString() };
    setVotes((prev) => [...prev, payload].slice(-500));

    if (!session.authenticated) {
      setConfirmation("Vote submitted successfully. (Stored locally on this device only.)");
      setTimeout(() => setConfirmation(""), 3500);
      return;
    }

    void submitDecisionVote({
      decisionKey,
      choice,
      weights: {
        impact,
        unity,
        feasibility,
        recommendation: weighted.recommendation,
      },
    })
      .then(() => {
        setHasServerVote(true);
        setConfirmation("Vote submitted successfully. (Council-wide confidential submission recorded.)");
        setTimeout(() => setConfirmation(""), 3500);
      })
      .catch((err) => {
        setConfirmation(err instanceof Error ? err.message : "Vote failed to submit.");
        setTimeout(() => setConfirmation(""), 5000);
      });
  };

  const exportVotes = () => {
    if (!session.isCouncilAdmin) return;
    void fetchDecisionVotesAsAdmin(decisionKey)
      .then((res) => {
        downloadJson("NPHC_DecisionPortal_Votes.json", res);
      })
      .catch((err) => {
        setConfirmation(err instanceof Error ? err.message : "Export failed.");
        setTimeout(() => setConfirmation(""), 5000);
      });
  };

  return (
    <div className="relative">
      <style>{`
        @media print {
          nav, footer { display: none !important; }
          main { padding: 0 !important; }
        }
      `}</style>

      <header className="relative overflow-hidden py-12 sm:py-16 px-4 sm:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 size-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px bg-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-white/60">Decision Portal</span>
            <div className="w-10 h-px bg-primary" />
          </div>

          <div className="mx-auto inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <img src={LOGO_URL} alt="NPHC of Hudson County Logo" className="h-12 w-auto" />
          </div>

          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">NPHC of Hudson County</h1>
          <p className="text-sm text-white/70 mt-2">Interactive Decision & Confidential Voting Portal</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-6">
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>{content.title}</CardTitle>
              <p className="text-sm text-white/70">{content.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {content.summary ? <p className="text-sm text-white/75 whitespace-pre-wrap">{content.summary}</p> : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60 mb-1">Option A</p>
                  <p className="text-sm font-semibold text-white">{blockOption.label}</p>
                  {blockOption.description ? (
                    <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{blockOption.description}</p>
                  ) : null}
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60 mb-1">Option B</p>
                  <p className="text-sm font-semibold text-white">{unityOption.label}</p>
                  {unityOption.description ? (
                    <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{unityOption.description}</p>
                  ) : null}
                </div>
              </div>

              {links.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-widest text-white/60">Links</p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                    {links.map((lnk) => (
                      <a
                        key={lnk.id}
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:border-primary/60 hover:text-primary hover:bg-white/10 transition w-fit"
                      >
                        {lnk.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {!content.isOpen ? (
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Voting is currently closed for this decision.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="size-5" />
                Weighted Decision Simulator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-white/70">
                Use the sliders below to weight strategic priorities and determine the higher weighted recommendation.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-white">Community Impact</label>
                    <span className="text-xs text-white/60">Weight: {impact}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-white">Inter-Organizational Unity</label>
                    <span className="text-xs text-white/60">Weight: {unity}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={unity}
                    onChange={(e) => setUnity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-white">Feasibility</label>
                    <span className="text-xs text-white/60">Weight: {feasibility}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={feasibility}
                    onChange={(e) => setFeasibility(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-bold text-white">{weighted.recommendation}</p>
                <p className="text-xs text-white/60 mt-1">
                  (Internal scoring only. Vote results are never shown publicly.)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Confidential Preference Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/70">
                Submit your independent choice. Your vote is submitted confidentially for council-wide access control,
                and never displayed publicly. (A local copy is kept on this device for continuity.)
              </p>
              {session.authenticated && hasServerVote ? (
                <p className="text-xs text-white/60">
                  Note: you have already submitted a vote for this decision. Submitting again will update your vote.
                </p>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => submitVote("block")} disabled={!content.isOpen}>
                  Vote: {blockOption.label}
                </Button>
                <Button onClick={() => submitVote("unity")} disabled={!content.isOpen}>
                  Vote: {unityOption.label}
                </Button>
              </div>

              {confirmation ? <p className="text-sm font-semibold text-white">{confirmation}</p> : null}

              <hr className="my-2" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Admin Export</p>
                  <p className="text-xs text-white/60">
                    Downloads council-wide vote history for this decision.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={exportVotes}
                  disabled={!session.isCouncilAdmin}
                  className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
                >
                  <Download className="size-4" />
                  Download Vote Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Print Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/70">
                Use your browser’s print function to generate a PDF snapshot of the decision simulator.
              </p>
              <Button
                variant="outline"
                className="gap-2 border-white/15 bg-white/5 text-white hover:border-primary/60 hover:text-primary hover:bg-white/10"
                onClick={() => window.print()}
              >
                <Printer className="size-4" />
                Print / Save PDF
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
