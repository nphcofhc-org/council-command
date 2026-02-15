import { Outlet, NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Home, Users, Calendar, TrendingUp, FolderOpen, Wallet, Shield, Menu, X, Target, ClipboardList, MessagesSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteConfig } from "../hooks/use-site-data";
import { useCouncilSession } from "../hooks/use-council-session";
import { useEditorMode } from "../hooks/use-editor-mode";
import { usePreviewDevice } from "./ui/use-mobile";
import { useMemberDirectory } from "../hooks/use-member-directory";
import { sessionDisplayName, sessionRoleLabel } from "../utils/user-display";
import { IntroSplash } from "./IntroSplash";

const baseNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chapter-information", label: "Chapter Info", icon: Users },
  { to: "/meetings-delegates", label: "Meetings & Delegates", icon: Calendar },
  { to: "/programs-events", label: "Programs & Events", icon: TrendingUp },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/treasury", label: "Treasury", icon: Wallet },
  { to: "/forms", label: "Forms", icon: ClipboardList },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/decision-portal", label: "Signature Event Analysis", icon: Target },
];

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: config } = useSiteConfig();
  const { session } = useCouncilSession();
  const { editorMode, toggleEditorMode } = useEditorMode();
  const { device: previewDevice, setDevice: setPreviewDevice } = usePreviewDevice();
  const { directory } = useMemberDirectory();

  const isFramed = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return false;
    }
  })();
  const mobilePreviewActive = session.isSiteEditor && editorMode && previewDevice === "mobile" && !isFramed;
  const iframeSrc = `/#${location.pathname}${location.search || ""}`;

  const navItems = session.isCouncilAdmin
    ? [...baseNavItems, { to: "/council-admin", label: "Council Admin", icon: Shield }]
    : baseNavItems;

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
  const logoUrl =
    config?.logoUrl ||
    "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/NPHC%20of%20HC%20LOGO%20Black.PNG";
  const faviconLogoUrl = "/icons/nphc-hc-192.png";
  const identity = sessionDisplayName(session, directory);
  const role = sessionRoleLabel(session);

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <IntroSplash session={session} directory={directory} logoUrl={faviconLogoUrl} fallbackLogoUrl={logoUrl} />
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-white/10 bg-black text-white nphc-holo-surface">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <NavLink to="/" className="inline-flex items-center gap-3">
            <img
              src={logoUrl}
              alt="NPHC of Hudson County"
              className="h-9 w-auto brightness-0 invert"
              loading="eager"
            />
          </NavLink>
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/55">
            {councilName.includes("National") ? "National Pan-Hellenic Council" : councilName}
          </p>
          <p className="text-white text-sm mt-1">Hudson County, NJ</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-white/35 tracking-widest uppercase">
              Portal · {identity.name} — {role}
            </span>
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
              className={({ isActive }) =>
                `nphc-holo-btn flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 drop-shadow-[0_0_12px_rgba(24,224,208,0.10)] ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/25 drop-shadow-[0_0_14px_rgba(11,189,176,0.35)]"
                    : "text-white/75 hover:bg-white/10 hover:text-primary border border-transparent"
                }`
              }
            >
              <item.icon className="size-5" />
              <span className="truncate">{item.label}</span>
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
          <div className="flex items-center justify-between h-14">
            {/* Mobile: hamburger + title */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="nphc-holo-btn p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <NavLink to="/" className="flex items-center gap-2">
                <img src={logoUrl} alt="NPHC" className="h-7 w-auto" />
                <span className="text-sm tracking-wide">
                  NPHC <span className="text-primary">Hudson County</span>
                </span>
              </NavLink>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex" />

            {/* Desktop: portal label */}
            <div className="hidden lg:flex" />

            <div className="flex items-center gap-2">
              {session.authenticated ? (
                <span className="text-[11px] text-slate-600 truncate max-w-[40vw]">
                  {identity.name} — {role}
                </span>
              ) : null}
            </div>
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                          isActive
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
