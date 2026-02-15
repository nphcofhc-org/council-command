import type { ReactNode } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useCouncilSession } from "../hooks/use-council-session";
import { useEditorMode } from "../hooks/use-editor-mode";

type CouncilAdminGateProps = {
  children: ReactNode;
};

export function CouncilAdminGate({ children }: CouncilAdminGateProps) {
  const { session, loading, error, refetch } = useCouncilSession();
  const { editorMode, setEditorMode } = useEditorMode();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-2xl items-center justify-center px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validating council admin access...
        </div>
      </div>
    );
  }

  if (!session.isSiteEditor) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
        <Card className="border-rose-400/30 bg-rose-500/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-200">
              <ShieldAlert className="h-5 w-5" />
              Site Editor Access Required
            </CardTitle>
            <CardDescription className="text-rose-200/80">
              Your account is not in the site editor allowlist for this section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700">
              If this is unexpected, confirm your Cloudflare Access login email and that it is listed in{" "}
              <code>SITE_ADMIN_EMAILS</code> (or legacy <code>SITE_EDITOR_EMAILS</code>).
            </p>
            {error ? (
              <p className="rounded-md border border-rose-400/30 bg-white/55 px-3 py-2 text-xs text-rose-200">
                Session check error: {error}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="border-black/15 bg-white/5 text-slate-900 hover:border-primary/60 hover:text-primary hover:bg-white/10"
              onClick={refetch}
            >
              Retry Access Check
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!editorMode) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
        <Card className="shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-slate-900">Editor Mode Is Off</CardTitle>
            <CardDescription>
              You are signed in as an admin, but you are currently viewing the portal as a regular member.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700">
              Turn on Editor Mode to access Council Admin tools (compliance tracking, content updates).
            </p>
            <Button type="button" onClick={() => setEditorMode(true)}>
              Enable Editor Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
