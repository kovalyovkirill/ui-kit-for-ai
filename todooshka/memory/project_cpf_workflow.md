---
name: CPF Generator workflow
description: Rules and gotchas for the Component Props Reference generation workflow in this repo
type: project
---

CPF output file is `todooshka/docs/figma-mcp-reference.md` in the **main project** (not any worktree).

**Why:** First session created the file in the worktree by mistake; user couldn't see it in the editor.

**How to apply:** Always write/append to the absolute path under the main project, not under `.claude/worktrees/`.

---

Import path for all ui-kit components is `@monorepo/ui-kit`.

**Why:** Session corrected from `@ui-kit/components/X` — single barrel export.

---

Always read both `Component.tsx` AND `Component.types.ts`. The types file contains the authoritative `@figma` node ID annotation and full union type literals.

**Why:** User sometimes provided incorrect Figma URLs; the `@figma` annotation in the types file was the reliable source.

---

When `get_design_context` returns metadata-only (frame too large), extract the variant matrix from symbol `name` attributes — do not make recursive sub-calls.

**Why:** Node `1:10688` (Button showcase frame) returned only symbol metadata. Sub-calls were not needed; all variant/size/state combinations were readable from symbol names.

---

CPF prompt is stored at `todooshka/docs/cpf-prompt.md` for reuse in future sessions.
