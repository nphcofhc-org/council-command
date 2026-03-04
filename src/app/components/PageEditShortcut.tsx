import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronUp, MessageCircle, PencilLine, Shield, SquarePen, ToggleLeft, ToggleRight } from "lucide-react";
import type { CouncilSession } from "../data/admin-api";

type Props = {
  session: CouncilSession;
  editorMode: boolean;
  onToggleEditorMode: () => void;
  helpHref?: string;
};

type EditTarget = {
  match: (path: string) => boolean;
  to: string;
  label: string;
};

const EDIT_TARGETS: EditTarget[] = [
  { match: (p) => p === "/", to: "/council-admin/content/home", label: "Edit Home" },
  { match: (p) => p === "/chapter-information", to: "/council-admin/content", label: "Edit Officers" },
  { match: (p) => p === "/meetings-delegates", to: "/council-admin/content/meetings", label: "Edit Meetings" },
  { match: (p) => p === "/programs-events", to: "/council-admin/content/programs", label: "Edit Programs" },
  { match: (p) => p === "/resources", to: "/council-admin/content/resources", label: "Edit Resources" },
  { match: (p) => p === "/decision-portal", to: "/council-admin/content/decision-portal", label: "Edit Decision Portal" },
  { match: (p) => p.startsWith("/forms"), to: "/council-admin/submissions", label: "Review Forms" },
  { match: (p) => p === "/forum" || p.startsWith("/forum/"), to: "/council-admin/submissions", label: "Review Activity" },
];

export function PageEditShortcut({ session, editorMode, onToggleEditorMode, helpHref }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileHidden, setMobileHidden] = useState(false);

  const target = useMemo(
    () => EDIT_TARGETS.find((item) => item.match(location.pathname || "/")) || null,
    [location.pathname],
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("nphc_mobile_editor_shortcut_hidden");
      setMobileHidden(stored === "1");
    } catch {
      // Ignore storage errors (private mode / browser restrictions).
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("nphc_mobile_editor_shortcut_hidden", mobileHidden ? "1" : "0");
    } catch {
      // Ignore storage errors (private mode / browser restrictions).
    }
  }, [mobileHidden]);

  if (!session.isSiteEditor && !session.isPresident) return null;

  return (
    <>
      <div className={`fixed bottom-3 left-3 right-[6.5rem] z-[72] sm:bottom-4 sm:left-4 sm:right-auto ${mobileHidden ? "hidden sm:block" : ""}`}>
        <div className="nphc-holo-surface rounded-2xl border border-black/10 bg-white/80 p-2 shadow-[0_16px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {session.isSiteEditor ? (
              <>
                <button
                  type="button"
                  onClick={onToggleEditorMode}
                  className="nphc-holo-btn inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/60 px-2.5 py-2 text-[11px] font-semibold text-slate-900 hover:border-primary/50 hover:text-primary transition sm:w-auto sm:justify-start sm:px-3 sm:text-xs"
                >
                  {editorMode ? <ToggleRight className="size-4 text-primary" /> : <ToggleLeft className="size-4 text-slate-500" />}
                  {editorMode ? "Editor On" : "Editor Off"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editorMode) onToggleEditorMode();
                    if (target) navigate(target.to);
                  }}
                  disabled={!target}
                  className="nphc-holo-btn inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/60 px-2.5 py-2 text-[11px] font-semibold text-slate-900 hover:border-primary/50 hover:text-primary disabled:opacity-45 disabled:cursor-not-allowed transition sm:w-auto sm:justify-start sm:px-3 sm:text-xs"
                >
                  {target ? <SquarePen className="size-4" /> : <PencilLine className="size-4" />}
                  {target ? target.label : "No editor for this page"}
                </button>
              </>
            ) : null}
            {session.isPresident ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/council-admin/site-maintenance")}
                  className="nphc-holo-btn inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/60 px-2.5 py-2 text-[11px] font-semibold text-slate-900 hover:border-primary/50 hover:text-primary transition sm:w-auto sm:justify-start sm:px-3 sm:text-xs"
                  title="Open The President's Desk"
                >
                  <Shield className="size-4" />
                  President&apos;s Desk
                </button>
                {helpHref ? (
                  <a
                    href={helpHref}
                    className="nphc-holo-btn inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/60 px-2.5 py-2 text-[11px] font-semibold text-slate-900 hover:border-primary/50 hover:text-primary transition sm:w-auto sm:justify-start sm:px-3 sm:text-xs"
                    aria-label="Contact portal help"
                  >
                    <MessageCircle className="size-4" />
                    Help
                  </a>
                ) : null}
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setMobileHidden(true)}
              className="nphc-holo-btn inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/60 px-2.5 py-2 text-[11px] font-semibold text-slate-900 hover:border-primary/50 hover:text-primary transition sm:hidden"
            >
              Hide
            </button>
          </div>
        </div>
      </div>
      {mobileHidden ? (
        <button
          type="button"
          onClick={() => setMobileHidden(false)}
          className="nphc-holo-btn fixed bottom-3 left-3 z-[72] inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/85 px-3 py-2 text-xs font-semibold text-slate-900 shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:hidden"
          aria-label="Show editor controls"
          title="Show editor controls"
        >
          <ChevronUp className="size-4" />
          Editor
        </button>
      ) : null}
    </>
  );
}
