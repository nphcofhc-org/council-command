# Figma Starter Pack (NPHC Portal)

This starter pack is the baseline for rebuilding and extending the live portal in Figma without losing engineering alignment.

## Included

- `design-map.md` - page map, section map, and component inventory
- `tokens.json` - color, radius, spacing, and typography tokens from the codebase
- `content-seed.json` - current leadership seed content for realistic mock data
- `create-guidelines.md` - rules for safe Figma Create output into staging only

## Recommended Figma File Structure

1. `00 Foundations` (tokens, text styles, effects)
2. `01 Navigation` (desktop + mobile nav states)
3. `02 Public Internal Pages` (Home, Chapter Info, Meetings, Programs, Resources)
4. `03 Council Admin` (Admin dashboard, Compliance, Content Manager)
5. `99 Handoff` (annotated production-ready variants)

## Workflow Rule

Design updates in Figma should generate code only into:

- `src/figma-staging/`

Then approved changes are manually promoted into:

- `src/app/`
