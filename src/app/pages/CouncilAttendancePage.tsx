import { Link } from "react-router";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { motion } from "motion/react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MeetingRollCallManager } from "../components/MeetingRollCallManager";
import { useCouncilCalendarSchedule } from "../hooks/use-council-calendar";

export function CouncilAttendancePage() {
  const { meetings } = useCouncilCalendarSchedule("/2026-council-calendar.html");

  const meetingOptions = meetings
    .slice()
    .sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0))
    .map((m) => ({
      meetingKey: `${m.kind}-${m.dateISO}`,
      meetingKind: m.kind as "general" | "exec",
      meetingLabel: m.label,
      dateISO: m.dateISO,
    }));

  return (
    <CouncilLeaderGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-4">
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
                  <ClipboardCheck className="size-6 text-primary" />
                  Roll Call & Attendance Reports
                </CardTitle>
                <CardDescription>
                  Includes FY 2024 and FY 2025 historical attendance, plus current-year General Body and Executive Council tracking.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08, duration: 0.35 }}>
            <MeetingRollCallManager meetingOptions={meetingOptions} />
          </motion.div>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}

