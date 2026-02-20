import { Link, useLocation } from "react-router";
import { ArrowLeft, Presentation } from "lucide-react";
import { motion } from "motion/react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
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
      <div className="relative min-h-screen p-2 sm:p-4">
        <div className="mx-auto max-w-[1500px] space-y-3">
          <Button
            asChild
            variant="outline"
            className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
          >
            <Link to="/council-admin">
              <ArrowLeft className="size-4" />
              Back to Council Command Center
            </Link>
          </Button>

          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Presentation className="size-6 text-primary" />
                  {deckTitle}
                </CardTitle>
                <CardDescription>
                  {deckDescription}
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild size="sm" variant={isArchiveDeck ? "outline" : "default"}>
                    <Link to="/council-admin/exec-council-meeting?deck=2026-02-23">Open 2/23 Deck</Link>
                  </Button>
                  <Button asChild size="sm" variant={isArchiveDeck ? "default" : "outline"}>
                    <Link to="/council-admin/exec-council-meeting?deck=2026-02-19">Open 2/19 Copy</Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="overflow-hidden rounded-xl border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
          >
            <MeetingDeck
              voterEmail={session.email}
              defaultMemberName={defaultMemberName}
              canControl
              meetingDateLabel={meetingDateLabel}
            />
          </motion.div>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}
