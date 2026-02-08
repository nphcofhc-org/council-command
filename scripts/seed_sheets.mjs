/**
 * One-time seeding helper to populate Google Sheets tabs via the Apps Script POST endpoint.
 *
 * Usage:
 *   APPS_SCRIPT_URL="https://script.google.com/macros/s/XXX/exec" \
 *   APPS_SCRIPT_TOKEN="your-token" \
 *   node scripts/seed_sheets.mjs --mode=upsert
 *
 * Modes:
 * - upsert: updates rows by `id` (safe default for most tabs)
 * - replace: wipes tab content (keeps header row) then writes all rows
 *
 * Notes:
 * - SiteConfig is always written as key/value rows and uses `replace`.
 * - InternalDocs is stored in Sheets as a flat table; we flatten sections for you.
 */

import fs from "node:fs";
import path from "node:path";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || process.env.NPHC_APPS_SCRIPT_URL || "";
const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || process.env.NPHC_APPS_SCRIPT_TOKEN || "";

const argv = process.argv.slice(2);
const modeArg = argv.find((a) => a.startsWith("--mode="));
const MODE = (modeArg ? modeArg.split("=")[1] : "upsert").toLowerCase(); // upsert | replace
const DRY_RUN = argv.includes("--dry-run");
const VERBOSE = argv.includes("--verbose");

const SEED_FILE = path.resolve("scripts/seed-data.json");
const seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));

const TABS = {
  SiteConfig: "SiteConfig",
  QuickLinks: "QuickLinks",
  Updates: "Updates",
  Officers: "Officers",
  Delegates: "Delegates",
  GoverningDocs: "GoverningDocs",
  TrainingResources: "TrainingResources",
  InternalDocs: "InternalDocs",
  Tasks: "Tasks",
};

function q(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function post(action, tab, data) {
  if (!APPS_SCRIPT_URL) throw new Error("Missing APPS_SCRIPT_URL env var.");

  const url = q(APPS_SCRIPT_URL, { token: APPS_SCRIPT_TOKEN || undefined });
  const payload = { action, tab, data };

  if (DRY_RUN) {
    console.log(`[dry-run] ${action} ${tab}: ${data.length} rows`);
    return { ok: true, dryRun: true };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }
  if (!res.ok) throw new Error(`POST failed (${res.status}) for ${tab}: ${text}`);
  if (json && json.ok === false) throw new Error(`POST error for ${tab}: ${JSON.stringify(json)}`);

  if (VERBOSE) {
    console.log(`[ok] ${action} ${tab}: ${data.length} rows ->`, json || text);
  } else {
    console.log(`[ok] ${action} ${tab}: ${data.length} rows`);
  }

  return json || { ok: true };
}

function siteConfigToRows(cfg) {
  const rows = [];
  for (const [k, v] of Object.entries(cfg || {})) {
    if (k === "presidentMessage" && Array.isArray(v)) continue;
    rows.push({ key: k, value: v == null ? "" : String(v) });
  }

  const msg = Array.isArray(cfg?.presidentMessage) ? cfg.presidentMessage : [];
  msg.forEach((p, i) => rows.push({ key: `presidentMessage_${i + 1}`, value: String(p) }));
  return rows;
}

function flattenInternalDocs(sections) {
  const rows = [];
  for (const section of sections || []) {
    for (const doc of section.documents || []) {
      rows.push({
        category: String(section.category || ""),
        iconName: String(section.iconName || "FileText"),
        id: String(doc.id || ""),
        name: String(doc.name || ""),
        updated: String(doc.updated || ""),
        status: String(doc.status || ""),
        fileUrl: doc.fileUrl ? String(doc.fileUrl) : "",
      });
    }
  }
  return rows;
}

function normalizeImageUrl(v) {
  if (v == null) return "";
  const s = String(v).trim();
  return s;
}

async function main() {
  if (!["upsert", "replace"].includes(MODE)) {
    throw new Error(`Invalid --mode. Expected upsert|replace, got: ${MODE}`);
  }

  console.log("Seeding Google Sheet via Apps Script...");
  console.log(`- mode: ${MODE}`);
  console.log(`- dry-run: ${DRY_RUN ? "yes" : "no"}`);
  console.log(`- apps script url: ${APPS_SCRIPT_URL ? "set" : "MISSING"}`);
  console.log(`- apps script token: ${APPS_SCRIPT_TOKEN ? "set" : "not set"}`);

  // Always replace SiteConfig to keep it deterministic.
  await post("replace", TABS.SiteConfig, siteConfigToRows(seed.siteConfig));

  const write = async (tab, rows) => {
    const action = MODE === "replace" ? "replace" : "upsert";
    await post(action, tab, rows || []);
  };

  await write(TABS.QuickLinks, seed.quickLinks);
  await write(TABS.Updates, seed.updates);

  const officers = (seed.officers || []).map((o) => ({
    ...o,
    imageUrl: normalizeImageUrl(o.imageUrl),
  }));
  await write(TABS.Officers, officers);

  await write(TABS.Delegates, seed.delegates);
  await write(TABS.GoverningDocs, seed.governingDocuments);
  await write(TABS.TrainingResources, seed.trainingResources);

  await write(TABS.InternalDocs, flattenInternalDocs(seed.internalDocuments));
  await write(TABS.Tasks, seed.tasks);

  console.log("Seed complete. Open your Google Sheet and confirm tabs have rows.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
