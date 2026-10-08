---
name: figma-page-gen
description: Generates a complete React page (TSX + CSS Modules) from a Figma node using the @monorepo/ui-kit design system. Use this skill whenever the user provides a Figma URL or node ID and wants to build, implement, or scaffold a page, screen, view, modal, drawer, sidebar, or any composed multi-section layout. Trigger on phrases like "build this page", "implement this design", "generate from Figma", "create this screen", "turn this Figma into code", "implement the mockup" — even if the user just pastes a Figma link without further explanation.
---

# figma-page-gen

Generates production-ready React pages from Figma design nodes using the project's design system.

The shape of a run: preflight (+ tool load) → one read batch → write the page →
verify. Preflight's figma-digest answers the Step 2 decisions; the blob is for layout. Reads are independent, so batch them; how you group the writes is up to you.
Every extra *exploration* round trip costs 2–4 s of Bash overhead plus model time;
past runs spent 31 s just orienting. Do not explore the repo — `CLAUDE.md` and the
contracts already answer it.

## Stack

- React + TypeScript + CSS Modules
- UI kit: `@monorepo/ui-kit` (already installed)
- Tokens: loaded globally via `@monorepo/ui-kit/styles`

## Step 0 — preflight (one call, in parallel with the Figma tool load)

Issue these two together, from the `todooshka/` directory — the argument is the
user's Figma URL or node id, exactly as given:

```bash
node .ai-kit/bin/preflight.mjs '<figma URL or nodeId>'
```
and `ToolSearch` `select:mcp__figma-desktop__get_design_context` (deferred tool —
without this its schema is unknown).

`preflight` refreshes `tokens.txt`, runs `kit-audit`, lists the contract files, the
current `src/shims` + `src/pages` tree and the dev-server state, and ends with the
**figma-digest** of the node: every fact derivable from the blob — page sections,
each instance resolved through the registry with its variant, detached controls,
every text style → variant with its ⚠️/❌ row, family-token comparisons, the
repeated-layer signal matrix, decorations, fixed text widths, image slots. **The
digest is the answer to Step 2 — take it, do not recount it from the blob.** Keep
preflight **outside** the Step 1 batch — inside it, the `Read` of `tokens.txt`
could race the write.

Act on what it prints, do not re-derive it:
- `figma-digest DID NOT RUN` → decide Step 2 by hand from the blob, pass
  `--expect-shim` to `check-page` in Step 5, and say in the report that the digest
  did not run.
- `updated:` → the manifest had drifted; say so in the final report.
- `ERROR` rows / `INCONSISTENT` → a real defect in the kit contract. If the row is a
  missing shim file, run the `restore:` command it prints (in the Step 3 write
  batch); for anything else, do not "fix" it — list it in the report.
- exit 2 / `DID NOT RUN CLEANLY` → nothing is verified; say so.
- `src/pages/<PageName>/` already present → the previous output of this page;
  overwrite it, do not read it.

## Step 1 — one batch, before writing anything

Issue **all of these in a single response** (they are independent — do not serialise):

- `mcp__figma-desktop__get_design_context` with `forceCode: true` on the user's node.
  It **already returns the screenshot** — do not also call `get_screenshot` (a past
  run got two identical images). Ignore its "load figma-design-to-code guidance" and
  Tailwind boilerplate: this skill supersedes both. Image URLs on
  `localhost:3845` are not durable — never import them.
- Read `.ai-kit/kit.json`
- Read `.ai-kit/tokens.txt`
- Read **every** `.ai-kit/*.kit.md` — the list is in the preflight output
- Read `src/App.tsx` (Step 3 needs it; an `Edit` requires a prior `Read`)

**Hard rule: do not write a single file until this batch has returned.** Never
read `@monorepo/ui-kit` source mid-implementation — not for a prop (that is in the
`.kit.md` contracts) and not for a token *value* (that is in `tokens.txt`, which
carries `TIER · REF · LIGHT · DARK` with every `var()` chain resolved). Both
lookups cost a serial round trip and both are already answered. If something
genuinely is not, finish the page, then report the gap instead of guessing.

