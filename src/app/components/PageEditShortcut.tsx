import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { PencilLine, Shield, SquarePen, ToggleLeft, ToggleRight } from "lucide-react";
import type { CouncilSession } from "../data/admin-api";

type Props = {
  session: CouncilSession;
  editorMode: boolean;
  onToggleEditorMode: () => void;
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

export function PageEditShortcut({ session, editorMode, onToggleEditorMode }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const target = useMemo(
    () => EDIT_TARGETS.find((item) => item.match(location.pathname || "/")) || null,
    [location.pathname],
  );

  if (!session.isSiteEditor && !session.isPresident) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[72]">
      <div className="nphc-holo-surface rounded-2xl border border-black/10 bg-white/80 p-2 shadow-[0_16px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {session.isSiteEditor ? (
            <>
              <button
                type="button"
                onClick={onToggleEditorMode}
                className="nphc-holo-btn inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-900 hover:border-primary/50 hover:text-primary transition"
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
                className="nphc-holo-btn inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-900 hover:border-primary/50 hover:text-primary disabled:opacity-45 disabled:cursor-not-allowed transition"
              >
                {target ? <SquarePen className="size-4" /> : <PencilLine className="size-4" />}
                {target ? target.label : "No editor for this page"}
              </button>
            </>
          ) : null}
          {session.isPresident ? (
            <button
              type="button"
              onClick={() => navigate("/council-admin/site-maintenance")}
              className="nphc-holo-btn inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-900 hover:border-primary/50 hover:text-primary transition"
              title="Open The President's Desk"
            >
              <Shield className="size-4" />
              President&apos;s Desk
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
