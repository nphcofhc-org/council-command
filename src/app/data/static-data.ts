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
  presidentName: "Marcus Johnson",
  presidentTitle: "Council President",
  presidentChapter: "Alpha Phi Alpha Fraternity, Inc.",
  presidentImageUrl:
    "https://images.unsplash.com/photo-1621062089461-01f1eaebb66c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBhZnJpY2FuJTIwYW1lcmljYW4lMjBtYW4lMjBidXNpbmVzcyUyMHN1aXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzA1MTMyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  presidentMessage: [
    "It is my distinct honor to welcome you to the National Pan-Hellenic Council of Hudson County's internal governance portal. This platform serves as the central hub for our council's operations, communication, and collaborative efforts.",
    "As we continue our mission to promote unity, scholarship, and service across our nine member organizations, this intranet represents our commitment to transparency, efficiency, and excellence in council administration. Here you will find critical resources, meeting documentation, event information, and the tools necessary to advance our collective goals.",
    "I encourage all officers, delegates, and chapter representatives to utilize this platform regularly, stay informed of council activities, and engage fully in our shared work. Together, we strengthen the legacy of the Divine Nine in Hudson County and beyond.",
  ],
  presidentClosing: "In Unity and Service,",
  bannerImageUrl: "", // Populated by figma:asset import in HomePage
};

// ═════════════════════════════════════════════════════════════════════════════
// QUICK LINKS  →  Google Sheet Tab: "QuickLinks"
// ═════════════════════════════════════════════════════════════════════════════

export const quickLinks: QuickLink[] = [
  { id: "ql-1", icon: "Calendar",      label: "Next Chapter Meeting",       shortLabel: "Next Meeting",  url: "/meetings-delegates",   row: 1 },
  { id: "ql-2", icon: "FileText",      label: "Submit an Event",            shortLabel: "Submit Event",  url: "/programs-events",      row: 1 },
  { id: "ql-3", icon: "MessageCircle", label: "Council GroupMe",            shortLabel: "GroupMe",       url: "#groupme",              row: 1 },
  { id: "ql-4", icon: "Calendar",      label: "Council Calendar",           shortLabel: "Calendar",      url: "/programs-events",      row: 2 },
  { id: "ql-5", icon: "FolderOpen",    label: "Shared Forms Library",       shortLabel: "Forms",         url: "/resources",            row: 2 },
  { id: "ql-6", icon: "Users",         label: "Officer & Delegate Directory", shortLabel: "Directory",  url: "/chapter-information",  row: 2 },
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
  { id: "off-1", name: "Marcus Johnson",    title: "President",                chapter: "Alpha Phi Alpha Fraternity, Inc.",   email: "president@nphchudson.org",       imageUrl: null },
  { id: "off-2", name: "Jasmine Williams",  title: "Vice President",           chapter: "Delta Sigma Theta Sorority, Inc.",   email: "vicepresident@nphchudson.org",   imageUrl: null },
  { id: "off-3", name: "David Thompson",    title: "Treasurer",                chapter: "Kappa Alpha Psi Fraternity, Inc.",   email: "treasurer@nphchudson.org",       imageUrl: null },
  { id: "off-4", name: "Nicole Patterson",  title: "Recording Secretary",      chapter: "Zeta Phi Beta Sorority, Inc.",       email: "secretary@nphchudson.org",       imageUrl: null },
  { id: "off-5", name: "Brandon Mitchell",  title: "Corresponding Secretary",  chapter: "Omega Psi Phi Fraternity, Inc.",     email: "correspondence@nphchudson.org",  imageUrl: null },
  { id: "off-6", name: "Angela Davis",      title: "Parliamentarian",          chapter: "Alpha Kappa Alpha Sorority, Inc.",   email: "parliamentarian@nphchudson.org", imageUrl: null },
];

// ═════════════════════════════════════════════════════════════════════════════
// DELEGATES  →  Google Sheet Tab: "Delegates"
// ═════════════════════════════════════════════════════════════════════════════

