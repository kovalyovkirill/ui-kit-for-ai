// Shared helpers for the scripts in .ai-kit/bin/.
//
// WHAT tokens.txt IS
// A table of every CSS custom property the ui-kit defines, with its tier and its
// value resolved per theme. It is GENERATED — a pure function of the ui-kit
// source CSS. That purity is the whole design: the manifest can always be
// re-derived and compared, so `--check` is a plain whole-file comparison and
// needs no stored checksum or timestamp.
//
// WHY IT CARRIES VALUES, NOT JUST NAMES
// The old manifest was a flat name list. That is not enough to decide anything:
// answering "does styling this frame with card-* change the pixels?" required
// opening the ui-kit CSS to learn that --card-padding-sm IS --spacing-4. Every
// such lookup is a round trip the generator pays for on every page. The REF and
// LIGHT/DARK columns exist so the ui-kit source never has to be opened.
//
// WHY THE TIER COLUMN EXISTS
// The source CSS is three-layered, and the layers live in different scopes:
// primitives/typography/component tokens are declared in `:root`, while the
// SEMANTIC layer is declared ONLY inside `:root[data-theme="light"|"dark"]`.
// The old regex matched declarations anywhere and flattened all three into one
// list, losing both the tier and the fact that semantic tokens are theme-scoped.
// The tiers also mirror how the tokens are organised on the Figma side, which is
// where this CSS is generated from in the first place.
//
// WHY THESE HELPERS LIVE TOGETHER
// check-tokens must know the manifest is fresh before it trusts it, so it needs
// the generator's logic. In the old bash version it shelled out to
// `gen-tokens.sh --check`; here it is an ordinary function call.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// .ai-kit/bin/lib/ → up three levels is the todooshka root.
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
export const KIT_JSON = join(ROOT, '.ai-kit/kit.json')
export const TOKENS_PATH = join(ROOT, '.ai-kit/tokens.txt')
export const TOKENS_DISPLAY = '.ai-kit/tokens.txt'

export function readKitJson() {
  return JSON.parse(readFileSync(KIT_JSON, 'utf8'))
}

/**
 * Absolute path to the ui-kit CSS the manifest is derived from.
 *
 * Read from kit.json rather than hardcoded here, so the path lives in exactly
 * one place. It used to be duplicated between kit.json and the generator, with
 * a note telling humans to keep the two in sync — a rule nobody can enforce.
 *
 * Deliberately points at ui-kit/src, not ui-kit/dist: the manifest stays correct
 * without anyone having to build the kit first.
 */
export function tokensSourcePath() {
  const kit = readKitJson()
  if (!kit.tokensSource) throw new Error('kit.json has no "tokensSource"')
  return resolve(ROOT, kit.tokensSource)
}

/**
 * The section comments the source CSS uses to group its `:root` declarations,
 * mapped to the tier label emitted in the manifest.
 *
 * Read from the file rather than inferred from the value, because inference is
 * wrong at the edges: --avatar-size-xl and --checkbox-radius-sm are literals but
 * are component tokens, so "has a literal value" does not mean "is a primitive".
 * A section the file grows later falls back to `prim` and shows up as manifest
 * drift, which is the visible-failure behaviour we want.
 */
const SECTION_TIER = {
  Colors: 'color',
  Primitives: 'prim',
  Typography: 'type',
  Component: 'comp',
}

/**
 * Parse the source CSS into declarations keyed by scope.
 *
 * Returns { decls, sections }:
 *   decls    Map name → { root?, light?, dark? } — the raw declared value
 *   sections Map name → section comment it was declared under (`:root` only)
 */
