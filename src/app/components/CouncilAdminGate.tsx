import type { ReactNode } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useCouncilSession } from "../hooks/use-council-session";

type CouncilAdminGateProps = {
  children: ReactNode;
};

export function CouncilAdminGate({ children }: CouncilAdminGateProps) {
  const { session, loading, error, refetch } = useCouncilSession();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-2xl items-center justify-center px-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validating council admin access...
        </div>
      </div>
    );
  }

  if (!session.isCouncilAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              Council Admin Access Required
            </CardTitle>
            <CardDescription className="text-red-700/80">
              Your account is not in the council admin allowlist for this section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              If this is unexpected, confirm your Cloudflare Access login email and that it is listed in{" "}
              <code>COUNCIL_ADMIN_EMAILS</code>.
            </p>
            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                Session check error: {error}
              </p>
            ) : null}
            <Button type="button" variant="outline" onClick={refetch}>
              Retry Access Check
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
