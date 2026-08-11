---
name: figma-page-gen
description: Generates a complete React page (TSX + CSS Modules) from a Figma node using the @monorepo/ui-kit design system. Use this skill whenever the user provides a Figma URL or node ID and wants to build, implement, or scaffold a page, screen, view, modal, drawer, sidebar, or any composed multi-section layout. Trigger on phrases like "build this page", "implement this design", "generate from Figma", "create this screen", "turn this Figma into code", "implement the mockup" — even if the user just pastes a Figma link without further explanation.
---

# figma-page-gen

Generates production-ready React pages from Figma design nodes using the project's design system.

## Stack

- React + TypeScript + CSS Modules
- UI kit: `@monorepo/ui-kit` (already installed)
- Tokens: loaded globally via `@monorepo/ui-kit/styles`

## Step 0 — refresh the token manifest

One serial call, ~30 ms, before the batch below:

```bash
node .ai-kit/bin/gen-tokens.mjs
```

`.ai-kit/tokens.txt` is generated from the ui-kit CSS. This self-heals it so the list
you read in Step 1 is correct as of a moment ago. Keep it **outside** the parallel
batch — inside it, the `Read` of `tokens.txt` could race the write.

If this prints `updated:`, the manifest had drifted; say so in your final report and
mention that the file now shows up as changed in git.

## Step 1 — one batch, before writing anything

Issue **all of these in a single response** (they are independent — do not serialise):

