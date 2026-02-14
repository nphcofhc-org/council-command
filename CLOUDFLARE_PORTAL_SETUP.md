# Members-Only Portal (Cloudflare Pages + Access)

This repo is a Vite/React portal. To keep the design and enforce privacy for members who may not have Google accounts, host it on Cloudflare Pages and gate it with Cloudflare Access (One-time PIN via email allowlist).

## Why This Setup

- Cloudflare Pages: hosts the UI (static site).
- Cloudflare Access: blocks non-members from even reaching the site URL.
- Google Sheets: content source (CMS).
- Apps Script: used only at build-time to pull content into the bundle (no runtime API).

Updates can land within ~15 minutes by triggering a rebuild on a schedule.

## Step 1: Domain

1. Buy a domain (any registrar).
2. Add the domain to Cloudflare and point nameservers to Cloudflare.
3. Decide hostnames:
   - Public site: `www.yourdomain.com` (separate repo)
   - Portal: `portal.yourdomain.com` (this repo)

## Step 2: Create The Google Sheet + Apps Script

1. Create a Google Sheet for portal content.
2. Extensions -> Apps Script.
3. Paste `apps-script/Code.gs`
4. Run `setupSheets()` once to create all tabs/headers.
5. Set `API_TOKEN` in Apps Script (optional but recommended).
6. Deploy -> New deployment -> Web app.
   - Execute as: Me
   - Who has access: Anyone
7. Copy the deployment URL (this becomes `APPS_SCRIPT_URL` in Cloudflare build env).

Note: even though the Apps Script web app is "Anyone", we do NOT call it from the browser. It is only used during the build, and can be protected with `API_TOKEN`.

## Step 3: Cloudflare Pages Project

1. In Cloudflare Dashboard -> Pages -> Create a project -> Connect to Git.
2. Select the repo `nphcofhc-org/council-command`.
3. Build settings:
   - Framework preset: Vite (or none)
   - Build command: `npm run build`
   - Build output directory: `dist`

Environment variables (Pages -> Settings -> Environment variables):
- `APPS_SCRIPT_URL` = your Apps Script deployment URL
- `APPS_SCRIPT_TOKEN` = your `API_TOKEN` (if set)

This repo runs `node scripts/sync_sheets.mjs` automatically via `prebuild`, which writes
`src/app/data/generated-data.ts` before building.

## Step 4: Cloudflare Access (Members Only)

1. Cloudflare Dashboard -> Zero Trust -> Access -> Applications -> Add application.
2. Type: Self-hosted.
3. Application domain:
   - `portal.yourdomain.com`
4. Policy:
   - Include: Emails -> add each member email (or use a group if you have one)
   - Login method: One-time PIN (email)

With Access enabled, non-members cannot reach the portal URL at all.

## Step 5: Council-Only Admin + Shared Compliance State

This repo includes Pages Functions for council admin checks and compliance sync.

Cloudflare Pages -> Project -> Settings:

1. Add Environment Variable:
   - `COUNCIL_ADMIN_EMAILS` = comma-separated list of council admin emails
2. Add D1 Database Binding:
   - Binding name: `DB`
3. Apply schema:
   - Run SQL in D1 console from `cloudflare/d1-schema.sql`

This enables:
- shared compliance checklist state
- runtime leadership content updates from `/#/council-admin/content`
- form submissions stored in D1 (budgets, reimbursements, social requests)

Important:
- This app uses hash routing (`/#/...`). URL fragments are not sent to Cloudflare Access.
- So Access cannot enforce different rules for `/#/council-admin`.
- Access should protect the whole portal hostname, and council-only access is enforced in-app via:
  - `COUNCIL_ADMIN_EMAILS`
  - `/api/admin/session` checks in Pages Functions

## Step 5B: Receipt Uploads (Optional, but recommended)

If you want reimbursements to accept receipt file uploads (PDF/JPG/PNG/HEIC) inside the portal:

1. Cloudflare Dashboard -> R2 -> Create bucket:
   - Bucket name: `nphc-portal-receipts` (or any name)
2. Cloudflare Pages -> Project -> Settings -> Functions -> R2 bindings:
   - Binding name: `RECEIPTS_BUCKET`
   - Bucket: select the bucket you created

Without this binding, reimbursements will still work but will require members to paste Google Drive receipt links instead of uploading.

## Step 6: 15-Minute Updates (Scheduled Deploy)

This repo deploys directly from GitHub Actions with Wrangler:

1. In GitHub repo settings -> Secrets and variables -> Actions, set:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. Ensure `.github/workflows/portal-refresh.yml` exists on `main`.
3. Push changes to `main` (also runs every 15 minutes by cron).

## Notes

- Do not enable GitHub Pages for this repo if the portal must be private.
- If you later want a public site, put that in a separate public repo and deploy via GitHub Pages or Cloudflare Pages without Access.
