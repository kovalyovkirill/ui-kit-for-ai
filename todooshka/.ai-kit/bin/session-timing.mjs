#!/usr/bin/env node
// Per-step timing of a Claude Code session, from its transcript (~/.claude/projects/<proj>/<session>.jsonl).
// MODEL = time the model spent before the next call (thinking + generating); TOOLS = tool wall time.
// Prints the timeline since the last real user prompt, then per-call latency.
//   node .ai-kit/bin/session-timing.mjs <session>.jsonl
import { readFileSync } from 'node:fs'
const f = process.argv[2]
const rows = readFileSync(f, 'utf8').trim().split('\n').map(x => { try { return JSON.parse(x) } catch { return null } }).filter(Boolean)
const msgs = rows.filter(r => (r.type === 'assistant' || r.type === 'user') && r.timestamp && r.message)
const t = r => new Date(r.timestamp).getTime()
const uses = new Map() // tool_use_id -> {name, ts, input}
const results = new Map()
let userPromptTs = null
const timeline = []
for (const r of msgs) {
  const c = Array.isArray(r.message.content) ? r.message.content : []
  if (r.type === 'user' && typeof r.message.content === 'string' && !r.isMeta && !r.message.content.startsWith('<')) userPromptTs = t(r)
  for (const b of c) {
    if (b.type === 'tool_use') uses.set(b.id, { name: b.name, ts: t(r), input: b.input })
    if (b.type === 'tool_result') results.set(b.tool_use_id, t(r))
  }
  timeline.push({ role: r.type, ts: t(r), c })
}
// assistant turns: dedupe by ts groups; compute model time = assistant ts - previous event ts (result/user)
let prev = userPromptTs
const out = []
const start = userPromptTs
for (const e of timeline) {
  if (e.ts < start) continue
  if (e.role === 'assistant') {
    const tools = e.c.filter(b => b.type === 'tool_use').map(b => b.name.replace('mcp__figma-desktop__', 'fig:'))
    out.push({ kind: 'MODEL', at: (e.ts - start) / 1000, dt: (e.ts - prev) / 1000, tools })
    prev = e.ts
  } else if (e.c.some(b => b.type === 'tool_result')) {
    out.push({ kind: 'TOOLS', at: (e.ts - start) / 1000, dt: (e.ts - prev) / 1000 })
    prev = e.ts
  }
}
let modelT = 0, toolT = 0
for (const o of out) { if (o.kind === 'MODEL') modelT += o.dt; else toolT += o.dt }
for (const o of out) console.log(`${o.kind.padEnd(5)} t=${o.at.toFixed(0).padStart(4)}s  +${o.dt.toFixed(1).padStart(6)}s  ${o.tools ? o.tools.join(',') : ''}`)
console.log(`\nTOTAL since prompt: ${((timeline.at(-1).ts - start) / 1000).toFixed(0)}s | model-side ${modelT.toFixed(0)}s | tool-side ${toolT.toFixed(0)}s`)
// per-tool latency (use -> result), only slowest
const lat = []
for (const [id, u] of uses) if (results.has(id) && u.ts >= start) lat.push([u.name.replace('mcp__figma-desktop__', 'fig:'), (results.get(id) - u.ts) / 1000, JSON.stringify(u.input).slice(0, 70)])
console.log('\nper-call use→result (parallel calls share wall time):')
for (const l of lat) console.log(`${l[1].toFixed(1).padStart(6)}s  ${l[0].padEnd(22)} ${l[2]}`)
