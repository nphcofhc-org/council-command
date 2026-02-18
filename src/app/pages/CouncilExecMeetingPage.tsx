import { Link } from "react-router";
import { ArrowLeft, Presentation } from "lucide-react";
import { motion } from "motion/react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MeetingDeck } from "../components/MeetingDeck";

export function CouncilExecMeetingPage() {
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
              Back to Council Admin
            </Link>
          </Button>

          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
            <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Presentation className="size-6 text-primary" />
                  Executive Council Meeting Deck & Voting
                </CardTitle>
                <CardDescription>
                  Restricted in-portal workspace for meeting slides, floor motions, and live voting.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="overflow-hidden rounded-xl border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
          >
            <MeetingDeck />
          </motion.div>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}
