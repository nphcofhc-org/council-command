import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Bell, Calendar, Clock, ExternalLink, Wallet, DollarSign, CreditCard, ClipboardList, ChevronLeft } from "lucide-react";
import googleBanner from "../../assets/08f5f2f8147d555bb4793ae6a060e3d0c28be71f.png";
import { motion } from "motion/react";
import { useHomePageData } from "../hooks/use-site-data";
import { DynamicIcon } from "../components/icon-resolver";
import { useMeetingsData } from "../hooks/use-site-data";
import { useCouncilCalendarSchedule } from "../hooks/use-council-calendar";
import { TREASURY } from "../data/treasury";

declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: () => void } };
  }
}

// ── Shared glass button class for quick links ───────────────────────────────
const glassButtonClass =
  "nphc-holo-btn relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer " +
  "bg-white/[0.08] backdrop-blur-xl text-slate-900 border border-black/15 " +
  "shadow-[0_8px_32px_0_rgba(255,255,255,0.07)] " +
  "transition-all duration-300 text-[13px] leading-none " +
  "hover:bg-primary/15 hover:text-primary hover:border-primary/50 " +
  "hover:shadow-[0_12px_40px_0_rgba(24,224,208,0.28)] hover:-translate-y-0.5 " +
  "active:bg-primary/25 active:text-primary active:scale-[0.97]";

const DEFAULT_HOME_BANNER_MEDIA_URL =
  "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/FORMAL%20NPHC%20BANNER%20(2).mp4";

const FORMS_PANE_LINKS = [
  { label: "Forms Hub", href: "#/forms", meta: "All submission forms" },
  { label: "Budget Submission", href: "#/forms/budget", meta: "Committee budget request" },
  { label: "Reimbursement Request", href: "#/forms/reimbursement", meta: "Upload receipts" },
  { label: "Request a Social Post", href: "#/forms/social-media", meta: "Flyers + captions" },
  { label: "Committee Report", href: "#/forms/committee-report", meta: "Monthly updates" },
  { label: "My Submissions", href: "#/forms/my", meta: "Track your requests" },
] as const;

function FormsQuickPane() {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <>
      {/* Desktop: hover-to-open pane */}
      <div className="hidden lg:block fixed right-0 top-24 z-40 group">
        <div
          className={[
            "nphc-holo-surface w-[360px] rounded-l-2xl border border-black/10 bg-white/75 backdrop-blur-xl",
            "shadow-[0_24px_80px_rgba(0,0,0,0.18)]",
            "transition-transform duration-300 ease-out",
            // Keep 56px exposed as a "handle"
            "translate-x-[304px] group-hover:translate-x-0",
          ].join(" ")}
        >
          <div className="relative">
            {/* Handle */}
            <div className="absolute left-0 top-0 h-full w-14 flex items-start justify-center pt-4">
              <div className="nphc-holo-btn flex flex-col items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-2 py-3 text-slate-700">
                <ClipboardList className="size-5 text-primary" />
                <ChevronLeft className="size-4 text-slate-500" />
                <span className="text-[10px] tracking-[0.22em] uppercase [writing-mode:vertical-rl] rotate-180">
                  Forms
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="pl-16 pr-5 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.25em] uppercase text-slate-500">Quick Submit</p>
                  <h3 className="text-slate-900 text-base font-semibold">Forms</h3>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {FORMS_PANE_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="nphc-holo-btn block rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 hover:border-primary/35 hover:bg-white/80 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-900">{l.label}</span>
                      <ExternalLink className="size-4 text-slate-400" />
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">{l.meta}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: tap-to-open */}
      <div className="lg:hidden fixed right-3 bottom-3 z-40">
        {openMobile ? (
          <div className="nphc-holo-surface w-[92vw] max-w-sm rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <p className="text-sm font-semibold text-slate-900">Forms</p>
              </div>
              <button
                type="button"
                className="nphc-holo-btn rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs text-slate-700"
                onClick={() => setOpenMobile(false)}
                aria-label="Close forms panel"
              >
                Close
              </button>
            </div>
            <div className="px-4 pb-4 pt-3 space-y-2">
              {FORMS_PANE_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="nphc-holo-btn block rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 hover:border-primary/35 hover:bg-white/80 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-900">{l.label}</span>
                    <ExternalLink className="size-4 text-slate-400" />
                  </div>
                  <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">{l.meta}</div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="nphc-holo-btn rounded-2xl border border-black/10 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.16)] px-4 py-3 text-slate-900 flex items-center gap-2"
            onClick={() => setOpenMobile(true)}
            aria-label="Open forms panel"
          >
            <ClipboardList className="size-5 text-primary" />
            <span className="text-sm font-semibold">Forms</span>
          </button>
        )}
      </div>
    </>
  );
}

