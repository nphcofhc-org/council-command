# Google Sites Embed (Fastest Path)

Google Sites cannot run this Vite/React project directly. The efficient setup is:

1. Host the app as a normal website (static hosting).
2. Embed the hosted URL into Google Sites.

This repo is configured to use hash routing (`#/path`) so embedding works without any server rewrite rules.

## Deploy

1. Install + run locally (optional):
   - `npm i`
   - `npm run dev`
2. Build:
   - `npm run build`
3. Deploy the built output using any static host (Vercel/Netlify/Cloudflare Pages/GitHub Pages).

## Embed In Google Sites

1. In Google Sites, add: `Insert` -> `Embed` -> `By URL`
2. Paste the deployed site URL.
3. Resize the embed to full width and enough height for the page content.

## Link Directly To Pages

Because this app uses hash routing, you can link to internal pages like:

- `https://YOUR_HOST/` (Home)
- `https://YOUR_HOST/#/chapter-information`
- `https://YOUR_HOST/#/meetings-delegates`
- `https://YOUR_HOST/#/programs-events`
- `https://YOUR_HOST/#/resources`
- `https://YOUR_HOST/#/council-admin`

