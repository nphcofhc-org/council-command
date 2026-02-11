# NPHC Portal Implementation Guide

This guide covers production setup, admin controls, and safe Figma-to-GitHub sync.

## 1) Hosting and Deploy Pipeline

### GitHub
- Primary repo: `nphcofhc-org/council-command`
- Deploy branch: `main`
- Deploy workflow: `.github/workflows/portal-refresh.yml`

### Cloudflare Pages
- Project name: `council-command`
- Production URL: `portal.nphcofhudsoncounty.org`
- Build command: `npm run build`
- Output directory: `dist`

### Required GitHub Secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 2) Council Admin Access Control

### Cloudflare Access (Zero Trust)
Protect the portal hostname with Access:

- `portal.nphcofhudsoncounty.org/*`

Note:
- this app uses hash routes (`/#/...`)
- hash fragments are not sent to Cloudflare Access
- route-level council-admin restriction is enforced in-app via session checks

Recommended setup:
- create a `Council Admin` group in Access
- include executive board emails in that group
- apply stricter rule for council-admin path

### Pages Environment Variable
Set in Cloudflare Pages project:

- `COUNCIL_ADMIN_EMAILS`
  - comma-separated list of admin emails
  - example: `president@nphc.org,secretary@nphc.org`

Backend session check endpoint:
- `GET /api/admin/session`

## 3) Compliance Data Persistence (Shared Cloud State)

The compliance checklist now supports cloud persistence via D1.

### Create/Bind D1
1. Create a D1 database in Cloudflare.
2. In Pages project settings, add binding:
   - name: `DB`
3. Apply schema from:
   - `cloudflare/d1-schema.sql`

API endpoint:
- `GET /api/admin/compliance` (read)
- `PUT /api/admin/compliance` (save)

If D1 is missing/unavailable:
- page falls back to local browser storage only.

## 4) How Content Updates Work

### Data flow
- `npm run build` triggers `prebuild` script:
  - `scripts/sync_sheets.mjs`
- it fetches Google Sheet data and writes:
  - `src/app/data/generated-data.ts`
- Vite builds static assets from that generated file.

### Operational rule
- update content in Sheet
- push/trigger deploy
- deployment rebuilds with latest content

## 5) Safe Figma Sync Workflow (No Core Wipes)

This repo now has:
- workflow: `.github/workflows/figma-sync-guard.yml`
- guard script: `scripts/ci/figma_sync_guard.mjs`

### How to use it
1. Create branch using prefix:
   - `figma/<feature-name>`
2. Open PR to `main`.
3. Add label:
   - `figma-sync` (optional if branch already starts with `figma/`)
4. Guard blocks protected core-file changes unless explicitly overridden.

### Protected files/directories
- `functions/`
- `cloudflare/`
- `src/app/data/`
- `src/data/`
- `.github/workflows/portal-refresh.yml`
- `scripts/sync_sheets.mjs`
- `package.json`
- `package-lock.json`

### Override path (intentional core changes only)
- add PR label: `allow-core-changes`
- guard still blocks deletion of protected files

## 6) Recommended Release Discipline

For each PR:
- run `npm run build` locally
- verify council-admin route behavior
- verify compliance save + reload
- confirm Access policy and D1 binding unchanged

For production incidents:
- revert via GitHub to last green commit
- redeploy by pushing revert commit to `main`

## 7) Quick Verification Checklist

- [ ] `main` push triggers successful Pages deploy
- [ ] non-admin user is blocked by in-app council admin gate on `#/council-admin`
- [ ] admin user can access compliance page
- [ ] compliance state survives refresh/login/device (with D1)
- [ ] Figma PR touching protected core files is blocked unless override label is added