export function HomePage() {
  const { data } = useHomePageData();
  const { data: meetingsData } = useMeetingsData();
  const { generalMeetings, execMeetings } = useCouncilCalendarSchedule("/2026-council-calendar.html");
  const [bannerError, setBannerError] = useState(false);

  // While loading, data is null — use safe defaults so layout doesn't jump
  const config = data?.config;
  const rawQuickLinks = data?.quickLinks || [];
  const updates = data?.updates || [];
  const presidentImageUrl = config?.presidentImageUrl || "";
  const bannerImageUrl = config?.bannerImageUrl || "";
  const instagramHandleRaw = config?.instagramHandle || "";
  const instagramHandle = instagramHandleRaw.trim().replace(/^@/, "");
  const instagramPostUrls = Array.isArray(config?.instagramPostUrls) ? config!.instagramPostUrls : [];
  const bannerMediaUrl = (bannerImageUrl || DEFAULT_HOME_BANNER_MEDIA_URL || googleBanner).trim();
  const effectiveBannerUrl = bannerError ? googleBanner : bannerMediaUrl;
  const bannerIsVideo = /\.mp4(?:\?|$)/i.test(effectiveBannerUrl);

  useEffect(() => {
    if (instagramPostUrls.length === 0) return;

    const existing = document.querySelector<HTMLScriptElement>('script[data-nphc-instagram-embed="true"]');
    const process = () => window.instgrm?.Embeds?.process?.();

    if (existing) {
      process();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = "https://www.instagram.com/embed.js";
    script.setAttribute("data-nphc-instagram-embed", "true");
    script.onload = () => process();
    document.body.appendChild(script);
  }, [instagramPostUrls.length]);

  // Required "core" quick links the council wants front-and-center.
  // If existing data doesn't include one of these URLs, we prepend it.
  const quickLinks = (() => {
    const required = [
      {
        id: "ql-core-next-meeting",
        icon: "Calendar",
        label: "Next Meeting",
        shortLabel: "Next",
        url: "/meetings-delegates",
        row: 1 as const,
      },
      {
        id: "ql-core-calendar-2026",
        icon: "Calendar",
        label: "Meetings Calendar",
        shortLabel: "Calendar",
        url: "/2026-council-calendar.html",
        row: 1 as const,
      },
      {
        id: "ql-core-minutes",
        icon: "FileText",
        label: "Meeting Minutes",
        shortLabel: "Minutes",
        url: "/meetings-delegates?tab=records",
        row: 1 as const,
      },
      {
        id: "ql-core-social-post",
        icon: "TrendingUp",
        label: "Request a Social Post",
        shortLabel: "Social",
        url: "/forms/social-media",
        row: 1 as const,
      },
      {
        id: "ql-core-nphc-hq",
        icon: "ExternalLink",
        label: "NPHC HQ Website",
        shortLabel: "NPHC HQ",
        url: "https://www.nphchq.com/",
        row: 2 as const,
      },
      {
        id: "ql-core-gateway",
        icon: "ExternalLink",
        label: "NPHC Gateway",
        shortLabel: "Gateway",
        url: "https://gateway.nphchq.com/app/login?action=userspending&chapterId=6044",
        row: 2 as const,
      },
    ];

    const hasMinutes = rawQuickLinks.some((l) => (l?.url || "").includes("tab=records") || (l?.label || "").toLowerCase().includes("minutes"));
    const hasCalendar = rawQuickLinks.some((l) => (l?.url || "").trim() === "/2026-council-calendar.html" || (l?.label || "").toLowerCase().includes("calendar"));
    const hasNext = rawQuickLinks.some((l) => (l?.url || "").trim() === "/meetings-delegates" || (l?.label || "").toLowerCase().includes("next meeting"));
    const hasSocial = rawQuickLinks.some((l) => (l?.shortLabel || "").toLowerCase() === "social" || (l?.label || "").toLowerCase().includes("social"));
    const hasHq = rawQuickLinks.some((l) => (l?.url || "").trim() === "https://www.nphchq.com/" || (l?.label || "").toLowerCase().includes("nphc hq"));
    const hasGateway = rawQuickLinks.some((l) => (l?.url || "").includes("gateway.nphchq.com") || (l?.label || "").toLowerCase().includes("gateway"));

    const missing = required.filter((r) => {
      if (r.id === "ql-core-minutes") return !hasMinutes;
      if (r.id === "ql-core-calendar-2026") return !hasCalendar;
      if (r.id === "ql-core-next-meeting") return !hasNext;
      if (r.id === "ql-core-social-post") return !hasSocial;
      if (r.id === "ql-core-nphc-hq") return !hasHq;
      if (r.id === "ql-core-gateway") return !hasGateway;
      return true;
    });

    if (missing.length === 0) return rawQuickLinks;
    return [...missing, ...rawQuickLinks];
  })();

  const welcomeParagraphs = (config?.presidentMessage && config.presidentMessage.length > 0)
    ? config.presidentMessage
    : [
    "It is my honor to welcome you to the National Pan-Hellenic Council of Hudson County's internal governance portal.",
    "Our mission remains clear: promote unity, scholarship, and service across our nine Divine Nine organizations. This platform is designed to help us organize better, mobilize faster, and execute with excellence, giving you direct access to meeting documentation, event information, and the resources you need to stay informed and engaged.",
    "As your Executive Council, we're focused on four priorities this year: expanded service, enhanced collaboration, operational excellence, and technological modernization. Our goal is to turn our collective vision into measurable impact.",
    "I encourage you to check the Internal News and Council Updates section regularly. That's where you'll find the latest on key initiatives, upcoming opportunities, and the work ahead.",
    "Thank you for your continued dedication to our council and our legacy. Let's get to work.",
  ];

  const presidentName = config?.presidentName || "Christopher DeMarkus";
  const presidentTitle = config?.presidentTitle || "President, NPHC Hudson County";
  const presidentChapter = config?.presidentChapter || "Alpha Phi Alpha Fraternity, Inc.";
  const presidentClosing = config?.presidentClosing || "In Unity and Service,";

  const row1Links = quickLinks.filter((l) => l.row === 1);
  const row2Links = quickLinks.filter((l) => l.row === 2);

  const isInternalHashRoute = (url: string) => {
    const u = url.trim();
    if (!u.startsWith("/")) return false;
    const pathOnly = u.split("?")[0] || u;
    if (pathOnly === "/") return true;
    return (
      pathOnly === "/chapter-information" ||
      pathOnly === "/meetings-delegates" ||
      pathOnly === "/programs-events" ||
      pathOnly === "/resources" ||
      pathOnly === "/treasury" ||
      pathOnly === "/decision-portal" ||
      pathOnly === "/viewer" ||
      pathOnly === "/figma-staging" ||
      pathOnly === "/forms" ||
      pathOnly.startsWith("/forms/") ||
      pathOnly.startsWith("/reports/") ||
      pathOnly === "/council-admin" ||
      pathOnly.startsWith("/council-admin/")
    );
  };

  // Hash routes for SPA pages. Plain paths for static assets (HTML/PDF under /public).
  const toHref = (url: string) => (isInternalHashRoute(url) ? `#${url}` : url);
  const isExternalUrl = (url: string) => /^https?:\/\//i.test(url.trim());

  const alertEnabled = !!config?.alertEnabled;
  const alertVariant = (config?.alertVariant || "info") as "info" | "warning" | "urgent";
  const alertTitle = (config?.alertTitle || "").trim();
  const alertMessage = (config?.alertMessage || "").trim();
  const alertLinkLabel = (config?.alertLinkLabel || "").trim();
  const alertLinkUrl = (config?.alertLinkUrl || "").trim();
  const showAlert = alertEnabled && (alertTitle.length > 0 || alertMessage.length > 0);
  const alertAccent =
    alertVariant === "urgent" ? "border-l-red-500" : alertVariant === "warning" ? "border-l-amber-400" : "border-l-primary";

  const normalizeJoinUrl = (input: string | null | undefined): string | null => {
    const raw = String(input || "").trim();
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("meet.google.com/")) return `https://${raw}`;
    return raw;
  };

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
  for (const m of meetingsData?.upcomingMeetings || []) {
    const ymd = toYmd(m.date);
    if (!ymd) continue;
    joinByDate.set(ymd, { joinUrl: m.joinUrl, joinLabel: m.joinLabel });
  }

  const nowISO = toYmd(new Date().toISOString()) || "";
  const nextGeneral = generalMeetings.find((m) => m.dateISO >= nowISO) || generalMeetings[0] || null;
  const nextJoin = nextGeneral ? joinByDate.get(nextGeneral.dateISO) : null;

  const generalSchedule = generalMeetings.filter((m) => m.dateISO >= nowISO).slice(0, 6);
  const execSchedule = execMeetings.filter((m) => m.dateISO >= nowISO).slice(0, 6);

  const nextMeeting = nextGeneral
    ? {
      dateISO: nextGeneral.dateISO,
      label: nextGeneral.label,
      mode: nextGeneral.mode,
      joinUrl: nextJoin?.joinUrl || "",
      joinLabel: nextJoin?.joinLabel || "Join Google Meet",
    }
    : null;

  return (
    <div>
      <FormsQuickPane />
      {/* ── Google Sites Cover Banner ─────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-white h-[220px] sm:h-[260px] lg:h-[340px]">
        {bannerIsVideo ? (
          <motion.video
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setBannerError(true)}
          >
            <source src={effectiveBannerUrl} type="video/mp4" />
          </motion.video>
        ) : (
          <motion.img
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src={effectiveBannerUrl}
            alt="NPHC Hudson County"
            className="absolute inset-0 h-full w-full object-cover object-center"
            onError={() => setBannerError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── Alert / Notifications Banner (Home) ───────────────────────────── */}
      {showAlert ? (
        <div>
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`rounded-2xl border border-black/15 bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4 sm:p-5 border-l-4 ${alertAccent}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl border border-primary/25 bg-primary/15 text-primary p-2.5 flex-shrink-0">
                    <Bell className="size-4" />
                  </div>
                  <div className="min-w-0">
                    {alertTitle ? <p className="text-sm font-semibold text-slate-900">{alertTitle}</p> : null}
                    {alertMessage ? <p className="text-sm text-slate-600 mt-0.5">{alertMessage}</p> : null}
                  </div>
                </div>

                {alertLinkUrl && alertLinkLabel ? (
                  <a
                    href={toHref(alertLinkUrl)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:brightness-110 active:scale-[0.99] transition self-start"
                  >
                    {alertLinkLabel}
                  </a>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}

      {/* ── Quick Links ───────────────────────────────────────────────────── */}
      <div className="bg-white py-8 sm:py-10 relative overflow-hidden">
        <div className="px-4 sm:px-8 lg:px-10 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap lg:flex-nowrap items-center justify-start gap-3 sm:gap-4 overflow-x-auto pb-2"
          >
            {[...row1Links, ...row2Links].map((link, i) => (
              <motion.a
                key={link.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}
                whileTap={{ scale: 0.95 }}
                href={toHref(link.url)}
                className={glassButtonClass + " flex-shrink-0"}
                target={isExternalUrl(link.url) ? "_blank" : undefined}
                rel={isExternalUrl(link.url) ? "noreferrer" : undefined}
              >
                <DynamicIcon name={link.icon} className="size-4 relative z-10 flex-shrink-0" />
                <span className="hidden sm:inline relative z-10">{link.label}</span>
                <span className="sm:hidden relative z-10 text-xs">{link.shortLabel}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── President's Welcome ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="px-4 sm:px-8 lg:px-10 py-14 sm:py-20 relative z-10">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.2em] uppercase text-slate-500">From the Desk of the President</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-slate-900">
              President&apos;s <span className="text-primary">Welcome</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start"
          >
            {/* President Photo */}
            <div className="md:col-span-5">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="nphc-holo-surface aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 shadow-[0_25px_80px_rgba(0,0,0,0.35),0_0_70px_rgba(255,255,255,0.18)] ring-1 ring-black/10"
              >
                {presidentImageUrl ? (
                  <img
                    src={presidentImageUrl}
                    alt="President Christopher DeMarkus"
                    className="h-full w-full object-contain object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-slate-500">
                    <span className="text-sm font-semibold uppercase tracking-wide">President Photo</span>
                  </div>
                )}
              </motion.div>
              <div className="mt-5 text-center">
                <h3 className="text-lg text-slate-900">{presidentName}</h3>
                <p className="text-slate-600 text-sm">{presidentTitle}</p>
                <p className="text-slate-500 text-xs mt-1">{presidentChapter}</p>
              </div>
            </div>

            {/* President's Message */}
            <div className="md:col-span-7 space-y-3 text-[15px] text-slate-800 leading-snug">
              {welcomeParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              <div className="pt-2">
                <p className="text-slate-500 italic">{presidentClosing}</p>
                <p className="text-slate-900 mt-2">
                  {presidentName}
                  <br />
                  <span className="text-slate-600 text-sm">{presidentTitle}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Next Meeting + Schedules ─────────────────────────────────────── */}
      <section className="relative">
        <div className="px-4 sm:px-8 lg:px-10 py-12 sm:py-14">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Meetings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-slate-900">
              Next <span className="text-primary">Meeting</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6">
                {nextMeeting ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">General Body</p>
                        <h3 className="text-slate-900 text-lg leading-snug">{nextMeeting.label}</h3>
                        {nextMeeting.mode ? (
                          <p className="text-xs text-slate-500 mt-1">{nextMeeting.mode}</p>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-primary/25 bg-primary/15 text-primary p-3 flex-shrink-0">
                        <Calendar className="size-5" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-sm text-slate-700">
                      <p><strong className="text-slate-900">Date:</strong> {nextMeeting.dateISO}</p>
                    </div>

                    {normalizeJoinUrl(nextMeeting.joinUrl) ? (
                      <a
                        href={normalizeJoinUrl(nextMeeting.joinUrl) || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:brightness-110 transition"
                      >
                        <ExternalLink className="size-4" />
                        {nextMeeting.joinLabel || "Join Google Meet"}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 text-slate-400 px-4 py-2.5 text-sm font-semibold cursor-not-allowed"
                        title="Join link will be added by Council Admin"
                      >
                        <ExternalLink className="size-4" />
                        Join link (coming soon)
                      </button>
                    )}

                    <div className="mt-4 text-xs text-slate-400">
                      Admin: set the join link in Council Admin → Content → Meetings.
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No upcoming General Body meetings found in the 2026 calendar.</p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Schedule List View</p>
                    <h3 className="text-slate-900 text-lg">Executive Council & General Body</h3>
                  </div>
                  <a
                    href="/2026-council-calendar.html"
                    className="inline-flex items-center justify-center rounded-lg border border-black/15 bg-white/5 px-3 py-2 text-sm text-slate-800 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition w-fit"
                  >
                    View Full 2026 Calendar
                  </a>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">General Body Meetings</p>
                    <div className="space-y-2">
                      {generalSchedule.map((m) => (
                        <div key={`${m.kind}:${m.dateISO}`} className="rounded-lg border border-black/10 bg-white/5 p-3">
                          <p className="text-sm text-slate-900">{m.label}</p>
                          <p className="text-xs text-slate-500">{m.dateISO}{m.mode ? ` • ${m.mode}` : ""}</p>
                        </div>
                      ))}
                      {generalSchedule.length === 0 ? <p className="text-sm text-slate-500">No General Body meetings listed yet.</p> : null}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">Executive Council Meetings</p>
                    <div className="space-y-2">
                      {execSchedule.map((m) => (
                        <div key={`${m.kind}:${m.dateISO}`} className="rounded-lg border border-black/10 bg-white/5 p-3">
                          <p className="text-sm text-slate-900">{m.label}</p>
                          <p className="text-xs text-slate-500">{m.dateISO}</p>
                        </div>
                      ))}
                      {execSchedule.length === 0 ? <p className="text-sm text-slate-500">No Executive Council meetings listed yet.</p> : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Treasury Snapshot ────────────────────────────────────────────── */}
      <section className="relative">
        <div className="px-4 sm:px-8 lg:px-10 py-12 sm:py-14">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Treasury</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-slate-900">
              Financial <span className="text-primary">Snapshot</span>
            </h2>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Total Funds (Cash on Hand)</p>
                    <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                      {(TREASURY.balances.lendingClub + TREASURY.balances.cashApp).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">{TREASURY.asOfLabel}</p>
                  </div>
                  <div className="rounded-xl border border-primary/25 bg-primary/15 text-primary p-3 flex-shrink-0">
                    <Wallet className="size-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-slate-500">LendingClub</p>
                      <CreditCard className="size-4 text-slate-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {TREASURY.balances.lendingClub.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-widest text-slate-500">Cash App</p>
                      <DollarSign className="size-4 text-slate-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mt-1">
                      {TREASURY.balances.cashApp.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <a
                    href="#/treasury"
                    className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:brightness-110 transition w-full sm:w-auto"
                  >
                    View Treasury Page
                  </a>
                  <a
                    href="#/forms/reimbursement"
                    className="inline-flex items-center justify-center rounded-lg border border-black/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition w-full sm:w-auto"
                  >
                    Reimbursement Form
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Cash App</p>
                <a
                  href={TREASURY.cashApp.payUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xl font-extrabold text-primary hover:underline"
                >
                  {TREASURY.cashApp.cashtag}
                </a>
                <p className="text-sm text-slate-600 mt-2">Scan or tap the link to submit payments.</p>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <img
                    src={TREASURY.cashApp.qrImageUrl}
                    alt="Cash App QR Code"
                    className="size-32 rounded-xl border border-black/10 bg-white p-2"
                    loading="lazy"
                  />
                  <a
                    href={TREASURY.cashApp.payUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-black/15 bg-white/5 px-3 py-2 text-sm text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition w-fit"
                  >
                    Open Link
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── What's New ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="px-4 sm:px-8 lg:px-10 py-14 sm:py-20 relative z-10">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Internal News</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-slate-900">
              Internal News and <span className="text-primary">Council Updates</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="p-0">
                {updates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ x: -15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className={`flex items-start gap-4 p-5 sm:p-6 transition-colors hover:bg-white/5 ${
                      index < updates.length - 1 ? "border-b border-black/10" : ""
                    }`}
                  >
                    <div className="rounded-xl border border-primary/25 bg-primary/15 text-primary p-2.5 flex-shrink-0">
                      <Clock className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 mb-1.5 text-sm sm:text-base">{update.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <p className="text-xs sm:text-sm text-slate-500">{update.date}</p>
                        <span className="px-2.5 py-0.5 rounded-full w-fit border border-primary/25 bg-primary/15 text-primary text-xs">
                          {update.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ── Instagram Feed ───────────────────────────────────────────────── */}
      {(instagramHandle || instagramPostUrls.length > 0) ? (
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs tracking-[0.2em] uppercase text-slate-500">Social</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-2xl sm:text-3xl text-slate-900">
                Chapter <span className="text-primary">Instagram</span>
              </h2>
              {instagramHandle ? (
                <a
                  href={`https://www.instagram.com/${encodeURIComponent(instagramHandle)}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-black/15 bg-white/5 px-3 py-2 text-sm text-slate-800 hover:border-primary/60 hover:text-primary hover:bg-white/10 transition w-fit"
                >
                  @{instagramHandle}
                  <ExternalLink className="ml-2 size-4" />
                </a>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Latest posts and announcements. If embeds do not load on your device, use the profile link above.
            </p>
          </motion.div>

          {instagramPostUrls.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {instagramPostUrls.slice(0, 6).map((url) => (
                <Card key={url} className="overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <CardContent className="p-0">
                    <blockquote
                      className="instagram-media"
                        data-instgrm-permalink={url}
                        data-instgrm-version="14"
                        style={{
                          margin: 0,
                          padding: 0,
                          width: "100%",
                          maxWidth: "100%",
                          background: "white",
                        }}
                      >
                        <a href={url} target="_blank" rel="noreferrer" />
                      </blockquote>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardContent className="p-6 text-sm text-slate-600">
                Feed posts are not configured yet. Add post URLs in Council Admin → Home Page Editor.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      ) : null}
    </div>
  );
}
