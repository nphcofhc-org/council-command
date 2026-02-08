// Default: re-export the bundled static content.
//
// In the members-only portal deployment, this file is overwritten at build-time
// by `scripts/sync_sheets.mjs` to bake Google Sheets content into the bundle
// (no runtime data API needed).
export * from "./static-data";

