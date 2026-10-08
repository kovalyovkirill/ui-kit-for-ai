#!/usr/bin/env node
// Every fact a page-gen run needs from the Figma blob that is DERIVABLE — printed by a
// script so the agent quotes it instead of counting 30 KB of Tailwind by eye.
//
//   node .ai-kit/bin/figma-digest.mjs <nodeId | figma URL> [--from-file <blob.tsx>]
//
// Fetches get_design_context from the Figma desktop MCP server over plain HTTP (the
// same server the agent's mcp__figma-desktop__* tools talk to), then prints:
//   sections      direct children of the page root — one component each (SKILL 2c)
//   components    every instance resolved through kit.json → figmaComponents, with its
//                 variant read from token names (--button-ghost-* → ghost), plus
//                 detached form controls and lookalike frames (SKILL 2a)
//   typography    every text style → Typography variant, with the ⚠️/❌ row it hits,
//                 and unstyled text matched by metrics (SKILL 2b)
//   families      plain frames named <X>Card/<X>Badge/…: per property, the family token
//                 that equals what Figma drew, or the mismatch (SKILL 2a)
//   repeats       repeated layers and the signals that differ between them (SKILL 2e)
//   decorations, fixed text widths, image slots (SKILL 2d, 2e, rule 7)
//
// The blob and a JSON digest are cached in .ai-kit/.cache/figma-<id>.{tsx,json};
// `check-page --figma <id>` verifies the page against that JSON.
//
// Exit 0 = digest printed. Exit 2 = could not run (Figma not reachable, node missing,
// or the parser lost nodes) — never read that as "nothing to report".

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, TOKENS_PATH, readKitJson } from './lib/tokens.mjs'

const MCP = process.env.FIGMA_MCP_URL ?? 'http://127.0.0.1:3845/mcp'
const CACHE = join(ROOT, '.ai-kit/.cache')
const GENERIC = /^(Frame|Group|Rectangle|Vector|Ellipse|Line|Container)(\s*\d+)?$/

const fail = (msg) => { console.error(`figma-digest: ${msg}`); process.exit(2) }

// ── args ──
const args = process.argv.slice(2)
const fromFile = args.includes('--from-file') ? args[args.indexOf('--from-file') + 1] : null
const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--from-file')
if (!target) fail('usage: figma-digest.mjs <nodeId | figma URL> [--from-file <blob>]')
const idMatch = target.match(/node-id=(\d+)[-:](\d+)/) || target.match(/^(\d+)[-:](\d+)$/)
if (!idMatch) fail(`cannot read a node id from "${target}" (want 2159:2910, 2159-2910 or a figma URL)`)
const nodeId = `${idMatch[1]}:${idMatch[2]}`
const slug = `${idMatch[1]}-${idMatch[2]}`

// ── fetch ──
async function rpc(body, session) {
  const res = await fetch(MCP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(session ? { 'mcp-session-id': session } : {}),
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  const data = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => JSON.parse(l.slice(5)))
  return { session: res.headers.get('mcp-session-id'), msg: data.at(-1) ?? (text ? JSON.parse(text) : null) }
}

async function fetchBlob() {
  let init
  try {
    init = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'figma-digest', version: '1' } } })
  } catch (e) {
    fail(`Figma desktop MCP not reachable at ${MCP} (${e.cause?.code ?? e.message}) — open the file in Figma desktop with the Dev Mode MCP server enabled`)
  }
  await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, init.session)
  const { msg } = await rpc({
    jsonrpc: '2.0', id: 2, method: 'tools/call',
    params: { name: 'get_design_context', arguments: { nodeId, forceCode: true, excludeScreenshot: true, clientFrameworks: 'react', clientLanguages: 'typescript,css' } },
  }, init.session)
  if (!msg?.result || msg.result.isError) fail(`get_design_context failed: ${JSON.stringify(msg?.error ?? msg?.result?.content ?? msg).slice(0, 300)}`)
  return msg.result.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n')
}

const blob = fromFile ? readFileSync(fromFile, 'utf8') : await fetchBlob()

