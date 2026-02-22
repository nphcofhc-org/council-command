/**
 * =============================================================================
 * NPHC Hudson County — Data API Service
 * =============================================================================
 *
 * This is the single data-fetching layer for the entire site. Every page
 * calls these functions to get its data. Right now they return static data.
 * When you connect Google Sheets, flip DATA_SOURCE in config.ts to
 * "google-sheets" and these functions will fetch live data instead.
 *
 * ARCHITECTURE:
 * ─────────────────────────────────────────────────────────────────────────────
 *   Page Component  →  useSiteData() hook  →  api.ts  →  static-data.ts
 *                                                    OR →  Google Sheets API
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ADDING A NEW DATA SOURCE:
 * ─────────────────────────────────────────────────────────────────────────────
 *   1. Add a new case in fetchSheetTab() for your source
 *   2. Or replace the Google Sheets fetch with any REST API
 *   3. The return types stay the same — components don't change at all
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { DATA_SOURCE, APPS_SCRIPT_URL, SHEET_TABS, CACHE_TTL_MS } from "./config";
import * as staticData from "./generated-data";
import {
  fetchMeetingsOverride,
  fetchProgramsOverride,
  fetchQuickLinksOverride,
  fetchResourcesOverride,
  fetchSiteConfigOverride,
  fetchUpdatesOverride,
} from "./content-api";
import type {
  HomePageData,
  ChapterInfoPageData,
  MeetingsPageData,
  ProgramsPageData,
  ResourcesPageData,
  CouncilAdminPageData,
  SiteConfig,
} from "./types";

// ── Simple in-memory cache ──────────────────────────────────────────────────

const cache: Record<string, { data: unknown; timestamp: number }> = {};

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    delete cache[key];
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache[key] = { data, timestamp: Date.now() };
}

// ── Core fetch function for Google Sheets ───────────────────────────────────

async function fetchSheetTab<T>(tabName: string): Promise<T[]> {
  const cacheKey = `sheet:${tabName}`;
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${APPS_SCRIPT_URL}?tab=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch tab "${tabName}": ${response.status}`);
    const data = await response.json();
    setCache(cacheKey, data);
    return data as T[];
  } catch (error) {
    console.error(`[NPHC API] Error fetching "${tabName}":`, error);
    throw error;
  }
}

// ── Page-level data fetchers ────────────────────────────────────────────────

/**
 * Fetch all data needed for the HomePage.
 * The banner image is handled separately via a local asset import in HomePage.
 */
export async function fetchHomePageData(): Promise<HomePageData> {
  if (DATA_SOURCE === "static") {
    const base: HomePageData = {
      config: staticData.siteConfig,
      quickLinks: staticData.quickLinks,
      updates: staticData.updates,
    };

    const mergeConfig = (override: Partial<HomePageData["config"]> | null | undefined): HomePageData["config"] => {
      if (!override) return base.config;
      const merged = { ...base.config, ...override } as HomePageData["config"];

      const preferNonEmptyString = (overrideValue: unknown, baseValue: string): string => {
        const s = String(overrideValue ?? "").trim();
        return s ? s : String(baseValue || "").trim();
      };

      // Preserve critical string defaults when overrides omit or accidentally clear them.
      merged.instagramHandle = preferNonEmptyString(override.instagramHandle, base.config.instagramHandle);
      merged.bannerImageUrl = preferNonEmptyString(override.bannerImageUrl, base.config.bannerImageUrl);
      merged.presidentImageUrl = preferNonEmptyString(override.presidentImageUrl, base.config.presidentImageUrl);

      // Preserve base defaults when overrides omit or clear arrays.
      if (Array.isArray(override.presidentMessage) && override.presidentMessage.length > 0) {
        merged.presidentMessage = override.presidentMessage;
      } else {
        merged.presidentMessage = base.config.presidentMessage;
      }
      if (Array.isArray(override.instagramPostUrls) && override.instagramPostUrls.length > 0) {
        merged.instagramPostUrls = override.instagramPostUrls;
      } else {
        merged.instagramPostUrls = base.config.instagramPostUrls;
      }
      return merged;
    };

    // Runtime overrides (D1-backed). If unavailable, keep static fallbacks.
    try {
      const [configOverride, linksOverride, updatesOverride] = await Promise.all([
        fetchSiteConfigOverride().catch(() => null),
        fetchQuickLinksOverride().catch(() => null),
        fetchUpdatesOverride().catch(() => null),
      ]);

      return {
        config: configOverride?.found && configOverride.data ? mergeConfig(configOverride.data as HomePageData["config"]) : base.config,
        quickLinks: linksOverride?.found ? (linksOverride.data as HomePageData["quickLinks"]) : base.quickLinks,
        updates: updatesOverride?.found ? (updatesOverride.data as HomePageData["updates"]) : base.updates,
      };
    } catch {
      return base;
    }
  }

  // Google Sheets: fetch each tab in parallel
  const [configRows, quickLinks, updates] = await Promise.all([
    fetchSheetTab(SHEET_TABS.siteConfig),
    fetchSheetTab(SHEET_TABS.quickLinks),
    fetchSheetTab(SHEET_TABS.updates),
  ]);

  // SiteConfig is a single-row key-value sheet — transform it
  const config = transformSiteConfig(configRows as Record<string, string>[]);

  return {
    config,
    quickLinks: quickLinks as HomePageData["quickLinks"],
    updates: updates as HomePageData["updates"],
  };
}

