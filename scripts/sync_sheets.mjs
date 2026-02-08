/**
 * Build-time Google Sheets sync.
 *
 * Fetches all required tabs from an Apps Script Web App and writes
 * `src/app/data/generated-data.ts` so the site bundles the latest content.
 *
 * This is intended for members-only deployments behind an access gateway
 * (Cloudflare Access). It avoids exposing any runtime data API.
 *
 * Env vars:
 * - APPS_SCRIPT_URL: required to enable syncing (example: https://script.google.com/macros/s/XXX/exec)
 * - APPS_SCRIPT_TOKEN: optional token (added as ?token=...)
 */

import fs from "node:fs";
import path from "node:path";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || process.env.NPHC_APPS_SCRIPT_URL || "";
const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || process.env.NPHC_APPS_SCRIPT_TOKEN || "";

const OUT_FILE = path.resolve("src/app/data/generated-data.ts");

const TABS = {
  siteConfig: "SiteConfig",
  quickLinks: "QuickLinks",
  updates: "Updates",
  officers: "Officers",
  delegates: "Delegates",
  governingDocuments: "GoverningDocs",
  upcomingMeetings: "UpcomingMeetings",
  meetingRecords: "MeetingRecords",
  delegateReports: "DelegateReports",
  upcomingEvents: "Events",
  archivedEvents: "EventArchive",
  eventFlyers: "EventFlyers",
  signupForms: "SignupForms",
  sharedFormsRaw: "SharedForms",
  nationalOrgs: "NationalOrgs",
  trainingResources: "TrainingResources",
  internalDocsRaw: "InternalDocs",
  tasks: "Tasks",
};

