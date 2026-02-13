# Figma Staging

Figma-generated code should land in this folder first.

Purpose:
- provide a safe preview lane in dev
- avoid direct overwrites of production routes/components

Default export surface:
- `index.ts` exports `FigmaStagingPreview`

Rule:
- production code promotion happens manually after review
