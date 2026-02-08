/**
 * =============================================================================
 * NPHC Hudson County — Data Hooks
 * =============================================================================
 *
 * React hooks that page components use to access data. Each hook wraps
 * an api.ts fetch call and handles loading / error states.
 *
 * USAGE IN A PAGE COMPONENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *   const { data, loading, error } = useHomePageData();
 *   if (loading) return <LoadingSkeleton />;
 *   if (error)   return <ErrorBanner message={error} />;
 *   // Use data.config, data.quickLinks, data.updates...
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import {
  fetchHomePageData,
  fetchChapterInfoData,
  fetchMeetingsData,
  fetchProgramsData,
  fetchResourcesData,
  fetchCouncilAdminData,
  fetchSiteConfig,
} from "../data/api";
import type {
  HomePageData,
  ChapterInfoPageData,
  MeetingsPageData,
  ProgramsPageData,
  ResourcesPageData,
  CouncilAdminPageData,
  SiteConfig,
} from "../data/types";

// ── Generic async data hook ─────────────────────────────────────────────────

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useAsyncData<T>(fetcher: () => Promise<T>): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => setTrigger((t) => t + 1);

  return { data, loading, error, refetch };
}

// ── Page-specific hooks ─────────────────────────────────────────────────────

export function useHomePageData(): UseDataResult<HomePageData> {
  return useAsyncData(fetchHomePageData);
}

export function useChapterInfoData(): UseDataResult<ChapterInfoPageData> {
  return useAsyncData(fetchChapterInfoData);
}

export function useMeetingsData(): UseDataResult<MeetingsPageData> {
  return useAsyncData(fetchMeetingsData);
}

export function useProgramsData(): UseDataResult<ProgramsPageData> {
  return useAsyncData(fetchProgramsData);
}

export function useResourcesData(): UseDataResult<ResourcesPageData> {
  return useAsyncData(fetchResourcesData);
}

export function useCouncilAdminData(): UseDataResult<CouncilAdminPageData> {
  return useAsyncData(fetchCouncilAdminData);
}

export function useSiteConfig(): UseDataResult<SiteConfig> {
  return useAsyncData(fetchSiteConfig);
}