- `mcp__figma-desktop__get_design_context` with `forceCode: true` on the user's node
- `mcp__figma-desktop__get_screenshot` on the same node
- Read `.ai-kit/kit.json`
- Read `.ai-kit/tokens.txt`
- Read **every** `.ai-kit/*.kit.md` (glob the directory — read them all, don't pre-guess which apply)

**Hard rule: do not write a single file until this batch has returned.** Never
read `@monorepo/ui-kit` source mid-implementation — not for a prop (that is in the
`.kit.md` contracts) and not for a token *value* (that is in `tokens.txt`, which
carries `TIER · REF · LIGHT · DARK` with every `var()` chain resolved). Both
lookups cost a serial round trip and both are already answered. If something
genuinely is not, finish the page, then report the gap instead of guessing.

The screenshot is **not** a source of structure (the code blob has all of it) — it
is the **reference image for Step 5**. Keep it in context.

## Step 2 — decide, mechanically

These five decisions caused every error in past runs. Each has a rule; none is a judgement call.

### 2a. Kit component, shim, stub, or hand-rolled div?

**Classify the layer.** It is a component instance when its subtree carries
instance-prefixed ids: its own id starts with `I`, **or** any descendant id
starts with `I<layerId>;` (layer `2159:2941` with child `I2159:2941;1:12476` is
an instance). No `I`-ids anywhere in the subtree → plain frame → hand-roll a
div, even if the layer is named like a component. A frame named `CountBadge`
with no `I`-children is not a `<Badge>`.

**Resolve an instance through `kit.json → figmaComponents`:**

| registry status | action |
|---|---|
| `implemented` | kit component; detect the variant from **token names** in the MCP output (`--button-ghost-*` → ghost), never from the layer name |
| variant `shim` | kit component with the base variant + shim class from `src/shims/button-variants.module.css` — table in `Button.kit.md` → "Unimplemented variants" |
| `tokens-only` | stub from `src/shims/<Component>/`; create it if missing — its CSS must use the component's own token family (`card-*`, `chip-*`) |
| `missing` / absent | hand-roll + mandatory drift-report entry |

**Never hand-roll a `<button>` for a Button instance** — every Figma Button
variant resolves to a kit `<Button>`, directly or via shim.

**Plain frames too:** before styling a hand-rolled frame with generic semantic
tokens, check `tokens.txt` for a family named after the pattern (`card-*`,
`chip-*`). If one exists, use it — that is what makes the future kit migration
a grep instead of a restyle. Use the `REF`/`LIGHT`/`DARK` columns to confirm the
swap is visually identical (`card-padding-sm  comp  spacing-4  16px  16px` — same
pixels, better name); a family member whose value differs from what Figma drew is
a real mismatch, so keep the Figma value and report it.

### 2b. Which `Typography` variant?

Figma text styles and `Typography` variants use different naming schemes —
`Display/MD` is **not** `display`. Use the lookup table in
`.ai-kit/Typography.kit.md` → *"Figma text style → variant"*. Never map by name
similarity, never map by eye.

### 2c. What becomes its own component?

A Figma layer becomes a co-located component when **either**:
- its name is PascalCase / named (not `Frame`, `Group`, `Rectangle`), **and** it has its own background, border or padding; **or**
- it repeats two or more times on the page.

One Figma layer name = **one** component file. Differences between instances are
**props**, not extra files (`TaskCard` with `variant="completed"`, not
`TaskCard` + `CompletedTaskCard`).

Empty directories already present under `src/pages/<PageName>/` are a
decomposition hint left for you — fill them, do not investigate their git history.

### 2d. Icons

The kit ships **no** icons (`kit.json` → `invariants.shipsIcons: false`). Author
them in `src/pages/<PageName>/icons.tsx` per `invariants.iconSpec`. Never install
or import an icon library.

### 2e. Repeated layers — diff ALL instances before writing the component

When a layer name repeats (`TaskCard` ×5), do **not** write the component from
the first instance you see. Build a signal matrix across every instance first —
all of them are already in the Step 1 code blob, this costs zero extra calls:

| signal | inst 1 | inst 2 | inst 3 |
|---|---|---|---|
| Checkbox child present | ✓ | — | ✓ |
| Badge child present | ✓ | ✓ | — |
| title has `line-through` | — | — | ✓ |
| border is `--accents-brand` | — | ✓ | — |

Every differing column becomes a **prop** (`checked`, `badge?`, `isActive`,
`variant="completed"`) — never an extra file, and never silently dropped.
A child missing from an instance means the prop makes it optional, not that
the component always renders it.

Text-decoration classes (`line-through`, `uppercase`, `underline`) and border
overrides in the Figma output are part of the design exactly like tokens —
carry each into CSS. A past run dropped a `line-through` and shipped a checkbox
the mockup didn't have; both were visible in the code blob the whole time.

## Step 3 — output structure

- Pages live in `src/pages/<PageName>/`
- Every component is exactly two files: `<Name>.tsx` + `<Name>.module.css`
- Sub-components nest in their own folder: `KanbanBoard/TaskCard/TaskCard.tsx`
- The page file **only composes** — no layout or styling logic in it
- Render the finished page from `src/App.tsx`
- **Write every file of the page in ONE parallel batch** — they are independent;
  serial writes were the second-largest time cost in past runs (~7 wasted round
  trips). The only serial follow-up is `App.tsx` (Read → Edit).

## Step 4 — coding rules

1. **Only `@monorepo/ui-kit` components.** No plain HTML for anything the kit covers.
2. **Every text node → `<Typography>`.** Never raw text, never bare `<p>/<h1>/<span>`.
3. **CSS values → only `var(--token)`.** No hardcoded colours, fonts, sizes, radii or spacing.
4. **Every token name must exist verbatim in the `NAME` column of `.ai-kit/tokens.txt`.**
   Normalise what Figma emits — `/` → `-` **and** `.` → `-`:
   `var(--neutrals\/surface)` → `var(--neutrals-surface)`;
   `var(--spacing\/1.5)` → `var(--spacing-1-5)`.
   Inventing a plausible-looking name is the single most common failure — it
   compiles, runs, and silently renders nothing.
5. **All kit components accept `className`** and spread remaining props
   (`kit.json` → `invariants`). Use `className` to attach layout from your own
   module; never wrap a kit component in a div purely to position it.
6. **Figma tool:** only `mcp__figma-desktop__*`. Never the remote Figma MCP tools.

## Step 5 — verify (do not skip)

Run all four, in order:

```bash
npx tsc --noEmit                                               # 1. types
node .ai-kit/bin/check-tokens.mjs src/pages/<PageName>         # 2. tokens (page)
node .ai-kit/bin/check-tokens.mjs src/shims                    # 2b. tokens (only if the page uses shims/stubs)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/  # 3. already running?
npm run dev                                                    #    only if step 3 failed
```

`check-tokens` has three distinct failure modes — read which one you got:
- **`tokens.txt is STALE`** → the manifest is behind the ui-kit. Run
  `node .ai-kit/bin/gen-tokens.mjs` and re-check. **Do not touch your CSS.**
- **`UNKNOWN TOKEN: --x`** → that name does not exist in the ui-kit. Fix your CSS.
- **`HARDCODED VALUE`** → a raw px/hex slipped into the CSS. Replace it with a
  token; only when no token exists, keep it with a same-line
  `/* off-system: <reason> */` marker — which must then appear in the drift report.

<!--
4. (disabled — visual check is left to the user for live demos; re-enable if
   unattended verification is needed again)
   Screenshot `http://localhost:5173/` and compare against the Figma screenshot
   from Step 1. `tsc` cannot see a wrong token and the dev server will not error
   on one — this visual diff plus `check-tokens` are the only detectors.

   Exact browser recipe — screenshot is an **action of the `computer` tool**,
   there is no standalone screenshot tool (a past run burned 6 calls hunting
   for one):
   1. ONE ToolSearch: `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch`
   2. `tabs_context_mcp {createIfEmpty: true}` → get tabId
   3. ONE `browser_batch`: navigate → wait 2s → `computer {action: "screenshot"}`

   Compare **per repeated component using the 2e matrix**, not the whole page at
   once: for each differing signal (strikethrough, brand border, child presence)
   check it in both images; `computer {action: "zoom"}` on a card when unsure.
   Whole-page eyeballing has passed a missing `line-through` before.
-->

Visual verification against the Figma screenshot from Step 1 is left to the
user — do not open Chrome or take screenshots as part of this skill. State in
the final report that `tsc` + `check-tokens` passed and that visual review
is pending the user's own check against the Step 1 screenshot.

Then report what was built, what verification passed, and the drift — **typed**:

- **shims used** — Figma variants routed through `src/shims/button-variants.module.css`;
- **stubs used/created** — `tokens-only` components rendered via `src/shims/<Component>/`;
- **off-system** — every `/* off-system: … */` marker in the CSS, with its reason;
- **hand-rolled** — instance layers that matched nothing in the registry.

"Drift: none" is only true when all four lists are empty. Do not silently
paper over a mismatch.

## Available components

`Button` · `ButtonGroup` / `ButtonGroupItem` · `Typography` · `Input` · `Checkbox` · `Avatar` · `Badge`

Full props, variant/size/state mappings and tokens: `.ai-kit/<ComponentName>.kit.md`.

For a pattern the kit does not cover, check `kit.json → figmaComponents` first:
- `tokens-only` (Card, Chip): use the stub in `src/shims/<Component>/` — create
  it if missing, styled strictly with its own token family (`card-*`, `chip-*`).
- Absent from the registry: build a co-located page component under the same
  two-file rule, and add a drift-report entry.

## Maintenance

`.ai-kit/tokens.txt` is generated and is a pure function of the ui-kit CSS — never
hand-edit it. That CSS is in turn generated from the Figma variables, so the
manifest is the code-side view of the Figma token set: one row per Figma variable,
with the tier (`sem`/`comp`/`prim`/`color`/`type`) mirroring the Figma collection
it came from. Step 0 refreshes it automatically, so normally there is nothing to do.
To refresh or audit it manually:

```bash
node .ai-kit/bin/gen-tokens.mjs           # write it
node .ai-kit/bin/gen-tokens.mjs --check   # exit 1 + names if stale, writes nothing
```
