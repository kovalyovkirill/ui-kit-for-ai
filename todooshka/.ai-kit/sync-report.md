# AI-kit sync report — 2026-08-11

## Summary
- Auditable components: 7
- Components queried in Figma: 7 (5 carry enum-shaped props; ButtonGroup and Typography have `props-in-scope=0`)
- Safe updates applied: 0
- Items needing attention: 0 new — 3 pre-existing shim-debt items unchanged

## Offline audit (verbatim)

`node .ai-kit/bin/gen-tokens.mjs` → `unchanged: .ai-kit/tokens.txt`

```
# kit-audit — derived facts, regenerate with: node .ai-kit/bin/kit-audit.mjs
# Every line below is read off disk. Do not restate it from memory.

## scope — a component is auditable only with BOTH a contract and an implementation

OK       Avatar        node=1:12442    props-in-scope=1
OK       Badge         node=1:12502    props-in-scope=2
OK       Button        node=1:10688    props-in-scope=2
OK       ButtonGroup   node=1:11314    props-in-scope=0
OK       Checkbox      node=1:11892    props-in-scope=1
OK       Input         node=1:12018    props-in-scope=1
OK       Typography    node=1:13098    props-in-scope=0

AUDITABLE COMPONENTS (7): Avatar Badge Button ButtonGroup Checkbox Input Typography
Query Figma for these and no others. A name absent here has no contract to
diff against, so any variant claim about it would be unfalsifiable.

## contract values vs ui-kit TypeScript unions (offline half of the diff)

OK       Avatar.size          figmaVariant=Size     [sm, md, lg, xl]
OK       Badge.variant        figmaVariant=Variant  [primary, secondary, bordered, danger, success, warning]
OK       Badge.size           figmaVariant=Size     [sm, md, lg]
OK       Button.variant       figmaVariant=Variant  [primary, secondary, link]
OK       Button.size          figmaVariant=Size     [sm, md, lg, xl]
OK       Checkbox.size        figmaVariant=Size     [sm, md, lg]
OK       Input.size           figmaVariant=Size     [sm, md, lg, xl]

in-scope props checked: 7

## kit.json registry vs disk

OK       Card          tokens-only, family "card-*" = 8 tokens, no kit component
OK       Chip          tokens-only, family "chip-*" = 21 tokens, no kit component

## shim debt — the only detector; tokens pre-exist the implementation

OK       Button.ghost      still shim — absent from ButtonVariant, ".ghost" present in src/shims/
OK       Button.bordered   still shim — absent from ButtonVariant, ".bordered" present in src/shims/
OK       Button.clear      still shim — absent from ButtonVariant, ".clear" present in src/shims/

open shim debt: 3

## summary

auditable components: 7
in-scope props:       7
registry entries:     9
open shim debt:       3
ERROR rows:           0
INFO rows:            0

RESULT: CONSISTENT
```

Exit code: 0

## Figma diff

Figma spells variants `Primary`/`XL`, contracts spell them `primary`/`xl` — that
casing difference is the documented mapping, not drift.

### Avatar — node 1:12442
- `size` (figmaVariant `Size`): Figma [SM, MD, LG, XL] · contract [sm, md, lg, xl] → match

### Badge — node 1:12502
- `variant` (figmaVariant `Variant`): Figma [Primary, Secondary, Bordered, Danger, Success, Warning] · contract [primary, secondary, bordered, danger, success, warning] → match
- `size` (figmaVariant `Size`): Figma [SM, MD, LG] · contract [sm, md, lg] → match

### Button — node 1:10688
Node exceeded the context limit and returned sparse metadata; variant values read
from the `<symbol name="Variant=…, Size=…, Icon=…, State=…">` attributes.

- `size` (figmaVariant `Size`): Figma [SM, MD, LG, XL] · contract [sm, md, lg, xl] → match
- `variant` (figmaVariant `Variant`): Figma [Primary, Secondary, Bordered, Clear, Link, Ghost] · contract [primary, secondary, link]
  - ⚠️ NEW_VALUE `bordered`, `clear`, `ghost` — **not new drift**: `ButtonVariant` is
    `'primary' | 'secondary' | 'link'`, so the audit produced no INFO row for them and
    they must stay out of the contract. They are the tracked shim debt below, already
    documented under "Unimplemented variants → shim" in `Button.kit.md`.
- Figma also carries the variant properties `Icon` (True/False) and `State`
  (Default/Hover/Active/Focus/Disabled). Neither is a `NEW_PROPERTY`: the contract
  covers them through non-variant props (`leftIcon` for `Icon=True`,
  `figmaState: Disabled` plus CSS pseudo-classes for `State`).

### Checkbox — node 1:11892
- `size` (figmaVariant `Size`): Figma [SM, MD, LG] · contract [sm, md, lg] → match
- Figma `state` (Unchecked/Checked/Hover/Focus/Disabled) is mapped by the contract's
  `figmaState` props (`checked`, `disabled`) — not a variant prop, not in scope.

### Input — node 1:12018
- `size` (figmaVariant `Size`): Figma [SM, MD, LG, XL] · contract [sm, md, lg, xl] → match
- Figma `state` (Default/Hover/Focus/Error/Disabled) and the `showLabel` /
  `showHelperText` booleans map to `error`, `disabled`, `label`, `helperText` —
  not variant props, not in scope.

### ButtonGroup — SKIPPED, props-in-scope=0 (nothing enum-shaped to diff)
Observed for context only: Figma exposes one composite `variant` property
[Default, With Active, With Icons, Size SM, Size LG, Vertical, With Dropdown] that
mixes size, orientation and content. The contract deliberately declares `size` and
`orientation` **without** `figmaVariant`, so there is no enum to diff. `With Dropdown`
has no contract counterpart — worth a design decision, but it is not contract drift.

### Typography — SKIPPED, props-in-scope=0 (nothing enum-shaped to diff)
Node 1:13098 is a specimen frame, not a component with variants. The contract maps
Figma text styles through `figmaStyleMap`, which this skill does not diff. The three
known kit↔Figma gaps stay documented in `Typography.kit.md` → "Known drift".

## Verification
- `node .ai-kit/bin/kit-audit.mjs` → exit 0
- `npx --no-install tsc --noEmit` (in ../ui-kit) → exit 0

## Shim debt
```
OK       Button.ghost      still shim — absent from ButtonVariant, ".ghost" present in src/shims/
OK       Button.bordered   still shim — absent from ButtonVariant, ".bordered" present in src/shims/
OK       Button.clear      still shim — absent from ButtonVariant, ".clear" present in src/shims/
open shim debt: 3
```
None are ready for deletion — `ButtonVariant` still lacks all three.

## Registry-only entries (not ui-kit components, not queried in Figma)
```
OK       Card          tokens-only, family "card-*" = 8 tokens, no kit component
OK       Chip          tokens-only, family "chip-*" = 21 tokens, no kit component
```

## Fixed during this run
- `kit.json → Card.stub` claimed `src/shims/Card/`, which does not exist on disk.
  Set to `null`; `stubMeaning` added to the registry to pin the field to what
  exists today rather than what is planned. kit-audit now fails on any such claim.
