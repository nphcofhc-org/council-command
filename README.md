# Council Command (Members Portal)

Private members-only portal UI built with Vite + React.

## Local Development

1. Install deps:
   - `npm i`
2. Run dev server:
   - `npm run dev`

## Content (Google Sheets)

Content is authored in Google Sheets and baked into the build output.

- Apps Script backend lives in `apps-script/`
- Build-time sync script lives at `scripts/sync_sheets.mjs`

To deploy with live content, set these environment variables in your hosting provider:
- `APPS_SCRIPT_URL` = your Apps Script Web App `/exec` URL
- `APPS_SCRIPT_TOKEN` = your `API_TOKEN` (optional but recommended)

Docs:
- `CLOUDFLARE_PORTAL_SETUP.md` (recommended hosting + privacy)
- `apps-script/README.md` (Sheets/API setup)
- `CONTENT_GUIDE.md` (which tabs/columns map to which pages)

## GitHub Pages Note

GitHub Pages is public hosting. Do not use it for the members-only portal unless you are intentionally making the portal public.
