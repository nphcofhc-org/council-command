import { Link, useLocation } from "react-router";
import { ArrowLeft, Presentation } from "lucide-react";
import { motion } from "motion/react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Button } from "../components/ui/button";
import { MeetingDeck } from "../components/MeetingDeck";
import { useCouncilSession } from "../hooks/use-council-session";

export function CouncilExecMeetingPage() {
  const { session } = useCouncilSession();
  const location = useLocation();
  const deckParam = new URLSearchParams(location.search || "").get("deck") || "";
  const isArchiveDeck = deckParam === "2026-02-19";
  const meetingDateLabel = isArchiveDeck ? "February 19, 2026" : "February 23, 2026";
  const deckTitle = isArchiveDeck ? "Executive Council Meeting Deck — 2/19 Archive Copy" : "Executive Council Meeting Deck — 2/23 Session";
  const deckDescription = isArchiveDeck
    ? "Archived copy of the 2/19 deck for retrieval and review."
    : "Current 2/23 meeting deck leveraging the 2/19 content baseline.";
  const defaultMemberName = (session.email || "")
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <CouncilLeaderGate>
      <div className="relative min-h-screen bg-slate-100">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="absolute left-2 top-2 z-50 flex max-w-[calc(100vw-1rem)] flex-wrap items-center gap-2"
        >
          <Button asChild size="sm" variant="outline" className="gap-2 border-black/15 bg-white/90 text-slate-900 backdrop-blur">
            <Link to="/council-admin">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div className="rounded-lg border border-black/10 bg-white/90 px-3 py-1.5 text-xs text-slate-700 backdrop-blur">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Presentation className="size-3.5 text-primary" />
              {deckTitle}
            </div>
            <div className="text-[11px] text-slate-500">{deckDescription}</div>
          </div>
          <Button asChild size="sm" variant={isArchiveDeck ? "outline" : "default"}>
            <Link to="/council-admin/exec-council-meeting?deck=2026-02-23">2/23 Deck</Link>
          </Button>
          <Button asChild size="sm" variant={isArchiveDeck ? "default" : "outline"}>
            <Link to="/council-admin/exec-council-meeting?deck=2026-02-19">2/19 Copy</Link>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05, duration: 0.25 }} className="h-screen w-full overflow-hidden">
          <MeetingDeck
            voterEmail={session.email}
            defaultMemberName={defaultMemberName}
            canParticipate
            canModerate
            canNavigate
            meetingDateLabel={meetingDateLabel}
            fullViewport
            forceSidebarOpen
          />
        </motion.div>
      </div>
    </CouncilLeaderGate>
  );
}