export async function fetchChapterInfoData(): Promise<ChapterInfoPageData> {
  if (DATA_SOURCE === "static") {
    return {
      officers: staticData.officers,
      delegates: staticData.delegates,
      governingDocuments: staticData.governingDocuments,
    };
  }

  const [officers, delegates, governingDocuments] = await Promise.all([
    fetchSheetTab(SHEET_TABS.officers),
    fetchSheetTab(SHEET_TABS.delegates),
    fetchSheetTab(SHEET_TABS.governingDocs),
  ]);

  return {
    officers: officers as ChapterInfoPageData["officers"],
    delegates: delegates as ChapterInfoPageData["delegates"],
    governingDocuments: governingDocuments as ChapterInfoPageData["governingDocuments"],
  };
}

export async function fetchMeetingsData(): Promise<MeetingsPageData> {
  if (DATA_SOURCE === "static") {
    const base: MeetingsPageData = {
      upcomingMeetings: staticData.upcomingMeetings,
      meetingRecords: staticData.meetingRecords,
      delegateReports: staticData.delegateReports,
    };

    try {
      const override = await fetchMeetingsOverride();
      if (override.found && override.data) return override.data as MeetingsPageData;
    } catch {
      // ignore
    }
    return base;
  }

  const [upcomingMeetings, meetingRecords, delegateReports] = await Promise.all([
    fetchSheetTab(SHEET_TABS.upcomingMeetings),
    fetchSheetTab(SHEET_TABS.meetingRecords),
    fetchSheetTab(SHEET_TABS.delegateReports),
  ]);

  return {
    upcomingMeetings: upcomingMeetings as MeetingsPageData["upcomingMeetings"],
    meetingRecords: meetingRecords as MeetingsPageData["meetingRecords"],
    delegateReports: delegateReports as MeetingsPageData["delegateReports"],
  };
}

export async function fetchProgramsData(): Promise<ProgramsPageData> {
  if (DATA_SOURCE === "static") {
    const base: ProgramsPageData = {
      upcomingEvents: staticData.upcomingEvents,
      archivedEvents: staticData.archivedEvents,
      eventHighlights: staticData.eventHighlights,
      eventFlyers: staticData.eventFlyers,
      signupForms: staticData.signupForms,
    };

    try {
      const override = await fetchProgramsOverride();
      if (override.found && override.data) {
        const payload = override.data as Partial<ProgramsPageData>;
        return {
          ...base,
          ...payload,
          eventHighlights: Array.isArray(payload.eventHighlights) ? payload.eventHighlights : base.eventHighlights,
        } as ProgramsPageData;
      }
    } catch {
      // ignore
    }
    return base;
  }

  const [upcomingEvents, archivedEvents, eventFlyers, signupForms] = await Promise.all([
    fetchSheetTab(SHEET_TABS.events),
    fetchSheetTab(SHEET_TABS.eventArchive),
    fetchSheetTab(SHEET_TABS.eventFlyers),
    fetchSheetTab(SHEET_TABS.signupForms),
  ]);

  return {
    upcomingEvents: upcomingEvents as ProgramsPageData["upcomingEvents"],
    archivedEvents: archivedEvents as ProgramsPageData["archivedEvents"],
    eventHighlights: [],
    eventFlyers: eventFlyers as ProgramsPageData["eventFlyers"],
    signupForms: signupForms as ProgramsPageData["signupForms"],
  };
}

