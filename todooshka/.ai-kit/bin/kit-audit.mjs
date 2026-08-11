#!/usr/bin/env node
// Derives every offline fact /sync-ai-map needs, so the model never has to
// establish one by reading and comparing files itself.
//
// WHY THIS EXISTS
// gen-tokens proved the pattern: a fact a script derives is a fact the model
// cannot fabricate. Everything else in the sync workflow used to be phrased as
// "read the types and compare" — precisely the operation an LLM will summarise
// plausibly instead of performing. A sync report is worthless if a clean run and
// a skipped run look identical, so the checks that CAN be mechanical must be.
//
// Only the Figma half is left to the model, because it needs an MCP call. This
// script fixes the SCOPE of that half: a component is auditable only if it has
// both a .kit.md contract and a ui-kit implementation.
//
//   node .ai-kit/bin/kit-audit.mjs      print the audit
//   node .ai-kit/bin/kit-audit.mjs -q   print only problems and the summary
//
// Exit 0 = no inconsistency. Exit 1 = at least one ERROR row. Exit 2 = the
// audit could not run (missing input) — never confuse that with "all clean".

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT,
  KIT_JSON,
  TOKENS_PATH,
  readKitJson,
  readManifestNames,
  findFiles,
} from './lib/tokens.mjs'

const AI_KIT = join(ROOT, '.ai-kit')
const SHIMS = join(ROOT, 'src/shims')
const UI_KIT_COMPONENTS = join(ROOT, '../ui-kit/src/components')

const QUIET = process.argv.includes('-q') || process.argv.includes('--quiet')

const rows = []       // { level, section, text }
const out = []
let errors = 0

const say = (s = '') => out.push(s)
const row = (level, section, text) => {
  rows.push({ level, section, text })
  if (level === 'ERROR') errors++
  if (!QUIET || level !== 'OK') say(`${level.padEnd(9)}${text}`)
}

const die = (msg) => {
  console.error(`kit-audit: ${msg}`)
  process.exit(2)
}

// ---------------------------------------------------------------- inputs

if (!existsSync(KIT_JSON)) die(`missing ${KIT_JSON}`)
if (!existsSync(TOKENS_PATH)) die(`missing ${TOKENS_PATH} — run: node .ai-kit/bin/gen-tokens.mjs`)
if (!existsSync(UI_KIT_COMPONENTS)) die(`ui-kit not found at ${UI_KIT_COMPONENTS}`)

const kit = readKitJson()

// tokens.txt stores names with the leading `--` STRIPPED (see lib/tokens.mjs).
// Matching on `--card-` therefore silently finds nothing and reads as "no such
// tokens" — a real mis-diagnosis this script is here to make impossible.
const tokenNames = readManifestNames()

const implemented = readdirSync(UI_KIT_COMPONENTS)
  .filter((d) => statSync(join(UI_KIT_COMPONENTS, d)).isDirectory())
  .sort()

const contractFiles = readdirSync(AI_KIT)
  .filter((f) => f.endsWith('.kit.md'))
  .sort()

// ---------------------------------------------------------------- parsing

// Contract frontmatter uses one-line flow mappings:
//   size:  { values: [sm, md, lg], default: md, figmaVariant: Size }
// Only the `props:` block counts — ButtonGroup also has `itemProps:` and
// Typography a `figmaStyleMap:`, and neither describes the component's own props.
function parseContract(file) {
  const text = readFileSync(join(AI_KIT, file), 'utf8')
  const fm = text.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) return null

  const lines = fm[1].split('\n')
  const scalar = (key) => {
    const m = fm[1].match(new RegExp(`^${key}:\\s*"?([^"\n]+)"?\\s*$`, 'm'))
    return m ? m[1].trim() : null
  }

  const props = []
  let inProps = false
  for (const line of lines) {
    if (/^props:\s*$/.test(line)) { inProps = true; continue }
    if (inProps && /^\S/.test(line)) break        // next top-level key ends the block
    if (!inProps) continue

    const m = line.match(/^\s+([A-Za-z0-9_]+):\s*\{(.*)\}\s*$/)
    if (!m) continue
    const [, name, body] = m
    const values = body.match(/values:\s*\[([^\]]*)\]/)
    const figmaVariant = body.match(/figmaVariant:\s*([A-Za-z0-9_-]+)/)
    // In scope only when BOTH are present: a `values` list with no figmaVariant
    // is a code-side enum Figma knows nothing about (Button.type, ButtonGroup.size).
    if (!values || !figmaVariant) continue
    props.push({
      name,
      figmaVariant: figmaVariant[1],
      values: values[1].split(',').map((v) => v.trim()).filter(Boolean),
    })
  }

  return { component: scalar('component'), figmaNodeId: scalar('figmaNodeId'), props, file }
}

