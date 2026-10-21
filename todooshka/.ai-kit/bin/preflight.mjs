#!/usr/bin/env node
// One call that replaces the orientation round trips of a page-gen run:
// refreshes the token manifest, runs kit-audit, lists the contract files and the
// current src/shims + src/pages tree, probes the dev server, and runs figma-digest
// on the page's node (recording it as the current node for check-page).
//
//   node .ai-kit/bin/preflight.mjs <nodeId | figma URL>
//
// The digest is part of preflight, not a separate step, because a separate line in
// the skill is a line a model can skip (a Haiku run did exactly that).
//
// Every line is derived, never remembered. Exit 0 = ready. Exit 1 = kit-audit
// found a real defect (read the ERROR rows). Exit 2 = something could not run —
// never read that as "ready".

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROOT } from './lib/tokens.mjs'

const BIN = dirname(fileURLToPath(import.meta.url))
const run = (script, args = []) =>
  spawnSync(process.execPath, [join(BIN, script), ...args], { cwd: ROOT, encoding: 'utf8' })

let status = 0
const bump = (code) => { status = Math.max(status, code) }

console.log('## tokens (gen-tokens)')
const gen = run('gen-tokens.mjs')
console.log((gen.stdout + gen.stderr).trim())
if (gen.status !== 0) bump(2)
if (gen.stdout.startsWith('updated:')) console.log('note: manifest had drifted — say so in the final report')

// The Button shim is versioned kit debt, not page output: restore it here, before
// kit-audit, instead of printing a command for the agent to run (a Sonnet run
// spent two model turns, ~12 s, on that detour after an INCONSISTENT verdict).
const SHIM = 'src/shims/button-variants.module.css'
if (!existsSync(join(ROOT, SHIM))) {
  const git = (...args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' })
  const prefix = git('rev-parse', '--show-prefix').stdout.trim()
  // HEAD may no longer have the file: restore from the parent of the commit that deleted it.
  const deletedIn = git('log', '-1', '--format=%H', '--diff-filter=D', '--', SHIM).stdout.trim()
  const rev = deletedIn ? `${deletedIn}^` : 'HEAD'
  const show = git('show', `${rev}:${prefix}${SHIM}`)
  console.log('\n## shims')
  if (show.status === 0 && show.stdout) {
    mkdirSync(join(ROOT, 'src/shims'), { recursive: true })
    writeFileSync(join(ROOT, SHIM), show.stdout)
    console.log(`restored ${SHIM} from git (${rev.slice(0, 8)}) — nothing to do`)
  } else {
    console.log(`${SHIM} missing and could not be restored from git: ${show.stderr.trim()}`)
    bump(2)
  }
}

console.log('\n## kit-audit (ERROR/INFO rows + verdict only; full output: node .ai-kit/bin/kit-audit.mjs)')
const audit = run('kit-audit.mjs')
if (audit.status !== 0 && audit.status !== 1) {
  console.log('kit-audit could not run:', (audit.stderr || audit.stdout).trim())
  bump(2)
} else {
  const rows = audit.stdout.split('\n').filter((l) => /^(ERROR|INFO)\s+(?!rows:)/.test(l) || l.startsWith('RESULT'))
  console.log(rows.join('\n'))
  if (audit.status === 1) bump(1)
}

const kitDir = join(ROOT, '.ai-kit')
const allContracts = readdirSync(kitDir).filter((f) => f.endsWith('.kit.md')).map((f) => f.slice(0, -'.kit.md'.length)).sort()

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [relative(ROOT, join(dir, e.name))],
  )
for (const d of ['src/shims', 'src/pages']) {
  const abs = join(ROOT, d)
  console.log(`\n## ${d}`)
  console.log(existsSync(abs) && statSync(abs).isDirectory() ? walk(abs).sort().join('\n') || '(empty)' : '(absent)')
}

console.log('\n## dev server')
try {
  const res = await fetch('http://localhost:5173/', { signal: AbortSignal.timeout(1500) })
  console.log(`http://localhost:5173/ -> ${res.status} (already running — do not start another)`)
} catch {
  console.log('http://localhost:5173/ -> not reachable (start it: npm run dev)')
}

// figma-digest — last, so its long output is the freshest thing in context
const node = process.argv[2]
const current = join(ROOT, '.ai-kit/.cache/current')
rmSync(current, { force: true }) // never let check-page pick up a previous run's node
console.log('')
let digestJson = null
let figmaInput = []
if (!node) {
  console.log('## figma-digest: NOT RUN — pass the Figma node: node .ai-kit/bin/preflight.mjs <nodeId | figma URL>')
  bump(2)
} else {
  const digest = run('figma-digest.mjs', [node])
  console.log((digest.stdout + digest.stderr).trim())
  if (digest.status !== 0) {
    console.log('figma-digest DID NOT RUN — decide Step 2 by hand from the blob and pass --expect-shim to check-page')
    bump(2)
  } else {
    const m = node.match(/(\d+)[-:](\d+)/)
    mkdirSync(dirname(current), { recursive: true })
    writeFileSync(current, `${m[1]}:${m[2]}\n`)
    const slug = `${m[1]}-${m[2]}`
    digestJson = JSON.parse(readFileSync(join(kitDir, `.cache/figma-${slug}.json`), 'utf8'))
    figmaInput = [`.ai-kit/.cache/figma-${slug}.tsx`, `.ai-kit/.cache/figma-${slug}.png`]
      .filter((f) => existsSync(join(ROOT, f)))
  }
}

// The Step 1 read list, spelled out: a Sonnet run left the contracts out of its read
// batch and fetched a hand-picked subset in an extra round trip. The digest knows
// which kit components the page instantiates, so only their contracts are listed.
let contracts = allContracts
if (digestJson) {
  const used = new Set(['Typography', ...digestJson.instances.map((i) => i.name), ...digestJson.detached.map((d) => d.name)])
  contracts = allContracts.filter((c) => used.has(c))
}
console.log('\n## Step 1 — Read ALL of these in ONE response (nothing else, no cat/ls round trips)')
console.log([...figmaInput, '.ai-kit/kit.json', '.ai-kit/tokens.txt', ...contracts.map((c) => `.ai-kit/${c}.kit.md`), 'src/App.tsx']
  .map((f) => join(ROOT, f)).join('\n'))
if (digestJson) {
  const skipped = allContracts.filter((c) => !contracts.includes(c))
  if (skipped.length) console.log(`not instantiated on this node — do not read: ${skipped.join(', ')}`)
} else {
  console.log('no digest → every contract is listed; get the blob + screenshot with get_design_context (SKILL Step 0)')
}

console.log(`\nPREFLIGHT: ${status === 0 ? 'OK' : status === 1 ? 'DEFECTS (see ERROR rows)' : 'DID NOT RUN CLEANLY'}`)
process.exit(status)
