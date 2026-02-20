import { useEffect, useState } from "react";
import { fetchCouncilSession, type CouncilSession } from "../data/admin-api";

type CouncilSessionResult = {
  session: CouncilSession;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const DEV_FALLBACK_SESSION: CouncilSession = {
  authenticated: true,
  email: "local-dev@nphc.local",
  isCouncilAdmin: true,
  isTreasuryAdmin: true,
  isSiteEditor: true,
  isPresident: true,
};

const DEFAULT_SESSION: CouncilSession = {
  authenticated: false,
  email: null,
  isCouncilAdmin: false,
  isTreasuryAdmin: false,
  isSiteEditor: false,
  isPresident: false,
};

let cachedSession: CouncilSession | null = null;
let inflight: Promise<CouncilSession> | null = null;

async function loadSession(): Promise<CouncilSession> {
  if (cachedSession) return cachedSession;
  if (inflight) return inflight;

  inflight = fetchCouncilSession()
    .then((session) => {
      cachedSession = session;
      return session;
    })
    .catch((error) => {
      if (import.meta.env.DEV) {
        cachedSession = DEV_FALLBACK_SESSION;
        return DEV_FALLBACK_SESSION;
      }
      throw error;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useCouncilSession(): CouncilSessionResult {
  const [session, setSession] = useState<CouncilSession>(cachedSession || DEFAULT_SESSION);
  const [loading, setLoading] = useState(!cachedSession);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadSession()
      .then((result) => {
        if (cancelled) return;
        setSession(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setSession(DEFAULT_SESSION);
        setError(err instanceof Error ? err.message : "Failed to load council session");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trigger]);

  const refetch = () => {
    cachedSession = null;
    inflight = null;
    setTrigger((prev) => prev + 1);
  };

  return { session, loading, error, refetch };
}