function q(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function fetchTab(tabName) {
  const url = q(APPS_SCRIPT_URL, { tab: tabName, token: APPS_SCRIPT_TOKEN || undefined });
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ${tabName}: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Expected array for ${tabName}`);
  return data;
}

function transformSiteConfig(rows) {
  // rows: [{key,value}, ...]
  const kv = {};
  for (const row of rows) {
    if (!row) continue;
    const key = String(row.key || "").trim();
    if (!key) continue;
    kv[key] = row.value == null ? "" : String(row.value);
  }

  const presidentMessage = [];
  for (let i = 1; kv[`presidentMessage_${i}`]; i++) presidentMessage.push(kv[`presidentMessage_${i}`]);

  return {
    councilName: kv.councilName || "",
    subtitle: kv.subtitle || "",
    footerText: kv.footerText || "",
    footerSubtext: kv.footerSubtext || "",
    presidentName: kv.presidentName || "",
    presidentTitle: kv.presidentTitle || "",
    presidentChapter: kv.presidentChapter || "",
    presidentImageUrl: kv.presidentImageUrl || "",
    presidentMessage,
    presidentClosing: kv.presidentClosing || "",
    bannerImageUrl: kv.bannerImageUrl || "",
  };
}

function groupFormsByCategory(rows) {
  const grouped = {};
  for (const row of rows) {
    const cat = row?.category ? String(row.category) : "Uncategorized";
    if (!grouped[cat]) grouped[cat] = { category: cat, forms: [] };
    grouped[cat].forms.push({
      id: String(row?.id || ""),
      name: String(row?.name || ""),
      description: String(row?.description || ""),
      link: String(row?.link || "#"),
    });
  }
  return Object.values(grouped);
}

function groupDocsByCategory(rows) {
  const grouped = {};
  for (const row of rows) {
    const cat = row?.category ? String(row.category) : "Uncategorized";
    if (!grouped[cat]) grouped[cat] = { category: cat, iconName: String(row?.iconName || "FileText"), documents: [] };
    grouped[cat].documents.push({
      id: String(row?.id || ""),
      name: String(row?.name || ""),
      updated: String(row?.updated || ""),
      status: String(row?.status || ""),
    });
  }
  return Object.values(grouped);
}

function asTs(value) {
  return JSON.stringify(value, null, 2);
}

async function main() {
  if (!APPS_SCRIPT_URL) {
    // Keep local dev friction-free: if not configured, do nothing.
    return;
  }

  const [
    siteConfigRows,
    quickLinks,
    updates,
    officers,
    delegates,
    governingDocuments,
    upcomingMeetings,
    meetingRecords,
    delegateReports,
    upcomingEvents,
    archivedEvents,
    eventFlyers,
    signupForms,
    sharedFormsRaw,
    nationalOrgs,
    trainingResources,
    internalDocsRaw,
    tasks,
  ] = await Promise.all([
    fetchTab(TABS.siteConfig),
    fetchTab(TABS.quickLinks),
    fetchTab(TABS.updates),
    fetchTab(TABS.officers),
    fetchTab(TABS.delegates),
    fetchTab(TABS.governingDocuments),
    fetchTab(TABS.upcomingMeetings),
    fetchTab(TABS.meetingRecords),
    fetchTab(TABS.delegateReports),
    fetchTab(TABS.upcomingEvents),
    fetchTab(TABS.archivedEvents),
    fetchTab(TABS.eventFlyers),
    fetchTab(TABS.signupForms),
    fetchTab(TABS.sharedFormsRaw),
    fetchTab(TABS.nationalOrgs),
    fetchTab(TABS.trainingResources),
    fetchTab(TABS.internalDocsRaw),
    fetchTab(TABS.tasks),
  ]);

  const siteConfig = transformSiteConfig(siteConfigRows);
  const sharedForms = groupFormsByCategory(sharedFormsRaw);
  const internalDocuments = groupDocsByCategory(internalDocsRaw);

  const banner = [
    "/* eslint-disable */",
    "/**",
    " * AUTO-GENERATED FILE. DO NOT EDIT.",
    ` * Generated: ${new Date().toISOString()}`,
    " */",
    "",
    'import type {',
    "  SiteConfig,",
    "  QuickLink,",
    "  Update,",
    "  Officer,",
    "  Delegate,",
    "  GoverningDocument,",
    "  UpcomingMeeting,",
    "  MeetingRecord,",
    "  DelegateReport,",
    "  CouncilEvent,",
    "  ArchivedEvent,",
    "  EventFlyer,",
    "  SignupForm,",
    "  SharedFormCategory,",
    "  NationalOrg,",
    "  TrainingResource,",
    "  InternalDocSection,",
    "  AdminTask,",
    '} from "./types";',
    "",
  ].join("\n");

  const body = [
    `export const siteConfig: SiteConfig = ${asTs(siteConfig)};`,
    "",
    `export const quickLinks: QuickLink[] = ${asTs(quickLinks)};`,
    `export const updates: Update[] = ${asTs(updates)};`,
    "",
    `export const officers: Officer[] = ${asTs(officers)};`,
    `export const delegates: Delegate[] = ${asTs(delegates)};`,
    `export const governingDocuments: GoverningDocument[] = ${asTs(governingDocuments)};`,
    "",
    `export const upcomingMeetings: UpcomingMeeting[] = ${asTs(upcomingMeetings)};`,
    `export const meetingRecords: MeetingRecord[] = ${asTs(meetingRecords)};`,
    `export const delegateReports: DelegateReport[] = ${asTs(delegateReports)};`,
    "",
    `export const upcomingEvents: CouncilEvent[] = ${asTs(upcomingEvents)};`,
    `export const archivedEvents: ArchivedEvent[] = ${asTs(archivedEvents)};`,
    `export const eventFlyers: EventFlyer[] = ${asTs(eventFlyers)};`,
    `export const signupForms: SignupForm[] = ${asTs(signupForms)};`,
    "",
    `export const sharedForms: SharedFormCategory[] = ${asTs(sharedForms)};`,
    `export const nationalOrgs: NationalOrg[] = ${asTs(nationalOrgs)};`,
    `export const trainingResources: TrainingResource[] = ${asTs(trainingResources)};`,
    "",
    `export const internalDocuments: InternalDocSection[] = ${asTs(internalDocuments)};`,
    `export const tasks: AdminTask[] = ${asTs(tasks)};`,
    "",
  ].join("\n");

  fs.writeFileSync(OUT_FILE, `${banner}${body}`, "utf8");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