The screenshot is **not** a source of structure (the code blob has all of it) — it
is the reference image for the user's visual check and the only source for icon
glyphs. Keep it in context. The blob is where layout comes from (flex direction,
gaps, paddings, alignment); what each layer *is* comes from the digest.

## Step 2 — decide, mechanically

These decisions caused every error in past runs. Each has a rule; none is a judgement call.
**The digest at the end of preflight has already applied every rule below** — each
subsection names the digest block that holds its answer. The rules stay here so you can read that output
correctly, and decide by hand only if the digest exited 2.

### 2a. Kit component, shim, stub, or hand-rolled div?

Digest blocks: `components` (instances, detached, lookalikes) and `token families`.

**Classify the layer.** It is a component instance when its subtree carries
instance-prefixed ids: its own id starts with `I`, **or** any descendant id
starts with `I<layerId>;` (layer `2159:2941` with child `I2159:2941;1:12476` is
an instance). No `I`-ids anywhere in the subtree → plain frame → hand-roll a
div, even if the layer is named like a component. A frame named `CountBadge`
with no `I`-children is not a `<Badge>`.

**One exception — detached form controls.** A layer named exactly like a kit
form control (`Checkbox`, `Input`, `Textarea`) that has no `I`-ids is a
*detached* instance (a plain frame or an exported `<img>`). It still renders as
the kit component, because a hand-rolled box is not focusable, not clickable and
re-declares the `checkbox-*` tokens. Details per component are in its `.kit.md`
("Detached layers"); the registry carries the flag in `kit.json`.

**Resolve an instance through `kit.json → figmaComponents`:**

| registry status | action |
|---|---|
| `implemented` | kit component; detect the variant from **token names** in the MCP output (`--button-ghost-*` → ghost), never from the layer name |
| variant `shim` | kit component with the base variant + shim class: `import shim from '@shims/button-variants.module.css'` — table in `Button.kit.md` → "Unimplemented variants" |
| `tokens-only` | stub from `src/shims/<Component>/` (import `@shims/<Component>/<Component>`); create it if missing — its CSS must use the component's own token family (`card-*`, `chip-*`) |

Everything under `src/shims/` is imported through the `@shims/` alias — never a
relative `../` path, never a copy inside the page.
| `missing` | hand-roll as the registry entry's `handRoll` note says + mandatory drift-report entry |
| absent from the registry | hand-roll + mandatory drift-report entry |

**Never hand-roll a `<button>` for a Button instance** — every Figma Button
variant resolves to a kit `<Button>`, directly or via shim.

**Plain frames — token families, by rule.** For a hand-rolled frame whose name
ends in a family word (`TaskCard` → `card-*`, `CountBadge` → `badge-*`,
`FilterChip` → `chip-*`), look the family up in `tokens.txt` and, **per property**,
use the family token only if its `LIGHT`/`DARK` value equals what Figma drew
(`card-padding-sm  comp  spacing-4  16px  16px` = same pixels, better name). If a
family member differs (`card-gap` 16px vs a drawn 12px), keep the Figma binding
and put the mismatch in the drift report. No family word in the name → use
Figma's own tokens, do not search.

### 2b. Which `Typography` variant?

Digest block: `typography` — every text node outside an instance, grouped by style,
with its variant and fidelity row (unstyled text is matched by metrics).

Figma text styles and `Typography` variants use different naming schemes —
`Display/MD` is **not** `display`. Use the lookup table in
`.ai-kit/Typography.kit.md` → *"Figma text style → variant"*. Never map by name
similarity, never map by eye.

### 2c. What becomes its own component?