export function parseSource() {
  const src = tokensSourcePath()
  if (!existsSync(src)) {
    const err = new Error(`token source not found: ${src}`)
    err.code = 'NO_SOURCE'
    throw err
  }

  const decls = new Map()
  const sections = new Map()
  let scope = null
  let section = null

  for (const line of readFileSync(src, 'utf8').split('\n')) {
    const selector = line.match(/^\s*:root(?:\[data-theme="(light|dark)"\])?\s*\{/)
    if (selector) {
      scope = selector[1] ?? 'root'
      section = null
      continue
    }
    if (/^\s*\}/.test(line)) {
      scope = null
      section = null
      continue
    }
    const comment = line.match(/^\s*\/\*\*\s*(.+?)\s*\*\//)
    if (comment) {
      section = comment[1]
      continue
    }
    if (!scope) continue

    // Anchored at the start of the line, so this only picks up declarations,
    // never a var(--x) reference sitting in the middle of a value.
    const decl = line.match(/^[ \t]*--([a-z0-9-]+)[ \t]*:[ \t]*(.+?)[ \t]*;?[ \t]*$/)
    if (!decl) continue
    const [, name, value] = decl
    if (!decls.has(name)) decls.set(name, {})
    decls.get(name)[scope] = value.replace(/;$/, '').trim()
    if (scope === 'root' && !sections.has(name)) sections.set(name, section)
  }

  return { decls, sections }
}

/** `var(--x)` → `x`; anything else → null. */
function refTarget(value) {
  const m = String(value ?? '').match(/^var\(--([a-z0-9-]+)\)$/)
  return m ? m[1] : null
}

/**
 * Follow the var() chain for `name` under `theme` until a literal falls out.
 *
 * The theme-scoped declaration wins over the `:root` one, which is what makes a
 * component token resolve differently per theme even though it is declared once:
 * --button-primary-background-default → --interactive-brand-default → the
 * brand-500/brand-400 split that only exists inside the theme blocks.
 */
function resolveValue(name, theme, decls, seen = new Set()) {
  if (seen.has(name)) return '<cycle>'
  seen.add(name)
  const declared = decls.get(name)
  if (!declared) return '<undefined>'
  const value = declared[theme] ?? declared.root
  if (value === undefined) return '<undefined>'
  const target = refTarget(value)
  return target ? resolveValue(target, theme, decls, seen) : value
}

/**
 * One row per token: name, tier, immediate reference, resolved light/dark value.
 *
 * Sorted by plain Array#sort, which compares UTF-16 code units. For the
 * [a-z0-9-] alphabet of token names that is identical to byte order, so the
 * result is the same on every machine. (The bash version needed LC_ALL=C for
 * this: glibc's en_US.UTF-8 ignores punctuation at the primary level and sorts
 * `spacing-10` before `spacing-1-5`, which made --check report phantom drift on
 * Linux while passing on macOS.)
 */
export function tokenRows() {
  const { decls, sections } = parseSource()

  return [...decls.keys()].sort().map((name) => {
    const declared = decls.get(name)
    const tier =
      declared.root !== undefined ? SECTION_TIER[sections.get(name)] ?? 'prim' : 'sem'

    // A semantic token is declared once per theme and usually points at a
    // different primitive in each; a single REF would have to pick one and lie.
    // Show it only when both themes agree.
    const lightRef = refTarget(declared.light ?? declared.root)
    const darkRef = refTarget(declared.dark ?? declared.root)
    const ref = lightRef && lightRef === darkRef ? lightRef : '-'

    return {
      name,
      tier,
      ref,
      light: resolveValue(name, 'light', decls),
      dark: resolveValue(name, 'dark', decls),
    }
  })
}

/**
 * The full manifest text, header included.
 *
 * Nothing emitted here may vary between runs — no timestamp, no count, no hash —
 * or --check could not be a whole-file comparison. The header lines start with
 * '#', which readManifestNames can never mistake for a token: it drops them.
 */
export function emitManifest() {
  const kit = readKitJson()
  const source = String(kit.tokensSource).replace(/^\.\.\//, '')
  const rows = tokenRows()

  const width = (key) => Math.max(...rows.map((r) => r[key].length))
  const nameW = width('name')
  const refW = width('ref')
  const lightW = width('light')

  const body = rows.map(
    (r) =>
      `${r.name.padEnd(nameW)}  ${r.tier.padEnd(5)}  ${r.ref.padEnd(refW)}  ` +
      `${r.light.padEnd(lightW)}  ${r.dark}`,
  )

  return [
    '# GENERATED — do not edit by hand.',
    `# source:     ${source}`,
    '# regenerate: node .ai-kit/bin/gen-tokens.mjs',
    '#',
    '# The source CSS is itself generated from the Figma variables, so every token',
    '# below is one Figma variable. Figma name → token: lowercase, "/"→"-", "."→"-"',
    '#   spacing/1.5 → --spacing-1-5      Display/2XL/fontSize → --display-2xl-fontsize',
    '#   button/padding-x/md → --button-padding-x-md',
    '# The reverse direction is NOT derivable from this file (the codegen flattens',
    '# "/" to "-"), so never reconstruct a Figma name from a token name.',
    '#',
    '# columns: NAME  TIER  REF  LIGHT  DARK',
    '#   TIER   sem   theme-scoped, declared ONLY in :root[data-theme=…]',
    '#          comp  component token, declared in :root, points at the sem layer',
    '#          prim  spacing / radius / border-width / control-height',
    '#          color raw palette hex',
    '#          type  font family / size / weight / line-height',
    '#   REF    the token this one points at; "-" if literal, or if the two themes',
    '#          point at different tokens (read LIGHT/DARK instead)',
    '#   LIGHT  value with the var() chain fully resolved, per [data-theme]',
    '#   DARK   same, dark theme. Equal columns = the token does not theme.',
    '#',
    ...body,
  ].join('\n') + '\n'
}

/** Token names currently listed in tokens.txt (header lines dropped). */
export function readManifestNames() {
  return manifestBody(readFileSync(TOKENS_PATH, 'utf8')).map(tokenNameOf)
}

const manifestBody = (text) =>
  text.split('\n').filter((line) => line && !line.startsWith('#'))

const tokenNameOf = (line) => line.split(/\s+/)[0]

/**
 * Compare the manifest on disk against what the source says it should be.
 *
 * Split three ways because the fixes differ: `added`/`removed` mean the kit
 * gained or lost a token, `changed` means a token kept its name but its value
 * moved — a theme retune, which the old name-only manifest could not see at all.
 * `headerOnly` means every row matches but the file still differs — the only way
 * that happens is a hand-edited header.
 */
export function compareManifest() {
  const empty = { missing: false, fresh: false, headerOnly: false, added: [], removed: [], changed: [] }

  if (!existsSync(TOKENS_PATH)) return { ...empty, missing: true }

  const wanted = emitManifest()
  const actual = readFileSync(TOKENS_PATH, 'utf8')
  if (wanted === actual) return { ...empty, fresh: true }

  const wantedRows = new Map(manifestBody(wanted).map((l) => [tokenNameOf(l), l]))
  const actualRows = new Map(manifestBody(actual).map((l) => [tokenNameOf(l), l]))

  const added = [...wantedRows.keys()].filter((n) => !actualRows.has(n))
  const removed = [...actualRows.keys()].filter((n) => !wantedRows.has(n))
  const changed = [...wantedRows.keys()].filter(
    (n) => actualRows.has(n) && actualRows.get(n) !== wantedRows.get(n),
  )

  return {
    ...empty,
    headerOnly: added.length === 0 && removed.length === 0 && changed.length === 0,
    added,
    removed,
    changed,
  }
}

/**
 * Every file under `dir`, recursively.
 *
 * Hand-rolled on purpose. readdirSync's `recursive` option needs Node 20.1 and
 * `dirent.parentPath` needs 20.12 — and on an older Node an unknown option is
 * silently ignored, so the walk would quietly see only the top level. A wrong
 * answer that looks authoritative is the exact failure these scripts exist to
 * prevent, so this depends on no Node version at all.
 */
export function findFiles(dir, predicate = () => true) {
  if (!existsSync(dir)) return []
  if (statSync(dir).isFile()) return predicate(dir) ? [dir] : []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) return findFiles(p, predicate)
    if (entry.isFile() && predicate(p)) return [p]
    return []
  })
}
