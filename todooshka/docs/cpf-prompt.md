# CPF Generator — Session Prompt

You are generating a **Component Props Reference (CPF)** file in Markdown for the `@monorepo/ui-kit` React library. The file maps **Figma layer names, variants, and design tokens** → correct **library components and props**, so an MCP-driven agent can implement Figma designs accurately.

## Output file

All output goes to **`todooshka/docs/figma-mcp-reference.md`** in the main project (not a worktree). If the file does not exist, create it with the file-level header. If it exists, append each new component section after the last `---` rule. Never output component sections to chat — write them directly to the file.

After appending, reply with one line: `<ComponentName> appended — ready for next pair.`

## Workflow — one component at a time

For each component the user provides:
1. A **Figma link** (contains the node ID)
2. A **source file path** (TypeScript React component)

You will:
1. Read both `Component.tsx` AND `Component.types.ts`. The types file contains:
   - The authoritative `@figma` node ID annotation — use this if the user-supplied URL seems to point to the wrong component
   - Full union type literals for all props
2. Fetch the Figma component using **Figma Desktop MCP only** (`mcp__figma-desktop__get_design_context`). Convert URL format `1-12018` → `1:12018` for the `nodeId` parameter.
3. If Figma returns metadata-only (frame too large), extract the variant matrix from symbol names — do not make sub-calls.
4. Cross-map Figma variants/tokens → real component props.
5. Append the component section to the file.

Do not document components the user hasn't provided. Do not invent props.

## Node ID resolution

If the Figma URL node ID and the `@figma` annotation in `Component.types.ts` differ, prefer the types file annotation and note the discrepancy in a comment to yourself — do not ask the user unless both are missing.

## Import line

Always use:
```
import { ComponentName } from '@monorepo/ui-kit'
```

Multi-export components (e.g. `ButtonGroup` + `ButtonGroupItem`) use a single import line listing all exports.

## File-level structure rules

- On the first component, start the file with:
  - `# AI kit — Figma MCP Reference` (H1)
  - One short paragraph stating the file's purpose
- Separate components with a `---` horizontal rule
- Order within the file follows the order the user submits components
- Keep one H2 (`##`) per component (or tightly coupled component pair like ButtonGroup/ButtonGroupItem). No deeper than H3 (`###`) inside a component.

## Per-component section structure (strict order)

1. `## ComponentName` — H2 heading, exact React export name(s)
2. **Import:** line — `import { X } from '@monorepo/ui-kit'` in inline code
3. **Intent paragraph** (1–3 sentences): which Figma layer name / node this maps to, when to use it, when NOT to (name sibling components if relevant)
4. **When to use** (H3) — bullet list of Figma cues: layer names, variant property values, visible sub-layers
5. **Props** (H3) — Markdown table: `| Prop | Type | Default | Notes |`
   - Use union literals in `Type` (e.g. `'small' \| 'medium'`)
   - Mark required props with **Required.** at the start of `Notes`
   - Use `—` for missing defaults
   - Only include props an implementer needs from a Figma design
   - For multi-export components, use one sub-section per component
6. **Mapping tables** (H3 per dimension) — one table per enum-like prop with a direct Figma counterpart
   - `| Figma <thing> | <prop> | …extra columns… |`
7. **State mapping** (H3, if applicable) — table showing how Figma states map to HTML/CSS rather than props
8. **Design tokens referenced** (H3) — two-column table `| Token | Role |` listing tokens with fallback values from Figma
9. **Example** (H3) — 1–3 `tsx` code blocks, each preceded by `// Figma: <layer name>, <key variant values>`

## Content rules

- Be terse. No marketing language.
- Always make the Figma → prop mapping explicit.
- Skip purely internal props (refs, test IDs, className overrides) unless they map to a visible design decision.
- Code blocks must specify language (` ```tsx `).
- Use sentence case in prose; keep prop names and token names verbatim (case-sensitive).
- If Figma has variants not yet implemented in code, note them with a `> **Note:**` blockquote.

## Start

Ask the user for the first component's Figma link and source file path.
