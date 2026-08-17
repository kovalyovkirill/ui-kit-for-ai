---
name: form-gen
description: Builds a working React form from an ADR that links a Figma mockup to an OpenAPI contract. Use this skill whenever the user points at a file in docs/adr/, mentions an ADR number, an operationId, or a contract in contracts/*.yaml, or asks to build/implement/wire a form, a create/edit screen, a dialog with fields, or anything that submits data to an endpoint. Trigger on phrases like "собери форму по ADR", "свёрстай форму", "build the form", "implement ADR 0001", "wire this form to the API", "форма создания задачи" — including when the user just names the ADR file.
---

# form-gen

Generates a page whose fields, types and validation come from an OpenAPI contract,
and whose appearance comes from a Figma mockup. The ADR is the only argument.

## What this skill does NOT own

Markup is `figma-page-gen`'s job and its rules are **not** repeated here. Read
`.claude/skills/figma-page-gen/SKILL.md` and follow its Step 2 (component /
shim / stub / hand-roll decisions, Typography lookup, icons, repeated-layer diff),
Step 3 (module layout) and Step 4 (coding rules, tokens) verbatim.

This skill adds one thing on top: **the form is bound to the contract, and no rule
from the contract is ever retyped by hand.**

## Step 0 — the ADR is the input

The user names an ADR (`docs/adr/0001-create-task-form.md`), a number, or an
`operationId`. If only a number or an operationId is given, glob `docs/adr/*.md`
and match on the filename prefix or the `operationId:` frontmatter field.

Its frontmatter is the whole job description:

| field | use |
|---|---|
| `figma` | the design node — may be the form itself **or the page containing it**, so resolve it in Step 0.5 before asking for code |
| `spec` | which contract the schema comes from |
| `operationId` | which request body applies |
| `output` | where the page goes |

Then, serially (it writes into the tree the next step reads):

```bash
npm run api
```

This regenerates `src/shared/api/tasks/` from the contract, so the schema you are
about to read is current. If it changes files, say so in the final report — they
will show up in git.

## Step 0.5 — narrow the node before asking for code

`figma` in the ADR may point at a whole page, not at the form. Resolve it with one
`mcp__figma-desktop__get_metadata` call — it returns structure only (ids, names,
sizes), no code, so it is cheap.

Pick the **smallest frame whose subtree contains every field the request schema
needs**. That test is derivable from the two sources you already have; it does not
depend on anyone's naming.

**Never identify the form by layer name.** Designer naming is arbitrary and often
misspelled — in this very file the form frame is `CreateFrom` (typo of Form), the
priority label reads `Преоритет`, and the text layer holding it is named just
`Label`. A name match looks like it works until the next mockup.

If two sibling subtrees both qualify (a page with two forms), **stop and ask which
one** — do not guess. State the resolved node id in the final report.

Narrowing is worth doing even when the link already looks precise: `get_design_context`
on a whole page returns far more code than the form needs, and a large frame can
trip the metadata-only fallback and cost an extra round trip. The metadata also
gives the frame's own `width`, which is the honest source for a page-level
`max-width` (the code blob reports the form as `size-full`).

## Step 1 — one batch

Issue **all of these in a single response**:

- Read the ADR
- `mcp__figma-desktop__get_design_context` with `forceCode: true` on the node resolved in Step 0.5
- `mcp__figma-desktop__get_screenshot` on the same node
- Read `src/shared/api/index.ts` and `src/shared/api/tasks/zod.gen.ts`
- Read `.ai-kit/kit.json`, `.ai-kit/tokens.txt`, and **every** `.ai-kit/*.kit.md`

Do not write a file until it returns. Do not open `contracts/*.yaml` — every rule
in it is already in `zod.gen.ts`, in the form you will actually use. Reading the
yaml only invites retyping its constraints into JSX, which is the one thing this
skill exists to prevent.

## Step 2 — the schema decides the fields, the ADR decides the mapping

Take the request schema for `operationId` from `zod.gen.ts`
(`createTaskRequestSchema` for `createTask` — `<camelCasedSchemaName>Schema`).

- **Fields come from the schema**, in its order. A field in the mockup with no
  property in the schema, or a `required` property with no field in the mockup, is
  a **drift report entry**, not something to quietly resolve.
- **Which layer is which property comes from the ADR's Binding table.** Never infer
  it from a label — labels are Russian, properties are English, and the ADR exists
  precisely because that mapping is not derivable.
- **Enum labels come from the ADR too** (Высокий → `high`). Put the map in
  `model/<field>.ts`, keyed by the schema's enum values so a new value on the
  backend breaks the build instead of rendering blank.

If a schema you need is not exported from `src/shared/api/index.ts`, **widen that
barrel** — add the export there and import from `…/shared/api`. Never import from a
`*.gen` path.

## Step 3 — where the form lives

Page layout is `figma-page-gen` Step 3. Form-specific placement:

```
model/use<PageName>Form.ts   ← useForm + resolver + submit
model/<field>.ts             ← label↔value maps for enums
components/<Field>/          ← presentational only: value, onChange, error in props
```

`components/` never imports from `shared/api` and never sees the schema. The hook in
`model/` is the only place that knows a contract exists.

## Step 4 — binding rules

1. **Validation comes from the schema, always:**
   ```ts
   const form = useForm<z.input<typeof xSchema>, unknown, z.output<typeof xSchema>>({
     resolver: zodResolver(xSchema),
     defaultValues: { … },
   })
   ```
   Three generics, not one: a property with a `default` is optional on input and
   guaranteed on output, so `z.input` ≠ `z.output`. With one generic either
   `defaultValues` rejects the missing property or `handleSubmit` hands you
   `undefined`.
2. **Never restate a constraint the schema carries.** No `maxLength`, `required`,
   `pattern`, `min`/`max` on an input, and no hand-written regex — the resolver
   already enforces every one of them. This is the single rule that keeps the form
   from drifting when the backend changes the contract.
3. **Error text is chosen in one place.** A `keyword → message` map in
   `model/`, not a string per field. `zod` gives the issue code; the map turns it
   into Russian.
4. **Server-side `422`** is a different source from the schema: parse it with
   `validationErrorSchema` and route each entry to its field by `errors[].field`,
   which equals the property name.
5. **The submit button's disabled state comes from `formState`**, never from a
   hand-rolled "are all fields filled" check.
6. **A control that is not a native input binds through `Controller`**, not through
   `watch` + `setValue`. `register` only covers things that emit DOM events;
   `ButtonGroup`, custom pickers and toggles need `Controller` so the field is
   actually registered and participates in validation and dirty state.
7. **Render the submit failure.** `setError('root', …)` with nothing displaying it
   turns a dead network into "the button doesn't work" — a real defect found in the
   browser on the first run of this skill. The mockup will not contain this element;
   add it anyway and note it in the report.

## Step 5 — verify

One chained call:

```bash
npx tsc --noEmit \
  && node .ai-kit/bin/check-tokens.mjs src/pages/<PageName> \
  && npm run api:check
```

`api:check` regenerates and diffs — it catches a hand-edit of the generated folder.
Note it only reports on tracked files, so a freshly generated folder that is still
untracked passes vacuously.

`.ai-api/bin/check-form.mjs` (schema ↔ markup, both directions) is **not written
yet**. Until it is, walk the list by hand and state the result explicitly:

- every `required` property of the schema is rendered as a field;
- every input in the page maps to a property that exists in the schema;
- no constraint from the schema is duplicated in the JSX;
- every enum value in the schema is reachable in the UI.

Visual comparison against the Step 1 screenshot is left to the user, as in
`figma-page-gen`.

## Report

Everything `figma-page-gen` asks for (shims used, stubs used/created, off-system
values, hand-rolled layers), plus:

- **contract drift** — mockup fields absent from the schema, and `required`
  properties absent from the mockup;
- **barrel changes** — exports added to `src/shared/api/index.ts`;
- **the four checks above**, each stated as passed or failed.

Multiline fields use the kit's `Textarea` (`implemented` in `kit.json`, contract in
`.ai-kit/Textarea.kit.md`) — do not hand-roll a `<textarea>` and do not build a stub.
