import { useMemo, useState } from "react";
import { Link as LinkIcon, Printer, FileText, ChevronRight } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  LOGO_URL,
  reportMeta,
  keyFindings,
  chapterAssessmentContext,
  evaluationFramework,
  concepts,
  criteria,
  keyDifferentiators,
  budgetRanges,
  blockPartyBudgetBreakdown,
  unityBudgetBreakdown,
  recommendations,
  financialModels,
  riskMitigation,
  riskMatrix,
  implementationTimeline,
  successMetrics,
  decisionFramework,
  references,
} from "../data/signature-event-comparison";

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
        {children}
      </h2>
      {id ? (
        <a
          href={`#${id}`}
          className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors"
          aria-label="Section link"
        >
          <LinkIcon className="size-3" />
          Link
        </a>
      ) : null}
    </div>
  );
}

type DetailMode = "summary" | "full";

export function SignatureEventComparisonReportPage() {
  const [detailMode, setDetailMode] = useState<DetailMode>("summary");

  const radarData = useMemo(() => {
    return criteria.map((c) => ({
      criterion: c.label,
      unity: c.unity.score,
      block: c.block.score,
    }));
  }, []);

  const budgetChartData = useMemo(() => {
    return [
      {
        name: "Unity BBQ",
        min: budgetRanges.unity_bbq.min,
        span: budgetRanges.unity_bbq.max - budgetRanges.unity_bbq.min,
      },
      {
        name: "Block Party",
        min: budgetRanges.block_party.min,
        span: budgetRanges.block_party.max - budgetRanges.block_party.min,
      },
    ];
  }, []);

  return (
    <div className="relative">
      <style>{`
        @media print {
          nav, footer { display: none !important; }
          main { padding: 0 !important; }
          a[href]:after { content: "" !important; }
        }
      `}</style>

      <header className="relative overflow-hidden py-12 px-4 sm:px-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 size-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-black/10 bg-white p-2 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                  <img src={LOGO_URL} alt="NPHC of Hudson County Logo" className="h-8 w-auto" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-slate-500">NPHC of Hudson County</p>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{reportMeta.title}</h1>
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-3 max-w-3xl">{reportMeta.subtitle}</p>
              <p className="text-xs text-slate-500 mt-2 max-w-3xl">{reportMeta.mission}</p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-black/15 text-slate-800">
                  Date: {reportMeta.dateLabel}
                </Badge>
                <Badge variant="outline" className="border-black/15 text-slate-800">
                  Treasury: {reportMeta.treasuryLabel}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                  onClick={() => window.print()}
                >
                  <Printer className="size-4" />
                  Print
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                  onClick={() => setDetailMode((m) => (m === "summary" ? "full" : "summary"))}
                >
                  <FileText className="size-4" />
                  {detailMode === "summary" ? "Show Full Report" : "Show Summary"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {reportMeta.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-black/15 px-3 py-2 text-xs text-slate-800 hover:bg-white/10 transition"
                  >
                    <ChevronRight className="size-4" />
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-6">
        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Key Findings (Quick Read)</CardTitle>
            <p className="text-sm text-slate-600">This is the committee’s baseline context and what the decision is responding to.</p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {keyFindings.map((k) => (
              <div key={k} className="rounded-lg border border-black/10 bg-white/5 p-4">
                <p className="text-sm text-slate-700">{k}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Tabs defaultValue="comparison">
          <TabsList className="w-full justify-start bg-white/5 border border-black/10 backdrop-blur-xl">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="concepts">Concepts</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendation</TabsTrigger>
            <TabsTrigger value="finance">Finance + Risk</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Criteria Snapshot (1-5)</CardTitle>
                <p className="text-sm text-slate-600">Qualitative ratings from the report are mapped to a 1-5 scale for visualization.</p>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.12)" />
                      <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.8)" }} />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 5]}
                        tickCount={6}
                        tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }}
                      />
                      <Radar
                        name="Unity BBQ"
                        dataKey="unity"
                        stroke="rgba(255,255,255,0.85)"
                        fill="rgba(255,255,255,0.35)"
                        fillOpacity={0.12}
                      />
                      <Radar
                        name="Block Party"
                        dataKey="block"
                        stroke="var(--color-primary)"
                        fill="var(--color-primary)"
                        fillOpacity={0.18}
                      />
                      <Legend formatter={(value) => <span className="text-slate-800">{value}</span>} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Scale Mapping</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Very High=5, High=4, Moderate-High=3.5, Moderate=3, Low-Moderate=2.5, Low=2, Minimal=1.
                    </p>
                  </div>

                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">What This Means</p>
                    <p className="text-sm text-slate-600 mt-2">
                      The Block Party dominates on external impact, pillar alignment, partnerships, signature potential, and strategic fit.
                      The Unity BBQ dominates on unity/collaboration and operational simplicity.
                    </p>
                  </div>

                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Next Step</p>
                    <p className="text-sm text-slate-600 mt-2">Use the Decision Portal to vote after reviewing the interactive report.</p>
                    <a className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-primary hover:underline" href="#/decision-portal">
                      Go to Decision Portal <ChevronRight className="size-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Criteria Explorer</CardTitle>
                <p className="text-sm text-slate-600">Tap a criterion to see the committee’s scoring language and the rationale in digest form.</p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {criteria.map((c) => (
                    <AccordionItem key={c.id} value={c.id}>
                      <AccordionTrigger>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full pr-3">
                          <span className="text-sm font-semibold text-slate-900">{c.label}</span>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-black/15 text-slate-800">
                              Unity: {c.unity.scoreLabel}
                            </Badge>
                            <Badge variant="outline" className="border-black/15 text-slate-800">
                              Block: {c.block.scoreLabel}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500">Unity BBQ</p>
                            <p className="text-sm text-slate-700 mt-2">{c.unity.summary}</p>
                            {detailMode === "full" && c.unity.strengths?.length ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-800">Strengths</p>
                                <ul className="mt-1 list-disc ml-5 text-sm text-slate-600 space-y-1">
                                  {c.unity.strengths.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {detailMode === "full" && c.unity.limitations?.length ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-800">Limitations</p>
                                <ul className="mt-1 list-disc ml-5 text-sm text-slate-600 space-y-1">
                                  {c.unity.limitations.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {detailMode === "full" && c.unity.notes?.length ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-800">Notes</p>
                                <ul className="mt-1 list-disc ml-5 text-sm text-slate-600 space-y-1">
                                  {c.unity.notes.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>

                          <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-widest text-slate-500">Block Party</p>
                            <p className="text-sm text-slate-700 mt-2">{c.block.summary}</p>
                            {detailMode === "full" && c.block.strengths?.length ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-800">Strengths</p>
                                <ul className="mt-1 list-disc ml-5 text-sm text-slate-600 space-y-1">
                                  {c.block.strengths.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {detailMode === "full" && c.block.limitations?.length ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-800">Limitations</p>
                                <ul className="mt-1 list-disc ml-5 text-sm text-slate-600 space-y-1">
                                  {c.block.limitations.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {detailMode === "full" && c.block.notes?.length ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-slate-800">Notes</p>
                                <ul className="mt-1 list-disc ml-5 text-sm text-slate-600 space-y-1">
                                  {c.block.notes.map((s) => (
                                    <li key={s}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Key Differentiators</CardTitle>
                <p className="text-sm text-slate-600">
                  Directly from the committee comparison section (advantages of each concept).
                </p>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Unity BBQ Advantages</p>
                  <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                    {keyDifferentiators.unityBBQAdvantages.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Block Party Advantages</p>
                  <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                    {keyDifferentiators.blockPartyAdvantages.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {detailMode === "full" ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>{chapterAssessmentContext.title}</CardTitle>
                  <p className="text-sm text-slate-600">Highlights pulled directly from the report’s assessment summary.</p>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Strengths to Leverage</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {chapterAssessmentContext.strengthsToLeverage.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Challenges to Address</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {chapterAssessmentContext.challengesToAddress.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-2 rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Assessment Conclusion</p>
                    <p className="text-sm text-slate-700 mt-2">{chapterAssessmentContext.assessmentConclusionQuote}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          <TabsContent value="concepts" className="space-y-6">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Evaluation Framework</CardTitle>
                <p className="text-sm text-slate-600">The committee evaluated both concepts across these nine dimensions.</p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {evaluationFramework.map((f) => (
                  <div key={f} className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-slate-900">{f}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>{concepts.unity.name}</CardTitle>
                  <p className="text-sm text-slate-600">{concepts.unity.oneLine}</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Target Audience</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {concepts.unity.targetAudience.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Primary Objectives</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {concepts.unity.primaryObjectives.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>{concepts.block.name}</CardTitle>
                  <p className="text-sm text-slate-600">{concepts.block.oneLine}</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Target Audience</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {concepts.block.targetAudience.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Primary Objectives</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {concepts.block.primaryObjectives.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>{recommendations.primary.title}</CardTitle>
                <p className="text-sm text-slate-600">Committee-recommended sequencing that uses both concepts.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc ml-5 text-sm text-slate-600 space-y-1">
                  {recommendations.primary.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                {detailMode === "full" ? (
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Rationale</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {recommendations.primary.rationale.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>{recommendations.alternative.title}</CardTitle>
                <p className="text-sm text-slate-600">If capacity or risk tolerance requires a more conservative first year.</p>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">Path</p>
                  <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                    {recommendations.alternative.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                {detailMode === "full" ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Advantages</p>
                      <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                        {recommendations.alternative.advantages.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Limitations</p>
                      <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                        {recommendations.alternative.limitations.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-600">
                      Switch to <b>Full Report</b> to view advantages, limitations, and risk mitigation notes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>{decisionFramework.title}</CardTitle>
                <p className="text-sm text-slate-600">Use these to guide deliberation before submitting votes.</p>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Questions for the Full Body</p>
                  <ol className="mt-2 list-decimal ml-5 text-sm text-slate-600 space-y-1">
                    {decisionFramework.questions.map((q1) => (
                      <li key={q1}>{q1}</li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Voting Options</p>
                  <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                    {decisionFramework.votingOptions.map((q1) => (
                      <li key={q1}>{q1}</li>
                    ))}
                  </ul>
                </div>
                {detailMode === "full" ? (
                  <div className="lg:col-span-2 rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Final Committee Statement</p>
                    <p className="text-sm text-slate-700 mt-2">{decisionFramework.closingStatement}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Budget Ranges</CardTitle>
                <p className="text-sm text-slate-600">Expense ranges from the report (first-year estimates).</p>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => money(Number(v))}
                        tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value, name, ctx) => {
                          const row = ctx?.payload as any;
                          if (!row) return value as any;
                          if (name === "span") {
                            const min = row.min;
                            const max = row.min + row.span;
                            return `${money(min)} - ${money(max)}`;
                          }
                          return value as any;
                        }}
                        labelFormatter={() => ""}
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.85)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 12,
                          color: "white",
                          backdropFilter: "blur(10px)",
                        }}
                      />
                      <Bar dataKey="min" stackId="a" fill="rgba(0,0,0,0)" />
                      <Bar dataKey="span" stackId="a" fill="var(--color-primary)" radius={[6, 6, 6, 6]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Unity BBQ</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {money(budgetRanges.unity_bbq.min)} - {money(budgetRanges.unity_bbq.max)}
                    </p>
                    {detailMode === "full" ? (
                      <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                        {unityBudgetBreakdown.map((b) => (
                          <li key={b.label}>
                            {b.label}: {money(b.range.min)} - {money(b.range.max)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Block Party</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {money(budgetRanges.block_party.min)} - {money(budgetRanges.block_party.max)}
                    </p>
                    {detailMode === "full" ? (
                      <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                        {blockPartyBudgetBreakdown.map((b) => (
                          <li key={b.label}>
                            {b.label}: {money(b.range.min)} - {money(b.range.max)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {detailMode === "full" ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Financial Models (Revenue Potential)</CardTitle>
                  <p className="text-sm text-slate-600">Report-provided ranges for sponsorship, in-kind support, and other cost offsets.</p>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Block Party</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {financialModels.block.revenuePotential.map((r) => (
                        <li key={r.label}>
                          {r.label}: {money(r.range.min)} - {money(r.range.max)}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-semibold text-slate-900 mt-3">
                      Total Revenue Potential: {money(financialModels.block.totalRevenuePotential.min)} - {money(financialModels.block.totalRevenuePotential.max)}
                    </p>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 border-b border-black/10">
                            <th className="py-2 pr-3 font-semibold">Scenario</th>
                            <th className="py-2 pr-3 font-semibold">Revenue</th>
                            <th className="py-2 font-semibold">Net Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financialModels.block.netCostScenarios.map((r) => (
                            <tr key={r.scenario} className="border-b border-black/10 last:border-b-0">
                              <td className="py-2 pr-3 align-top font-semibold text-slate-900">{r.scenario}</td>
                              <td className="py-2 pr-3 align-top text-slate-600">{money(r.revenue)}</td>
                              <td className="py-2 align-top text-slate-600">
                                {money(r.netCost.min)} - {money(r.netCost.max)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Unity BBQ</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {financialModels.unity.revenuePotential.map((r) => (
                        <li key={r.label}>
                          {r.label}: {money(r.range.min)} - {money(r.range.max)}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-semibold text-slate-900 mt-3">
                      Total Revenue Potential: {money(financialModels.unity.totalRevenuePotential.min)} - {money(financialModels.unity.totalRevenuePotential.max)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Net Cost (after revenue): {money(financialModels.unity.netCost.min)} - {money(financialModels.unity.netCost.max)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {detailMode === "full" ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>{riskMitigation.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Block Party Mitigation</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {riskMitigation.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Unity BBQ Introduction (2027)</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {riskMitigation.unityBBQIntroduction2027.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Risk Snapshot</CardTitle>
                <p className="text-sm text-slate-600">Block Party has a moderate risk profile; Unity BBQ is lower-risk operationally.</p>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">{riskMatrix.blockParty.title}</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 border-b border-black/10">
                          <th className="py-2 pr-3 font-semibold">Risk</th>
                          <th className="py-2 pr-3 font-semibold">Impact</th>
                          <th className="py-2 font-semibold">Mitigation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riskMatrix.blockParty.rows.map((r) => (
                          <tr key={r.risk} className="border-b border-black/10 last:border-b-0">
                            <td className="py-2 pr-3 align-top font-semibold text-slate-900">{r.risk}</td>
                            <td className="py-2 pr-3 align-top text-slate-600">{r.impact}</td>
                            <td className="py-2 align-top text-slate-600">{r.mitigation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">{riskMatrix.unityBBQ.title}</p>
                  <p className="text-sm text-slate-600 mt-2">{riskMatrix.unityBBQ.overall}</p>
                  <ul className="mt-3 list-disc ml-5 text-sm text-slate-600 space-y-1">
                    {riskMatrix.unityBBQ.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {detailMode === "full" ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>{implementationTimeline.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <SectionTitle>Block Party - August 2026</SectionTitle>
                    {implementationTimeline.blockParty.map((t) => (
                      <div key={t.label} className="rounded-lg border border-black/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-slate-900">{t.label}</p>
                        <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                          {t.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <SectionTitle>Unity BBQ - 2027</SectionTitle>
                    {implementationTimeline.unityBBQ.map((t) => (
                      <div key={t.label} className="rounded-lg border border-black/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-slate-900">{t.label}</p>
                        <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                          {t.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {detailMode === "full" ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Success Metrics</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-slate-900">{successMetrics.blockParty.title}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mt-3">Quantitative</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {successMetrics.blockParty.quantitative.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mt-4">Qualitative</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {successMetrics.blockParty.qualitative.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mt-4">Strategic Impact</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {successMetrics.blockParty.strategicImpact.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-slate-900">{successMetrics.unityBBQ.title}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mt-3">Quantitative</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {successMetrics.unityBBQ.quantitative.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mt-4">Qualitative</p>
                    <ul className="mt-2 list-disc ml-5 text-sm text-slate-600 space-y-1">
                      {successMetrics.unityBBQ.qualitative.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {detailMode === "full" ? (
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>References</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-decimal ml-5 text-sm text-slate-600 space-y-1">
                    {references.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
