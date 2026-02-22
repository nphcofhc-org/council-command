import { Outlet, NavLink, useLocation, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import { Home, Users, Calendar, TrendingUp, FolderOpen, Shield, Menu, X, Target, ClipboardList, MessagesSquare, Bell, AlertTriangle, Info, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteConfig } from "../hooks/use-site-data";
import { useCouncilSession } from "../hooks/use-council-session";
import { useEditorMode } from "../hooks/use-editor-mode";
import { usePreviewDevice } from "./ui/use-mobile";
import { useMemberDirectory } from "../hooks/use-member-directory";
import { useMemberProfile } from "../hooks/use-member-profile";
import { isProfileComplete } from "../data/member-profile-api";
import { sessionDisplayNameWithProfile, sessionRoleLabel } from "../utils/user-display";
import { IntroSplash } from "./IntroSplash";
import { GuidedTour } from "./GuidedTour";
import { trackPortalActivity } from "../data/admin-api";
import { MemberProfileRequiredModal } from "./MemberProfileRequiredModal";
import { fetchMemberAlerts, type MemberAlerts } from "../data/content-api";
import { PageEditShortcut } from "./PageEditShortcut";

const baseNavItems: Array<{ to: string; label: string; icon: any; danger?: boolean }> = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chapter-information", label: "Chapter Info", icon: Users },
  { to: "/meetings-delegates", label: "Meetings & Delegates", icon: Calendar },
  { to: "/programs-events", label: "Programs & Events", icon: TrendingUp },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/forms", label: "Forms", icon: ClipboardList },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  {
    to: "/reports/signature-event-comparison",
    label: "For Your Consideration: Signature Event Comparison",
    icon: Target,
    danger: true,
  },
];

const DISMISSED_ALERTS_KEY = "nphc-dismissed-member-alerts";

const EMPTY_ALERT: MemberAlerts = {
  enabled: false,
  style: "banner",
  severity: "info",
  title: "",
  message: "",
  ctaLabel: "",
  ctaUrl: "",
  alertId: "",
};

