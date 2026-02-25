/**
 * =============================================================================
 * NPHC Hudson County — Static Data Store
 * =============================================================================
 *
 * ALL site content lives in this single file. Every array and object here
 * mirrors a Google Sheets tab. When you switch to live data, this file
 * becomes the fallback / default data.
 *
 * TO UPDATE CONTENT:
 * ─────────────────────────────────────────────────────────────────────────────
 *  • Edit the relevant array below
 *  • Or update the corresponding Google Sheet tab (when connected)
 *  • Or let Claude Cowork push changes via Apps Script POST endpoint
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  SiteConfig,
  QuickLink,
  Update,
  Officer,
  Delegate,
  GoverningDocument,
  UpcomingMeeting,
  MeetingRecord,
  DelegateReport,
  CouncilEvent,
  ArchivedEvent,
  ProgramEventHighlight,
  EventFlyer,
  SignupForm,
  SharedFormCategory,
  NationalOrg,
  TrainingResource,
  InternalDocSection,
  AdminTask,
} from "./types";

// ═════════════════════════════════════════════════════════════════════════════
// SITE CONFIG  →  Google Sheet Tab: "SiteConfig"
// ═════════════════════════════════════════════════════════════════════════════

export const siteConfig: SiteConfig = {
  councilName: "National Pan-Hellenic Council of Hudson County",
  subtitle: "Internal Governance Portal",
  footerText: "© 2026 National Pan-Hellenic Council of Hudson County",
  footerSubtext: "Internal Governance Portal · Authorized Access Only",
  presidentName: "Christopher DeMarkus",
  presidentTitle: "Council President",
  presidentChapter: "Alpha Phi Alpha Fraternity, Inc.",
  presidentImageUrl: "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/Your%20paragraph%20text%20(1).png",
  presidentMessage: [
    "Welcome to the NPHC of Hudson County digital portal. Our Council is committed to the principles of cooperation and service throughout the Bergen Neck and beyond.",
    "From the urban heights of Jersey City to the waterfronts of Bayonne and Hoboken, this portal serves as a strategic resource for our member chapters to ensure operational alignment, rigorous governance, and impactful community service.",
    "As we navigate the fastest-growing county in the state, we lead with a focus on institutional health and fraternal unity.",
  ],
  presidentClosing: "In Unity and Service,",
  bannerImageUrl: "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/FORMAL%20NPHC%20BANNER%20(2).mp4",
  instagramHandle: "nphcofhudsoncounty",
  instagramPostUrls: [],
  alertEnabled: false,
  alertVariant: "warning",
  alertTitle: "",
  alertMessage: "",
  alertLinkLabel: "",
  alertLinkUrl: "",
  showChapterInfo: true,
  showMeetingsDelegates: true,
  showProgramsEvents: true,
  showResources: true,
  showForms: true,
  showForum: true,
  showChat: true,
  showSignatureEventComparison: true,
  showCouncilCommandOperations: true,
  showCouncilCommandTreasury: true,
  showCouncilCommandPresidentsDesk: true,
  showCouncilCommandContentManager: true,
  showCouncilCommandEditors: true,
  showCouncilCommandMemberDirectory: true,
  showCouncilCommandSubmissions: true,
  showCouncilCommandNotifications: true,
  showCouncilCommandInternalDocuments: true,
  showCouncilCommandTaskTracker: true,
  meetingDeckLive: false,
  showIntroSplashModal: true,
  showGuidedTourModal: true,
  showMemberAlertPopupModal: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// QUICK LINKS  →  Google Sheet Tab: "QuickLinks"
// ═════════════════════════════════════════════════════════════════════════════

export const quickLinks: QuickLink[] = [
  { id: "ql-1", icon: "Calendar",      label: "Next Meeting",             shortLabel: "Next",     url: "/meetings-delegates",              row: 1 },
  { id: "ql-2", icon: "Calendar",      label: "Meetings Calendar",        shortLabel: "Calendar", url: "/2026-council-calendar.html",      row: 1 },
  { id: "ql-3", icon: "FileText",      label: "Meeting Minutes",          shortLabel: "Minutes",  url: "/meetings-delegates?tab=records",  row: 1 },
  { id: "ql-4", icon: "TrendingUp",   label: "Request a Social Post",     shortLabel: "Social",   url: "/resources",                       row: 1 },
  { id: "ql-5", icon: "ExternalLink",  label: "NPHC HQ Website",          shortLabel: "NPHC HQ",  url: "https://www.nphchq.com/",           row: 2 },
  { id: "ql-6", icon: "ExternalLink",  label: "NPHC Gateway",             shortLabel: "Gateway",  url: "https://gateway.nphchq.com/app/login?action=userspending&chapterId=6044", row: 2 },
];

// ═════════════════════════════════════════════════════════════════════════════
// WHAT'S NEW  →  Google Sheet Tab: "Updates"
// ═════════════════════════════════════════════════════════════════════════════

export const updates: Update[] = [
  { id: "upd-1", date: "February 5, 2026",  title: "February 2026 General Body Meeting - Agenda Posted",  type: "Meeting Notice"   },
  { id: "upd-2", date: "February 3, 2026",  title: "Q1 Financial Report - Available for Review",          type: "Budget Update"    },
  { id: "upd-3", date: "January 30, 2026",  title: "Delegate Reports Due - February 15th",                type: "Action Required"  },
  { id: "upd-4", date: "January 28, 2026",  title: "Unity Week 2026 - Event Registration Open",           type: "Event Notice"     },
];

// ═════════════════════════════════════════════════════════════════════════════
// OFFICERS  →  Google Sheet Tab: "Officers"
// ═════════════════════════════════════════════════════════════════════════════

export const officers: Officer[] = [
  { id: "off-1", name: "Christopher DeMarkus", title: "President",           chapter: "Alpha Phi Alpha Fraternity, Inc.",   email: "", imageUrl: null },
  { id: "off-2", name: "Kimberly Conway",      title: "Vice President",      chapter: "Alpha Kappa Alpha Sorority, Inc.",   email: "", imageUrl: null },
  { id: "off-3", name: "April Stitt",          title: "Secretary",           chapter: "Sigma Gamma Rho Sorority, Inc.",     email: "", imageUrl: null },
  { id: "off-4", name: "Gibril Kamara",        title: "Financial Secretary", chapter: "Alpha Phi Alpha Fraternity, Inc.",   email: "", imageUrl: null },
  { id: "off-5", name: "Dr. Viva White",       title: "Chaplain",            chapter: "Zeta Phi Beta Sorority, Inc.",       email: "", imageUrl: null },
  { id: "off-6", name: "Krystal Allbright",    title: "Parliamentarian",     chapter: "Sigma Gamma Rho Sorority, Inc.",     email: "", imageUrl: null },
  { id: "off-7", name: "To Be Appointed",      title: "Treasurer",           chapter: "",                                   email: "", imageUrl: null },
];

// ═════════════════════════════════════════════════════════════════════════════
// DELEGATES  →  Google Sheet Tab: "Delegates"
// ═════════════════════════════════════════════════════════════════════════════

export const delegates: Delegate[] = [
  { id: "del-1", chapter: "Alpha Phi Alpha Fraternity, Inc.",   representative: "TBD",                delegate: "TBD",              term: "2025-2026" },
  { id: "del-2", chapter: "Alpha Kappa Alpha Sorority, Inc.",   representative: "TBD",                delegate: "TBD",              term: "2025-2026" },
  { id: "del-3", chapter: "Kappa Alpha Psi Fraternity, Inc.",   representative: "Lawrence Fernandes", delegate: "Jahshae Stewart",   term: "2025-2026" },
  { id: "del-4", chapter: "Omega Psi Phi Fraternity, Inc.",     representative: "Antonio Gordon",     delegate: "TBD",              term: "2025-2026" },
  { id: "del-5", chapter: "Delta Sigma Theta Sorority, Inc.",   representative: "Tina Jones",         delegate: "TBD",              term: "2025-2026" },
  { id: "del-6", chapter: "Phi Beta Sigma Fraternity, Inc.",    representative: "TBD",                delegate: "TBD",              term: "2025-2026" },
  { id: "del-7", chapter: "Zeta Phi Beta Sorority, Inc.",       representative: "Ayesha Noel-Smith",  delegate: "Dr. Viva White",    term: "2025-2026" },
  { id: "del-8", chapter: "Sigma Gamma Rho Sorority, Inc.",     representative: "April Stitt",        delegate: "Krystal Allbright", term: "2025-2026" },
  { id: "del-9", chapter: "Iota Phi Theta Fraternity, Inc.",    representative: "TBD",                delegate: "TBD",              term: "Interest 2024-2025" },
];

// ═════════════════════════════════════════════════════════════════════════════
// GOVERNING DOCUMENTS  →  Google Sheet Tab: "GoverningDocs"
// ═════════════════════════════════════════════════════════════════════════════

export const governingDocuments: GoverningDocument[] = [
  {
    id: "gov-1",
    title: "NPHC National Constitution (2020)",
    type: "National Governance",
    lastUpdated: "2020",
    status: "Active",
    fileUrl: "/docs/2020_NPHC_Signed_Constitution_Bylaws.pdf",
  },
  {
    id: "gov-2",
    title: "NPHC Hudson County Local Bylaws (Revised 10.4.23)",
    type: "Local Governance",
    lastUpdated: "October 4, 2023",
    status: "Active",
    fileUrl: "/docs/NPHC_Hudson_County_Bylaws_Revised_2023-10-04.pdf",
  },
  { id: "gov-3", title: "Council Accountability and Compliance Standards", type: "Compliance",         lastUpdated: "February 2026",   status: "Reference", fileUrl: "/docs/nphc-council-accountability-and-compliance-standards.docx" },
];

// ═════════════════════════════════════════════════════════════════════════════
// UPCOMING MEETINGS  →  Google Sheet Tab: "UpcomingMeetings"
// ═════════════════════════════════════════════════════════════════════════════

export const upcomingMeetings: UpcomingMeeting[] = [
  {
    id: "mtg-1",
    title: "January 2026 General Body Meeting",
    date: "January 24, 2026",
    time: "",
    location: "In-Person",
    type: "General Body",
    joinUrl: "", // Set in Council Command Center → Content → Meetings
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-2",
    title: "January 2026 Executive Council Meeting",
    date: "January 22, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "", // Set in Council Command Center → Content → Meetings
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-3",
    title: "February 2026 General Body Meeting",
    date: "February 23, 2026",
    time: "8:00 PM – 9:00 PM ET",
    location: "Virtual Meeting",
    type: "General Body",
    joinUrl: "https://meet.google.com/ktp-drvx-rjx",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-4",
    title: "February 2026 Executive Council Meeting",
    date: "February 19, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-5",
    title: "March 2026 General Body Meeting",
    date: "March 23, 2026",
    time: "",
    location: "Virtual Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-6",
    title: "March 2026 Executive Council Meeting",
    date: "March 19, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-7",
    title: "April 2026 General Body Meeting",
    date: "April 25, 2026",
    time: "",
    location: "General Body Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-8",
    title: "April 2026 Executive Council Meeting",
    date: "April 23, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-9",
    title: "May 2026 General Body Meeting",
    date: "May 18, 2026",
    time: "",
    location: "General Body Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-10",
    title: "May 2026 Executive Council Meeting",
    date: "May 14, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-11",
    title: "June 2026 General Body Meeting",
    date: "June 22, 2026",
    time: "",
    location: "General Body Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-12",
    title: "June 2026 Executive Council Meeting",
    date: "June 18, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-13",
    title: "September 2026 General Body Meeting",
    date: "September 26, 2026",
    time: "",
    location: "General Body Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-14",
    title: "September 2026 Executive Council Meeting",
    date: "September 24, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-15",
    title: "October 2026 General Body Meeting",
    date: "October 26, 2026",
    time: "",
    location: "Virtual Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-16",
    title: "October 2026 Executive Council Meeting",
    date: "October 22, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-17",
    title: "November 2026 General Body Meeting",
    date: "November 23, 2026",
    time: "",
    location: "General Body Meeting",
    type: "General Body",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
  {
    id: "mtg-18",
    title: "November 2026 Executive Council Meeting",
    date: "November 19, 2026",
    time: "",
    location: "Executive Council Meeting",
    type: "Executive Council",
    joinUrl: "",
    joinLabel: "Join Google Meet",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// MEETING RECORDS  →  Google Sheet Tab: "MeetingRecords"
// ═════════════════════════════════════════════════════════════════════════════

export const meetingRecords: MeetingRecord[] = [];

// ═════════════════════════════════════════════════════════════════════════════
// DELEGATE REPORTS  →  Google Sheet Tab: "DelegateReports"
// ═════════════════════════════════════════════════════════════════════════════

export const delegateReports: DelegateReport[] = [];

// ═════════════════════════════════════════════════════════════════════════════
// UPCOMING EVENTS  →  Google Sheet Tab: "Events"
// ═════════════════════════════════════════════════════════════════════════════

export const upcomingEvents: CouncilEvent[] = [
  { id: "evt-1", title: "Unity Week 2026",           date: "March 10-16, 2026",  location: "Hudson County Community Venues",       description: "Annual week-long celebration of NPHC unity, scholarship, and service",       type: "Council Signature Event",  registration: "Open"        },
  { id: "evt-2", title: "Spring Scholarship Gala",   date: "April 25, 2026",     location: "The Manor - West Orange, NJ",           description: "Annual fundraising event supporting NPHC Hudson County scholarship recipients", type: "Fundraiser",               registration: "Coming Soon" },
  { id: "evt-3", title: "Leadership Summit 2026",    date: "May 18, 2026",       location: "Rutgers University - Newark Campus",    description: "Professional development and leadership training for chapter officers",        type: "Educational Program",      registration: "Coming Soon" },
];

// ═════════════════════════════════════════════════════════════════════════════
// EVENT ARCHIVE  →  Google Sheet Tab: "EventArchive"
// ═════════════════════════════════════════════════════════════════════════════

export const archivedEvents: ArchivedEvent[] = [
  { id: "arch-1", title: "MLK Day of Service 2026",    date: "January 20, 2026",   attendees: "85 participants",   status: "Completed" },
  { id: "arch-2", title: "Black History Month Kickoff", date: "February 1, 2026",   attendees: "120 participants",  status: "Completed" },
  { id: "arch-3", title: "Holiday Food Drive 2025",     date: "December 15, 2025",  attendees: "67 participants",   status: "Completed" },
];

// ═════════════════════════════════════════════════════════════════════════════
// EVENT HIGHLIGHTS  →  Programs page top media highlights
// ═════════════════════════════════════════════════════════════════════════════

export const eventHighlights: ProgramEventHighlight[] = [
  {
    id: "highlight-video-1",
    title: "Bowling Night Highlight Video",
    mediaType: "video",
    mediaUrl: "https://pub-490dff0563064ae89e191bee5e711eaf.r2.dev/1.mp4",
  },
  {
    id: "highlight-image-1",
    title: "Thank You Letter & Chapter Photo",
    mediaType: "image",
    mediaUrl: "https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/2.png",
  },
  {
    id: "highlight-image-2",
    title: "Event Total",
    mediaType: "image",
    mediaUrl: "https://pub-e0d3ae4075164c7aa7204024db626148.r2.dev/3.png",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// EVENT FLYERS  →  Google Sheet Tab: "EventFlyers"
// ═════════════════════════════════════════════════════════════════════════════

export const eventFlyers: EventFlyer[] = [
  { id: "fly-1", title: "Unity Week 2026 - Event Flyer",             type: "Promotional Material",  date: "Posted: February 1, 2026"  },
  { id: "fly-2", title: "Spring Scholarship Gala - Save the Date",   type: "Promotional Material",  date: "Posted: January 15, 2026"  },
  { id: "fly-3", title: "MLK Day of Service 2026 - Recap Flyer",     type: "Event Summary",         date: "Posted: January 22, 2026"  },
];

// ═════════════════════════════════════════════════════════════════════════════
// SIGNUP FORMS  →  Google Sheet Tab: "SignupForms"
// ═════════════════════════════════════════════════════════════════════════════

export const signupForms: SignupForm[] = [
  { id: "sf-1", title: "Unity Week 2026 - Volunteer Registration",  description: "Sign up to volunteer for Unity Week activities and events",           deadline: "March 1, 2026",   status: "Active"      },
  { id: "sf-2", title: "Spring Scholarship Gala - Ticket Purchase",  description: "Purchase tickets and reserve tables for the annual scholarship gala", deadline: "April 10, 2026",  status: "Coming Soon" },
  { id: "sf-3", title: "Event Proposal Submission Form",             description: "Submit proposals for new council-sponsored events and programs",      deadline: "Rolling",         status: "Active"      },
];

// ═════════════════════════════════════════════════════════════════════════════
// SHARED FORMS  →  Google Sheet Tab: "SharedForms"
// ═════════════════════════════════════════════════════════════════════════════

export const sharedForms: SharedFormCategory[] = [
  {
    category: "Event Planning",
    forms: [
      { id: "form-1",  name: "Event Proposal & Budget Request Form",             description: "Submit proposals for new council-sponsored events",   link: "#/forms/event-proposal-budget" },
      { id: "form-2",  name: "Event Post-Report & Financial Reconciliation",     description: "Document event outcomes and final expenses",          link: "#/forms/event-post-report-reconciliation" },
      { id: "form-3",  name: "Event Submission Form",                            description: "Submit an event for calendar approval and visibility", link: "#/forms/events" },
    ],
  },
  {
    category: "Financial Administration",
    forms: [
      { id: "form-4",  name: "Reimbursement Request Form",                       description: "Request reimbursement for council-approved expenses", link: "#/forms/reimbursement" },
      { id: "form-5",  name: "Chapter Dues Payment Confirmation",                description: "Submit confirmation of quarterly chapter dues payment", link: "#" },
      { id: "form-6",  name: "Sponsorship & Donation Receipt Template",          description: "Official receipt template for external contributions", link: "#" },
    ],
  },
  {
    category: "Chapter Reporting",
    forms: [
      { id: "form-7",  name: "Monthly Delegate Report Template",                 description: "Standard template for chapter activity reports",      link: "#" },
      { id: "form-8",  name: "Quarterly Membership Roster Update",               description: "Update active chapter membership information",        link: "#" },
      { id: "form-9",  name: "Service Hours Tracking Form",                      description: "Report community service and volunteer activities",   link: "#" },
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// NATIONAL ORGANIZATIONS  →  Google Sheet Tab: "NationalOrgs"
// ═════════════════════════════════════════════════════════════════════════════

export const nationalOrgs: NationalOrg[] = [
  { id: "org-1", name: "Alpha Phi Alpha Fraternity, Inc.",   website: "https://apa1906.net",              founded: "1906" },
  { id: "org-2", name: "Alpha Kappa Alpha Sorority, Inc.",   website: "https://aka1908.com",              founded: "1908" },
  { id: "org-3", name: "Kappa Alpha Psi Fraternity, Inc.",   website: "https://kappaalphapsi1911.com",    founded: "1911" },
  { id: "org-4", name: "Omega Psi Phi Fraternity, Inc.",     website: "https://oppf.org",                 founded: "1911" },
  { id: "org-5", name: "Delta Sigma Theta Sorority, Inc.",   website: "https://deltasigmatheta.org",      founded: "1913" },
  { id: "org-6", name: "Phi Beta Sigma Fraternity, Inc.",    website: "https://pbs1914.org",              founded: "1914" },
  { id: "org-7", name: "Zeta Phi Beta Sorority, Inc.",       website: "https://zphib1920.org",            founded: "1920" },
  { id: "org-8", name: "Sigma Gamma Rho Sorority, Inc.",     website: "https://sgrho1922.org",            founded: "1922" },
  { id: "org-9", name: "Iota Phi Theta Fraternity, Inc.",    website: "https://iotaphitheta.org",         founded: "1963" },
];

// ═════════════════════════════════════════════════════════════════════════════
// TRAINING RESOURCES  →  Google Sheet Tab: "TrainingResources"
// ═════════════════════════════════════════════════════════════════════════════

export const trainingResources: TrainingResource[] = [
  {
    id: "trn-1",
    title: "Comprehensive Data Brief for Intranet Integration",
    description: "Draft portal content, executive roster context, directory notes, and governance registry.",
    type: "Reference",
    updated: "February 2026",
    fileUrl: "/docs/nphc-of-hudson-county-comprehensive-data-brief-for-intranet-integration.docx",
  },
  {
    id: "trn-2",
    title: "Council Accountability and Compliance Standards",
    description: "Annual reporting, financial documentation, bylaws upload requirements, and compliance expectations.",
    type: "Compliance",
    updated: "February 2026",
    fileUrl: "/docs/nphc-council-accountability-and-compliance-standards.docx",
  },
  {
    id: "trn-3",
    title: "Centralized Intranet Portal Data Brief (XLSX)",
    description: "Source tables and references used to assemble portal content.",
    type: "Data",
    updated: "February 2026",
    fileUrl: "/docs/nphc-of-hudson-county-centralized-intranet-portal-data-brief.xlsx",
  },
  {
    id: "trn-4",
    title: "NotebookLM Mind Map (PNG)",
    description: "High-level mind map of council portal content and structure.",
    type: "Reference",
    updated: "February 2026",
    fileUrl: "/docs/notebooklm-mind-map.png",
  },
  {
    id: "trn-5",
    title: "Member Quick Start (Top 5 Need-to-Know)",
    description: "Shareable onboarding guide covering access, verification, home screen setup, meeting materials, and event sharing.",
    type: "Onboarding",
    updated: "February 2026",
    fileUrl: "/docs/member-quick-start.html",
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// INTERNAL DOCUMENTS  →  Google Sheet Tab: "InternalDocs"
// ═════════════════════════════════════════════════════════════════════════════

export const internalDocuments: InternalDocSection[] = [
  {
    category: "Financial",
    iconName: "DollarSign",
    documents: [],
  },
  {
    category: "Governance",
    iconName: "FileText",
    documents: [
      {
        id: "idoc-4",
        name: "Comprehensive Data Brief for Intranet Integration",
        updated: "February 2026",
        status: "Live",
        fileUrl: "/council-admin/data-brief",
      },
      {
        id: "idoc-5",
        name: "Exec Council Meeting Workspace (Feb 19)",
        updated: "February 2026",
        status: "Live",
        fileUrl: "/council-admin/exec-council-meeting",
      },
    ],
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN TASKS  →  Google Sheet Tab: "Tasks"
// ═════════════════════════════════════════════════════════════════════════════

export const tasks: AdminTask[] = [
  { id: "tsk-1", task: "Review Q1 Financial Report",              assignedTo: "Executive Board",     dueDate: "February 12, 2026",  priority: "High",    status: "In Progress" },
  { id: "tsk-2", task: "Update Officer Contact Information",       assignedTo: "Recording Secretary", dueDate: "February 10, 2026",  priority: "Medium",  status: "Pending"     },
  { id: "tsk-3", task: "Unity Week Budget Approval",              assignedTo: "Treasurer",           dueDate: "February 15, 2026",  priority: "High",    status: "In Progress" },
  { id: "tsk-4", task: "Prepare National NPHC Quarterly Report",  assignedTo: "President",           dueDate: "March 1, 2026",      priority: "Medium",  status: "Not Started" },
];
