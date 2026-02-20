import { Link } from "react-router";
import { ArrowLeft, Presentation } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MeetingDeck } from "../components/MeetingDeck";
import { useCouncilSession } from "../hooks/use-council-session";

export function MeetingDeckPage() {
  const { session } = useCouncilSession();
  const defaultMemberName = (session.email || "")
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="relative min-h-screen p-2 sm:p-4">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <Button
          asChild
          variant="outline"
          className="gap-2 border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
        >
          <Link to="/meetings-delegates">
            <ArrowLeft className="size-4" />
            Back to Meetings
          </Link>
        </Button>

        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Presentation className="size-6 text-primary" />
                Meeting Deck (Member View)
              </CardTitle>
              <CardDescription>
                View-only access for members. Voting and meeting controls are available to council leadership only.
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
          <MeetingDeck voterEmail={session.email} defaultMemberName={defaultMemberName} canControl={false} />
        </motion.div>
      </div>
    </div>
  );
}
