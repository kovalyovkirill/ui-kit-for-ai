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

## Workflow

1. **Read the contract** — read `.ai-kit/kit.json` for the token naming rule. For each ui-kit component you expect to use, read its `.ai-kit/<Component>.kit.md`. The YAML frontmatter contains the props, variant/state/size mappings, and Figma layer names you need.
2. **Fetch the design** — call `mcp__figma-desktop__get_design_context` on the Figma node the user provided.
3. **Map layers to components** — for every Figma layer, match its name and variant properties against the `.kit.md` frontmatter (`figmaLayer`, `figmaVariant`, `figmaState`). Use exactly what the contract specifies — do not guess prop names or token values.
4. **Implement** — write TSX + CSS Modules. No placeholders, no TODOs.

## Output structure

- All pages go in `src/pages/<PageName>/`
- Exactly two files per page: `<PageName>.tsx` + `<PageName>.module.css`
- The page file only composes — no layout or styling logic inside it
- Every visually or semantically distinct region becomes its own component in the same folder with its own `.tsx` + `.module.css` pair. A region qualifies when it: has its own background/border/spacing, repeats across the page, or can be understood independently (navigation, hero, card, data column, sidebar, etc.)

## Coding rules

1. **Only `@monorepo/ui-kit` components.** No plain HTML for anything a ui-kit component covers.
2. **Every text node → `<Typography>`.** Never raw text or bare `<p>/<h1>/<span>`.
3. **CSS values → only `var(--token)`.** No hardcoded colors, fonts, sizes, radii, or spacing. Use `--spacing-*`, `--radius-*`, `--foreground-*`, `--neutrals-*`, `--border-*`, `--accents-*`.
4. **Token names use hyphens, never slashes.** Figma MCP outputs slash-escaped names — convert them: `var(--neutrals\/surface)` → `var(--neutrals-surface)`. Rule: replace every `/` with `-`.
5. **Figma tool:** only `mcp__figma-desktop__get_design_context`. Never remote Figma MCP tools.

## Available components

`Button` · `ButtonGroup` / `ButtonGroupItem` · `Typography` · `Input` · `Checkbox` · `Avatar` · `Badge`

See `.ai-kit/<ComponentName>.kit.md` for each component's full prop list, size/state/variant mappings, design tokens, and usage examples.

For any pattern not covered by a ui-kit component (card, list item, modal shell, etc.) — create a co-located app-level component in the same folder following the same two-file rule.
