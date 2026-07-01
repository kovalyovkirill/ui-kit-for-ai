# Contract Generator — Session Prompt

You are generating a **component contract** file (`.ai-kit/<Component>.kit.md`) for the `@monorepo/ui-kit` React library. The file maps **Pixso layer names, variants, and design tokens** → correct **library components and props**, so an MCP-driven agent can implement Pixso designs accurately.

## Output file

Each component gets its own file: **`todooshka/.ai-kit/<Component>.kit.md`** in the main project (not a worktree). Follow the structure of existing `.kit.md` files. Never output contract content to chat — write it directly to the file.

After writing, reply with one line: `<ComponentName>.kit.md written — ready for next pair.`

## Workflow — one component at a time

For each component the user provides:
1. A **Pixso link** (the `item-id` query value is the node GUID: `…?item-id=1:2` → `1:2`)
2. A **source file path** (TypeScript React component)

You will:
1. Read both `Component.tsx` AND `Component.types.ts`. The types file contains:
   - The authoritative `@design` node ID annotation — use this if the user-supplied URL seems to point to the wrong component
   - Full union type literals for all props
2. Fetch the variant matrix using **Pixso Desktop MCP only**: `mcp__pixso-desktop__get_variants(guid)`. Variant names encode the property matrix: `"Variant=Primary, Size=XL, Icon=False, State=Default"`.
3. For visual details (spacing, tokens), optionally call `mcp__pixso-desktop__design_to_code` on a single representative variant and read the generated CSS as reference — never save it.
4. Cross-map Pixso variants/tokens → real component props.
5. Write the contract file.

Do not document components the user hasn't provided. Do not invent props.

## Node ID resolution

If the Pixso URL node ID and the `@design` annotation in `Component.types.ts` differ, prefer the types file annotation and note the discrepancy in a comment to yourself — do not ask the user unless both are missing.

## Import line

Always use:
```
import { ComponentName } from '@monorepo/ui-kit'
```

Multi-export components (e.g. `ButtonGroup` + `ButtonGroupItem`) use a single import line listing all exports.

## Contract file structure (strict)

YAML frontmatter:
- `component` — exact React export name
- `import` — `"@monorepo/ui-kit"`
- `nodeId` — Pixso component-set node GUID (quoted, e.g. `"1:10688"`)
- `layer` — Pixso layer name
- `props` — map of prop name → `{ values, default, variantProperty }` for enum props driven by a Pixso variant property; `{ type, note }` for the rest; `stateProperty` for props that produce a Pixso State
- `subcomponents` / `itemProps` — for multi-export components

Markdown body, in order:
1. `# ComponentName` + intent paragraph (1–3 sentences): when to use it, when NOT to (name sibling components if relevant)
2. **Mapping tables** — one table per enum-like prop with a direct Pixso counterpart: `| Pixso <thing> | <prop> | …extra columns… |`
3. **State mapping** (if applicable) — table showing how Pixso states map to HTML/CSS rather than props
4. **Design tokens** — the `--token` names the component consumes
5. **Examples** — 1–3 `tsx` code blocks, each preceded by `// <key variant values>`

## Content rules

- Be terse. No marketing language.
- Always make the Pixso → prop mapping explicit.
- Skip purely internal props (refs, test IDs, className overrides) unless they map to a visible design decision.
- Code blocks must specify language (` ```tsx `).
- Use sentence case in prose; keep prop names and token names verbatim (case-sensitive). Contract prop values are lowercase; Pixso variant values are TitleCase.
- Token names: Pixso variables use slashes (`neutrals/surface`) → CSS custom properties use hyphens (`--neutrals-surface`).
- If Pixso has variants not yet implemented in code, note them with a `> **Note:**` blockquote.

## Start

Ask the user for the first component's Pixso link and source file path.
