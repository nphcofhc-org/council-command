import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { CouncilSession } from "../data/admin-api";
import type { MemberDirectory } from "../data/member-directory";
import { sessionDisplayName, sessionRoleLabel } from "../utils/user-display";

const STORAGE_HIDE_KEY = "nphc-hide-intro";
const SESSION_SHOWN_KEY = "nphc-intro-shown";

function shouldHidePermanently(): boolean {
  try {
    return localStorage.getItem(STORAGE_HIDE_KEY) === "true";
  } catch {
    return false;
  }
}

function markHidePermanently(value: boolean) {
  try {
    localStorage.setItem(STORAGE_HIDE_KEY, value ? "true" : "false");
  } catch {
    // ignore
  }
}

function wasShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";
  } catch {
    return false;
  }
}

function markShownThisSession() {
  try {
    sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
  } catch {
    // ignore
  }
}

export function IntroSplash({
  session,
  directory,
  logoUrl,
}: {
  session: CouncilSession;
  directory: MemberDirectory | null;
  logoUrl: string;
}) {
  const [open, setOpen] = useState(false);

  const display = useMemo(() => sessionDisplayName(session, directory), [session, directory]);
  const role = useMemo(() => sessionRoleLabel(session), [session]);

  useEffect(() => {
    if (!session.authenticated) return;
    if (shouldHidePermanently()) return;
    if (wasShownThisSession()) return;
    setOpen(true);
  }, [session.authenticated]);

  const greetingLine = display.designation
    ? `Hello, ${display.designation}`
    : `Hello, ${display.name}`;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ y: 14, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="nphc-glass w-[92vw] max-w-xl rounded-3xl border border-white/20 bg-white/20 p-7 shadow-[0_40px_140px_rgba(0,0,0,0.35)] text-slate-900"
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -6, scale: 0.96, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="rounded-2xl border border-white/25 bg-white/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
              >
                <img src={logoUrl} alt="NPHC" className="h-10 w-auto" />
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.28em] uppercase text-white/80">NPHC Portal</p>
                <h2 className="text-2xl font-semibold leading-tight text-white">{greetingLine}</h2>
                <p className="mt-1 text-sm text-white/75">
                  {display.name} — {role}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  className="accent-primary"
                  onChange={(e) => markHidePermanently(e.target.checked)}
                  defaultChecked={shouldHidePermanently()}
                />
                Don&apos;t show again
              </label>

              <button
                type="button"
                className="nphc-holo-btn rounded-xl border border-white/25 bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition"
                onClick={() => {
                  markShownThisSession();
                  setOpen(false);
                }}
              >
                Enter Portal
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