function readDismissedAlerts(): Record<string, true> {
  try {
    const raw = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function markAlertDismissed(alertId: string) {
  if (!alertId) return;
  try {
    const current = readDismissedAlerts();
    current[alertId] = true;
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tourRequested, setTourRequested] = useState(false);
  const [memberAlert, setMemberAlert] = useState<MemberAlerts>(EMPTY_ALERT);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();
  const { session } = useCouncilSession();
  const { editorMode, toggleEditorMode } = useEditorMode();
  const { device: previewDevice, setDevice: setPreviewDevice } = usePreviewDevice();
  const { directory } = useMemberDirectory();
  const {
    profile,
    loading: profileLoading,
    saving: profileSaving,
    error: profileError,
    save: saveProfile,
  } = useMemberProfile(session.authenticated);

  const isFramed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return false;
    }
  })();
  const mobilePreviewActive = session.isSiteEditor && editorMode && previewDevice === "mobile" && !isFramed;
  const iframeSrc = `/#${location.pathname}${location.search || ""}`;

  const navItems = [
    ...baseNavItems,
    ...(session.isCouncilAdmin || session.isSiteEditor ? [{ to: "/council-admin", label: "Council Command Center", icon: Shield }] : []),
    ...(session.isPresident ? [{ to: "/council-admin/site-maintenance", label: "The President's Desk", icon: Shield }] : []),
  ];

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!session.authenticated) return;
    void trackPortalActivity(location.pathname || "/", "page_view");
  }, [location.pathname, session.authenticated]);

  useEffect(() => {
    if (!session.authenticated) {
      setMemberAlert(EMPTY_ALERT);
      setShowAlertModal(false);
      return;
    }

    let cancelled = false;
    void fetchMemberAlerts()
      .then((payload) => {
        if (cancelled) return;
        const incoming = payload?.data || EMPTY_ALERT;
        setMemberAlert({
          ...EMPTY_ALERT,
          ...incoming,
        });
      })
      .catch(() => {
        if (!cancelled) setMemberAlert(EMPTY_ALERT);
      });

    return () => {
      cancelled = true;
    };
  }, [session.authenticated]);

  useEffect(() => {
    if (!session.authenticated) return;
    if (!memberAlert.enabled || !memberAlert.alertId) {
      setShowAlertModal(false);
      return;
    }
    if (memberAlert.style !== "alert") {
      setShowAlertModal(false);
      return;
    }

    const dismissed = readDismissedAlerts();
    const alreadyDismissed = dismissed[memberAlert.alertId] === true;
    setShowAlertModal(!alreadyDismissed);
  }, [session.authenticated, memberAlert.enabled, memberAlert.style, memberAlert.alertId]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const councilName = config?.councilName || "NPHC Hudson County";
  const footerText = config?.footerText || "© 2026 National Pan-Hellenic Council of Hudson County";
  const footerSubtext = config?.footerSubtext || "Internal Governance Portal · Authorized Access Only";
  const sidebarCouncilTitle = "NPHC of Hudson County";
  const logoUrl =
    config?.logoUrl ||
    "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20of%20HC%20LOGO%20Black.PNG";
  const faviconLogoUrl = "/favicon.png";
  const identity = sessionDisplayNameWithProfile(session, directory, profile);
  const role = sessionRoleLabel(session);
  const profileRequired = session.authenticated && !profileLoading && !isProfileComplete(profile);
  const introSplashEnabled = config?.showIntroSplashModal ?? true;
  const guidedTourEnabled = config?.showGuidedTourModal ?? true;
  const memberAlertPopupEnabled = config?.showMemberAlertPopupModal ?? true;
  const canShowMemberAlert =
    session.authenticated &&
    !profileRequired &&
    memberAlert.enabled &&
    Boolean(memberAlert.alertId) &&
    Boolean(memberAlert.title || memberAlert.message);
  const showMemberBanner = canShowMemberAlert && memberAlert.style === "banner" && !readDismissedAlerts()[memberAlert.alertId];
  const isUrgentAlert = memberAlert.severity === "urgent";
  const isImportantAlert = memberAlert.severity === "important";
  const alertBgClass = isUrgentAlert
    ? "border-rose-300/50 bg-rose-500/10 text-rose-900"
    : isImportantAlert
      ? "border-amber-300/50 bg-amber-500/10 text-amber-900"
      : "border-sky-300/50 bg-sky-500/10 text-sky-900";
  const alertTitle = memberAlert.title || "Council Update";
  const helpMailtoHref = (() => {
    const subject = encodeURIComponent("NPHC Portal Help Request");
    const body = encodeURIComponent(
      [
        "Hello NPHC Hudson County,",
        "",
        "I need help with the portal.",
        "",
        `Page: ${location.pathname || "/"}`,
        `User: ${session.email || "Not signed in"}`,
        "",
        "Issue / question:",
      ].join("\n"),
    );
    return `mailto:nphcofhudsoncounty@gmail.com?subject=${subject}&body=${body}`;
  })();

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <MemberProfileRequiredModal
        open={profileRequired}
        email={session.email}
        initialValue={profile}
        saving={profileSaving}
        error={profileError}
        onSubmit={saveProfile}
      />
      {introSplashEnabled ? (
        <IntroSplash
          session={session}
          directory={directory}
          profile={profile}
          logoUrl={faviconLogoUrl}
          fallbackLogoUrl={logoUrl}
          disabled={profileRequired}
        />
      ) : null}
      {guidedTourEnabled ? (
        <GuidedTour
          session={session}
          forceOpen={tourRequested}
          onForceOpenHandled={() => setTourRequested(false)}
          onNavigate={(route) => navigate(route)}
        />
      ) : null}
      <AnimatePresence>
        {canShowMemberAlert && memberAlertPopupEnabled && showAlertModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4"
          >
            <motion.div
              initial={{ y: 14, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 8, opacity: 0, scale: 0.98 }}
              className={`w-full max-w-xl rounded-2xl border p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl ${alertBgClass}`}
            >
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                <Bell className="size-4" />
                Member Alert
              </div>
              <h3 className="text-lg font-semibold">{alertTitle}</h3>
              {memberAlert.message ? <p className="mt-2 text-sm leading-relaxed">{memberAlert.message}</p> : null}
              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                {memberAlert.ctaLabel && memberAlert.ctaUrl ? (
                  <a
                    href={memberAlert.ctaUrl}
                    target={memberAlert.ctaUrl.startsWith("/") ? undefined : "_blank"}
                    rel={memberAlert.ctaUrl.startsWith("/") ? undefined : "noreferrer"}
                    className="rounded-lg border border-black/20 bg-white/55 px-3 py-1.5 text-sm font-semibold hover:bg-white/75 transition-colors"
                  >
                    {memberAlert.ctaLabel}
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    markAlertDismissed(memberAlert.alertId);
                    setShowAlertModal(false);
                  }}
                  className="rounded-lg border border-black/20 bg-white/45 px-3 py-1.5 text-sm font-semibold hover:bg-white/70 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {/* Desktop Sidebar Navigation */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-white/10 bg-black text-white nphc-holo-surface"
        data-tour="nav"
      >
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <img
              src={logoUrl}
              alt="NPHC of Hudson County"
              className="h-9 w-auto brightness-0 invert"
              loading="eager"
            />
          </NavLink>
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/65 leading-snug">
            {sidebarCouncilTitle}
          </p>
          {session.authenticated ? (
            <div className="mt-2 space-y-0.5">
              <p className="text-white text-sm leading-tight">{identity.name}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/45">{role}</p>
            </div>
          ) : (
            <p className="mt-2 text-white/45 text-xs tracking-wider uppercase">Sign in required</p>
          )}
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[10px] text-white/35 tracking-[0.22em] uppercase">
              Portal
            </span>
            <div className="flex items-center gap-2">
              {session.authenticated && guidedTourEnabled ? (
                <button
                  type="button"
                  onClick={() => setTourRequested(true)}
                  className="nphc-holo-btn rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] tracking-widest uppercase text-white/70 hover:text-white hover:border-primary/60 transition-colors"
                  title="Start the portal tour"
                >
                  Tour
                </button>
              ) : null}
              {session.isSiteEditor ? (
                <button
                  type="button"
                  onClick={toggleEditorMode}
                  className="nphc-holo-btn rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] tracking-widest uppercase text-white/70 hover:text-white hover:border-primary/60 transition-colors"
                >
                  {editorMode ? "Editor" : "Member"}
                </button>
              ) : null}
            </div>
          </div>

          {session.isSiteEditor && editorMode ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] tracking-[0.22em] uppercase text-white/40">Preview</span>
              <button
                type="button"
                onClick={() => setPreviewDevice(previewDevice === "mobile" ? "desktop" : "mobile")}
                className="nphc-holo-btn rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] tracking-widest uppercase text-white/70 hover:text-white hover:border-primary/60 transition-colors"
                title="Toggle between desktop and mobile preview"
              >
                {previewDevice === "mobile" ? "Mobile" : "Desktop"}
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("auto")}
                className="nphc-holo-btn rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] tracking-widest uppercase text-white/55 hover:text-white hover:border-primary/60 transition-colors"
                title="Return to auto (real device width)"
              >
                Auto
              </button>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              data-tour={item.to === "/forum" ? "nav-forum" : undefined}
              className={({ isActive }) =>
                `nphc-holo-btn flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 drop-shadow-[0_0_12px_rgba(24,224,208,0.10)] ${
                  item.danger
                    ? isActive
                      ? "bg-rose-500/10 text-rose-200 border border-rose-400/35 drop-shadow-[0_0_16px_rgba(244,63,94,0.35)]"
                      : "text-rose-200/85 border border-transparent hover:bg-rose-500/10 hover:text-rose-200 hover:border-rose-400/35 drop-shadow-[0_0_16px_rgba(244,63,94,0.18)]"
                    : isActive
                      ? "bg-primary/10 text-primary border border-primary/25 drop-shadow-[0_0_14px_rgba(11,189,176,0.35)]"
                      : "text-white/75 hover:bg-white/10 hover:text-primary border border-transparent"
                }`
              }
            >
              <item.icon className="size-5" />
              <span className={item.danger ? "text-[12px] leading-tight" : "truncate"}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-white/55 text-xs">{footerText}</p>
          <p className="text-white/35 text-[11px] mt-1">{footerSubtext}</p>
          <a
            href="https://www.xdesignlabs.co/"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex text-[11px] text-white/35 hover:text-primary transition-colors"
          >
            Created by Xceptional Design Lab, LLC
          </a>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-h-screen flex-1 flex-col w-full">
      {/* Top Navigation Bar */}
      <nav className="lg:hidden nphc-holo-nav sticky top-0 z-50 border-b border-black/10 bg-white/60 text-slate-900 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-start justify-between gap-2 py-2 min-h-[58px]">
            {/* Mobile: hamburger + title */}
            <div className="flex min-w-0 items-start gap-2 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="nphc-holo-btn p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle navigation"
                data-tour="nav-toggle"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <div className="min-w-0">
                <NavLink to="/" className="flex min-w-0 items-center gap-2">
                  <img src={logoUrl} alt="NPHC" className="h-6 w-auto" />
                  <span className="text-sm tracking-wide whitespace-nowrap">
                    NPHC <span className="text-primary">of Hudson County</span>
                  </span>
                </NavLink>
                {session.authenticated ? (
                  <p className="mt-0.5 text-[11px] text-slate-600 truncate">
                    {identity.name} — {role}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex" />

            {/* Desktop: portal label */}
            <div className="hidden lg:flex" />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-white/70 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              data-tour="nav"
              className="fixed bottom-0 left-0 top-14 z-40 w-72 overflow-y-auto border-r border-black/10 bg-white/70 backdrop-blur-xl lg:hidden"
            >
              <div className="py-4">
                <div className="px-6 pb-4 mb-2 border-b border-black/10">
                  <p className="text-slate-400 text-xs tracking-widest uppercase">
                    {councilName.includes("National") ? "National Pan-Hellenic Council" : councilName}
                  </p>
                  <p className="text-slate-900 text-sm mt-1">Hudson County, NJ</p>
                </div>

              <div className="px-3 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      data-tour={item.to === "/forum" ? "nav-forum" : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                          item.danger
                            ? isActive
                              ? "bg-rose-500/10 text-rose-700 drop-shadow-[0_0_14px_rgba(244,63,94,0.25)]"
                              : "text-rose-700/80 hover:bg-rose-500/10 hover:text-rose-700 hover:drop-shadow-[0_0_12px_rgba(244,63,94,0.18)]"
                            : isActive
                              ? "bg-white/10 text-primary drop-shadow-[0_0_12px_rgba(24,224,208,0.55)]"
                              : "text-slate-600 hover:bg-white/5 hover:text-primary hover:drop-shadow-[0_0_12px_rgba(24,224,208,0.35)]"
                          }`
                      }
                    >
                      <item.icon className="size-5" />
                      <span>{item.label}</span>
                    </NavLink>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 mt-8 pt-4 border-t border-black/10">
                  {session.isSiteEditor ? (
                    <button
                      type="button"
                      onClick={toggleEditorMode}
                      className="w-full rounded-lg border border-black/10 bg-white/5 px-3 py-2 text-left text-xs text-slate-600 hover:text-slate-900 hover:border-primary/60 transition-colors"
                    >
                      View Mode: {editorMode ? "Editor" : "Member"} (tap to switch)
                    </button>
                  ) : null}
                  <p className="text-slate-400 text-xs">Internal Use Only</p>
                  <p className="text-slate-300 text-xs mt-1">&copy; 2026 NPHC of Hudson County</p>
                  <a
                    href="https://www.xdesignlabs.co/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs text-slate-500 hover:text-primary transition-colors"
                  >
                    Created by Xceptional Design Lab, LLC
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showMemberBanner ? (
        <div className={`mx-3 mt-3 rounded-xl border px-4 py-3 shadow-sm lg:mx-6 ${alertBgClass}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-2">
              {isUrgentAlert ? <AlertTriangle className="mt-0.5 size-4 flex-shrink-0" /> : <Info className="mt-0.5 size-4 flex-shrink-0" />}
              <div>
                <p className="text-sm font-semibold">{alertTitle}</p>
                {memberAlert.message ? <p className="text-sm leading-relaxed">{memberAlert.message}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {memberAlert.ctaLabel && memberAlert.ctaUrl ? (
                memberAlert.ctaUrl.startsWith("/") ? (
                  <Link
                    to={memberAlert.ctaUrl}
                    className="rounded-lg border border-black/20 bg-white/55 px-3 py-1 text-sm font-semibold hover:bg-white/75 transition-colors"
                  >
                    {memberAlert.ctaLabel}
                  </Link>
                ) : (
                  <a
                    href={memberAlert.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-black/20 bg-white/55 px-3 py-1 text-sm font-semibold hover:bg-white/75 transition-colors"
                  >
                    {memberAlert.ctaLabel}
                  </a>
                )
              ) : null}
              <button
                type="button"
                onClick={() => {
                  markAlertDismissed(memberAlert.alertId);
                }}
                className="rounded-lg border border-black/20 bg-white/40 px-3 py-1 text-sm font-semibold hover:bg-white/65 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Page Content */}
      <main className="flex-1">
        {mobilePreviewActive ? (
          <div className="px-4 py-6 sm:px-8">
            <div className="mx-auto w-fit">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="tracking-widest uppercase">Mobile Preview</span>
                <span className="text-slate-400">390×844</span>
              </div>
              <div className="rounded-[28px] border border-black/15 bg-white/40 shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden">
                <iframe
                  title="NPHC Mobile Preview"
                  src={iframeSrc}
                  className="block w-[390px] h-[844px] bg-white"
                />
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {!isFramed ? (
        <PageEditShortcut
          session={session}
          editorMode={editorMode}
          onToggleEditorMode={toggleEditorMode}
        />
      ) : null}

      {!isFramed ? (
        <div className="fixed bottom-4 right-4 z-[72]">
          <a
            href={helpMailtoHref}
            className="nphc-holo-btn inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_16px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl hover:border-primary/50 hover:text-primary transition"
            aria-label="Contact portal help"
          >
            <MessageCircle className="size-4" />
            Help
          </a>
        </div>
      ) : null}

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 bg-white/55 py-8 text-slate-500 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>{footerText}</p>
            <p className="text-slate-400">{footerSubtext}</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
