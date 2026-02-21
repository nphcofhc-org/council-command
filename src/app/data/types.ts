/**
 * =============================================================================
 * NPHC Hudson County — Central Type Definitions
 * =============================================================================
 *
 * Every interface here maps 1:1 to a Google Sheets tab. When you connect
 * Google Sheets as a backend, each tab's columns match these field names.
 *
 * GOOGLE SHEETS TAB MAPPING:
 * ─────────────────────────────────────────────────────────────────────────────
 *  TypeScript Interface    →  Google Sheet Tab Name    →  Used On Page
 * ─────────────────────────────────────────────────────────────────────────────
 *  SiteConfig              →  "SiteConfig"             →  HomePage (president info, banner)
 *  Update                  →  "Updates"                →  HomePage (What's New)
 *  QuickLink               →  "QuickLinks"             →  HomePage
 *  Officer                 →  "Officers"               →  ChapterInfoPage
 *  Delegate                →  "Delegates"              →  ChapterInfoPage
 *  GoverningDocument       →  "GoverningDocs"          →  ChapterInfoPage
 *  UpcomingMeeting         →  "UpcomingMeetings"       →  MeetingsPage
 *  MeetingRecord           →  "MeetingRecords"         →  MeetingsPage
 *  DelegateReport          →  "DelegateReports"        →  MeetingsPage
 *  CouncilEvent            →  "Events"                 →  ProgramsPage
 *  ArchivedEvent           →  "EventArchive"           →  ProgramsPage
 *  EventFlyer              →  "EventFlyers"            →  ProgramsPage
 *  SignupForm              →  "SignupForms"            →  ProgramsPage
 *  SharedFormCategory      →  "SharedForms"            →  ResourcesPage
 *  NationalOrg             →  "NationalOrgs"           →  ResourcesPage
 *  TrainingResource        →  "TrainingResources"      →  ResourcesPage
 *  InternalDocSection      →  "InternalDocs"           →  CouncilAdminPage
 *  AdminTask               →  "Tasks"                  →  CouncilAdminPage
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── HomePage ─────────────────────────────────────────────────────────────────

export interface SiteConfig {
  councilName: string;
  subtitle: string;
  footerText: string;
  footerSubtext: string;
  presidentName: string;
  presidentTitle: string;
  presidentChapter: string;
  presidentImageUrl: string;
  presidentMessage: string[];       // Each paragraph as an array item
  presidentClosing: string;
  bannerImageUrl: string;           // Google Sites header banner
  instagramHandle: string;          // e.g. "nphcofhudsoncounty"
  instagramPostUrls: string[];      // Optional: specific post URLs to embed as a feed
  // Optional sitewide notification banner (primarily used on Home).
  alertEnabled: boolean;
  alertVariant: "meeting" | "warning" | "urgent" | "info"; // "info" kept for backward compatibility
  alertTitle: string;
  alertMessage: string;
  alertLinkLabel: string;
  alertLinkUrl: string;
}

export interface QuickLink {
  id: string;
  icon: string;                     // Lucide icon name: "Calendar", "FileText", etc.
  label: string;                    // Full label for desktop
  shortLabel: string;               // Abbreviated label for mobile
  url: string;                      // Destination URL or route
  row: 1 | 2;                       // Which row to display in (1 or 2)
}

export interface Update {
  id: string;
  date: string;
  title: string;
  type: string;                     // "Meeting Notice", "Action Required", etc.
  flyerUrl?: string;                // Optional flyer/image/PDF link for Internal News
}

// ── ChapterInfoPage ─────────────────────────────────────────────────────────

export interface Officer {
  id: string;
  name: string;
  title: string;
  chapter: string;
  email: string;
  imageUrl: string | null;          // null = show placeholder avatar
}

export interface Delegate {
  id: string;
  chapter: string;
  representative: string;
  delegate: string;
  term: string;
}

export interface GoverningDocument {
  id: string;
  title: string;
  type: string;
  lastUpdated: string;
  status: string;
  fileUrl?: string;
}

// ── MeetingsPage ─────────────────────────────────────────────────────────────

export interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;                     // "General Body", "Executive Board"
  joinUrl?: string;                 // Google Meet / Zoom / etc.
  joinLabel?: string;               // Optional button label ("Join Google Meet")
}

export interface MeetingRecord {
  id: string;
  date: string;
  title: string;
  agendaFile: string;
  minutesFile: string;
  status: string;                   // "Final", "Draft"
}

export interface DelegateReport {
  id: string;
  meetingCycle: string;
  chapter: string;
  submittedBy: string;
  dateSubmitted: string;
  status: string;                   // "Submitted", "Pending"
}

// ── ProgramsPage ─────────────────────────────────────────────────────────────

export interface CouncilEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: string;
  registration: string;            // "Open", "Coming Soon", "Closed"
  linkUrl?: string;
}

export interface ArchivedEvent {
  id: string;
  title: string;
  date: string;
  attendees: string;
  status: string;
}

export interface EventFlyer {
  id: string;
  title: string;
  type: string;
  date: string;
  fileUrl?: string;
}

export interface SignupForm {
  id: string;
  title: string;
  description: string;
  deadline: string;
  status: string;                   // "Active", "Coming Soon", "Closed"
  formUrl?: string;
}

// ── Decision Portal ─────────────────────────────────────────────────────────

export type DecisionPortalLink = {
  id: string;
  label: string;
  url: string;
};

export type DecisionPortalContent = {
  decisionKey: string;
  title: string;
  subtitle: string;
  summary: string;
  options: Array<{
    id: "block" | "unity";
    label: string;
    description: string;
  }>;
  links: DecisionPortalLink[];
  isOpen: boolean;
};

// ── ResourcesPage ────────────────────────────────────────────────────────────

export interface SharedForm {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface SharedFormCategory {
  category: string;
  forms: SharedForm[];
}

export interface NationalOrg {
  id: string;
  name: string;
  website: string;
  founded: string;
}

export interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: string;
  updated: string;
  fileUrl?: string;
}

// ── CouncilAdminPage ─────────────────────────────────────────────────────────

export interface InternalDoc {
  id: string;
  name: string;
  updated: string;
  status: string;
  fileUrl?: string;
}

export interface InternalDocSection {
  category: string;
  iconName: string;                 // Lucide icon name: "DollarSign", "Target", etc.
  documents: InternalDoc[];
}

export interface AdminTask {
  id: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  priority: string;                 // "High", "Medium", "Low"
  status: string;                   // "In Progress", "Pending", "Not Started", "Complete"
}

// ── Aggregate types for full-page data bundles ───────────────────────────────

export interface HomePageData {
  config: SiteConfig;
  quickLinks: QuickLink[];
  updates: Update[];
}

export interface ChapterInfoPageData {
  officers: Officer[];
  delegates: Delegate[];
  governingDocuments: GoverningDocument[];
}

export interface MeetingsPageData {
  upcomingMeetings: UpcomingMeeting[];
  meetingRecords: MeetingRecord[];
  delegateReports: DelegateReport[];
  featuredDeckTitle?: string;       // Optional featured deck (for "Next General Body" callout)
  featuredDeckImageUrl?: string;    // Cover image URL for the featured deck
  featuredDeckUrl?: string;         // Link to slides/PDF/etc (will be opened in Viewer if internal)
}

export interface ProgramsPageData {
  upcomingEvents: CouncilEvent[];
  archivedEvents: ArchivedEvent[];
  eventFlyers: EventFlyer[];
  signupForms: SignupForm[];
}

export interface ResourcesPageData {
  sharedForms: SharedFormCategory[];
  nationalOrgs: NationalOrg[];
  trainingResources: TrainingResource[];
}

export interface CouncilAdminPageData {
  internalDocuments: InternalDocSection[];
  tasks: AdminTask[];
}
