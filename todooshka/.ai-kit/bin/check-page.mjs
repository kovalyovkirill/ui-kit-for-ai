#!/usr/bin/env node
// Structural checks a generated page must pass — the things check-tokens cannot see,
// plus a report of every fact that can be DERIVED from the code, so the agent quotes
// it instead of writing the drift report from memory.
//
//   node .ai-kit/bin/check-page.mjs src/pages/<Page> --figma <nodeId> [--report]
//   node .ai-kit/bin/check-page.mjs src/pages/<Page> [--expect-shim ghost=2,clear=0,bordered=0] [--report]
//
// Rules (each line of output names its rule):
//   text    no raw text inside native tags (div, p, span, …) — every text node is <Typography>
//   style   no inline style={{…}} — styling lives in .module.css, where check-tokens sees it
//   import  every relative import resolves to a file (tsc accepts any *.module.css path)
//   canvas  (with a digest) the Figma artboard width never appears in page CSS
//   font    no font-size / font-family / font-weight / line-height / letter-spacing in page
//           CSS, not even with an `off-system:` marker — text metrics come from Typography
//   shim    the Figma blob had --button-<variant>-* instances, so the page must use
//           `shim.<variant>` at least once (loops fold usages). Counts come from the
//           figma-digest cache with --figma, or from --expect-shim
//   exit    index.ts exports exactly the page component and nothing else
//   barrel  no index.* inside components/ or model/
// With --figma <nodeId> (reads .ai-kit/.cache/figma-<id>.json, written by figma-digest):
//   kit     every implemented component Figma instantiates is imported from the kit
//   detach  every detached form control (Checkbox …) is rendered as that kit component
//   typo    every Typography variant the digest mapped a Figma text style to is used
//   deco    line-through / underline in Figma appear in the page CSS
//   width   every wrapping fixed text width in Figma is kept (max-width: Npx)
//
// Exit 0 = clean. Exit 1 = violations. Exit 2 = could not run.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { ROOT } from './lib/tokens.mjs'

const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--') && !/^[a-z]+=\d/.test(a))
const flagValue = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : null
}
if (!target) {
  console.error('usage: check-page.mjs <src/pages/Page> [--expect-shim ghost=2,...] [--report]')
  process.exit(2)
}
const dir = resolve(process.cwd(), target)
if (!existsSync(dir) || !statSync(dir).isDirectory()) {
  console.error(`error: not a directory: ${target}`)
  process.exit(2)
}

const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)],
  )
const files = walk(dir)
const tsx = files.filter((f) => f.endsWith('.tsx'))
const css = files.filter((f) => f.endsWith('.module.css'))
const rel = (f) => relative(ROOT, f)
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length
const blank = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))

const violations = []
// Every `import { … } from '@monorepo/ui-kit'` in a file — there may be several.
const kitImports = (src) =>
  [...src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]@monorepo\/ui-kit['"]/g)]
    .flatMap((m) => m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean))

// ── style: no inline style — it bypasses every CSS rule (tokens, text metrics, hardcodes) ──
for (const f of tsx) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/\bstyle=\{/g)) {
    violations.push(`style   ${rel(f)}:${lineOf(src, m.index)}: inline style → move it to the component's .module.css (check-tokens cannot see inline values)`)
  }
}

