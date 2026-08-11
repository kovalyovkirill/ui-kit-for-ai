# Todooshka

- UI components: `import { … } from '@monorepo/ui-kit'`
- Design-system contract lives in `.ai-kit/` (`kit.json` — invariants + `figmaComponents` registry; `<Component>.kit.md` — props/mappings). `/figma-page-gen` reads it itself; consult it for manual UI edits
- Kit debt (variant shims, component stubs) lives in `src/shims/` — each file carries its own deletion contract; `/sync-ai-map` reports what is ready for removal
- Page generation: use skill `/figma-page-gen`
- Sync contract with Figma/ui-kit: use skill `/sync-ai-map`
- Skills live in `.claude/skills/` and are version-controlled — edit them there, there is no second copy
- `.ai-kit/tokens.txt` is GENERATED from the ui-kit CSS. Never hand-edit it;
  regenerate with `npm run tokens`. It is a table, not a name list:
  `NAME · TIER · REF · LIGHT · DARK`. Because it carries every value resolved
  through the `var()` chain, questions like "is `--card-padding-sm` the same as
  `--spacing-4`?" or "does this token theme?" are answered from it — there is no
  reason to open the ui-kit CSS. `TIER` = `sem` (theme-scoped, declared only in
  `:root[data-theme=…]`) · `comp` · `prim` · `color` · `type`
- The ui-kit CSS is itself generated from the Figma variables, so each token is
  one Figma variable. Figma → token is mechanical (lowercase, `/`→`-`, `.`→`-`);
  the reverse is NOT derivable, so never reconstruct a Figma name from a token
- `node .ai-kit/bin/kit-audit.mjs` (`npm run kit-audit`) derives every offline
  fact about the kit — which components are auditable, contract `values` vs the
  TS unions, registry vs disk, shim debt. Run it before answering any question
  about kit state instead of reading the files and comparing by eye; exit 1 =
  real defect, exit 2 = the audit could not run (never read that as "clean")
- Tooling in `.ai-kit/bin/` is plain Node (`.mjs`), no dependencies:
  `npm run tokens` · `tokens:check` · `kit-audit` · `check-tokens -- <path>`
  (the `--` is required to pass a path through npm). Skills call `node …` directly
  so they do not depend on the working directory
- Before start `npm run dev` check app is running on http://localhost:5173/
