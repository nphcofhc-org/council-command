import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Calendar, FileText, Users, MapPin, Clock, ExternalLink, PlayCircle, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useProgramsData } from "../hooks/use-site-data";
import { StatusBadge } from "../components/status-badge";
import type { ProgramEventHighlight } from "../data/types";

const ART_MARBLE = "https://images.unsplash.com/photo-1678756466078-1ff0d7b09431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vY2hyb21lJTIwYWJzdHJhY3QlMjBtYXJibGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MDUxMzIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const EVENTS_ENDPOINT = "/api/events/upcoming";

export function ProgramsPage() {
  const { data } = useProgramsData();
  const [activeHighlight, setActiveHighlight] = useState<ProgramEventHighlight | null>(null);
  const [dismissAutoplayHighlight, setDismissAutoplayHighlight] = useState(false);
  const [memberEvents, setMemberEvents] = useState<any[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const upcomingEvents = data?.upcomingEvents || [];
  const archivedEvents = data?.archivedEvents || [];
  const eventHighlights = data?.eventHighlights || [];
  const eventFlyers = data?.eventFlyers || [];
  const signupForms = data?.signupForms || [];
  const autoplayVideoHighlight = eventHighlights.find((h) => h.mediaType === "video") || null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(EVENTS_ENDPOINT, { method: "GET", credentials: "same-origin", headers: { accept: "application/json" } });
        if (!res.ok) return;
        const body = await res.json();
        if (cancelled) return;
        const events = Array.isArray(body?.events) ? body.events : [];
        setMemberEvents(events);
      } catch (e) {
        if (!cancelled) setEventsError(e instanceof Error ? e.message : "Failed to load member events.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedUpcoming = useMemo(() => {
    const mapped = memberEvents
      .map((e) => {
        const date = String(e?.eventDate || "").trim();
        const time = [String(e?.startTime || "").trim(), String(e?.endTime || "").trim()].filter(Boolean).join("–");
        const dateLabel = time ? `${date} • ${time}` : date;
        const link = String(e?.eventLinkUrl || "").trim() || String(e?.flyerLinks || "").trim() || "";
        return {
          id: `member-${String(e?.id || "").trim()}`,
          title: String(e?.eventName || "").trim(),
          date: dateLabel,
          location: String(e?.location || "").trim() || "TBD",
          description: String(e?.description || "").trim() || "Member-submitted event (approved).",
          type: "Member Event",
          registration: link ? "Open" : "Approved",
          linkUrl: link || undefined,
        };
      })
      .filter((e) => e.title && e.date);

    const all = [...upcomingEvents, ...mapped];
    // Best-effort sort by ISO date prefix if present.
    return all.sort((a, b) => {
      const da = String(a.date || "").slice(0, 10);
      const db = String(b.date || "").slice(0, 10);
      return da.localeCompare(db);
    });
  }, [memberEvents, upcomingEvents]);

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.03] pointer-events-none hidden lg:block">
        <img src={ART_MARBLE} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="p-4 sm:p-8 max-w-7xl mx-auto relative z-10">
        {/* Highlight Modal */}
        {activeHighlight ? (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-black/50 shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
                <div className="min-w-0">
                  <p className="text-xs tracking-[0.22em] uppercase text-white/60">
                    {activeHighlight.mediaType === "video" ? "Video Highlight" : "Event Highlight"}
                  </p>
                  <p className="text-sm font-semibold text-white truncate">{activeHighlight.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHighlight(null)}
                  className="nphc-holo-btn rounded-xl border border-white/15 bg-white/5 p-2 text-white/80 hover:text-white hover:border-primary/60 transition-colors"
                  aria-label="Close highlight"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="bg-black">
                {activeHighlight.mediaType === "video" ? (
                  <video
                    src={activeHighlight.mediaUrl}
                    poster={activeHighlight.thumbnailUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                  />
                ) : (
                  <img
                    src={activeHighlight.mediaUrl}
                    alt={activeHighlight.title}
                    className="w-full h-auto object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Council Programming</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-slate-900 mb-1">
            Programs <span className="text-primary">&amp;</span> Events
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Council programming, event calendar, and member registration access
          </p>
        </motion.div>

        {/* Autoplay video highlight with skip */}
        {autoplayVideoHighlight && !dismissAutoplayHighlight ? (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl mb-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-white/50 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Autoplay Highlight</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{autoplayVideoHighlight.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
                    onClick={() => setActiveHighlight(autoplayVideoHighlight)}
                  >
                    <PlayCircle className="size-3.5" />
                    Expand
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => setDismissAutoplayHighlight(true)}
                  >
                    <X className="size-3.5" />
                    Skip
                  </Button>
                </div>
              </div>
              <div className="bg-black">
                <video
                  src={autoplayVideoHighlight.mediaUrl}
                  poster={autoplayVideoHighlight.thumbnailUrl}
                  autoPlay
                  muted
                  playsInline
                  controls
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Event Highlights */}
        {eventHighlights.length > 0 ? (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl mb-6">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Event Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventHighlights.map((highlight, index) => (
                  <motion.button
                    key={highlight.id}
                    type="button"
                    initial={{ y: 12, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                    onClick={() => setActiveHighlight(highlight)}
                    className="group overflow-hidden rounded-xl border border-black/10 bg-white/5 text-left hover:border-primary/35 hover:bg-white/10 transition-all"
                  >
                    <div className="aspect-[4/3] bg-black/5 overflow-hidden">
                      {highlight.mediaType === "video" ? (
                        <video
                          src={highlight.mediaUrl}
                          poster={highlight.thumbnailUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={highlight.mediaUrl}
                          alt={highlight.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        {highlight.mediaType === "video" ? "Video" : "Image"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">{highlight.title}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap justify-start border border-black/10 bg-white/5 backdrop-blur-xl">
            <TabsTrigger value="calendar" className="text-xs sm:text-sm">Event Calendar</TabsTrigger>
            <TabsTrigger value="flyers" className="text-xs sm:text-sm">Event Materials</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs sm:text-sm">Sign-Up Forms</TabsTrigger>
          </TabsList>

          {/* Event Calendar */}
          <TabsContent value="calendar" className="space-y-8">
            <div>
              <motion.h2
                initial={{ x: -15, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-lg sm:text-xl text-slate-900 mb-4"
              >
                Upcoming Events
              </motion.h2>
              {eventsError ? <p className="text-sm text-slate-500 mb-3">{eventsError}</p> : null}
              <div className="mb-4">
                <Button asChild variant="outline" className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10">
                  <Link to="/forms/events">
                    <Users className="size-4" />
                    Submit an Event
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                {mergedUpcoming.map((event: any, index: number) => (
                  <motion.div
                    key={event.id}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                  >
                    <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2.5 rounded-lg border border-black/10 bg-white/5 flex-shrink-0">
                                <Calendar className="size-5 text-slate-900" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl text-slate-900 mb-1">{event.title}</h3>
                                <p className="text-slate-600 text-sm mb-3">{event.description}</p>
                                <div className="space-y-1.5 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Clock className="size-3.5 flex-shrink-0" />
                                    <span>{event.date}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="size-3.5 flex-shrink-0 mt-0.5" />
                                    <span className="break-words">{event.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:text-right gap-2 w-full sm:w-auto">
                            <Badge className="w-fit border border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">
                              {event.type}
                            </Badge>
                            {event.registration === "Open" && event.linkUrl ? (
                              <Button
                                asChild
                                size="sm"
                                className="bg-primary text-primary-foreground hover:brightness-110 w-full sm:w-auto"
                              >
                                <a href={event.linkUrl} target="_blank" rel="noreferrer">
                                  View Details
                                </a>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className={
                                  event.registration === "Open"
                                    ? "bg-primary text-primary-foreground hover:brightness-110 w-full sm:w-auto"
                                    : "bg-white/10 text-slate-400 w-full sm:w-auto cursor-default"
                                }
                                disabled={event.registration !== "Open"}
                              >
                                {event.registration}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <motion.h2
                initial={{ x: -15, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-lg sm:text-xl text-slate-900 mb-4"
              >
                Recent Events
              </motion.h2>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <CardContent className="p-0">
                    {archivedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ x: -15, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-2 ${
                          index < archivedEvents.length - 1 ? "border-b border-black/10" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className="text-slate-900">{event.title}</h3>
                          <p className="text-sm text-slate-500">{event.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-slate-500">{event.attendees}</p>
                          <StatusBadge status={event.status} />
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Event Materials */}
          <TabsContent value="flyers" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Event One-Pagers & Promotional Materials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {eventFlyers.map((flyer, index) => (
                      <motion.div
                        key={flyer.id}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="rounded-xl border border-black/10 bg-white/5 p-4 transition-all duration-300 group hover:border-primary/30 hover:bg-white/10"
                      >
                        <div className="aspect-[8.5/11] bg-gradient-to-br from-black via-gray-800 to-gray-700 rounded-lg mb-4 flex items-center justify-center group-hover:from-gray-800 group-hover:to-gray-600 transition-all duration-300">
                          <FileText className="size-12 sm:size-16 text-slate-900/15" />
                        </div>
                        <h3 className="text-slate-900 text-sm mb-1">{flyer.title}</h3>
                        <p className="text-xs text-slate-500 mb-1">{flyer.type}</p>
                        <p className="text-xs text-slate-400 mb-3">{flyer.date}</p>
                        {flyer.fileUrl ? (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition-all duration-200"
                          >
                            <a href={flyer.fileUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="size-3" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="w-full gap-2 border-black/15 bg-white/5 text-slate-900/35">
                            <ExternalLink className="size-3" />
                            Missing
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Sign-Up Forms */}
          <TabsContent value="signup" className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Event Registration & Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {signupForms.map((form, index) => (
                      <motion.div
                        key={form.id}
                        initial={{ x: -15, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.08, duration: 0.4 }}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 rounded-lg border border-black/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-colors gap-4"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="p-2 rounded-lg border border-black/10 bg-white/5 flex-shrink-0">
                            <Users className="size-5 text-slate-900" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 mb-1">{form.title}</h3>
                            <p className="text-sm text-slate-600 mb-2">{form.description}</p>
                            <p className="text-xs text-slate-400">
                              <strong>Deadline:</strong> {form.deadline}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <StatusBadge status={form.status} />
                          {form.status === "Active" && form.formUrl ? (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 w-full sm:w-auto"
                            >
                              <a href={form.formUrl} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-3" />
                                Open Form
                              </a>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 border-black/15 bg-white/5 text-slate-900/35 w-full sm:w-auto"
                              disabled
                            >
                              <ExternalLink className="size-3" />
                              {form.formUrl ? "Closed" : "Missing"}
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