export async function fetchResourcesData(): Promise<ResourcesPageData> {
  if (DATA_SOURCE === "static") {
    const base: ResourcesPageData = {
      sharedForms: staticData.sharedForms,
      nationalOrgs: staticData.nationalOrgs,
      trainingResources: staticData.trainingResources,
    };

    try {
      const override = await fetchResourcesOverride();
      if (override.found && override.data) return override.data as ResourcesPageData;
    } catch {
      // ignore
    }
    return base;
  }

  const [sharedFormsRaw, nationalOrgs, trainingResources] = await Promise.all([
    fetchSheetTab(SHEET_TABS.sharedForms),
    fetchSheetTab(SHEET_TABS.nationalOrgs),
    fetchSheetTab(SHEET_TABS.trainingResources),
  ]);

  // SharedForms come as flat rows from Sheets — group by category
  const sharedForms = groupFormsByCategory(sharedFormsRaw as Record<string, string>[]);

  return {
    sharedForms,
    nationalOrgs: nationalOrgs as ResourcesPageData["nationalOrgs"],
    trainingResources: trainingResources as ResourcesPageData["trainingResources"],
  };
}

export async function fetchCouncilAdminData(): Promise<CouncilAdminPageData> {
  if (DATA_SOURCE === "static") {
    return {
      internalDocuments: staticData.internalDocuments,
      tasks: staticData.tasks,
    };
  }

  const [internalDocsRaw, tasks] = await Promise.all([
    fetchSheetTab(SHEET_TABS.internalDocs),
    fetchSheetTab(SHEET_TABS.tasks),
  ]);

  // InternalDocs come as flat rows — group by category
  const internalDocuments = groupDocsByCategory(internalDocsRaw as Record<string, string>[]);

  return {
    internalDocuments,
    tasks: tasks as CouncilAdminPageData["tasks"],
  };
}

/**
 * Fetch just the site config (used by MainLayout for nav / footer).
 */
export async function fetchSiteConfig(): Promise<SiteConfig> {
  if (DATA_SOURCE === "static") {
    // Same override behavior as HomePage: prefer runtime override if present.
    try {
      const override = await fetchSiteConfigOverride();
      if (override.found && override.data) return override.data as SiteConfig;
    } catch {
      // ignore
    }
    return staticData.siteConfig;
  }

  const configRows = await fetchSheetTab(SHEET_TABS.siteConfig);
  return transformSiteConfig(configRows as Record<string, string>[]);
}

// ── Transform helpers (Google Sheets → typed data) ──────────────────────────

/**
 * SiteConfig in Sheets is stored as key-value rows:
 *   | key                | value                              |
 *   | councilName        | National Pan-Hellenic Council...   |
 *   | presidentMessage_1 | First paragraph...                 |
 *   | presidentMessage_2 | Second paragraph...                |
 */
