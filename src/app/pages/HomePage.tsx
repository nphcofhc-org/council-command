import { Card, CardContent } from "../components/ui/card";
import { Bell, Clock } from "lucide-react";
import googleBanner from "../../assets/08f5f2f8147d555bb4793ae6a060e3d0c28be71f.png";
import { motion } from "motion/react";
import { useHomePageData } from "../hooks/use-site-data";
import { DynamicIcon } from "../components/icon-resolver";

// ── Shared glass button class for quick links ───────────────────────────────
const glassButtonClass =
  "relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer " +
  "bg-white/[0.08] backdrop-blur-xl text-white border border-white/20 " +
  "shadow-[0_8px_32px_0_rgba(255,255,255,0.07)] " +
  "transition-all duration-300 text-sm " +
  "hover:bg-[#D4AF37]/15 hover:text-[#FFD700] hover:border-[#D4AF37]/50 " +
  "hover:shadow-[0_12px_40px_0_rgba(212,175,55,0.3)] hover:-translate-y-0.5 " +
  "active:bg-[#D4AF37]/25 active:text-[#FFD700] active:scale-[0.97]";

// ── Abstract art image URLs (centralized for easy swap) ─────────────────────
const ART_MARBLE = "https://images.unsplash.com/photo-1678756466078-1ff0d7b09431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vY2hyb21lJTIwYWJzdHJhY3QlMjBtYXJibGUlMjB0ZXh0dXJlfGVufDF8fHx8MTc3MDUxMzIyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const ART_INK = "https://images.unsplash.com/photo-1769181417562-be594f91fcc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwYWJzdHJhY3QlMjBpbmslMjBicnVzaCUyMHN0cm9rZXN8ZW58MXx8fHwxNzcwNTEzMjIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const ART_GEO = "https://images.unsplash.com/photo-1665680779817-11a0d63ee51e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMHdoaXRlJTIwZ2VvbWV0cmljJTIwbWluaW1hbCUyMGFydHxlbnwxfHx8fDE3NzA1MTMyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export function HomePage() {
  const { data } = useHomePageData();

  // While loading, data is null — use safe defaults so layout doesn't jump
  const config = data?.config;
  const rawQuickLinks = data?.quickLinks || [];
  const updates = data?.updates || [];
  const presidentImageUrl = config?.presidentImageUrl || "";
  const bannerImageUrl = config?.bannerImageUrl || "";

  const CALENDAR_URL = "/2026-council-calendar.html";
  const quickLinks = (() => {
    const alreadyHas = rawQuickLinks.some((l) => (l?.url || "").trim() === CALENDAR_URL);
    if (alreadyHas) return rawQuickLinks;
    return [
      {
        id: "calendar-2026",
        icon: "Calendar",
        label: "2026 Calendar",
        shortLabel: "Calendar",
        url: CALENDAR_URL,
        row: 1 as const,
      },
      ...rawQuickLinks,
    ];
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
    if (u === "/") return true;
    return (
      u === "/chapter-information" ||
      u === "/meetings-delegates" ||
      u === "/programs-events" ||
      u === "/resources" ||
      u === "/figma-staging" ||
      u === "/council-admin" ||
      u.startsWith("/council-admin/")
    );
  };

  // Hash routes for SPA pages. Plain paths for static assets (HTML/PDF under /public).
  const toHref = (url: string) => (isInternalHashRoute(url) ? `#${url}` : url);

  const alertEnabled = !!config?.alertEnabled;
  const alertVariant = (config?.alertVariant || "info") as "info" | "warning" | "urgent";
  const alertTitle = (config?.alertTitle || "").trim();
  const alertMessage = (config?.alertMessage || "").trim();
  const alertLinkLabel = (config?.alertLinkLabel || "").trim();
  const alertLinkUrl = (config?.alertLinkUrl || "").trim();
  const showAlert = alertEnabled && (alertTitle.length > 0 || alertMessage.length > 0);
  const alertAccent =
    alertVariant === "urgent" ? "border-l-red-600" : alertVariant === "warning" ? "border-l-amber-500" : "border-l-slate-900";

  return (
    <div className="bg-white">
      {/* ── Google Sites Cover Banner ─────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-black">
        <motion.img
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          src={bannerImageUrl || googleBanner}
          alt="NPHC Hudson County"
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── Alert / Notifications Banner (Home) ───────────────────────────── */}
      {showAlert ? (
        <div className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`rounded-xl border bg-white shadow-sm p-4 sm:p-5 border-gray-200 border-l-4 ${alertAccent}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-black text-white p-2 flex-shrink-0">
                    <Bell className="size-4" />
                  </div>
                  <div className="min-w-0">
                    {alertTitle ? <p className="text-sm font-semibold text-black">{alertTitle}</p> : null}
                    {alertMessage ? <p className="text-sm text-gray-700 mt-0.5">{alertMessage}</p> : null}
                  </div>
                </div>

                {alertLinkUrl && alertLinkLabel ? (
                  <a
                    href={toHref(alertLinkUrl)}
                    className="inline-flex items-center justify-center rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 active:scale-[0.99] transition self-start"
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
      <div className="bg-black py-8 sm:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <img src={ART_MARBLE} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10">
          {/* Row 1 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4"
          >
            {row1Links.map((link, i) => (
              <motion.a
                key={link.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
                whileTap={{ scale: 0.95 }}
                href={toHref(link.url)}
                className={glassButtonClass}
              >
                <DynamicIcon name={link.icon} className="size-4 relative z-10 flex-shrink-0" />
                <span className="hidden sm:inline relative z-10">{link.label}</span>
                <span className="sm:hidden relative z-10 text-xs">{link.shortLabel}</span>
              </motion.a>
            ))}
          </motion.div>

          {/* Row 2 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {row2Links.map((link, i) => (
              <motion.a
                key={link.id}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
                whileTap={{ scale: 0.95 }}
                href={toHref(link.url)}
                className={glassButtonClass}
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
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-[0.04] pointer-events-none hidden lg:block">
          <img src={ART_INK} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative z-10">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-black" />
              <span className="text-xs tracking-[0.2em] uppercase text-gray-500">From the Desk of the President</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-black">President's Welcome</h2>
          </motion.div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start"
          >
            {/* President Photo */}
            <div className="md:col-span-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-xl ring-1 ring-black/5"
              >
                {presidentImageUrl ? (
                  <img
                    src={presidentImageUrl}
                    alt="President Christopher DeMarkus"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm font-semibold uppercase tracking-wide">President Photo</span>
                  </div>
                )}
              </motion.div>
              <div className="mt-5 text-center">
                <h3 className="text-lg text-black">{presidentName}</h3>
                <p className="text-gray-500 text-sm">{presidentTitle}</p>
                <p className="text-gray-400 text-xs mt-1">{presidentChapter}</p>
              </div>
            </div>

            {/* President's Message */}
            <div className="md:col-span-2 space-y-5 text-gray-700">
              {welcomeParagraphs.map((paragraph, i) => (
                <p key={i} className="leading-relaxed">{paragraph}</p>
              ))}
              <div className="pt-2">
                <p className="text-gray-500 italic">{presidentClosing}</p>
                <p className="text-black mt-2">
                  {presidentName}
                  <br />
                  <span className="text-gray-500 text-sm">{presidentTitle}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── What's New ────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-80 h-80 opacity-[0.04] pointer-events-none">
          <img src={ART_GEO} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative z-10">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-px bg-black" />
              <span className="text-xs tracking-[0.2em] uppercase text-gray-500">Internal News</span>
            </div>
            <h2 className="text-2xl sm:text-3xl text-black">Internal News and Council Updates</h2>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 ring-1 ring-black/5">
              <CardContent className="p-0">
                {updates.map((update, index) => (
                  <motion.div
                    key={update.id}
                    initial={{ x: -15, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className={`flex items-start gap-4 p-5 sm:p-6 transition-colors hover:bg-gray-50/80 ${
                      index < updates.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="p-2.5 bg-black rounded-lg flex-shrink-0">
                      <Clock className="size-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-black mb-1.5 text-sm sm:text-base">{update.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <p className="text-xs sm:text-sm text-gray-500">{update.date}</p>
                        <span className="px-2.5 py-0.5 bg-black text-white text-xs rounded-full w-fit">
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
    </div>
  );
}