// ── text: raw text inside native text tags ──
const ATTRS = '(?:[^<>{}]|\\{[^{}]*\\})*'
// Two passes: a <div> match would otherwise swallow the text tags nested inside it.
const NATIVE = [
  new RegExp(`<(h[1-6]|p|span|li|td|th|label|strong|em|small|b|i|a|button)\\b(${ATTRS})>([\\s\\S]*?)<\\/\\1>`, 'g'),
  new RegExp(`<(div)\\b(${ATTRS})>([\\s\\S]*?)<\\/\\1>`, 'g'),
]
for (const f of tsx) {
  const src = readFileSync(f, 'utf8')
  for (const m of NATIVE.flatMap((re) => [...src.matchAll(re)])) {
    let inner = m[3]
    let prev
    do {
      prev = inner
      inner = inner
        .replace(new RegExp(`<([A-Z][\\w.]*)\\b${ATTRS}>[\\s\\S]*?<\\/\\1>`, 'g'), '')
        .replace(new RegExp(`<[A-Za-z][\\w.]*\\b${ATTRS}\\/>`, 'g'), '')
    } while (inner !== prev)
    inner = inner
      .replace(/\{[^{}]*(?:&&|\?|\.map\()[^{}]*\}/g, '')
      .replace(/\{\s*children\s*\}/g, '')
      .replace(/<[^>]+>/g, '')
    // A <div> is a box, not a text tag: `{icon}` / `{slot}` in it is fine, and the lazy
    // match stops at the first nested </div>, leaving half an expression. Only literal
    // text outside braces counts there.
    if (m[1] === 'div') {
      do { prev = inner; inner = inner.replace(/\{[^{}]*\}/g, '') } while (inner !== prev)
      inner = inner.replace(/\{[\s\S]*$/, '').replace(/^[\s\S]*?\}/, '')
    }
    const text = inner.replace(/\s+/g, ' ').trim()
    if (text) {
      violations.push(`text    ${rel(f)}:${lineOf(src, m.index)}: raw text in <${m[1]}> → wrap in <Typography>: "${text.slice(0, 50)}"`)
    }
  }
}

// ── font: text metrics in page CSS ──
const FONT = /^\s*(font-size|font-family|font-weight|font|line-height|letter-spacing)\s*:/
// `font: inherit` is a reset (a <button> hand-roll needs it), not a metric
const RESET = /:\s*inherit\s*;?\s*$/
for (const f of css) {
  const raw = readFileSync(f, 'utf8').split('\n')
  blank(readFileSync(f, 'utf8')).split('\n').forEach((line, i) => {
    if (FONT.test(line) && !RESET.test(line)) {
      violations.push(`font    ${rel(f)}:${i + 1}: ${raw[i].trim()}`)
    }
  })
}

// ── shim: usage of button-variants shim classes ──
const shimUse = { ghost: 0, clear: 0, bordered: 0 }
const shimWhere = []
for (const f of tsx) {
  const src = readFileSync(f, 'utf8')
  for (const im of src.matchAll(/import\s+(\w+)\s+from\s+['"][^'"]*button-variants\.module\.css['"]/g)) {
    for (const cls of Object.keys(shimUse)) {
      const n = [...src.matchAll(new RegExp(`\\b${im[1]}\\.${cls}\\b`, 'g'))].length
      if (n) { shimUse[cls] += n; shimWhere.push(`${rel(f)} → shim.${cls} ×${n}`) }
    }
  }
}
// ── figma digest (written by figma-digest.mjs) ──
// No --figma → the node preflight recorded. The agent does not have to remember the
// flag: a Haiku run passed the fallback --expect-shim and skipped every Figma rule.
const currentFile = join(ROOT, '.ai-kit/.cache/current')
const figmaArg = flagValue('--figma') ?? (existsSync(currentFile) ? readFileSync(currentFile, 'utf8').trim() : null)
let digest = null
if (figmaArg) {
  const m = figmaArg.match(/(\d+)[-:](\d+)/)
  const cache = m && join(ROOT, `.ai-kit/.cache/figma-${m[1]}-${m[2]}.json`)
  if (!cache || !existsSync(cache)) {
    console.error(`error: no digest for ${figmaArg} — run: node .ai-kit/bin/figma-digest.mjs ${figmaArg}`)
    process.exit(2)
  }
  digest = JSON.parse(readFileSync(cache, 'utf8'))
}

let expectRaw = flagValue('--expect-shim')
if (digest) {
  console.log(`figma   checking against the digest of ${digest.node}${flagValue('--figma') ? '' : ' (recorded by preflight)'}${expectRaw ? ' — --expect-shim ignored, the digest counts win' : ''}`)
  expectRaw = Object.entries(digest.expectShim).map(([k, v]) => `${k}=${v}`).join(',')
} else if (!expectRaw) {
  console.error('error: nothing to check the page against Figma with — run preflight with the node (it records the digest), or pass --expect-shim if the digest could not run')
  process.exit(2)
}
if (expectRaw) {
  for (const pair of expectRaw.split(',')) {
    const [cls, nRaw] = pair.split('=')
    const n = Number(nRaw)
    if (!(cls in shimUse) || Number.isNaN(n)) {
      console.error(`error: bad --expect-shim entry "${pair}" (want ghost|clear|bordered=<n>)`)
      process.exit(2)
    }
    if (n > 0 && shimUse[cls] === 0) {
      violations.push(`shim    Figma has ${n} --button-${cls}-* layer(s) but the page never uses shim.${cls} — see Button.kit.md → Unimplemented variants`)
    }
  }
}

// ── figma-derived rules ──
if (digest) {
  const tsxSrc = tsx.map((f) => readFileSync(f, 'utf8'))
  const cssSrc = css.map((f) => blank(readFileSync(f, 'utf8'))).join('\n')
  const imported = new Set(tsxSrc.flatMap((s) => {
    return kitImports(s)
  }))
  const counts = (list) => list.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map())

  for (const [name, n] of counts(digest.instances.filter((i) => i.status === 'implemented').map((i) => i.name))) {
    if (!imported.has(name)) violations.push(`kit     Figma has ${n} ${name} instance(s) but no file imports ${name} from @monorepo/ui-kit`)
  }
  for (const [name, n] of counts(digest.detached.map((d) => d.name))) {
    if (!tsxSrc.some((s) => new RegExp(`<${name}\\b`).test(s))) {
      violations.push(`detach  Figma has ${n} detached ${name} layer(s) but the page never renders <${name}> — see ${name}.kit.md → Detached layers`)
    }
  }

  const typoTags = tsxSrc.flatMap((s) => [...s.matchAll(/<Typography\b((?:[^>{]|\{[^{}]*\})*)>/g)].map((m) => m[1]))
  const dynamic = typoTags.some((a) => /\bvariant=\{/.test(a))
  const used = new Set(typoTags.map((a) => a.match(/\bvariant="(\w+)"/)?.[1]).filter(Boolean))
  if (!dynamic) {
    for (const t of digest.typography) {
      if (t.variant && !used.has(t.variant)) {
        violations.push(`typo    Figma ${t.style} (×${t.nodes.length}, e.g. ${t.nodes[0].id} "${t.nodes[0].text.slice(0, 30)}") maps to variant="${t.variant}", which the page never uses`)
      }
    }
  }

  for (const [deco, nodes] of Object.entries(digest.decorations)) {
    if (!['line-through', 'underline'].includes(deco)) continue
    if (!cssSrc.includes(deco) && !tsxSrc.some((s) => s.includes(deco))) {
      violations.push(`deco    Figma has ${deco} on ${nodes.map((n) => n.id).join(', ')} but no page CSS carries it`)
    }
  }

  for (const px of new Set(digest.fixedWidths.filter((w) => w.wraps).map((w) => w.px))) {
    if (!new RegExp(`\\bmax-width\\s*:\\s*${px}px`).test(cssSrc)) {
      violations.push(`width   Figma fixes a wrapping text width of ${px}px (${digest.fixedWidths.filter((w) => w.px === px).map((w) => w.id).join(', ')}) — keep it as max-width: ${px}px + off-system marker (rule 7)`)
    }
  }
  if (dynamic) console.log('note    typo rule skipped: a <Typography> takes a computed variant={…}')

  const pageSrc = files.filter((x) => /\.(tsx?|jsx?)$/.test(x)).map((x) => readFileSync(x, 'utf8')).join('\n').replace(/\s+/g, ' ')
  for (const name of digest.expectedComponents ?? []) {
    if (!new RegExp(`export\\s+(?:default\\s+)?(?:function|const)\\s+${name}\\b`).test(pageSrc)) {
      violations.push(`comp    Figma layer ${name} has no component of its own (export function ${name}) — one layer name = one component; do not fold it into another behind a flag (SKILL 2c)`)
    }
  }

  // Every string Figma draws appears verbatim somewhere in the page (model/ or JSX).
  // Short numbers ("4", "12") are skipped — they are often computed from data.
  for (const text of digest.copy ?? []) {
    if (/^\d{1,3}$/.test(text)) continue
    if (!pageSrc.includes(text)) violations.push(`copy    Figma text "${text}" appears nowhere in the page — dropped content (or retyped: copy it verbatim from the blob)`)
  }
}

if (digest?.canvasWidth && new RegExp(`\\b${digest.canvasWidth}px`).test(css.map((f) => readFileSync(f, 'utf8')).join('\n'))) {
  for (const f of css) {
    readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
      if (new RegExp(`\\b${digest.canvasWidth}px`).test(l)) violations.push(`canvas  ${rel(f)}:${i + 1}: ${l.trim()} — ${digest.canvasWidth}px is the Figma artboard, not a layout width; the page root is width: 100%`)
    })
  }
}

