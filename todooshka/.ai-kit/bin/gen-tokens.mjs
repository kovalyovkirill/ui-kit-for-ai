#!/usr/bin/env node
// Derives .ai-kit/tokens.txt — every CSS custom property the ui-kit defines,
// with its tier and its value resolved per theme — from the ui-kit source CSS.
// See lib/tokens.mjs for the column contract and why values are carried.
//
// The manifest is a *pure function* of that source, which is why it never needs
// a stored checksum: it can simply be re-derived and compared.
//
//   node .ai-kit/bin/gen-tokens.mjs            write the manifest
//   node .ai-kit/bin/gen-tokens.mjs --stdout   print it, write nothing
//   node .ai-kit/bin/gen-tokens.mjs --check    exit 1 if the manifest is stale
//
// Exit 0 = fine. Exit 1 = --check found drift. Exit 2 = could not run at all
// (no source CSS, unknown flag) — never confuse that with "nothing to do".

import { readFileSync, writeFileSync } from 'node:fs'
import {
  TOKENS_PATH,
  TOKENS_DISPLAY,
  emitManifest,
  compareManifest,
} from './lib/tokens.mjs'

const mode = process.argv[2] ?? 'write'

if (!['write', '--stdout', '--check'].includes(mode)) {
  console.error('usage: gen-tokens.mjs [--stdout|--check]')
  process.exit(2)
}

// The source CSS missing is an environment problem, not drift: say so and stop
// rather than writing an empty manifest that would look like "the kit has no
// tokens" to every other script.
let manifest
try {
  manifest = emitManifest()
} catch (err) {
  console.error(`error: ${err.message}`)
  process.exit(2)
}

if (mode === '--stdout') {
  process.stdout.write(manifest)
  process.exit(0)
}

if (mode === '--check') {
  const result = compareManifest()

  if (result.missing) {
    console.error(`manifest missing: ${TOKENS_PATH}`)
    process.exit(1)
  }
  if (result.fresh) {
    process.exit(0)
  }
  // Report *what* moved, so the caller sees the actual drift: a token appearing
  // or disappearing is a different event from one whose value was retuned.
  if (result.headerOnly) {
    console.error('manifest body matches the source but the file differs — the header was hand-edited')
  } else {
    for (const name of result.added) console.error(`  + ${name}`)
    for (const name of result.removed) console.error(`  - ${name}`)
    for (const name of result.changed) console.error(`  ~ ${name} (value changed)`)
  }
  process.exit(1)
}

// mode === 'write'
const current = compareManifest()
if (current.fresh) {
  console.log(`unchanged: ${TOKENS_DISPLAY}`)
} else {
  writeFileSync(TOKENS_PATH, manifest)
  const count = readFileSync(TOKENS_PATH, 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#')).length
  console.log(`updated: ${TOKENS_DISPLAY} (${count} tokens)`)
}
