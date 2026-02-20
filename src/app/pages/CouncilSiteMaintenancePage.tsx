import { Link } from "react-router";
import { ArrowLeft, Database, SlidersHorizontal, Shield, Wrench } from "lucide-react";
import { PresidentGate } from "../components/PresidentGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function CouncilSiteMaintenancePage() {
  return (
    <PresidentGate>
      <div className="relative min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-4">
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

          <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Wrench className="size-6 text-primary" />
                Site Maintenance
              </CardTitle>
              <CardDescription>
                President-only controls for core portal maintenance and sensitive configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Card className="border-black/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <SlidersHorizontal className="size-4" />
                    Content Management
                  </CardTitle>
                  <CardDescription>Manage site content, officers, meetings, resources, and decision portal modules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/council-admin/content">Open Content Manager</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-black/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="size-4" />
                    Submissions & Data
                  </CardTitle>
                  <CardDescription>Review form pipelines and submission records from members.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/council-admin/submissions">Open Submission Review</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-black/10 bg-white/5 sm:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="size-4" />
                    Access Governance
                  </CardTitle>
                  <CardDescription>
                    Council Command Center access is officer-based. Treasury access is restricted to President, Treasurer, and Financial Secretary.
                  </CardDescription>
                </CardHeader>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </PresidentGate>
  );
}

