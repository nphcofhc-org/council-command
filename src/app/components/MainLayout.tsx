import { Outlet, NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Home, Users, Calendar, TrendingUp, FolderOpen, Wallet, Shield, Menu, X, Target, ClipboardList, MessagesSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteConfig } from "../hooks/use-site-data";
import { useCouncilSession } from "../hooks/use-council-session";
import { useEditorMode } from "../hooks/use-editor-mode";

const baseNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chapter-information", label: "Chapter Info", icon: Users },
  { to: "/meetings-delegates", label: "Meetings & Delegates", icon: Calendar },
  { to: "/programs-events", label: "Programs & Events", icon: TrendingUp },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/treasury", label: "Treasury", icon: Wallet },
  { to: "/forms", label: "Forms", icon: ClipboardList },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
  { to: "/decision-portal", label: "Decision Portal", icon: Target },
];

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: config } = useSiteConfig();
  const { session } = useCouncilSession();
  const { editorMode, toggleEditorMode } = useEditorMode();

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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <nav className="nphc-holo-nav sticky top-0 z-50 border-b border-black/10 bg-white/60 text-slate-900 backdrop-blur-xl">
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
              <span className="text-sm tracking-wide">
                NPHC <span className="text-primary">Hudson County</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-4 text-sm transition-all duration-200 border-b-2 ${
                      isActive
                        ? "border-primary text-primary bg-white/5 drop-shadow-[0_0_12px_rgba(24,224,208,0.55)]"
                        : "border-transparent text-slate-600 hover:text-primary hover:bg-white/5 hover:drop-shadow-[0_0_12px_rgba(24,224,208,0.35)]"
                    }`
                  }
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Desktop: portal label */}
            <div className="hidden lg:flex items-center">
              {session.isSiteEditor ? (
                <button
                  type="button"
                  onClick={toggleEditorMode}
                  className="nphc-holo-btn rounded-full border border-black/15 bg-white/5 px-3 py-1 text-[11px] tracking-widest uppercase text-slate-600 hover:text-slate-900 hover:border-primary/60 transition-colors"
                >
                  {editorMode ? "Editor View" : "Member View"}
                </button>
              ) : (
                <span className="text-xs text-slate-400 tracking-widest uppercase">Internal Portal</span>
              )}
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
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/10 bg-white/55 py-8 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>{footerText}</p>
            <p className="text-slate-400">{footerSubtext}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