// Captures single-line AND multi-line unions, then pulls every quoted literal.
function parseUnions(component) {
  const f = join(UI_KIT_COMPONENTS, component, `${component}.types.ts`)
  if (!existsSync(f)) return null
  const lines = readFileSync(f, 'utf8').split('\n')
  const unions = new Map()
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^export type (\w+)\s*=(.*)$/)
    if (!m) continue
    let body = m[2]
    for (let j = i + 1; j < lines.length; j++) {
      if (/^\s*$/.test(lines[j]) || /^(export|interface|type|\/\*\*|\})/.test(lines[j])) break
      body += ' ' + lines[j]
    }
    const literals = [...body.matchAll(/'([^']*)'/g)].map((x) => x[1])
    if (literals.length) unions.set(m[1], literals)
  }
  return unions
}

const shimSources = findFiles(SHIMS)
  .map((p) => readFileSync(p, 'utf8'))
  .join('\n')

// ---------------------------------------------------------------- 1. scope

say('# kit-audit — derived facts, regenerate with: node .ai-kit/bin/kit-audit.mjs')
say('# Every line below is read off disk. Do not restate it from memory.')
say()
say('## scope — a component is auditable only with BOTH a contract and an implementation')
say()

const contracts = contractFiles.map(parseContract).filter(Boolean)
const inScope = []

for (const c of contracts) {
  if (!c.component) { row('ERROR', 'scope', `${c.file}: frontmatter has no "component:" key`); continue }
  const hasImpl = implemented.includes(c.component)
  if (!hasImpl) {
    row('ERROR', 'scope', `${c.component}: contract exists but ../ui-kit/src/components/${c.component}/ does not`)
    continue
  }
  if (!c.figmaNodeId) {
    row('ERROR', 'scope', `${c.component}: no figmaNodeId — cannot be queried in Figma`)
    continue
  }
  inScope.push(c)
  row('OK', 'scope', `${c.component.padEnd(13)} node=${c.figmaNodeId.padEnd(10)} props-in-scope=${c.props.length}`)
}

for (const name of implemented) {
  if (!contracts.some((c) => c.component === name)) {
    row('ERROR', 'scope', `${name}: implemented in ui-kit but has no .ai-kit/${name}.kit.md contract`)
  }
}

say()
say(`AUDITABLE COMPONENTS (${inScope.length}): ${inScope.map((c) => c.component).join(' ')}`)
say('Query Figma for these and no others. A name absent here has no contract to')
say('diff against, so any variant claim about it would be unfalsifiable.')
say()

// ------------------------------------------------- 2. contract vs TS union

say('## contract values vs ui-kit TypeScript unions (offline half of the diff)')
say()

let propsChecked = 0
for (const c of inScope) {
  const unions = parseUnions(c.component)
  if (!unions) {
    row('ERROR', 'types', `${c.component}: no ${c.component}.types.ts`)
    continue
  }
  for (const p of c.props) {
    propsChecked++
    // Convention across the kit: <Component><Prop> — AvatarSize, BadgeVariant…
    const typeName = c.component + p.name[0].toUpperCase() + p.name.slice(1)
    const union = unions.get(typeName)
    if (!union) {
      row('ERROR', 'types', `${c.component}.${p.name}: no union "${typeName}" in ${c.component}.types.ts`)
      continue
    }
    const contractOnly = p.values.filter((v) => !union.includes(v))
    const tsOnly = union.filter((v) => !p.values.includes(v))
    if (contractOnly.length) {
      row('ERROR', 'types', `${c.component}.${p.name}: contract promises [${contractOnly}] the kit cannot render (${typeName})`)
    } else {
      row('OK', 'types', `${`${c.component}.${p.name}`.padEnd(20)} figmaVariant=${p.figmaVariant.padEnd(8)} [${p.values.join(', ')}]`)
    }
    if (tsOnly.length) {
      row('INFO', 'types', `${c.component}.${p.name}: kit also implements [${tsOnly}] — undocumented in the contract`)
    }
  }
}