// ── parse the JSX into a tree ──
const start = blob.indexOf('return (')
const end = blob.indexOf('\nSUPER CRITICAL')
if (start < 0) fail('no "return (" in the blob — the MCP output format changed; the digest cannot be trusted')
const jsx = blob.slice(start, end > start ? end : undefined)

const TAG = /<(\/?)([A-Za-z][\w.]*)((?:[^>"'{]|"[^"]*"|'[^']*'|\{[^{}]*\})*?)(\/?)>/g
const attr = (s, name) => s.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
const root = { tag: 'root', children: [], text: '' }
const stack = [root]
const all = []
let last = 0
for (const m of jsx.matchAll(TAG)) {
  const between = jsx.slice(last, m.index).trim()
  if (between && !between.startsWith('return')) stack.at(-1).text += (stack.at(-1).text ? ' ' : '') + between.replace(/\s+/g, ' ')
  last = m.index + m[0].length
  const [, closing, tag, attrs, selfClosing] = m
  if (closing) {
    const i = stack.findLastIndex((n) => n.tag === tag)
    if (i > 0) stack.length = i
    continue
  }
  const node = {
    tag,
    id: attr(attrs, 'data-node-id'),
    name: attr(attrs, 'data-name'),
    cls: (attr(attrs, 'className') ?? '').split(/\s+/).filter(Boolean),
    children: [],
    text: '',
    parent: stack.at(-1),
  }
  stack.at(-1).children.push(node)
  all.push(node)
  if (!selfClosing) stack.push(node)
}
const expectedIds = (jsx.match(/data-node-id="/g) ?? []).length
const parsedIds = all.filter((n) => n.id).length
if (!expectedIds || parsedIds !== expectedIds) fail(`parser lost nodes: ${parsedIds} of ${expectedIds} data-node-id attributes — the digest cannot be trusted`)
const top = root.children[0]
if (top?.id !== nodeId) fail(`blob root is ${top?.id}, expected ${nodeId}`)

const desc = (n) => n.children.flatMap((c) => [c, ...desc(c)])
const allText = (n) => [n.text, ...n.children.map(allText)].filter(Boolean).join(' ')
const isInstance = (n) => !!n.id && (n.id.startsWith('I') || desc(n).some((d) => d.id?.startsWith(`I${n.id};`)))
const insideInstance = (n) => n.id?.startsWith('I') || (n.parent && n.parent.tag !== 'root' && (isInstance(n.parent) || insideInstance(n.parent)))
const quote = (s, n = 32) => `"${s.length > n ? s.slice(0, n - 1) + '…' : s}"`

// Figma var → token: `var(--spacing\/1.5,6px)` → { token: 'spacing-1-5', raw: 'spacing\/1.5', fallback: '6px' }
const varOf = (v) => {
  const m = v.match(/^var\(--([^,)]+)(?:,(.*))?\)$/)
  return m ? { token: m[1].replace(/\\\//g, '-').replace(/[/.]/g, '-').toLowerCase(), raw: m[1], fallback: m[2] } : null
}
const varsIn = (n) => n.cls.flatMap((c) => [...c.matchAll(/var\(--([^,)]+)/g)].map((m) => m[1]))

// ── contracts ──
const kit = readKitJson()
const registry = kit.figmaComponents
const componentNames = Object.keys(registry).filter((k) => typeof registry[k] === 'object' && registry[k].status)
const kitMd = (name) => {
  const p = join(ROOT, `.ai-kit/${name}.kit.md`)
  return existsSync(p) ? readFileSync(p, 'utf8') : ''
}
const variantValues = (name) => {
  const fm = kitMd(name).match(/^\s*variant:\s*\{\s*values:\s*\[([^\]]*)\]/m)
  return new Set([...(fm ? fm[1].split(',').map((s) => s.trim()) : []), ...Object.keys(registry[name]?.variants ?? {})])
}
const tokens = new Map(
  readFileSync(TOKENS_PATH, 'utf8').split('\n').filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split(/\s+/)).map(([name, tier, ref, light, dark]) => [name, { tier, ref, light, dark }]),
)

const typoMd = kitMd('Typography')
const styleRows = new Map(
  [...typoMd.matchAll(/^\|\s*((?:Display|Body|Label)\/\w+)\s*\|\s*(\d+) \/ (\d+) \/ (\d+)\s*\|\s*(?:`(\w+)`|—)\s*\|\s*(.+?)\s*\|\s*$/gm)]
    .map((m) => [m[1], { metrics: `${m[2]}/${m[3]}/${m[4]}`, variant: m[5] ?? null, fidelity: m[6].replace(/\*\*/g, '') }]),
)
const renderRows = [...typoMd.matchAll(/^\|\s*(\w+)\s*\|\s*([\w-]+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/gm)]
  .map((m) => ({ variant: m[1], size: +m[3], weight: +m[4], lh: +m[5] }))
if (!styleRows.size || !renderRows.length) fail('could not read the tables in .ai-kit/Typography.kit.md')

const digest = { node: nodeId, sections: [], instances: [], detached: [], lookalikes: [], typography: [], families: [], repeats: [], decorations: {}, fixedWidths: [], images: [] }

// ── sections: descend through single-child wrappers ──
let page = top
const wrappers = [top]
while (page.children.filter((c) => c.id).length === 1) wrappers.push(page = page.children.find((c) => c.id))
digest.sections = page.children.filter((c) => c.id).map((c) => ({ id: c.id, name: c.name ?? c.tag }))
// The artboard's own width (w-[1440px] + absolute left-0 top-0 on the wrappers) is the
// canvas, not a layout width — a Haiku run shipped `width: 1440px` on the page root.
digest.canvasWidth = +(wrappers.flatMap((w) => w.cls).map((c) => c.match(/^w-\[(\d+)px\]$/)?.[1]).find(Boolean) ?? 0) || null

// ── components ──
const variantOf = (n, name) => {
  const fam = name.toLowerCase()
  const values = variantValues(name)
  for (const v of [n, ...desc(n)].flatMap(varsIn)) {
    const seg = v.split('\\/')
    if (seg[0] === fam && values.has(seg[1])) return seg[1]
  }
  return null
}
for (const n of all) {
  if (!n.id || n.id.startsWith('I') || insideInstance(n.parent ?? {})) continue
  const name = n.name
  if (!name) continue
  const entry = registry[name]
  if (isInstance(n)) {
    const variant = entry ? variantOf(n, name) : null
    const vStatus = variant && entry?.variants?.[variant]
    digest.instances.push({ id: n.id, name, status: entry?.status ?? 'absent', variant, variantStatus: vStatus ?? null })
  } else if (entry?.detached) {
    const checked = desc(n).some((d) => d.tag === 'img') || varsIn(n).some((v) => v.includes('checked'))
    digest.detached.push({ id: n.id, name, state: checked ? 'checked' : 'empty', drawnAs: desc(n).some((d) => d.tag === 'img') ? '<img>' : 'frame' })
  } else if (entry) {
    digest.lookalikes.push({ id: n.id, name })
  }
}
const expectShim = { ghost: 0, clear: 0, bordered: 0 }
for (const i of digest.instances) if (i.variantStatus === 'shim' && i.variant in expectShim) expectShim[i.variant]++
digest.expectShim = expectShim

// ── typography (text nodes outside instances — kit components render their own) ──
const WEIGHT = { thin: 100, light: 300, normal: 400, regular: 400, medium: 500, semibold: 600, semi_bold: 600, bold: 700, extrabold: 800, black: 900 }
const textNodes = all.filter((n) => n.text && (n.tag === 'p' || n.tag === 'span') && !insideInstance(n))
const typo = new Map()
for (const n of textNodes) {
  let key, row
  const sm = n.cls.join(' ').match(/var\(--(display|body|label)\\\/(\w+)\\\/fontsize/)
  if (sm) {
    key = `${sm[1][0].toUpperCase()}${sm[1].slice(1)}/${sm[2].toUpperCase()}`
    const r = styleRows.get(key)
    row = r
      ? { variant: r.variant ?? renderRows.reduce((a, b) => (Math.abs(b.size - +r.metrics.split('/')[0]) < Math.abs(a.size - +r.metrics.split('/')[0]) ? b : a)).variant, fidelity: r.fidelity, metrics: r.metrics }
      : { variant: null, fidelity: '❌ style not in Typography.kit.md', metrics: '?' }
  } else {
    const size = +(n.cls.join(' ').match(/(?:^|\s)text-\[(\d+)px\]/)?.[1] ?? NaN)
    const lh = +(n.cls.join(' ').match(/leading-\[(\d+)px\]/)?.[1] ?? NaN)
    const wCls = n.cls.find((c) => /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/.test(c))
    const wFam = n.cls.join(' ').match(/Inter:([A-Za-z_]+)/)?.[1]?.toLowerCase()
    const weight = WEIGHT[wCls?.slice(5)] ?? WEIGHT[wFam] ?? NaN
    key = `unstyled ${size}/${weight}/${lh}`
    const exact = renderRows.find((r) => r.size === size && r.weight === weight && r.lh === lh)
    const near = renderRows.reduce((a, b) => (Math.abs(b.size - size) < Math.abs(a.size - size) ? b : a))
    row = exact
      ? { variant: exact.variant, fidelity: '✅ metrics exact (no named style in Figma)', metrics: `${size}/${weight}/${lh}` }
      : { variant: near.variant, fidelity: `❌ no variant — use ${near.variant} (${near.size}/${near.weight}/${near.lh}) as-is, no CSS override; report the size drop as drift`, metrics: `${size}/${weight}/${lh}` }
  }
  if (!typo.has(key)) typo.set(key, { style: key, ...row, nodes: [] })
  typo.get(key).nodes.push({ id: n.id, text: n.text })
}
digest.typography = [...typo.values()]

// ── decorations, fixed widths, images ──
for (const n of textNodes) {
  for (const d of ['line-through', 'underline', 'uppercase', 'italic']) {
    if (n.cls.includes(d)) (digest.decorations[d] ??= []).push({ id: n.id, text: n.text })
  }
  const w = n.cls.map((c) => c.match(/^w-\[(\d+)px\]$/)?.[1]).find(Boolean)
  if (w) digest.fixedWidths.push({ id: n.id, px: +w, text: n.text, wraps: !n.cls.includes('whitespace-nowrap') })
}
for (const n of all.filter((x) => x.tag === 'img')) {
  const slot = n.parent
  if (digest.detached.some((d) => d.id === slot.id)) continue
  const owner = (function up(x) { return !x || x.tag === 'root' ? null : (x.id && !x.id.startsWith('I') && isInstance(x) ? x : up(x.parent)) })(slot)
  digest.images.push({ id: slot.id, name: slot.name ?? '?', in: owner ? `${owner.name} ${owner.id}` : null })
}

// ── token families on plain frames named <X><Component> ──
const PROPS = [
  [/^p-\[(.+)\]$/, 'padding'], [/^px-\[(.+)\]$/, 'padding-x'], [/^py-\[(.+)\]$/, 'padding-y'],
  [/^gap-\[(.+)\]$/, 'gap'], [/^rounded-\[(.+)\]$/, 'radius'], [/^bg-\[(.+)\]$/, 'background'],
  [/^border-\[length:(.+)\]$/, 'border-width'], [/^border-\[(?!length:)(.+)\]$/, 'border'],
]
const familyCandidates = (fam, prop) => [...tokens.keys()].filter((t) => {
  if (!t.startsWith(`${fam}-`)) return false
  if (prop === 'padding') return /-padding(-(xs|sm|md|lg|xl))?$/.test(t)
  if (prop === 'padding-x') return /-padding-x(-|$)/.test(t) || /-padding(-(xs|sm|md|lg|xl))?$/.test(t)
  if (prop === 'padding-y') return /-padding-y(-|$)/.test(t) || /-padding(-(xs|sm|md|lg|xl))?$/.test(t)
  if (prop === 'border') return t.includes('border') && !t.includes('border-width')
  return t.includes(prop)
})
const drawnValue = (v) => {
  const x = varOf(v)
  if (!x) return { label: v, light: v, dark: v }
  const t = tokens.get(x.token)
  return t ? { label: `--${x.token}`, light: t.light, dark: t.dark } : { label: `--${x.token} (NOT in tokens.txt)`, light: x.fallback, dark: x.fallback }
}
const famSeen = new Map()
for (const n of all) {
  if (!n.name || !n.id || isInstance(n) || insideInstance(n)) continue
  const comp = componentNames.find((c) => n.name !== c && n.name.endsWith(c))
  if (!comp) continue
  const fam = comp.toLowerCase()
  const props = []
  for (const c of n.cls) {
    for (const [re, prop] of PROPS) {
      const m = c.match(re)
      if (!m || (prop === 'border' && !m[1].startsWith('var('))) continue
      const drawn = drawnValue(m[1])
      const cands = familyCandidates(fam, prop)
      const equal = cands.filter((t) => tokens.get(t).light === drawn.light && tokens.get(t).dark === drawn.dark)
      props.push({
        prop, drawn: drawn.label, value: drawn.light === drawn.dark ? drawn.dark : `${drawn.light}/${drawn.dark}`,
        use: equal.length ? `--${equal[0]}` : null,
        mismatch: !equal.length && cands.length ? cands.map((t) => `--${t} ${tokens.get(t).dark}`).join(', ') : null,
      })
    }
  }
  const sig = JSON.stringify([n.name, props])
  if (famSeen.has(sig)) { famSeen.get(sig).ids.push(n.id); continue }
  const entry = { name: n.name, family: `${fam}-*`, ids: [n.id], props }
  famSeen.set(sig, entry)
  digest.families.push(entry)
}

// ── repeats: same layer name (or same prefix before "_") ≥ 2 times, outside instances ──
const groups = new Map()
for (const n of all) {
  if (!n.name || !n.id || GENERIC.test(n.name) || n.id.startsWith('I') || insideInstance(n.parent ?? {}) || isInstance(n) || registry[n.name]) continue
  if (n.tag === 'p' || n.tag === 'span') continue
  const key = n.name.includes('_') ? `${n.name.split('_')[0]}_*` : n.name
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(n)
}
// A repeated group nested inside another group's members, with no styling of its own
// (CardHeader inside TaskCard), is a layout frame of that component — not a component
// (SKILL 2c first clause). It gets no matrix; its contents count toward the parent's.
const styled = (n) => n.cls.some((c) => /^(bg-\[|border|p[xytblr]?-\[|rounded-\[)/.test(c))
const repeated = [...groups].filter(([, nodes]) => nodes.length >= 2)
const memberOf = new Map(repeated.flatMap(([key, nodes]) => nodes.map((n) => [n, key])))
const ancestorGroup = (n, own) => { for (let p = n.parent; p && p.tag !== 'root'; p = p.parent) if (memberOf.has(p) && memberOf.get(p) !== own) return memberOf.get(p); return null }
const internal = new Map()
for (const [key, nodes] of repeated) {
  const outer = ancestorGroup(nodes[0], key)
  if (outer && nodes.every((n) => ancestorGroup(n, key)) && !nodes.every(styled)) internal.set(key, outer)
}
const stopAt = new Set([...memberOf].filter(([, key]) => !internal.has(key)).map(([n]) => n))
const signals = (n) => {
  const s = new Set()
  s.add(`layout: ${n.cls.includes('flex-col') ? 'column' : 'row'}`)
  for (const c of n.cls) {
    const bg = c.match(/^bg-\[(var\(.+\))\]$/); if (bg) s.add(`bg: --${varOf(bg[1]).token}`)
    const br = c.match(/^border-\[(var\(.+\))\]$/); if (br) s.add(`border: --${varOf(br[1]).token}`)
  }
  const counts = new Map()
  for (const c of n.children) if (c.name && !GENERIC.test(c.name) && c.tag !== 'p' && !isInstance(c) && !registry[c.name]) counts.set(c.name, (counts.get(c.name) ?? 0) + 1)
  for (const [name, k] of counts) s.add(`has ${name}${k > 1 ? ` ×${k}` : ''}`)
  const walk = (x) => {
    for (const d of x.children) {
      if (stopAt.has(d)) continue
      if (d.id && !d.id.startsWith('I') && isInstance(d) && d.name) {
        const v = registry[d.name] ? variantOf(d, d.name) : null
        s.add(`${d.name}${v ? `[${v}]` : ''}`)
        continue
      }
      if (d.name && registry[d.name]?.detached) s.add(`${d.name} ${digest.detached.find((y) => y.id === d.id)?.state}`)
      if (d.tag === 'p') { for (const dec of ['line-through', 'underline']) if (d.cls.includes(dec)) s.add(`text ${dec}`); texts++ }
      walk(d)
    }
  }
  let texts = 0
  walk(n)
  s.add(`text nodes: ${texts}`)
  return s
}
digest.internal = [...internal].map(([name, parent]) => ({ name, parent, ids: groups.get(name).map((n) => n.id) }))
for (const [key, nodes] of repeated) {
  if (internal.has(key)) continue
  const sigs = nodes.map(signals)
  const allSigs = [...new Set(sigs.flatMap((s) => [...s]))]
  digest.repeats.push({
    name: key,
    ids: nodes.map((n) => n.id),
    labels: nodes.map((n) => quote(allText(n).split(' ').slice(0, 3).join(' '), 18)),
    common: allSigs.filter((x) => sigs.every((s) => s.has(x))),
    differing: allSigs.filter((x) => !sigs.every((s) => s.has(x))).map((x) => ({ signal: x, per: sigs.map((s) => s.has(x)) })),
  })
}

// ── components the page must define (SKILL 2c), by layer name: sections, repeated
// styled groups, named family frames. `Col_*`-style names are skipped — they take the
// name of what they are, which no script can know. (A Haiku run folded PerformanceCard
// into TaskCard behind an isPerformance flag and lost a card.)
digest.expectedComponents = [...new Set([
  ...digest.sections.map((s) => s.name),
  ...digest.repeats.map((r) => r.name),
  ...digest.families.map((f) => f.name),
].filter((n) => n && /^[A-Z][A-Za-z0-9]*$/.test(n)))]

// ── copy: every visible string, instance labels included (a Haiku run dropped a whole card) ──
digest.copy = [...new Set(all.filter((n) => n.text && (n.tag === 'p' || n.tag === 'span')).map((n) => n.text))]

// ── write cache ──
mkdirSync(CACHE, { recursive: true })
writeFileSync(join(CACHE, `figma-${slug}.tsx`), blob)
writeFileSync(join(CACHE, `figma-${slug}.json`), JSON.stringify(digest, null, 2) + '\n')

// ── print ──
const out = []
const say = (s = '') => out.push(s)
say(`## figma-digest ${nodeId} — derived from the blob; quote it, do not recount`)
say(`cache: .ai-kit/.cache/figma-${slug}.{tsx,json}`)
say(`\nsections (each → components/<Name>/, SKILL 2c): ${digest.sections.map((s) => `${s.name} ${s.id}`).join(' · ')}`)
say(`components the page must define (one Figma layer name = one component, differences are props): ${digest.expectedComponents.join(', ')}`)
if (digest.canvasWidth) say(`canvas: ${digest.canvasWidth}px artboard — the page root is width: 100%, never ${digest.canvasWidth}px, never position: absolute`)

say('\ncomponents (instances → kit.json figmaComponents):')
const byName = new Map()
for (const i of digest.instances) {
  const k = `${i.name}${i.variant ? `[${i.variant}]` : ''}`
  if (!byName.has(k)) byName.set(k, { ...i, ids: [] })
  byName.get(k).ids.push(i.id)
}
for (const [k, i] of byName) {
  const action = i.variantStatus === 'shim'
    ? `shim.${i.variant} (Button.kit.md → Unimplemented variants)`
    : { implemented: 'kit component', 'tokens-only': `stub src/shims/${i.name}/`, missing: `hand-roll per kit.json handRoll + drift entry`, absent: 'NOT IN REGISTRY → hand-roll + drift entry' }[i.status] ?? i.status
  say(`  ${k.padEnd(22)} ×${i.ids.length}  ${i.status.padEnd(12)} → ${action}   (${i.ids.join(', ')})`)
}
for (const d of digest.detached) say(`  ${`${d.name} (detached)`.padEnd(22)} ${d.id}  ${d.state}, drawn as ${d.drawnAs} → <${d.name}${d.state === 'checked' ? ' defaultChecked' : ''}> (${d.name}.kit.md → Detached layers)`)
for (const l of digest.lookalikes) say(`  ${`${l.name} (lookalike)`.padEnd(22)} ${l.id}  plain frame named like a kit component → hand-roll, NOT <${l.name}>`)
say(`  --expect-shim ghost=${expectShim.ghost},clear=${expectShim.clear},bordered=${expectShim.bordered}`)

say('\ntypography (Typography.kit.md table; ⚠️/❌ rows go into the drift report verbatim):')
for (const t of digest.typography) {
  say(`  ${t.style.padEnd(20)} ×${String(t.nodes.length).padEnd(2)} → ${String(t.variant).padEnd(9)} ${t.fidelity}`)
  say(`  ${''.padEnd(20)}     ${t.nodes.slice(0, 4).map((x) => `${x.id} ${quote(x.text, 20)}`).join(' · ')}${t.nodes.length > 4 ? ' …' : ''}`)
}

if (digest.families.length) {
  say('\ntoken families on plain frames (SKILL 2a — use the family token only where it equals the drawing):')
  for (const f of digest.families) {
    say(`  ${f.name} (${f.ids.join(', ')}) — ${f.family}`)
    for (const p of f.props) {
      const verdict = p.use ? `= ${p.use} → use it` : p.mismatch ? `≠ ${p.mismatch} → keep ${p.drawn}, TOKEN MISMATCH` : `no ${f.family} token for it → keep ${p.drawn}`
      say(`    ${p.prop.padEnd(12)} ${p.value.padEnd(16)} ${verdict}`)
    }
  }
}

if (digest.repeats.length) {
  say('\nrepeated layers (SKILL 2e — one component; every differing row is a prop):')
  for (const r of digest.repeats) {
    say(`  ${r.name} ×${r.ids.length}: ${r.ids.map((id, i) => `${id} ${r.labels[i]}`).join(' · ')}`)
    say(`    common: ${r.common.join(' · ') || '(none)'}`)
    for (const d of r.differing) say(`    ${d.signal.padEnd(34)} ${d.per.map((p) => (p ? '✓' : '—')).join('  ')}`)
  }
  if (digest.internal.length) say(`  layout frames, not components: ${digest.internal.map((i) => `${i.name} ×${i.ids.length} (inside ${i.parent})`).join(' · ')}`)
}

const decos = Object.entries(digest.decorations)
say(`\ntext decorations (carry into CSS): ${decos.length ? '' : '(none)'}`)
for (const [d, ns] of decos) say(`  ${d} ×${ns.length}: ${ns.map((x) => `${x.id} ${quote(x.text, 24)}`).join(' · ')}`)

say(`\nfixed widths on text nodes (rule 7 → max-width + off-system marker): ${digest.fixedWidths.length ? '' : '(none)'}`)
for (const w of digest.fixedWidths) say(`  ${w.px}px  ${w.id} ${quote(w.text, 30)}${w.wraps ? '' : '  (nowrap — layout noise, drop it)'}`)

say(`\nimage slots (no durable asset — icons are authored from the screenshot, SKILL 2d): ${digest.images.length ? '' : '(none)'}`)
for (const i of digest.images) say(`  ${i.name} ${i.id}${i.in ? ` inside ${i.in}` : ''}`)

console.log(out.join('\n'))
