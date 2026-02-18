import { Link } from "react-router";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { motion } from "motion/react";
import { CouncilLeaderGate } from "../components/CouncilLeaderGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const REPO_URL = "https://github.com/vault54nyc-spec/219execcouncilmeetingn";
const LOCAL_PATH = "/Users/sirchristopherdemarkus/NPHC/219execcouncilmeetingn";

export function CouncilExecMeetingPage() {
  return (
    <CouncilLeaderGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-4">
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
                  <Github className="size-6 text-primary" />
                  Exec Council Meeting Workspace
                </CardTitle>
                <CardDescription>
                  Restricted workspace entry for the February 19 Executive Council meeting materials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">GitHub Repository</p>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {REPO_URL}
                  </a>
                </div>

                <div className="rounded-lg border border-black/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Local Clone Path</p>
                  <p className="text-sm text-slate-700 break-all">{LOCAL_PATH}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <a href={REPO_URL} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 size-4" />
                      Open Repository
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </CouncilLeaderGate>
  );
}

