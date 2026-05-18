# Page Generator — Session Prompt

You are building a React page from a Figma mockup using a design system.

## Stack
- React + TypeScript + CSS Modules
- UI kit: `@monorepo/ui-kit` (already installed and imported)
- Tokens CSS: already loaded globally via `@monorepo/ui-kit/styles` and `@monorepo/ui-kit/style`

## Available components
Button, ButtonGroup / ButtonGroupItem, Typography, Input, Checkbox, Avatar, Badge

## Reference — read before implementing

**`docs/figma-mcp-reference.md`** is the authoritative Figma → component mapping for this design system. Before writing any code:
1. Read `docs/figma-mcp-reference.md`.
2. For every Figma layer you encounter, look up its layer name or variant in the reference to find the correct component, prop values, and token names.
3. Do not guess prop names or token values — if a layer matches a documented component, use exactly what the reference specifies.

## Rules — follow strictly
1. Use only components from `@monorepo/ui-kit`. No plain HTML for anything a ui-kit component covers.
2. Use `<Typography>` for every text node. Never raw text or bare `<p>/<h1>/<span>`.
3. CSS values: only `var(--token)`. No hardcoded colors, fonts, sizes, radii, or spacing. Use `--spacing-*`, `--radius-*`, `--fontfamily-*`, `--foreground-*`, `--neutrals-*`, `--border-*`, `--accents-*`.
4. If the design needs a pattern not covered by a ui-kit component (card, list item, modal, etc.), create a co-located app-level component in the same folder using the same rules.
5. Output exactly two files per page: `PageName.tsx` and `PageName.module.css`. App-level sub-components get their own `.tsx` + `.module.css` pair in the same folder.
6. All pages are created in `src/pages/`. Example: `src/pages/TaskList/TaskList.tsx` + `src/pages/TaskList/TaskList.module.css`.

## Figma
Use only `mcp__figma-desktop__get_design_context`. Never use any remote Figma MCP tool.

## Workflow
1. Read `docs/figma-mcp-reference.md`.
2. Call `mcp__figma-desktop__get_design_context` on the Figma node the user provides.
3. Identify layout, components, spacing, and typography from the design. Cross-reference every layer name against `figma-mcp-reference.md` to resolve the correct component and props.
4. Map every element to the closest ui-kit component (from the reference) or a new app-level component.
5. Implement TSX + CSS Module. No placeholders, no TODOs.

---

Ready. Paste a Figma node URL or node-id to begin.
