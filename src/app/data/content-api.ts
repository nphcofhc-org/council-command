import type {
  ArchivedEvent,
  CouncilEvent,
  DelegateReport,
  DecisionPortalContent,
  EventFlyer,
  ProgramEventHighlight,
  MeetingRecord,
  NationalOrg,
  QuickLink,
  SharedFormCategory,
  SignupForm,
  SiteConfig,
  TrainingResource,
  UpcomingMeeting,
  Update,
} from "./types";
import type { RollCallContent } from "./roll-call";

type ContentResponse<T> = {
  found: boolean;
  data: T;
  updatedAt: string | null;
  updatedBy: string | null;
};

export type NotificationSettings = {
  enabled: boolean;
  defaultNotifyEmails: string;
  treasurerEmail: string;
  rules: Record<
    string,
    {
      notifyEmails: string;
      sendConfirmation: boolean;
      notifyOnStatusChange: boolean;
    }
  >;
};

export type MemberAlerts = {
  enabled: boolean;
  style: "banner" | "alert";
  severity: "info" | "important" | "urgent";
  title: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  alertId: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error) return String(data.error);
  } catch {
    // ignore
  }
  return `Request failed (${response.status})`;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "GET",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

export function fetchSiteConfigOverride(): Promise<ContentResponse<SiteConfig | null>> {
  return getJson("/api/content/site-config");
}

export function saveSiteConfigOverride(config: SiteConfig): Promise<ContentResponse<SiteConfig>> {
  return putJson("/api/content/site-config", config);
}

export function fetchQuickLinksOverride(): Promise<ContentResponse<QuickLink[]>> {
  return getJson("/api/content/home-quick-links");
}

export function saveQuickLinksOverride(links: QuickLink[]): Promise<ContentResponse<QuickLink[]>> {
  return putJson("/api/content/home-quick-links", links);
}

export function fetchUpdatesOverride(): Promise<ContentResponse<Update[]>> {
  return getJson("/api/content/home-updates");
}

export function saveUpdatesOverride(updates: Update[]): Promise<ContentResponse<Update[]>> {
  return putJson("/api/content/home-updates", updates);
}

export type MeetingsOverridePayload = {
  upcomingMeetings: UpcomingMeeting[];
  meetingRecords: MeetingRecord[];
  delegateReports: DelegateReport[];
  featuredDeckTitle?: string;
  featuredDeckImageUrl?: string;
  featuredDeckUrl?: string;
};

export function fetchMeetingsOverride(): Promise<ContentResponse<MeetingsOverridePayload | null>> {
  return getJson("/api/content/meetings");
}

export function saveMeetingsOverride(payload: MeetingsOverridePayload): Promise<ContentResponse<MeetingsOverridePayload>> {
  return putJson("/api/content/meetings", payload);
}

export type ProgramsOverridePayload = {
  upcomingEvents: CouncilEvent[];
  archivedEvents: ArchivedEvent[];
  eventHighlights?: ProgramEventHighlight[];
  eventFlyers: EventFlyer[];
  signupForms: SignupForm[];
};

export function fetchProgramsOverride(): Promise<ContentResponse<ProgramsOverridePayload | null>> {
  return getJson("/api/content/programs");
}

export function saveProgramsOverride(payload: ProgramsOverridePayload): Promise<ContentResponse<ProgramsOverridePayload>> {
  return putJson("/api/content/programs", payload);
}

export type ResourcesOverridePayload = {
  sharedForms: SharedFormCategory[];
  nationalOrgs: NationalOrg[];
  trainingResources: TrainingResource[];
};

export function fetchResourcesOverride(): Promise<ContentResponse<ResourcesOverridePayload | null>> {
  return getJson("/api/content/resources");
}

export function fetchDecisionPortalOverride(): Promise<ContentResponse<DecisionPortalContent | null>> {
  return getJson("/api/content/decision-portal");
}

export function saveDecisionPortalOverride(payload: DecisionPortalContent): Promise<ContentResponse<DecisionPortalContent>> {
  return putJson("/api/content/decision-portal", payload);
}

export function saveResourcesOverride(payload: ResourcesOverridePayload): Promise<ContentResponse<ResourcesOverridePayload>> {
  return putJson("/api/content/resources", payload);
}

export function fetchNotificationSettings(): Promise<ContentResponse<NotificationSettings | null>> {
  return getJson("/api/content/notification-settings");
}

export function saveNotificationSettings(payload: NotificationSettings): Promise<ContentResponse<NotificationSettings>> {
  return putJson("/api/content/notification-settings", payload);
}

export function fetchMemberAlerts(): Promise<ContentResponse<MemberAlerts | null>> {
  return getJson("/api/content/member-alerts");
}

export function saveMemberAlerts(payload: MemberAlerts): Promise<ContentResponse<MemberAlerts>> {
  return putJson("/api/content/member-alerts", payload);
}

export function fetchRollCallContent(): Promise<ContentResponse<RollCallContent | null>> {
  return getJson("/api/content/roll-call");
}

export function saveRollCallContent(payload: RollCallContent): Promise<ContentResponse<RollCallContent>> {
  return putJson("/api/content/roll-call", payload);
}