// ── import: every relative import resolves to a file ──
// tsc cannot see this for CSS modules (vite/client declares every *.module.css), so a
// wrong `../` depth type-checks green and the page fails to load. A Haiku run did that.
const EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']
for (const f of files.filter((x) => /\.(tsx?|jsx?)$/.test(x))) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/(?:import|export)\s[^'"]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|import\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
    const spec = m[1] ?? m[2]
    const base = resolve(f, '..', spec)
    if (!EXTS.some((e) => existsSync(base + e) && statSync(base + e).isFile())) {
      const name = basename(spec)
      const hit = walk(join(ROOT, 'src')).find((x) => basename(x) === name || basename(x).replace(/\.[jt]sx?$/, '') === name)
      let fix = ''
      if (hit) {
        const r = relative(resolve(f, '..'), hit).replace(/\.[jt]sx?$/, '')
        fix = ` — did you mean '${r.startsWith('.') ? r : `./${r}`}'?`
      }
      violations.push(`import  ${rel(f)}:${lineOf(src, m.index)}: '${spec}' does not resolve to a file — the page will not load (tsc does not check CSS-module paths)${fix}`)
    }
  }
}

// ── shimsrc: kit debt lives in src/shims only — imported via @shims, never copied ──
for (const f of files) {
  if (/button-variants/.test(basename(f)) || /\/shims\//.test(f)) {
    violations.push(`shimsrc ${rel(f)}: a copy of kit debt inside the page — delete it and import '@shims/…' (src/shims is the only copy /sync-ai-map tracks)`)
  }
}
for (const f of tsx) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/from\s*['"]([^'"]*(?:button-variants|shims\/)[^'"]*)['"]/g)) {
    if (!m[1].startsWith('@shims/')) {
      violations.push(`shimsrc ${rel(f)}:${lineOf(src, m.index)}: '${m[1]}' → import it as '@shims/${m[1].split(/shims\//).pop()}' (the alias works from any depth)`)
    }
  }
}