say()
say(`in-scope props checked: ${propsChecked}`)
say()

// ------------------------------------------------ 3. registry consistency

say('## kit.json registry vs disk')
say()

const registry = Object.entries(kit.figmaComponents ?? {})
  .filter(([, v]) => v && typeof v === 'object' && typeof v.status === 'string')

for (const [name, entry] of registry) {
  const hasImpl = implemented.includes(name)
  const hasContract = contracts.some((c) => c.component === name)

  if (entry.status === 'implemented' && !hasImpl) {
    row('ERROR', 'registry', `${name}: status=implemented but no ui-kit component`)
  }
  if (entry.status === 'implemented' && !hasContract) {
    row('ERROR', 'registry', `${name}: status=implemented but no .kit.md contract`)
  }

  if (entry.status === 'tokens-only') {
    if (hasImpl) {
      row('ERROR', 'registry', `${name}: status=tokens-only but ui-kit implements it — promote to implemented`)
    }
    const family = String(entry.tokens ?? '').replace(/\*$/, '')
    const count = family ? tokenNames.filter((t) => t.startsWith(family)).length : 0
    if (!family) {
      row('ERROR', 'registry', `${name}: status=tokens-only but no "tokens" family declared`)
    } else if (count === 0) {
      row('ERROR', 'registry', `${name}: token family "${entry.tokens}" matches 0 names in tokens.txt — status should be "missing"`)
    } else {
      row('OK', 'registry', `${name.padEnd(13)} tokens-only, family "${entry.tokens}" = ${count} tokens, no kit component`)
    }
  }

  if (entry.stub) {
    const p = join(ROOT, entry.stub)
    if (!existsSync(p)) {
      row('ERROR', 'registry', `${name}: declares stub "${entry.stub}" which does not exist on disk`)
    } else {
      row('OK', 'registry', `${name}: stub ${entry.stub} present`)
    }
  }
}

for (const c of contracts) {
  if (c.component && !registry.some(([n]) => n === c.component)) {
    row('ERROR', 'registry', `${c.component}: has a contract but no kit.json → figmaComponents entry`)
  }
}

say()

// ------------------------------------------------------------ 4. shim debt

say('## shim debt — the only detector; tokens pre-exist the implementation')
say()

let debt = 0
for (const [name, entry] of registry) {
  const unions = implemented.includes(name) ? parseUnions(name) : null
  for (const [variant, status] of Object.entries(entry.variants ?? {})) {
    if (status !== 'shim') continue
    const union = unions?.get(`${name}Variant`) ?? []
    const inCss = new RegExp(`\\.${variant}\\b`).test(shimSources)
    if (union.includes(variant)) {
      row('INFO', 'shim', `🗑 ${name}.${variant}: NOW in ${name}Variant — delete the shim, migrate usages, set status=implemented`)
    } else if (!inCss) {
      row('ERROR', 'shim', `${name}.${variant}: registry says shim, but no ".${variant}" class exists under src/shims/`)
    } else {
      debt++
      row('OK', 'shim', `${name}.${variant.padEnd(10)} still shim — absent from ${name}Variant, ".${variant}" present in src/shims/`)
    }
  }
}

say()
say(`open shim debt: ${debt}`)
say()

// --------------------------------------------------------------- summary

say('## summary')
say()
say(`auditable components: ${inScope.length}`)
say(`in-scope props:       ${propsChecked}`)
say(`registry entries:     ${registry.length}`)
say(`open shim debt:       ${debt}`)
say(`ERROR rows:           ${errors}`)
say(`INFO rows:            ${rows.filter((r) => r.level === 'INFO').length}`)
say()
say(errors ? 'RESULT: INCONSISTENT — every ERROR row above is a real defect.' : 'RESULT: CONSISTENT')

console.log(out.join('\n'))
process.exit(errors ? 1 : 0)
