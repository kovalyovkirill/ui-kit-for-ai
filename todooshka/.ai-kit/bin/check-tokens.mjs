#!/usr/bin/env node
// Verifies that every var(--…) used in a generated page resolves to a token the
// ui-kit actually defines, and that no visual value is hardcoded.
//
// A misspelled token is invisible to tsc and to the dev server — the browser
// just renders nothing. This is the only cheap detector.
//
//   node .ai-kit/bin/check-tokens.mjs                   # defaults to src/pages
//   node .ai-kit/bin/check-tokens.mjs src/pages/Dark
//   npm run check-tokens -- src/pages/Dark              # note the --
//
// Exit 0 = clean. Exit 1 = findings, or the manifest is stale.

import { existsSync, readFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import {
  ROOT,
  TOKENS_PATH,
  TOKENS_DISPLAY,
  compareManifest,
  readManifestNames,
  findFiles,
} from './lib/tokens.mjs'

const arg = process.argv[2]
// A relative argument resolves against the caller's cwd; the default resolves
// against the repo root, so `check-tokens` works from anywhere.
const targetPath = arg ? resolve(process.cwd(), arg) : resolve(ROOT, 'src/pages')
const target = arg ?? 'src/pages'

if (!existsSync(TOKENS_PATH)) {
  console.error(`error: ${TOKENS_PATH} missing — run gen-tokens.mjs first`)
  process.exit(1)
}

// ─── Step 0: is the manifest itself still true? ───
// Must run before the usage check below. A stale manifest is worse than none:
// a genuinely-new ui-kit token would be reported as UNKNOWN TOKEN, and the
// cheapest "fix" is to swap a correct token for a wrong-but-listed one.
// The two failure modes must therefore read completely differently — this one
// says *regenerate the manifest*, never *fix your CSS*.
const manifest = compareManifest()
if (!manifest.fresh) {
  if (manifest.headerOnly) {
    console.error('manifest body matches the source but the file differs — the header was hand-edited')
  } else {
    for (const name of manifest.added) console.error(`  + ${name}`)
    for (const name of manifest.removed) console.error(`  - ${name}`)
    for (const name of manifest.changed) console.error(`  ~ ${name} (value changed)`)
  }
  console.error(`✗ ${TOKENS_DISPLAY} is STALE relative to the ui-kit source (names listed above)`)
  console.error('  fix: node .ai-kit/bin/gen-tokens.mjs   — then re-run this check')
  console.error('  do NOT change your CSS in response to this message.')
  process.exit(1)
}

if (!existsSync(targetPath)) {
  console.error(`error: target not found: ${target}`)
  process.exit(1)
}

const cssFiles = findFiles(targetPath, (p) => p.endsWith('.module.css'))
if (cssFiles.length === 0) {
  console.log(`no .module.css files under ${target}`)
  process.exit(0)
}

// Read every file once; each check below works off these lines.
const files = cssFiles.map((path) => ({
  path,
  label: relative(ROOT, path),
  lines: readFileSync(path, 'utf8').split('\n'),
}))

const known = new Set(readManifestNames())

// Custom properties declared locally inside the page itself are legitimate too.
const localDefs = new Set()
for (const file of files) {
  for (const line of file.lines) {
    const m = line.match(/^[ \t]*--([a-z0-9-]+)[ \t]*:/)
    if (m) localDefs.add(m[1])
  }
}

// ─── Step 1: every var(--…) resolves ───
// Capture the whole name up to `)` or `,` — NOT just [a-z0-9-]+. Stopping at the
// first invalid char would silently truncate `--spacing-1.5` to the valid
// `--spacing-1` and let the Figma dot-vs-dash bug through.
const used = new Set()
for (const file of files) {
  for (const line of file.lines) {
    for (const m of line.matchAll(/var\(--([^),;\s]+)/g)) used.add(m[1])
  }
}

let bad = false

for (const token of [...used].sort()) {
  if (known.has(token) || localDefs.has(token)) continue
  console.log(`UNKNOWN TOKEN: --${token}`)
  // Plain string search, not a regex: the name may contain regex metacharacters
  // (e.g. the dot in --spacing-1.5).
  const needle = `var(--${token}`
  for (const file of files) {
    file.lines.forEach((line, i) => {
      if (line.includes(needle)) console.log(`    ${file.label}:${i + 1}: ${line.trim()}`)
    })
  }
  bad = true
}

// ─── Step 2: hardcoded px / hex values (coding rule 3) ───
// Every visual value must be var(--token). Verified behaviour of this pattern:
// `0`, `0px`, `1px` and non-px units pass; `2px`, `10px`, `1.5px`, `0.5px` and
// any `#hex` are flagged. Anything flagged needs a real token, or — only when
// none exists — a same-line `/* off-system: <reason> */` marker, which must then
// be listed in the page's drift report so nothing off-system is ever silent.
// `outline` rules pass because the kit itself hardcodes its 2px focus ring.
const HARDCODED = /([2-9]|[0-9]{2,})(\.[0-9]+)?px|#[0-9a-fA-F]{3,8}/
const hardcoded = []
for (const file of files) {
  file.lines.forEach((line, i) => {
    if (!HARDCODED.test(line)) return
    if (line.includes('off-system:')) return
    if (/^[ \t]*outline/.test(line)) return
    hardcoded.push(`    ${file.label}:${i + 1}: ${line.trim()}`)
  })
}

if (hardcoded.length > 0) {
  console.log('HARDCODED VALUE (use a token, or add a same-line /* off-system: reason */ marker):')
  for (const entry of hardcoded) console.log(entry)
  bad = true
}

if (bad) {
  console.error(`✗ check failed for ${target} — see findings above`)
  process.exit(1)
}

console.log(`✓ all ${used.size} tokens used in ${target} resolve; no unmarked hardcoded values`)
