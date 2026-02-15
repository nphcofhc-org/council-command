import { useEffect, useState } from "react";
import { fetchMemberDirectory, type MemberDirectoryResponse } from "../data/admin-api";
import { DEFAULT_MEMBER_DIRECTORY } from "../data/member-directory";

type Result = {
  directory: MemberDirectoryResponse["data"];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

let cached: MemberDirectoryResponse | null = null;
let inflight: Promise<MemberDirectoryResponse> | null = null;

async function load(): Promise<MemberDirectoryResponse> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetchMemberDirectory()
    .then((r) => {
      cached = r;
      return r;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useMemberDirectory(): Result {
  const [directory, setDirectory] = useState(cached?.data || DEFAULT_MEMBER_DIRECTORY);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    load()
      .then((r) => {
        if (cancelled) return;
        setDirectory(r.data || DEFAULT_MEMBER_DIRECTORY);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setDirectory(DEFAULT_MEMBER_DIRECTORY);
        setError(e instanceof Error ? e.message : "Failed to load member directory");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refetch = () => {
    cached = null;
    inflight = null;
    setTick((v) => v + 1);
  };

  return { directory, loading, error, refetch };
}

