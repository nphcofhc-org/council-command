import { Outlet, NavLink, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Home, Users, Calendar, TrendingUp, FolderOpen, Shield, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSiteConfig } from "../hooks/use-site-data";
import { useCouncilSession } from "../hooks/use-council-session";

const baseNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chapter-information", label: "Chapter Info", icon: Users },
  { to: "/meetings-delegates", label: "Meetings & Delegates", icon: Calendar },
  { to: "/programs-events", label: "Programs & Events", icon: TrendingUp },
  { to: "/resources", label: "Resources", icon: FolderOpen },
];

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { data: config } = useSiteConfig();
  const { session } = useCouncilSession();

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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Mobile: hamburger + title */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <span className="text-sm tracking-wide">NPHC Hudson County</span>
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
                        ? "border-white text-white bg-white/10"
                        : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
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
              <span className="text-xs text-white/40 tracking-widest uppercase">Internal Portal</span>
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
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-14 left-0 bottom-0 w-72 bg-black z-40 lg:hidden overflow-y-auto"
            >
              <div className="py-4">
                <div className="px-6 pb-4 mb-2 border-b border-white/10">
                  <p className="text-white/40 text-xs tracking-widest uppercase">
                    {councilName.includes("National") ? "National Pan-Hellenic Council" : councilName}
                  </p>
                  <p className="text-white text-sm mt-1">Hudson County, NJ</p>
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
                              ? "bg-white/15 text-white"
                              : "text-white/60 hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <item.icon className="size-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 mt-8 pt-4 border-t border-white/10">
                  <p className="text-white/30 text-xs">Internal Use Only</p>
                  <p className="text-white/20 text-xs mt-1">&copy; 2026 NPHC of Hudson County</p>
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
      <footer className="bg-black text-white/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>{footerText}</p>
            <p className="text-white/30">{footerSubtext}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
