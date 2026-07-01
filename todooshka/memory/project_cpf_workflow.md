---
name: Contract Generator workflow
description: Rules and gotchas for the .ai-kit contract generation workflow in this repo (Pixso MCP)
type: project
---

Contract output goes to `todooshka/.ai-kit/<Component>.kit.md` in the **main project** (not any worktree).

**Why:** First session created output in the worktree by mistake; user couldn't see it in the editor.

**How to apply:** Always write to the absolute path under the main project, not under `.claude/worktrees/`.

---

Import path for all ui-kit components is `@monorepo/ui-kit`.

**Why:** Session corrected from `@ui-kit/components/X` — single barrel export.

---

Always read both `Component.tsx` AND `Component.types.ts`. The types file contains the authoritative `@design` node ID annotation (Pixso URL with `item-id`) and full union type literals.

**Why:** User sometimes provided incorrect design URLs; the annotation in the types file was the reliable source.

---

Design source is **Pixso Desktop MCP** (`mcp__pixso-desktop__*`). The library was imported from Figma — **node IDs were preserved** (Figma `node-id=1-6908` = Pixso `item-id=1:6908`), variables kept slash naming (`neutrals/surface`), so `tokenRule: slash-to-dash` still applies.

`mcp__pixso-desktop__get_variants(guid)` on a component-set node returns the full variant matrix as names like `Variant=Primary, Size=XL, Icon=False, State=Default` — no large-frame fallback needed (unlike the old Figma `get_design_context` metadata-only issue).

`design_to_code` returns a whole project scaffold via temporary localhost URLs with machine-named props (`slot_1_2345`) — use its CSS only as a read-only token/layout reference, never save it.

---

Contract prompt is stored at `todooshka/docs/cpf-prompt.md` for reuse in future sessions.
