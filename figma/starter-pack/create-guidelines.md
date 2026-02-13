# Figma Create Guidelines (Safe Mode)

## Objective

Allow rapid Figma-driven UI iteration without breaking protected production files.

## Output Target

All generated code from Figma should go to:

- `src/figma-staging/`

Do not write directly to:

- `src/app/pages/CouncilAdminPage.tsx`
- `src/app/pages/CouncilCompliancePage.tsx`
- `src/app/pages/CouncilContentManagerPage.tsx`
- `src/app/components/MainLayout.tsx`
- `src/app/routes.tsx`
- `functions/`
- `cloudflare/`
- `src/app/data/`

## Promotion Flow

1. Generate/update in `src/figma-staging/`.
2. Open PR from `figma/<feature-name>`.
3. Review against UX and data/security constraints.
4. Manually promote approved fragments into production files.
5. Merge only after `Figma sync guard` and `Portal deploy` checks pass.

## Figma Prompt Template

Use this in Figma Create:

```text
Generate React/Tailwind code for this frame into src/figma-staging/<feature>.
Do not modify routing, auth/access guards, backend API files, or data layer files.
Use existing token palette from figma/starter-pack/tokens.json.
Build visual-only components suitable for manual promotion into src/app.
```
