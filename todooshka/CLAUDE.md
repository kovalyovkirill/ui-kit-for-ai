# Todooshka

- UI components: `import { … } from '@monorepo/ui-kit'`
- Design-system contract lives in `.ai-kit/` (`kit.json` — invariants + `figmaComponents` registry; `<Component>.kit.md` — props/mappings). `/figma-page-gen` reads it itself; consult it for manual UI edits
- Kit debt (variant shims, component stubs) lives in `src/shims/` — each file carries its own deletion contract; `/sync-ai-map` reports what is ready for removal
- Page generation: use skill `/figma-page-gen`
- Form generation from an ADR (Figma + OpenAPI contract): use skill `/form-gen`
- Sync contract with Figma/ui-kit: use skill `/sync-ai-map`
- Skills live in `.claude/skills/` and are version-controlled — edit them there, there is no second copy
- Pages are modules. `src/pages/<PageName>/` holds `<PageName>.tsx` +
  `.module.css`, a `components/` segment (one folder per sub-component, two files
  each) and a `model/` segment (form hooks, submit, label↔value maps — everything
  that knows about data). Components never import from `model/` siblings' internals
  and never talk to the API themselves; the page wires them together.
  `index.ts` at the page root exports **only** the page component — nothing else
  leaves the folder. Inside `components/` and `model/` there are no barrels: import
  by direct path
- API contracts live in `contracts/*.yaml` (OpenAPI 3.1) — backend artifacts, never
  hand-edited. `src/shared/api/tasks/` is GENERATED from them by `npm run api`
  (`@hey-api/openapi-ts`): `types.gen.ts` — TS types, `zod.gen.ts` — zod schemas
  carrying every validation rule from the spec. Always import from the barrel
  `src/shared/api` (`import { createTaskRequestSchema } from '…/shared/api'`),
  never from a `*.gen` file — the barrel is the public surface and lists exactly
  what the app is allowed to use; widen it there when something new is needed.
  Never re-implement a rule that is in the schema, never hand-edit the generated
  folder; `npm run api:check` fails if it drifted
- Forms bind that schema with `react-hook-form` + `@hookform/resolvers/zod`. Three
  generics, not one — a schema property with a `default` is optional on input and
  guaranteed on output, so they are different types:
  ```ts
  const form = useForm<z.input<typeof xSchema>, unknown, z.output<typeof xSchema>>({
    resolver: zodResolver(xSchema), defaultValues: { … },
  })
  ```
  `handleSubmit` then hands you the output type. Do not pass `maxLength`/`required`
  to the input — the resolver already enforces them from the spec
- Which form field maps to which schema property is fixed by an ADR in `docs/adr/` —
  that file holds only what neither the Figma mockup nor the spec can express
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
- React exists twice in this monorepo: the root has 18 (Storybook 8 in `ui-kit`
  pins it), todooshka has 19. Any package npm hoists to the root resolves the
  18 copy, and its hooks then crash with `Cannot read properties of null (reading
  'useRef')`. `resolve.dedupe: ['react', 'react-dom']` in `vite.config.ts` is what
  keeps this from happening — do not remove it, and suspect it first if a hook
  library blows up on a null dispatcher