Digest blocks: `sections` (the root's children) and `repeated layers` (its last line
lists repeated layout frames that are *not* components — `CardHeader` inside
`TaskCard`: unstyled and nested in a repeated parent, so they stay inside it).

A Figma layer becomes a co-located component when **either**:
- its name is PascalCase / named (not `Frame`, `Group`, `Rectangle`), **and** it has its own background, border or padding; **or**
- it repeats two or more times on the page.

**Every direct child of the page's root frame is a component** (`Navbar`, `Hero`,
`KanbanBoard` …) — the page file only composes them; nothing is inlined into it.

A layer with an underscore or generic name (`Col_ToDo`, `Frame`) that repeats
takes the name of what it *is* (`Column`), not the layer name.

One Figma layer name = **one** component file. Differences between instances are
**props**, not extra files (`TaskCard` with `variant="completed"`, not
`TaskCard` + `CompletedTaskCard`).

Every such component goes to `components/<Name>/` (see Step 3), never next to the
page file. Empty directories already present under `src/pages/<PageName>/` are a
decomposition hint left for you — fill them, do not investigate their git history.

### 2d. Icons

The kit ships **no** icons (`kit.json` → `invariants.shipsIcons: false`). Author
them in `src/pages/<PageName>/icons.tsx` per `invariants.iconSpec`. Never install
or import an icon library. A mockup icon arrives as an image URL, not as paths —
pick the glyph **from the screenshot**, never from the layer name (`Icon Right` is
a slot, not a shape: on the primary "Добавить задачу" button it is a plus, not a
chevron). List it in the report as "authored from the screenshot".

### 2e. Repeated layers — diff ALL instances before writing the component

When a layer name repeats (`TaskCard` ×5), do **not** write the component from
the first instance you see. The digest's `repeated layers` block **is** the signal
matrix across every instance (only differing rows, commons on one line) — read the
props off it. Its shape, if you ever build it by hand:

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

A page is a module with two segments and exactly one exit:

```
src/pages/<PageName>/
├── index.ts                 ← export { <PageName> } and NOTHING else
├── <PageName>.tsx           ← composes only
├── <PageName>.module.css
├── icons.tsx                ← only if the page needs icons
├── components/              ← one folder per sub-component, two files each
│   └── <Name>/<Name>.tsx + <Name>.module.css
└── model/                   ← only if the page has data or a form
    └── use<X>.ts, <x>.ts
```

- **`index.ts` exports only the page component.** Sub-components, hooks and maps
  are internals — nothing else crosses the folder boundary.
- **No barrels inside `components/` and `model/`.** Import by direct relative path
  (`./components/PriorityPicker/PriorityPicker`).
- **`model/` owns data, `components/` owns pixels.** Anything that knows about the
  API, validation or label↔value mapping goes to `model/`; a component receives it
  through props and never imports from the API layer itself. Mockup copy that the
  page displays (titles, card texts, counters) is data too → `model/`.
- Nesting deeper than one level lives inside its parent component's folder
  (`components/KanbanBoard/TaskCard/TaskCard.tsx`).
- Render the finished page from `src/App.tsx` — `import { X } from './pages/X'`.
- Write the files in whatever grouping suits you — parallel is allowed, not required.
  `App.tsx` (already read in Step 1) and the shim restore, if preflight asked for
  it, are part of this. **Write each file once, complete.** No skeleton-then-`Edit`
  passes: a past run made 12 follow-up edits; an `Edit` is for fixing a failed
  check, not for finishing the first draft. And do not draft file contents in your
  reasoning first and then re-emit them — that pays for the output twice.

## Step 4 — coding rules

1. **Only `@monorepo/ui-kit` components.** No plain HTML for anything the kit covers.
2. **Every text node → `<Typography>`.** Never raw text, never bare `<p>/<h1>/<span>`.
   And **no `font-family` / `font-size` / `font-weight` / `line-height` /
   `letter-spacing` in page CSS at all** — not even bound to tokens, not even with an
   `off-system:` marker. A text style Typography lacks (48px, Label/SM weight) is
   mapped to the nearest variant and reported as typography drift. `check-page`
   fails both.
