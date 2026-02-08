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
3. Paste `/Users/sirchristopherdemarkus/Desktop/Downloads/Chrome Vault/vault/Vault54membership1/NPHC1/apps-script/Code.gs`
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

## Step 5: 15-Minute Updates (Scheduled Rebuild)

Cloudflare Pages supports "Deploy hooks". Create one and then trigger it from GitHub Actions.

1. In Cloudflare Pages -> your project -> Settings -> Deploy hooks -> Create hook.
2. Copy the hook URL.
3. Add a GitHub repo secret:
   - `CF_PAGES_DEPLOY_HOOK_URL` = the hook URL
4. Enable the scheduled workflow in this repo:
   - `.github/workflows/portal-refresh.yml`

## Notes

- Do not enable GitHub Pages for this repo if the portal must be private.
- If you later want a public site, put that in a separate public repo and deploy via GitHub Pages or Cloudflare Pages without Access.
