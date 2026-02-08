/**
 * =============================================================================
 * NPHC Hudson County — Data Source Configuration
 * =============================================================================
 *
 * Toggle between STATIC (bundled JSON) and LIVE (Google Sheets / Apps Script).
 *
 * HOW TO CONNECT GOOGLE SHEETS:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Create a Google Sheet with tabs matching the names in types.ts
 * 2. Deploy an Apps Script Web App that reads each tab and returns JSON
 * 3. Set DATA_SOURCE to "google-sheets" below
 * 4. Paste your deployed Apps Script URL into APPS_SCRIPT_URL
 * 5. The api.ts fetch functions will automatically use the live endpoint
 *
 * APPS SCRIPT TEMPLATE (deploy as Web App → "Anyone" access):
 * ─────────────────────────────────────────────────────────────────────────────
 *   function doGet(e) {
 *     const sheet = e.parameter.tab;
 *     const ss = SpreadsheetApp.getActiveSpreadsheet();
 *     const ws = ss.getSheetByName(sheet);
 *     const data = ws.getDataRange().getValues();
 *     const headers = data[0];
 *     const rows = data.slice(1).map(row => {
 *       const obj = {};
 *       headers.forEach((h, i) => obj[h] = row[i]);
 *       return obj;
 *     });
 *     return ContentService
 *       .createTextOutput(JSON.stringify(rows))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *
 * Then call: APPS_SCRIPT_URL?tab=Officers
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CLAUDE CODEX / COWORK AUTOMATION:
 * ─────────────────────────────────────────────────────────────────────────────
 * Claude's Cowork agent can:
 *   1. Monitor a Gmail inbox for update emails
 *   2. Parse meeting notices, event announcements, officer changes
 *   3. Write parsed data to Google Sheets via Apps Script POST endpoint
 *   4. The site automatically reflects changes on next page load
 *
 * The POST endpoint in Apps Script would look like:
 *   function doPost(e) {
 *     const payload = JSON.parse(e.postData.contents);
 *     const ss = SpreadsheetApp.getActiveSpreadsheet();
 *     const ws = ss.getSheetByName(payload.tab);
 *     // Append or update rows based on payload.action
 *     // payload.action: "append" | "update" | "delete"
 *     // payload.data: array of row objects
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type DataSource = "static" | "google-sheets";

// ── Change this to switch data sources ──────────────────────────────────────
export const DATA_SOURCE: DataSource = "static";

// ── Google Sheets / Apps Script Configuration ───────────────────────────────
export const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

// Optional: Google Sheet ID (if using Sheets API directly instead of Apps Script)
export const GOOGLE_SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";

// ── Cache / Refresh Configuration ───────────────────────────────────────────
// How often (in ms) to re-fetch data from Google Sheets. Default: 5 minutes.
export const CACHE_TTL_MS = 5 * 60 * 1000;

// ── Tab name mapping ────────────────────────────────────────────────────────
// Maps each data type to its Google Sheet tab name.
// Keep these in sync with your actual Sheet tab names.
export const SHEET_TABS = {
  siteConfig:         "SiteConfig",
  quickLinks:         "QuickLinks",
  updates:            "Updates",
  officers:           "Officers",
  delegates:          "Delegates",
  governingDocs:      "GoverningDocs",
  upcomingMeetings:   "UpcomingMeetings",
  meetingRecords:     "MeetingRecords",
  delegateReports:    "DelegateReports",
  events:             "Events",
  eventArchive:       "EventArchive",
  eventFlyers:        "EventFlyers",
  signupForms:        "SignupForms",
  sharedForms:        "SharedForms",
  nationalOrgs:       "NationalOrgs",
  trainingResources:  "TrainingResources",
  internalDocs:       "InternalDocs",
  tasks:              "Tasks",
} as const;
