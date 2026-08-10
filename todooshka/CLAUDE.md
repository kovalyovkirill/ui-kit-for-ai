# Todooshka

- UI components: `import { … } from '@monorepo/ui-kit'`
- Design-system contract lives in `.ai-kit/` (`kit.json` — invariants + `figmaComponents` registry; `<Component>.kit.md` — props/mappings). `/figma-page-gen` reads it itself; consult it for manual UI edits
- Kit debt (variant shims, component stubs) lives in `src/shims/` — each file carries its own deletion contract; `/sync-ai-map` reports what is ready for removal
- Page generation: use skill `/figma-page-gen`
- Sync contract with Figma/ui-kit: use skill `/sync-ai-map`
- Skills live in `.claude/skills/` and are version-controlled — edit them there, there is no second copy
- `.ai-kit/tokens.txt` is GENERATED from the ui-kit CSS. Never hand-edit it;
  regenerate with `bash .ai-kit/bin/gen-tokens.sh`
- Before start `npm run dev` check app is running on http://localhost:5173/
