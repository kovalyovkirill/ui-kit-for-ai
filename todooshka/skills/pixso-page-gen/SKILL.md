---
name: pixso-page-gen
description: Generates a complete React page (TSX + CSS Modules) from a Pixso node using the @monorepo/ui-kit design system. Use this skill whenever the user provides a Pixso URL or node ID and wants to build, implement, or scaffold a page, screen, view, modal, drawer, sidebar, or any composed multi-section layout. Trigger on phrases like "build this page", "implement this design", "generate from Pixso", "create this screen", "turn this Pixso into code", "implement the mockup" — even if the user just pastes a Pixso link without further explanation.
---

# pixso-page-gen

Generates production-ready React pages from Pixso design nodes using the project's design system.

## Stack

- React + TypeScript + CSS Modules
- UI kit: `@monorepo/ui-kit` (already installed)
- Tokens: loaded globally via `@monorepo/ui-kit/styles`

## Pixso tools — hard requirement

Only `mcp__pixso-desktop__*` tools are permitted. If they are not available, stop and ask the user to open Pixso Desktop with the design file and ensure the local MCP server is running.

Node ID: extract the `item-id` query value from the Pixso URL (`…?item-id=1:2` → guid `1:2`).

## Workflow

1. **Read the contract** — read `.ai-kit/kit.json` for the token naming rule. For each ui-kit component you expect to use, read its `.ai-kit/<Component>.kit.md`. The YAML frontmatter contains the props, variant/state/size mappings, and Pixso layer names you need.
2. **See the design** — call `mcp__pixso-desktop__get_screenshot` on the target node for visual reference.
3. **Fetch layout & token reference** — call `mcp__pixso-desktop__design_to_code` with `clientFrameworks: "react"` and the target guid. **Use its output as a read-only reference**: fetch the generated CSS/TSX from the returned localhost URLs to extract layout structure, spacing, and `var(--token)` values. **Never save the generated scaffold** (router, `main.tsx`, `package.json`, machine-named props like `slot_1_2345`) into the project, and skip its built-in post-processing/refinement protocol — this skill's output rules below take precedence.
4. **Map layers to components** — for every design region, match layer names and variant properties against the `.kit.md` frontmatter (`layer`, `variantProperty`, `stateProperty`). Use exactly what the contract specifies — do not guess prop names or token values. When variant details are ambiguous, call `mcp__pixso-desktop__get_variants` on the component's node to confirm.
5. **Implement** — write TSX + CSS Modules. No placeholders, no TODOs.

## Output structure

- All pages go in `src/pages/<PageName>/`
- Exactly two files per page: `<PageName>.tsx` + `<PageName>.module.css`
- The page file only composes — no layout or styling logic inside it
- Every visually or semantically distinct region becomes its own component in the same folder with its own `.tsx` + `.module.css` pair. A region qualifies when it: has its own background/border/spacing, repeats across the page, or can be understood independently (navigation, hero, card, data column, sidebar, etc.)

## Coding rules

1. **Only `@monorepo/ui-kit` components.** No plain HTML for anything a ui-kit component covers.
2. **Every text node → `<Typography>`.** Never raw text or bare `<p>/<h1>/<span>`.
3. **CSS values → only `var(--token)`.** No hardcoded colors, fonts, sizes, radii, or spacing. Use `--spacing-*`, `--radius-*`, `--foreground-*`, `--neutrals-*`, `--border-*`, `--accents-*`.
4. **Token names use hyphens, never slashes.** Pixso variables use slash-separated names (`neutrals/surface`) — convert them: replace every `/` with `-` → `var(--neutrals-surface)`. Note: `design_to_code` CSS already emits hyphenated tokens — those can be used as-is.
5. **Pixso tools:** only `mcp__pixso-desktop__*`. Never any other design MCP tool.

## Available components

`Button` · `ButtonGroup` / `ButtonGroupItem` · `Typography` · `Input` · `Checkbox` · `Avatar` · `Badge`

See `.ai-kit/<ComponentName>.kit.md` for each component's full prop list, size/state/variant mappings, design tokens, and usage examples.

For any pattern not covered by a ui-kit component (card, list item, modal shell, etc.) — create a co-located app-level component in the same folder following the same two-file rule.