export const delegates: Delegate[] = [
  { id: "del-1", chapter: "Alpha Phi Alpha Fraternity, Inc.",   representative: "Marcus Johnson",   delegate: "Christopher Hayes",    term: "2025-2027" },
  { id: "del-2", chapter: "Alpha Kappa Alpha Sorority, Inc.",   representative: "Angela Davis",     delegate: "Michelle Robinson",    term: "2025-2027" },
  { id: "del-3", chapter: "Kappa Alpha Psi Fraternity, Inc.",   representative: "David Thompson",   delegate: "Steven Wilson",        term: "2024-2026" },
  { id: "del-4", chapter: "Omega Psi Phi Fraternity, Inc.",     representative: "Brandon Mitchell", delegate: "James Carter",         term: "2025-2027" },
  { id: "del-5", chapter: "Delta Sigma Theta Sorority, Inc.",   representative: "Jasmine Williams", delegate: "Kimberly Brooks",      term: "2024-2026" },
  { id: "del-6", chapter: "Phi Beta Sigma Fraternity, Inc.",    representative: "Anthony Green",    delegate: "Malcolm Harris",       term: "2025-2027" },
  { id: "del-7", chapter: "Zeta Phi Beta Sorority, Inc.",       representative: "Nicole Patterson", delegate: "Lisa Anderson",        term: "2024-2026" },
  { id: "del-8", chapter: "Sigma Gamma Rho Sorority, Inc.",     representative: "Tamara Lewis",     delegate: "Christina Moore",      term: "2025-2027" },
  { id: "del-9", chapter: "Iota Phi Theta Fraternity, Inc.",    representative: "Eric Jackson",     delegate: "Timothy Washington",   term: "2024-2026" },
];

// ═════════════════════════════════════════════════════════════════════════════
// GOVERNING DOCUMENTS  →  Google Sheet Tab: "GoverningDocs"
// ═════════════════════════════════════════════════════════════════════════════

export const governingDocuments: GoverningDocument[] = [
  { id: "gov-1", title: "NPHC Hudson County Bylaws (Revised 2024)", type: "Constitution & Bylaws",    lastUpdated: "January 15, 2024",   status: "Active" },
  { id: "gov-2", title: "Standing Rules & Procedures Manual",       type: "Operational Guidelines",   lastUpdated: "July 10, 2023",      status: "Active" },
  { id: "gov-3", title: "Chapter Membership Requirements",          type: "Governance Document",      lastUpdated: "September 1, 2023",  status: "Active" },
  { id: "gov-4", title: "Financial Policies & Procedures",          type: "Financial Governance",     lastUpdated: "March 20, 2024",     status: "Active" },
  { id: "gov-5", title: "Code of Conduct & Ethics Policy",          type: "Policy Document",          lastUpdated: "June 5, 2023",       status: "Active" },
];

// ═════════════════════════════════════════════════════════════════════════════
// UPCOMING MEETINGS  →  Google Sheet Tab: "UpcomingMeetings"
// ═════════════════════════════════════════════════════════════════════════════

export const upcomingMeetings: UpcomingMeeting[] = [
  { id: "mtg-1", title: "February 2026 General Body Meeting",  date: "February 15, 2026", time: "2:00 PM - 4:00 PM",  location: "Hudson County Community College - Room 301", type: "General Body"    },
  { id: "mtg-2", title: "March 2026 Executive Board Meeting",  date: "March 5, 2026",     time: "6:30 PM - 8:00 PM",  location: "Virtual - Zoom Link Provided",               type: "Executive Board" },
  { id: "mtg-3", title: "March 2026 General Body Meeting",     date: "March 20, 2026",    time: "2:00 PM - 4:00 PM",  location: "Jersey City Public Library - Main Branch",    type: "General Body"    },
];

// ═════════════════════════════════════════════════════════════════════════════
// MEETING RECORDS  →  Google Sheet Tab: "MeetingRecords"
// ═════════════════════════════════════════════════════════════════════════════

export const meetingRecords: MeetingRecord[] = [
  { id: "rec-1", date: "January 18, 2026",  title: "January 2026 General Body Meeting",   agendaFile: "Agenda_Jan_2026_GB.pdf",  minutesFile: "Minutes_Jan_2026_GB.pdf",         status: "Final" },
  { id: "rec-2", date: "December 14, 2025", title: "December 2025 General Body Meeting",  agendaFile: "Agenda_Dec_2025_GB.pdf",  minutesFile: "Minutes_Dec_2025_GB.pdf",         status: "Final" },
  { id: "rec-3", date: "November 16, 2025", title: "November 2025 General Body Meeting",  agendaFile: "Agenda_Nov_2025_GB.pdf",  minutesFile: "Minutes_Nov_2025_GB.pdf",         status: "Final" },
  { id: "rec-4", date: "October 19, 2025",  title: "October 2025 General Body Meeting",   agendaFile: "Agenda_Oct_2025_GB.pdf",  minutesFile: "Minutes_Oct_2025_GB_DRAFT.pdf",   status: "Draft" },
];

// ═════════════════════════════════════════════════════════════════════════════
// DELEGATE REPORTS  →  Google Sheet Tab: "DelegateReports"
// ═════════════════════════════════════════════════════════════════════════════

