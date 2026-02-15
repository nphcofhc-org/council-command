import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Calendar, FileText, Clock, ExternalLink, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { useLocation } from "react-router";
import { useMeetingsData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";
import { Link } from "react-router";
import { useCouncilCalendarSchedule } from "../hooks/use-council-calendar";
import { useEffect, useMemo, useRef } from "react";

const ART_GEO = "https://images.unsplash.com/photo-1665680779817-11a0d63ee51e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwZ2VvbWV0cmljJTIwbWluaW1hbCUyMGFydHxlbnwxfHx8fDE3NzA1MTMyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

function normalizeDocUrl(input: string | null | undefined): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return raw;
  // Allow legacy values like "Agenda_Jan_2026_GB.pdf" → /docs/Agenda_Jan_2026_GB.pdf
  return `/docs/${raw}`;
}

function normalizeJoinUrl(input: string | null | undefined): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("meet.google.com/")) return `https://${raw}`;
  return raw;
}

export function MeetingsPage() {
  const { data } = useMeetingsData();
  const location = useLocation();
  const focus = new URLSearchParams(location.search || "").get("focus") || "";
  const nextGeneralRef = useRef<HTMLDivElement | null>(null);

  const calendarHref = "/2026-council-calendar.html";
  const { generalMeetings, execMeetings } = useCouncilCalendarSchedule(calendarHref);

  // Use CMS data only for join links/labels (not dates).
  const upcomingMeetings = data?.upcomingMeetings || [];
  const meetingRecords = data?.meetingRecords || [];
  const delegateReports = data?.delegateReports || [];
  const tab = new URLSearchParams(location.search || "").get("tab") || "";
  const initialTab = tab === "records" ? "records" : tab === "reports" ? "reports" : "upcoming";
  const toViewer = (url: string) => `/viewer?src=${encodeURIComponent(url)}`;
  const isInternalFile = (url: string) => url.trim().startsWith("/");

  const toYmd = (input: string | null | undefined): string | null => {
    const raw = String(input || "").trim();
    if (!raw) return null;
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)) return raw;
    const t = Date.parse(raw);
    if (!Number.isFinite(t)) return null;
    const d = new Date(t);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const joinByDate = new Map<string, { joinUrl?: string; joinLabel?: string }>();
  for (const m of upcomingMeetings) {
    const ymd = toYmd(m.date);
    if (!ymd) continue;
    joinByDate.set(ymd, { joinUrl: m.joinUrl, joinLabel: m.joinLabel });
  }

  const nowISO = toYmd(new Date().toISOString()) || "";
  const nextGeneral = generalMeetings.find((m) => m.dateISO >= nowISO) || generalMeetings[0] || null;
  const nextGeneralISO = nextGeneral?.dateISO || "";

  const scheduleRows = [...generalMeetings, ...execMeetings]
    .filter((m) => m.dateISO >= nowISO)
    .sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0))
    .map((m) => ({
      id: `${m.kind}-${m.dateISO}`,
      title: m.label,
      dateISO: m.dateISO,
      type: m.kind === "exec" ? "Executive Council" : "General Body",
      location: m.mode || (m.kind === "exec" ? "Executive Council Meeting" : "General Body Meeting"),
      joinUrl: joinByDate.get(m.dateISO)?.joinUrl || "",
      joinLabel: joinByDate.get(m.dateISO)?.joinLabel || "Join Google Meet",
      kind: m.kind as "exec" | "general",
    }));

  const featuredDeck = useMemo(() => {
    const title = String(data?.featuredDeckTitle || "").trim();
    const imageUrl = String(data?.featuredDeckImageUrl || "").trim();
    const url = String(data?.featuredDeckUrl || "").trim();
    return {
      title: title || "Meeting Deck",
      imageUrl,
      url,
    };
  }, [data?.featuredDeckTitle, data?.featuredDeckImageUrl, data?.featuredDeckUrl]);

  useEffect(() => {
    if (focus !== "next-general") return;
    // Smooth scroll into the "Next General Body Meeting" callout.
    const t = window.setTimeout(() => {
      nextGeneralRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(t);
  }, [focus]);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 left-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
        <img src={ART_GEO} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="p-4 sm:p-8 max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Council Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-slate-900 mb-1">
            Meetings <span className="text-primary">&amp;</span> Delegates
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Council meeting schedule, agendas, minutes, and delegate reporting for the current governance cycle
          </p>
        </motion.div>

        <Tabs key={initialTab} defaultValue={initialTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap justify-start border border-black/10 bg-white/5 backdrop-blur-xl">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming Meetings</TabsTrigger>
            <TabsTrigger value="records" className="text-xs sm:text-sm">Agendas & Minutes</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Delegate Reports</TabsTrigger>
          </TabsList>

          {/* Upcoming Meetings */}
          <TabsContent value="upcoming" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <div ref={nextGeneralRef} id="next-general-body" />
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl border border-primary/20">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="size-4" />
                        <p className="text-xs tracking-[0.22em] uppercase">Highlighted</p>
                      </div>
                      <CardTitle className="text-lg sm:text-xl mt-1">Next General Body Meeting</CardTitle>
                      <p className="text-sm text-slate-600 mt-2">
                        This is the meeting members should prioritize. Use the links below for the deck and Social Media Intake.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="w-fit">
                        <Link to="/forms/social-media">Social Media Intake</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-fit">
                        <a href={calendarHref}>View 2026 Calendar</a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-2xl border border-black/10 bg-white/5 p-4 nphc-raised">
                    {nextGeneral ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">General Body</p>
                          <h3 className="text-slate-900 text-lg leading-snug">{nextGeneral.label}</h3>
                          <p className="text-sm text-slate-600 mt-1">{nextGeneral.dateISO}</p>
                          {nextGeneral.mode ? <p className="text-xs text-slate-500 mt-1">{nextGeneral.mode}</p> : null}
                        </div>
                        <Badge className="w-fit border border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">
                          Upcoming
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No upcoming General Body meetings found in the 2026 calendar.</p>
                    )}

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      {normalizeJoinUrl(nextGeneralISO ? joinByDate.get(nextGeneralISO)?.joinUrl : "") ? (
                        <Button asChild className="gap-2">
                          <a
                            href={normalizeJoinUrl(nextGeneralISO ? joinByDate.get(nextGeneralISO)?.joinUrl : "") || "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="size-4" />
                            {joinByDate.get(nextGeneralISO)?.joinLabel || "Join Google Meet"}
                          </a>
                        </Button>
                      ) : (
                        <Button disabled className="gap-2">
                          <ExternalLink className="size-4" />
                          Join link (coming soon)
                        </Button>
                      )}

                      {featuredDeck.url ? (
                        <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                          {featuredDeck.url.trim().startsWith("/") ? (
                            <Link to={toViewer(featuredDeck.url)}>
                              <FileText className="size-4" />
                              View Deck
                            </Link>
                          ) : (
                            <a href={featuredDeck.url} target="_blank" rel="noreferrer">
                              <FileText className="size-4" />
                              View Deck
                            </a>
                          )}
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                          <Link to="/meetings-delegates?tab=records">
                            <FileText className="size-4" />
                            Meeting Archive
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/5 p-4 nphc-raised">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Deck Preview</p>
                    {featuredDeck.imageUrl ? (
                      <img
                        src={featuredDeck.imageUrl}
                        alt={featuredDeck.title}
                        className="w-full aspect-[4/3] rounded-xl border border-black/10 bg-white object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-xl border border-black/10 bg-white/60 flex items-center justify-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="size-6" />
                          <p className="text-xs text-center max-w-[24ch]">
                            Add a deck cover image in Council Admin → Content → Meetings.
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-slate-700 mt-3 font-semibold">{featuredDeck.title}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg sm:text-xl">Council Meeting Calendar</CardTitle>
                    <Button asChild variant="outline" size="sm" className="w-fit">
                      <a href={calendarHref}>View 2026 Calendar</a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scheduleRows.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className={[
                          "flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors group",
                          meeting.kind === "general" && meeting.dateISO === nextGeneralISO
                            ? "border-primary/40 bg-primary/5 shadow-[0_20px_60px_rgba(11,189,176,0.18)]"
                            : "",
                        ].join(" ")}
                      >
                        <div className="p-3 rounded-xl border border-primary/25 bg-primary/15 text-primary text-center min-w-[4rem] flex-shrink-0">
                          <div className="text-2xl">{Number(meeting.dateISO.slice(8, 10))}</div>
                          <div className="text-[10px] uppercase tracking-wider opacity-70">
                            {new Date(`${meeting.dateISO}T00:00:00`).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-slate-900 mb-2">{meeting.title}</h3>
                              <div className="space-y-1.5 text-sm text-slate-600">
                                <div className="flex items-start gap-2">
                                  <Calendar className="size-3.5 flex-shrink-0 mt-0.5" />
                                  <span className="break-words">{meeting.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <Badge className="w-fit border border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">
                                {meeting.kind === "general" && meeting.dateISO === nextGeneralISO ? "Next General Body" : meeting.type}
                              </Badge>
                              {normalizeJoinUrl(meeting.joinUrl) ? (
                                <Button asChild variant="outline" size="sm" className="w-full sm:w-auto gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                                  <a href={normalizeJoinUrl(meeting.joinUrl) || "#"} target="_blank" rel="noreferrer">
                                    <ExternalLink className="size-3.5" />
                                    {meeting.joinLabel || "Join"}
                                  </a>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {scheduleRows.length === 0 ? (
                      <p className="text-sm text-slate-600">No upcoming meetings found in the 2026 calendar.</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-black/10 bg-white/5 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Note:</strong> Dates on this page are sourced directly from the 2026 Council Calendar.
                    Council Admin can add the Google Meet join link for each meeting (shown above when available).
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Agendas & Minutes */}
          <TabsContent value="records" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Meeting Documentation Archive</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meeting Date</TableHead>
                          <TableHead>Meeting Title</TableHead>
                          <TableHead>Agenda</TableHead>
                          <TableHead>Minutes</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meetingRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ x: -15, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            className="border-b border-black/10 transition-colors hover:bg-white/5"
                          >
                            <TableCell className="text-slate-500">{record.date}</TableCell>
                            <TableCell className="font-medium">{record.title}</TableCell>
                            <TableCell>
                              {normalizeDocUrl(record.agendaFile) ? (
                                <Button asChild variant="ghost" size="sm" className="h-8 gap-2 text-slate-900 hover:bg-white/5">
                                  {(() => {
                                    const href = normalizeDocUrl(record.agendaFile) || "#";
                                    return isInternalFile(href) ? (
                                      <Link to={toViewer(href)}>
                                        <FileText className="size-3.5" />
                                        <span className="text-xs">View</span>
                                      </Link>
                                    ) : (
                                      <a href={href} target="_blank" rel="noreferrer">
                                        <FileText className="size-3.5" />
                                        <span className="text-xs">View</span>
                                      </a>
                                    );
                                  })()}
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-slate-900/35">
                                  <FileText className="size-3.5" />
                                  <span className="text-xs">Missing</span>
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              {normalizeDocUrl(record.minutesFile) ? (
                                <Button asChild variant="ghost" size="sm" className="h-8 gap-2 text-slate-900 hover:bg-white/5">
                                  {(() => {
                                    const href = normalizeDocUrl(record.minutesFile) || "#";
                                    return isInternalFile(href) ? (
                                      <Link to={toViewer(href)}>
                                        <FileText className="size-3.5" />
                                        <span className="text-xs">View</span>
                                      </Link>
                                    ) : (
                                      <a href={href} target="_blank" rel="noreferrer">
                                        <FileText className="size-3.5" />
                                        <span className="text-xs">View</span>
                                      </a>
                                    );
                                  })()}
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" disabled className="h-8 gap-2 text-slate-900/35">
                                  <FileText className="size-3.5" />
                                  <span className="text-xs">Missing</span>
                                </Button>
                              )}
                            </TableCell>
                            <TableCell><StatusBadge status={record.status} /></TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {meetingRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                      >
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-slate-900 text-sm flex-1">{record.title}</h3>
                              <StatusBadge status={record.status} />
                            </div>
                            <p className="text-sm text-slate-500 mb-3">{record.date}</p>
                            <div className="flex gap-2">
                              {normalizeDocUrl(record.agendaFile) ? (
                                <Button asChild variant="outline" size="sm" className="flex-1 gap-2 text-xs border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                                  {(() => {
                                    const href = normalizeDocUrl(record.agendaFile) || "#";
                                    return isInternalFile(href) ? (
                                      <Link to={toViewer(href)}>
                                        <FileText className="size-3" />
                                        Agenda
                                      </Link>
                                    ) : (
                                      <a href={href} target="_blank" rel="noreferrer">
                                        <FileText className="size-3" />
                                        Agenda
                                      </a>
                                    );
                                  })()}
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" disabled className="flex-1 gap-2 text-xs border-black/15 bg-white/5 text-slate-900/35">
                                  <FileText className="size-3" />
                                  Agenda
                                </Button>
                              )}
                              {normalizeDocUrl(record.minutesFile) ? (
                                <Button asChild variant="outline" size="sm" className="flex-1 gap-2 text-xs border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                                  {(() => {
                                    const href = normalizeDocUrl(record.minutesFile) || "#";
                                    return isInternalFile(href) ? (
                                      <Link to={toViewer(href)}>
                                        <FileText className="size-3" />
                                        Minutes
                                      </Link>
                                    ) : (
                                      <a href={href} target="_blank" rel="noreferrer">
                                        <FileText className="size-3" />
                                        Minutes
                                      </a>
                                    );
                                  })()}
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" disabled className="flex-1 gap-2 text-xs border-black/15 bg-white/5 text-slate-900/35">
                                  <FileText className="size-3" />
                                  Minutes
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Delegate Reports */}
          <TabsContent value="reports" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Chapter Delegate Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meeting Cycle</TableHead>
                          <TableHead>Chapter</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Date Submitted</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {delegateReports.map((report, index) => (
                          <motion.tr
                            key={report.id}
                            initial={{ x: -15, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            className="border-b border-black/10 transition-colors hover:bg-white/5"
                          >
                            <TableCell className="font-medium">{report.meetingCycle}</TableCell>
                            <TableCell>{report.chapter}</TableCell>
                            <TableCell>{report.submittedBy}</TableCell>
                            <TableCell className="text-slate-500">{report.dateSubmitted}</TableCell>
                            <TableCell><StatusBadge status={report.status} /></TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {delegateReports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                      >
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-slate-900 text-sm flex-1">{report.meetingCycle}</h3>
                              <StatusBadge status={report.status} />
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-slate-500 text-xs">Chapter</span>
                                <p className="text-slate-800">{report.chapter}</p>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-500 flex-shrink-0">Submitted By:</span>
                                <span className="text-right">{report.submittedBy}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-500 flex-shrink-0">Date:</span>
                                <span className="text-right">{report.dateSubmitted}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-black/10 bg-white/5 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-700">
                    <strong className="text-slate-900">Reminder:</strong> Chapter delegate reports are due 72 hours prior to each General Body meeting.
                    Please use the official Delegate Report Form available in the Resources section.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