function transformSiteConfig(rows: Record<string, string>[]): SiteConfig {
  const kv: Record<string, string> = {};
  for (const row of rows) {
    kv[row.key] = row.value;
  }

  // Collect presidentMessage paragraphs (presidentMessage_1, _2, _3, ...)
  const messageParagraphs: string[] = [];
  let i = 1;
  while (kv[`presidentMessage_${i}`]) {
    messageParagraphs.push(kv[`presidentMessage_${i}`]);
    i++;
  }

  return {
    councilName: kv.councilName || "",
    subtitle: kv.subtitle || "",
    footerText: kv.footerText || "",
    footerSubtext: kv.footerSubtext || "",
    presidentName: kv.presidentName || "",
    presidentTitle: kv.presidentTitle || "",
    presidentChapter: kv.presidentChapter || "",
    presidentImageUrl: kv.presidentImageUrl || "",
    presidentMessage: messageParagraphs,
    presidentClosing: kv.presidentClosing || "",
    bannerImageUrl: kv.bannerImageUrl || "",
    alertEnabled: (kv.alertEnabled || "").toLowerCase() === "true",
    alertVariant: (["meeting", "warning", "urgent", "info"] as const).includes((kv.alertVariant || "").toLowerCase() as any)
      ? ((kv.alertVariant || "").toLowerCase() as "meeting" | "warning" | "urgent" | "info")
      : "warning",
    alertTitle: kv.alertTitle || "",
    alertMessage: kv.alertMessage || "",
    alertLinkLabel: kv.alertLinkLabel || "",
    alertLinkUrl: kv.alertLinkUrl || "",
    showChapterInfo: (kv.showChapterInfo || "true").toLowerCase() !== "false",
    showMeetingsDelegates: (kv.showMeetingsDelegates || "true").toLowerCase() !== "false",
    showProgramsEvents: (kv.showProgramsEvents || "true").toLowerCase() !== "false",
    showResources: (kv.showResources || "true").toLowerCase() !== "false",
    showForms: (kv.showForms || "true").toLowerCase() !== "false",
    showForum: (kv.showForum || "true").toLowerCase() !== "false",
    showChat: (kv.showChat || "true").toLowerCase() !== "false",
    showSignatureEventComparison: (kv.showSignatureEventComparison || "true").toLowerCase() !== "false",
    showCouncilCommandOperations: (kv.showCouncilCommandOperations || "true").toLowerCase() !== "false",
    showCouncilCommandTreasury: (kv.showCouncilCommandTreasury || "true").toLowerCase() !== "false",
    showCouncilCommandPresidentsDesk: (kv.showCouncilCommandPresidentsDesk || "true").toLowerCase() !== "false",
    showCouncilCommandContentManager: (kv.showCouncilCommandContentManager || "true").toLowerCase() !== "false",
    showCouncilCommandEditors: (kv.showCouncilCommandEditors || "true").toLowerCase() !== "false",
    showCouncilCommandMemberDirectory: (kv.showCouncilCommandMemberDirectory || "true").toLowerCase() !== "false",
    showCouncilCommandSubmissions: (kv.showCouncilCommandSubmissions || "true").toLowerCase() !== "false",
    showCouncilCommandNotifications: (kv.showCouncilCommandNotifications || "true").toLowerCase() !== "false",
    showCouncilCommandInternalDocuments: (kv.showCouncilCommandInternalDocuments || "true").toLowerCase() !== "false",
    showCouncilCommandTaskTracker: (kv.showCouncilCommandTaskTracker || "true").toLowerCase() !== "false",
    meetingDeckLive: (kv.meetingDeckLive || "false").toLowerCase() === "true",
    showIntroSplashModal: (kv.showIntroSplashModal || "true").toLowerCase() !== "false",
    showGuidedTourModal: (kv.showGuidedTourModal || "true").toLowerCase() !== "false",
    showMemberAlertPopupModal: (kv.showMemberAlertPopupModal || "true").toLowerCase() !== "false",
  };
}

/**
 * SharedForms in Sheets is a flat table:
 *   | category       | id      | name             | description      | link |
 *   | Event Planning | form-1  | Event Proposal.. | Submit propos... | #    |
 *
 * Groups rows by category into SharedFormCategory[].
 */
function groupFormsByCategory(rows: Record<string, string>[]) {
  const grouped: Record<string, { category: string; forms: { id: string; name: string; description: string; link: string }[] }> = {};
  for (const row of rows) {
    const cat = row.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = { category: cat, forms: [] };
    grouped[cat].forms.push({
      id: row.id || `form-${Date.now()}`,
      name: row.name || "",
      description: row.description || "",
      link: row.link || "#",
    });
  }
  return Object.values(grouped);
}

/**
 * InternalDocs in Sheets is a flat table:
 *   | category  | iconName   | id      | name              | updated          | status |
 *   | Financial | DollarSign | idoc-1  | FY 2026 Budget... | January 10, 2026 | Active |
 *
 * Groups rows by category into InternalDocSection[].
 */
function groupDocsByCategory(rows: Record<string, string>[]) {
  const grouped: Record<string, { category: string; iconName: string; documents: { id: string; name: string; updated: string; status: string; fileUrl?: string }[] }> = {};
  for (const row of rows) {
    const cat = row.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = { category: cat, iconName: row.iconName || "FileText", documents: [] };
    grouped[cat].documents.push({
      id: row.id || `idoc-${Date.now()}`,
      name: row.name || "",
      updated: row.updated || "",
      status: row.status || "",
      fileUrl: row.fileUrl || undefined,
    });
  }
  return Object.values(grouped);
}