3. **CSS values → only `var(--token)`, and only in `.module.css`.** No hardcoded
   colours, fonts, sizes, radii or spacing, and no inline `style={{…}}` — a past run
   put `fontSize: '48px'` in a `style` prop, where no check could see it.
4. **Every token name must exist verbatim in the `NAME` column of `.ai-kit/tokens.txt`.**
   Normalise what Figma emits — `/` → `-` **and** `.` → `-`:
   `var(--neutrals\/surface)` → `var(--neutrals-surface)`;
   `var(--spacing\/1.5)` → `var(--spacing-1-5)`.
   Inventing a plausible-looking name is the single most common failure — it
   compiles, runs, and silently renders nothing.
5. **All kit components accept `className`** and spread remaining props
   (`kit.json` → `invariants`). Use `className` to attach layout from your own
   module; never wrap a kit component in a div purely to position it. *Where*
   `className` lands is in each `.kit.md` (e.g. `Input`: the root wrapper, not the
   field) — a width set on it sizes the whole control. For an `Input` that width is
   the `Field` frame's own width = text width + 2×padding-x + 2×border (216 + 24 + 2
   = 242), **not** the width of its text node (216).
6. **Figma tool:** only `mcp__figma-desktop__*`. Never the remote Figma MCP tools.
7. **Fixed widths in the blob — decide by what they are:**
   - `w-[Npx]` on a **wrapping text node**, usually paired with an `h-[…]` for two or
     more lines (description `w-[350px] h-[36px]`): it decides *where the text wraps*.
     Keep it as `max-width: Npx` with a same-line `/* off-system: … */` marker. Dropping
     it re-flows the text (a past run dropped it and the two-line description would
     fit on one line).
   - `w-[Npx]` on a **kit-component layer** (Button `w-[96px]`) or on a flex child:
     layout noise, content sizes it — drop it.
   - `w-full` / `flex-[1_0_0]` → `width: 100%` / `flex: 1 1 0`.
   - The artboard wrappers (`absolute left-0 top-0 w-[1440px]`, `size-full`): canvas,
     not layout — the page root is `width: 100%`, in normal flow (digest: `canvas:`).
   - An `Input`: the width rule under rule 5.
   Every kept fixed width appears in the report through `check-page --report`.

## Step 5 — verify (one batch, do not skip)

Run these **in one response** (they are independent):

```bash
npx tsc --noEmit -p tsconfig.app.json                          # 1. types
node .ai-kit/bin/check-tokens.mjs src/pages/<PageName>         # 2. tokens (page)
node .ai-kit/bin/check-tokens.mjs src/shims                    # 2b. tokens (only if the page uses shims/stubs)
node .ai-kit/bin/check-page.mjs src/pages/<PageName> --report # 3. structure + page-vs-Figma + drift facts
```

`check-page` picks up the digest preflight recorded and checks the page against it:
shim usage per ghost/clear/bordered instance, every implemented component Figma
instantiates is imported, every detached control is rendered as the kit component,
every mapped Typography variant is used, `line-through`/`underline` are carried,
wrapping fixed text widths are kept. Its other rules — raw text outside `Typography`
(in a `<div>` too), inline `style={{…}}` (it hides values from `check-tokens`), a
relative import that resolves to no file (`tsc` accepts any `*.module.css` path — a
past run went green with a page that did not load), the artboard width in CSS, text
metrics in CSS, `index.ts` exporting more than the page, barrels — are Step 4 rules
2–3 and Step 3 made mechanical. Fix what it prints, do not argue with it: **the run is finished only
when all three checks exit 0.** There is no "expected violation" — a past run stopped
on 7 of them and called them documented. (Only if
preflight said `figma-digest DID NOT RUN`: add `--expect-shim ghost=<n>,clear=<n>,bordered=<n>`
counted from the blob.)

