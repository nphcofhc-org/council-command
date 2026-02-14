# Import Current Portal Layout Into Figma (From Code)

Figma is not automatically “in sync” with the repo. The safe way to continue designing from where development is right now is:

1. Use the included **route screenshots** as the visual source-of-truth in Figma.
2. Use `tokens.json` to recreate the portal’s variables/styles in Figma.
3. Rebuild components/screens in Figma on top of the screenshots (trace), then only generate code into `src/figma-staging/`.

## 1) Add The Screenshots To Your Figma File

Screenshots live here:

- `/Users/sirchristopherdemarkus/NPHC/council-command/figma/starter-pack/screenshots/desktop/`
- `/Users/sirchristopherdemarkus/NPHC/council-command/figma/starter-pack/screenshots/mobile/`

Recommended frame sizes:

- Desktop: `1440 × 900`
- Mobile: `390 × 844`

In Figma:

1. Create a page named `99 Dev Snapshots`.
2. Drag each PNG from the folders above into Figma.
3. For each image, create a frame at the matching size and set the image as the frame’s fill (or place the image and “Frame selection”).
4. Lock the image layer, reduce opacity to ~50%, and trace over it on a new layer.

## 2) Create Variables / Styles From Tokens

Tokens are here:

- `/Users/sirchristopherdemarkus/NPHC/council-command/figma/starter-pack/tokens.json`

Use it to create:

- Color variables (background/foreground/border/muted/etc)
- Radius styles (sm/md/lg/xl)
- Effects (card shadow / card ring)
- Typography styles (Inter + sizes/weights)

## 3) Keep Figma → Code Safe

Rule: Figma Create output goes only to:

- `/Users/sirchristopherdemarkus/NPHC/council-command/src/figma-staging/`

Then we manually promote changes into:

- `/Users/sirchristopherdemarkus/NPHC/council-command/src/app/`

This prevents Figma-driven codegen from wiping core app files.

## Notes

- “Code → Figma sync” is not something we can do automatically. The reliable workflow is **screenshots + tokens**.
- If you want true Figma-context pulls (design context, screenshots, assets), we need Figma MCP configured in this Codex environment.

