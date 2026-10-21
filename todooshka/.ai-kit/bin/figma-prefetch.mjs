#!/usr/bin/env node
// Hook (UserPromptSubmit, PreToolUse:Skill): starts the Figma fetch the moment a page-gen
// request appears, so the ~6 s get_design_context runs while the model is still loading
// the skill instead of inside preflight. Fire-and-forget: spawns
// `figma-digest.mjs <node> --fetch-only` detached and exits 0 at once, printing nothing
// (UserPromptSubmit stdout would land in the model's context).
//
// Triggers on a figma.com URL with node-id= in the prompt, or on a Skill call to
// figma-page-gen (whose args may be a bare node id). Anything else → no-op.
// The digest consumes the result once (see figma-digest.mjs → prefetch).

import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BIN = dirname(fileURLToPath(import.meta.url))
const CACHE = join(BIN, '../.cache')

let input = {}
try { input = JSON.parse(readFileSync(0, 'utf8')) } catch { process.exit(0) }

let m = null
if (typeof input.prompt === 'string') {
  m = input.prompt.match(/figma\.com\/\S*node-id=(\d+)[-:](\d+)/)
} else if (input.tool_name === 'Skill' && /figma-page-gen/.test(input.tool_input?.skill ?? '')) {
  const a = String(input.tool_input?.args ?? '')
  m = a.match(/node-id=(\d+)[-:](\d+)/) || a.match(/(?:^|\s)(\d+)[-:](\d+)(?:\s|$)/)
}
if (!m) process.exit(0)

// Already in flight or fetched moments ago (prompt hook, then the Skill hook) → skip.
const marker = join(CACHE, `figma-${m[1]}-${m[2]}.prefetch.json`)
try {
  const prev = JSON.parse(readFileSync(marker, 'utf8'))
  if (Date.now() - prev.startedAt < 60_000 && prev.state !== 'failed') process.exit(0)
} catch {}

// Marker first, synchronously: a digest that starts before the child is up must
// already see "pending" and wait, not launch a second identical fetch.
mkdirSync(CACHE, { recursive: true })
writeFileSync(marker, JSON.stringify({ state: 'pending', startedAt: Date.now() }))
spawn(process.execPath, [join(BIN, 'figma-digest.mjs'), `${m[1]}:${m[2]}`, '--fetch-only'], {
  detached: true,
  stdio: 'ignore',
}).unref()