export const delegateReports: DelegateReport[] = [
  { id: "drpt-1", meetingCycle: "January 2026 General Body",  chapter: "Alpha Phi Alpha Fraternity, Inc.",  submittedBy: "Marcus Johnson",   dateSubmitted: "January 16, 2026",  status: "Submitted" },
  { id: "drpt-2", meetingCycle: "January 2026 General Body",  chapter: "Delta Sigma Theta Sorority, Inc.",  submittedBy: "Jasmine Williams", dateSubmitted: "January 15, 2026",  status: "Submitted" },
  { id: "drpt-3", meetingCycle: "January 2026 General Body",  chapter: "Kappa Alpha Psi Fraternity, Inc.",  submittedBy: "David Thompson",   dateSubmitted: "January 17, 2026",  status: "Submitted" },
  { id: "drpt-4", meetingCycle: "February 2026 General Body", chapter: "Alpha Kappa Alpha Sorority, Inc.",  submittedBy: "Angela Davis",     dateSubmitted: "\u2014",            status: "Pending"   },
  { id: "drpt-5", meetingCycle: "February 2026 General Body", chapter: "Omega Psi Phi Fraternity, Inc.",    submittedBy: "Brandon Mitchell", dateSubmitted: "\u2014",            status: "Pending"   },
];

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
      { id: "form-1",  name: "Event Proposal & Budget Request Form",             description: "Submit proposals for new council-sponsored events",   link: "#" },
      { id: "form-2",  name: "Event Post-Report & Financial Reconciliation",     description: "Document event outcomes and final expenses",          link: "#" },
      { id: "form-3",  name: "Facility & Venue Request Form",                    description: "Reserve venues for NPHC council activities",          link: "#" },
    ],
  },
  {
    category: "Financial Administration",
    forms: [
      { id: "form-4",  name: "Reimbursement Request Form",                       description: "Request reimbursement for council-approved expenses", link: "#" },
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
  { id: "trn-1", title: "NPHC Hudson County New Member Orientation",  description: "Introduction to council structure, procedures, and expectations",    type: "Onboarding",   updated: "September 2025" },
  { id: "trn-2", title: "Officer Transition Manual",                   description: "Role-specific guidance for incoming council officers",               type: "Leadership",   updated: "June 2025"      },
  { id: "trn-3", title: "Event Planning Best Practices Guide",        description: "Step-by-step guide for organizing successful NPHC events",           type: "Programming",  updated: "October 2025"   },
  { id: "trn-4", title: "Financial Management & Budget Procedures",   description: "Treasury operations, reimbursements, and fiscal responsibility",     type: "Financial",    updated: "August 2025"    },
  { id: "trn-5", title: "Parliamentary Procedure Quick Reference",    description: "Robert's Rules of Order as applied to council meetings",             type: "Governance",   updated: "March 2025"     },
];

// ═════════════════════════════════════════════════════════════════════════════
// INTERNAL DOCUMENTS  →  Google Sheet Tab: "InternalDocs"
// ═════════════════════════════════════════════════════════════════════════════

export const internalDocuments: InternalDocSection[] = [
  {
    category: "Financial",
    iconName: "DollarSign",
    documents: [
      { id: "idoc-1", name: "FY 2026 Operating Budget - Approved",         updated: "January 10, 2026",  status: "Active"    },
      { id: "idoc-2", name: "Q1 2026 Financial Report",                    updated: "February 5, 2026",  status: "Current"   },
      { id: "idoc-3", name: "Treasurer's Reconciliation - January 2026",   updated: "February 1, 2026",  status: "Filed"     },
    ],
  },
  {
    category: "Strategic Planning",
    iconName: "Target",
    documents: [
      { id: "idoc-4", name: "NPHC Hudson County Strategic Plan 2024-2027", updated: "June 15, 2024",     status: "Active"    },
      { id: "idoc-5", name: "2026 Program Priorities & Goals",             updated: "December 20, 2025", status: "Active"    },
      { id: "idoc-6", name: "Mid-Year Strategic Review - Fall 2025",       updated: "November 10, 2025", status: "Filed"     },
    ],
  },
  {
    category: "Compliance & Reporting",
    iconName: "ClipboardCheck",
    documents: [
      { id: "idoc-7", name: "Annual Report to National NPHC - 2025",       updated: "January 30, 2026",  status: "Submitted" },
      { id: "idoc-8", name: "IRS Form 990 - Tax Year 2025",               updated: "January 15, 2026",  status: "Filed"     },
      { id: "idoc-9", name: "State of New Jersey Registration Renewal",    updated: "December 1, 2025",  status: "Current"   },
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
