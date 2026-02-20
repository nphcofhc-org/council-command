import type { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCouncilSession } from "../hooks/use-council-session";

type PresidentGateProps = {
  children: ReactNode;
};

export function PresidentGate({ children }: PresidentGateProps) {
  const { session, loading, error, refetch } = useCouncilSession();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-2xl items-center justify-center px-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validating president access...
        </div>
      </div>
    );
  }

  if (!session.isPresident) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert className="h-5 w-5" />
              President Access Required
            </CardTitle>
            <CardDescription className="text-red-700/80">
              This section is visible only to the council president.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