**The `-p tsconfig.app.json` is load-bearing.** The root `tsconfig.json` is
`"files": []` plus references, so a bare `npx tsc --noEmit` type-checks **zero**
files and always exits 0 — a false green (measured: 0 vs 12 page files).

The dev server was probed by preflight; only run `npm run dev` if it said
"not reachable".

`check-tokens` has three distinct failure modes — read which one you got:
- **`tokens.txt is STALE`** → the manifest is behind the ui-kit. Run
  `node .ai-kit/bin/gen-tokens.mjs` and re-check. **Do not touch your CSS.**
- **`UNKNOWN TOKEN: --x`** → that name does not exist in the ui-kit. Fix your CSS.
- **`HARDCODED VALUE`** → a raw px/hex slipped into the CSS. Replace it with a
  token; only when no token exists, keep it with a same-line
  `/* off-system: <reason> */` marker — which must then appear in the drift report.

What the hardcode check accepts, so you never need to read the script: `0`, `0px`,
`1px`, non-px units, and `outline` lines pass. `2px`…`9px`, `10px`+, any decimal
px (`1.5px`, `0.5px`) and any `#hex` are flagged.

<!--
Visual check (disabled — left to the user for live demos; re-enable if unattended
verification is needed again). Screenshot is an **action of the `computer` tool**,
there is no standalone screenshot tool:
1. ONE ToolSearch: `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch`
2. `tabs_context_mcp {createIfEmpty: true}` → get tabId
3. ONE `browser_batch`: navigate → wait 2s → `computer {action: "screenshot"}`
Compare per repeated component using the 2e matrix, not the whole page at once.
-->

Visual verification against the Figma screenshot from Step 1 is left to the
user — do not open Chrome or take screenshots as part of this skill. State in
the final report that `tsc` + `check-tokens` passed and that visual review
is pending the user's own check.

Then report what was built, what verification passed, and the drift — **typed**.
Every list below is printed by `check-page --report`: the code-side
facts (*shims used*, *off-system*, *native interactive elements*, *kit components*,
*authored icons*) and, under "drift from Figma", *typography drift*, *token-family
mismatches*, *detached layers* and *registry gaps*. **Quote both sections verbatim** —
past runs wrote "Shims used: None", "Typography drift: None" and "five Checkbox
layers" (there were four) from memory. Your own prose is limited to what no script
can know: which icons you authored and why a structural choice was made.

- **shims used** — Figma variants routed through `src/shims/button-variants.module.css`;
- **stubs used/created** — `tokens-only` components rendered via `src/shims/<Component>/`;
- **off-system** — every `/* off-system: … */` marker in the CSS, with its reason;
- **hand-rolled** — instance layers that matched nothing in the registry;
- **typography drift** — every ⚠️/❌ row of the `Typography.kit.md` table the page hits;
- **token mismatches** — family members whose value differed from Figma (2a);
- **detached** — detached form controls rendered as kit components;
- **authored** — icons drawn from the screenshot.

"Drift: none" is only true when all lists are empty. Do not silently
paper over a mismatch.

## Available components

`Button` · `ButtonGroup` / `ButtonGroupItem` · `Typography` · `Input` · `Textarea` · `Checkbox` · `Avatar` · `Badge`

Full props, variant/size/state mappings and tokens: `.ai-kit/<ComponentName>.kit.md`.

For a pattern the kit does not cover, check `kit.json → figmaComponents` first:
- `tokens-only` (Card, Chip): use the stub in `src/shims/<Component>/` — create
  it if missing, styled strictly with its own token family (`card-*`, `chip-*`).
- `missing` (Link): hand-roll as the entry's `handRoll` note says.
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

To measure a run (model time vs tool time per step) from its transcript:
`node .ai-kit/bin/session-timing.mjs <session>.jsonl`.