// ── exit: index.ts exports only the page ──
const indexFile = files.find((f) => /^index\.tsx?$/.test(basename(f)) && resolve(f, '..') === dir)
if (!indexFile) {
  violations.push(`exit    ${rel(dir)}/index.ts is missing`)
} else {
  const exports = readFileSync(indexFile, 'utf8').split('\n').filter((l) => /^\s*export\b/.test(l))
  if (exports.length !== 1 || !new RegExp(`\\b${basename(dir)}\\b`).test(exports[0])) {
    violations.push(`exit    ${rel(indexFile)}: must be exactly one export, of ${basename(dir)}; found ${exports.length}`)
  }
}

// ── barrel: index files inside components/ or model/ ──
for (const f of files) {
  if (/^index\.tsx?$/.test(basename(f)) && /\/(components|model)\//.test(f)) {
    violations.push(`barrel  ${rel(f)}: no barrels inside components/ or model/`)
  }
}

// ── report: everything derivable from code ──
if (args.includes('--report')) {
  console.log('## derived drift facts — quote these, do not restate from memory')
  console.log('\nshims used:')
  console.log(shimWhere.length ? shimWhere.map((s) => `  ${s}`).join('\n') : '  (none)')
  console.log('\noff-system markers:')
  const off = []
  for (const f of css) {
    readFileSync(f, 'utf8').split('\n').forEach((l, i) => { if (l.includes('off-system:')) off.push(`  ${rel(f)}:${i + 1}: ${l.trim()}`) })
  }
  console.log(off.length ? off.join('\n') : '  (none)')
  console.log('\nkit components imported (per file):')
  const kit = []
  for (const f of tsx) {
    const names = kitImports(readFileSync(f, 'utf8'))
    if (names.length) kit.push(`  ${rel(f)}: ${names.join(', ')}`)
  }
  console.log(kit.length ? kit.join('\n') : '  (none)')
  console.log('\nnative interactive elements (hand-rolled unless the registry says otherwise):')
  const native = []
  for (const f of tsx) {
    const src = readFileSync(f, 'utf8')
    for (const m of src.matchAll(/<(button|input|select|textarea|a)\b/g)) native.push(`  ${rel(f)}:${lineOf(src, m.index)}: <${m[1]}>`)
  }
  console.log(native.length ? native.join('\n') : '  (none)')
  console.log('\nauthored icons:')
  const icons = files.filter((f) => basename(f) === 'icons.tsx')
  const names = icons.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/export function (\w+)/g)].map((m) => m[1]))
  console.log(names.length ? `  ${names.join(', ')}` : '  (none)')
  if (!digest) {
    console.log('\nNOT derivable without --figma <nodeId>: typography drift, token-family mismatches, detached layers.')
  } else {
    console.log(`\n## drift from Figma ${digest.node} (figma-digest cache) — quote these too`)
    const typo = digest.typography.filter((t) => !t.fidelity.startsWith('✅'))
    console.log('\ntypography drift:')
    console.log(typo.length ? typo.map((t) => `  ${t.style} ×${t.nodes.length} → ${t.variant}: ${t.fidelity}`).join('\n') : '  (none)')
    const mism = digest.families.flatMap((f) => f.props.filter((p) => p.mismatch).map((p) => `  ${f.name} (${f.ids.join(', ')}) ${p.prop} ${p.value}: ${p.mismatch} → kept ${p.drawn}`))
    console.log('\ntoken-family mismatches:')
    console.log(mism.length ? mism.join('\n') : '  (none)')
    console.log('\ndetached layers rendered as kit components:')
    console.log(digest.detached.length ? digest.detached.map((d) => `  ${d.name} ${d.id} (${d.state}, drawn as ${d.drawnAs})`).join('\n') : '  (none)')
    const off = digest.instances.filter((i) => ['missing', 'absent', 'tokens-only'].includes(i.status))
    console.log('\nregistry gaps (hand-rolled / stubbed instances):')
    console.log(off.length ? off.map((i) => `  ${i.name} ${i.id}: ${i.status}`).join('\n') : '  (none)')
  }
}

if (violations.length) {
  console.log(violations.join('\n'))
  if (violations.some((v) => v.startsWith('font '))) {
    console.log('hint    font: text metrics come only from <Typography>. Use the nearest variant as-is (Typography.kit.md), with NO size/weight override in CSS — the visible difference IS the drift you report. An off-system marker does not waive this.')
  }
  console.error(`✗ ${violations.length} violation(s) in ${target} — the page is NOT done. There are no "expected" violations: fix each line and re-run until exit 0.`)
  process.exit(1)
}
console.log(`✓ ${target}: no raw text, no text metrics in CSS, index exports the page only${expectRaw ? ', shim usage matches Figma' : ''}`)
