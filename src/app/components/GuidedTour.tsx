import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { CouncilSession } from "../data/admin-api";

type TourStep = {
  id: string;
  title: string;
  body: string;
  selector?: string; // CSS selector for spotlight target
  route?: string; // app route (without #)
};

function storageKey(email: string | null | undefined) {
  const safe = String(email || "anonymous").trim().toLowerCase();
  return `nphc-tour-complete:${safe}`;
}

function wasCompleted(email: string | null | undefined): boolean {
  try {
    return localStorage.getItem(storageKey(email)) === "true";
  } catch {
    return false;
  }
}

function markCompleted(email: string | null | undefined): void {
  try {
    localStorage.setItem(storageKey(email), "true");
  } catch {
    // ignore
  }
}

const SESSION_SHOWN_KEY = "nphc-tour-shown-session";
const INTRO_SESSION_SHOWN_KEY = "nphc-intro-shown";

function wasShownThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_SHOWN_KEY) === "true";
  } catch {
    return false;
  }
}

function markShownThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
  } catch {
    // ignore
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function GuidedTour({
  session,
  onNavigate,
  forceOpen,
  onForceOpenHandled,
}: {
  session: CouncilSession;
  onNavigate: (route: string) => void;
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
}) {
  const steps: TourStep[] = useMemo(
    () => [
      {
        id: "nav",
        title: "Navigation",
        body: "Use the left navigation to move between the portal sections. This is your home base.",
        selector: '[data-tour="nav"]',
        route: "/",
      },
      {
        id: "quick-links",
        title: "Quick Links",
        body: "These shortcuts jump you to key areas: the next meeting, calendar, minutes, and request forms.",
        selector: '[data-tour="quick-links"]',
        route: "/",
      },
      {
        id: "next-meeting",
        title: "Next General Body Meeting",
        body: "This callout stays updated and highlights the upcoming General Body meeting first.",
        selector: '[data-tour="next-general-callout"]',
        route: "/meetings-delegates?focus=next-general",
      },
      {
        id: "materials",
        title: "Meeting Materials",
        body: "Agendas and minutes live under Meetings & Delegates → Agendas & Minutes.",
        selector: '[data-tour="meeting-tabs"]',
        route: "/meetings-delegates?tab=records",
      },
      {
        id: "join-link",
        title: "Meeting Join Link",
        body: "When a join link is available, you can click straight into Google Meet.",
        selector: '[data-tour="join-next-general"]',
        route: "/meetings-delegates?focus=next-general",
      },
      {
        id: "forms-pane",
        title: "Forms Drawer",
        body: "Hover/tap the Forms rail to submit reimbursements, budgets, social media requests, and committee reports.",
        selector: '[data-tour="forms-rail"]',
        route: "/",
      },
      {
        id: "reimbursement",
        title: "Reimbursements",
        body: "Submit receipts and reimbursement requests here. You can track status under My Submissions.",
        selector: '[data-tour=\"forms-reimbursement\"]',
        route: "/forms/reimbursement",
      },
      {
        id: "social",
        title: "Social Media Intake",
        body: "Use the Social Media Intake form for flyers, captions, and announcements (48–72 hours in advance).",
        selector: '[data-tour=\"forms-social\"]',
        route: "/forms/social-media",
      },
      {
        id: "forum",
        title: "Forum Discussions",
        body: "Start a topic, ask questions, and keep decisions transparent with a structured discussion thread.",
        selector: '[data-tour="nav-forum"]',
        route: "/forum",
      },
      {
        id: "done",
        title: "Ok, you're ready to go!",
        body: "If you ever want to re-run this tour, use the Tour button in the sidebar header.",
        selector: undefined,
        route: "/",
      },
    ],
    [],
  );

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [missingTarget, setMissingTarget] = useState(false);
  const requestedRouteRef = useRef<string | null>(null);

  const email = session.email;

  useEffect(() => {
    if (!session.authenticated) return;
    if (wasCompleted(email)) return;
    if (wasShownThisSession()) return;

    // Avoid stacking on top of the intro welcome modal.
    const introAlreadyShown = (() => {
      try {
        return sessionStorage.getItem(INTRO_SESSION_SHOWN_KEY) === "true";
      } catch {
        return true;
      }
    })();

    if (introAlreadyShown) {
      setOpen(true);
      markShownThisSession();
      return;
    }

    const t = window.setTimeout(() => {
      setOpen(true);
      markShownThisSession();
    }, 900);
    return () => window.clearTimeout(t);
  }, [session.authenticated, email]);

  useEffect(() => {
    if (!forceOpen) return;
    setOpen(true);
    if (onForceOpenHandled) onForceOpenHandled();
  }, [forceOpen, onForceOpenHandled]);

  const step = steps[clamp(index, 0, steps.length - 1)];
  const progress = Math.round(((index + 1) / steps.length) * 100);

  useEffect(() => {
    if (!open) return;

    const desiredRoute = step.route || "/";
    if (requestedRouteRef.current !== desiredRoute) {
      requestedRouteRef.current = desiredRoute;
      onNavigate(desiredRoute);
    }

    const updateRect = () => {
      if (!step.selector) {
        setTargetRect(null);
        setMissingTarget(false);
        return;
      }
      const el = document.querySelector(step.selector);
      if (!el) {
        setTargetRect(null);
        setMissingTarget(true);
        return;
      }
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      setMissingTarget(false);
      (el as HTMLElement).scrollIntoView?.({ behavior: "smooth", block: "center" });
    };

    const t = window.setTimeout(updateRect, 180);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [open, index, step.selector, step.route, onNavigate]);

  const close = (complete: boolean) => {
    if (complete) markCompleted(email);
    setOpen(false);
  };

  const next = () => {
    if (index >= steps.length - 1) {
      close(true);
      return;
    }
    setIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  const back = () => setIndex((i) => Math.max(0, i - 1));

  const pad = 10;
  const spotlight = targetRect
    ? {
      top: Math.max(8, targetRect.top - pad),
      left: Math.max(8, targetRect.left - pad),
      width: Math.min(window.innerWidth - 16, targetRect.width + pad * 2),
      height: Math.min(window.innerHeight - 16, targetRect.height + pad * 2),
    }
    : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70]"
          role="dialog"
          aria-modal="true"
        >
          {/* Spotlight overlay (darken everything except target) */}
          {spotlight ? (
            <div
              className="absolute inset-0"
              aria-hidden="true"
            >
              <div
                className="absolute rounded-2xl"
                style={{
                  top: spotlight.top,
                  left: spotlight.left,
                  width: spotlight.width,
                  height: spotlight.height,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  backdropFilter: "blur(1px)",
                  pointerEvents: "none",
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
          )}

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <motion.div
              initial={{ y: 14, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-[92vw] max-w-xl"
            >
              <Card className="nphc-holo-surface rounded-3xl border border-white/15 bg-black/55 p-6 shadow-[0_40px_140px_rgba(0,0,0,0.45)] text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.28em] uppercase text-white/75">
                      Portal Tour • Step {index + 1} of {steps.length}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold leading-tight text-white">{step.title}</h2>
                  </div>
                  <button
                    type="button"
                    className="nphc-holo-btn rounded-xl border border-white/20 bg-white/10 p-2 text-white/80 hover:text-white hover:bg-white/15 transition"
                    onClick={() => close(false)}
                    aria-label="Close tour"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <p className="mt-4 text-sm text-white/80 leading-relaxed">{step.body}</p>
                {missingTarget ? (
                  <p className="mt-3 text-xs text-amber-200/90">
                    Note: this highlight isn’t visible on your current screen size/layout. Continue to the next step.
                  </p>
                ) : null}

                <div className="mt-5">
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-1.5 bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                      onClick={back}
                      disabled={index === 0}
                    >
                      <ChevronLeft className="size-4" />
                      Back
                    </Button>
                    <Button className="gap-2" onClick={next}>
                      {index === steps.length - 1 ? "Finish" : "Next"}
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs text-white/70 hover:text-white transition-colors"
                      onClick={() => close(false)}
                    >
                      Remind me later
                    </button>
                    <span className="text-white/25">|</span>
                    <button
                      type="button"
                      className="text-xs text-white/70 hover:text-white transition-colors"
                      onClick={() => close(true)}
                    >
                      Skip tour
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
