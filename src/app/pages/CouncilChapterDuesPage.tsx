import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Link } from "react-router";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { ChapterDuesTrackerPanel } from "../components/ChapterDuesTrackerPanel";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useCouncilSession } from "../hooks/use-council-session";

export function CouncilChapterDuesPage() {
  const { session } = useCouncilSession();

  return (
    <CouncilLeaderGate>
      <div className="mx-auto max-w-5xl p-4 sm:p-8 space-y-4">
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

        {!session.isTreasuryAdmin ? (
          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldAlert className="size-5 text-primary" />
                Treasury Access Required
              </CardTitle>
              <CardDescription>
                Chapter dues tracking is restricted to Treasury leadership roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Treasurer, Financial Secretary, and President accounts can open and update this tracker.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ChapterDuesTrackerPanel description="Track the date each chapter paid dues. Treasury leadership can update this record directly." />
        )}
      </div>
    </CouncilLeaderGate>
  );
}
