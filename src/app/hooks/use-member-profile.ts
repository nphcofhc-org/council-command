import { useCallback, useEffect, useState } from "react";
import { fetchMyMemberProfile, saveMyMemberProfile, type MemberProfile } from "../data/member-profile-api";

type Result = {
  profile: MemberProfile;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refetch: () => void;
  save: (next: MemberProfile) => Promise<void>;
};

const EMPTY_PROFILE: MemberProfile = {
  firstName: "",
  lastName: "",
  organization: "",
  notifyConsent: false,
  notifyConsentAt: null,
  noticeVersion: "v1",
};

let cachedProfile: MemberProfile | null = null;
let inflight: Promise<MemberProfile> | null = null;

async function loadProfile(): Promise<MemberProfile> {
  if (cachedProfile) return cachedProfile;
  if (inflight) return inflight;
  inflight = fetchMyMemberProfile()
    .then((response) => {
      cachedProfile = response.data;
      return response.data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useMemberProfile(enabled: boolean): Result {
  const [profile, setProfile] = useState<MemberProfile>(cachedProfile || EMPTY_PROFILE);
  const [loading, setLoading] = useState(enabled && !cachedProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      setProfile(EMPTY_PROFILE);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    loadProfile()
      .then((result) => {
        if (cancelled) return;
        setProfile(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setProfile(EMPTY_PROFILE);
        setError(err instanceof Error ? err.message : "Failed to load member profile.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  const refetch = useCallback(() => {
    cachedProfile = null;
    inflight = null;
    setTick((v) => v + 1);
  }, []);

  const save = useCallback(
    async (next: MemberProfile) => {
      if (!enabled) return;
      setSaving(true);
      setError(null);
      try {
        const saved = await saveMyMemberProfile(next);
        cachedProfile = saved.data;
        setProfile(saved.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save member profile.");
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [enabled],
  );

  return { profile, loading, saving, error, refetch, save };
}
