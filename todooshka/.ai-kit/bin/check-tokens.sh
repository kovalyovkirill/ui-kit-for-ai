#!/usr/bin/env bash
# Verifies that every var(--…) used in a generated page resolves to a token the
# ui-kit actually defines. A misspelled token is invisible to tsc and to the dev
# server — the browser just renders nothing. This is the only cheap detector.
#
# Usage (from anywhere):
#   bash .ai-kit/bin/check-tokens.sh src/pages/Dark
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TOKENS="$ROOT/.ai-kit/tokens.txt"
TARGET="${1:-$ROOT/src/pages}"

[[ -f "$TOKENS" ]] || { echo "error: $TOKENS missing — run gen-tokens.sh first" >&2; exit 1; }

# ─── Step 0: is the manifest itself still true? ───
# Must run before the usage check below. A stale manifest is worse than none:
# a genuinely-new ui-kit token would be reported as UNKNOWN TOKEN, and the
# cheapest "fix" is to swap a correct token for a wrong-but-listed one.
# The two failure modes must therefore read completely differently — this one
# says *regenerate the manifest*, never *fix your CSS*.
if ! bash "$(dirname "${BASH_SOURCE[0]}")/gen-tokens.sh" --check; then
  echo "✗ .ai-kit/tokens.txt is STALE relative to the ui-kit source (names listed above)" >&2
  echo "  fix: bash .ai-kit/bin/gen-tokens.sh   — then re-run this check" >&2
  echo "  do NOT change your CSS in response to this message." >&2
  exit 1
fi

[[ -e "$TARGET" ]] || { echo "error: target not found: $TARGET" >&2; exit 1; }

css_files=$(find "$TARGET" -name '*.module.css')
[[ -n "$css_files" ]] || { echo "no .module.css files under $TARGET"; exit 0; }

# Custom properties declared locally inside the page itself are legitimate too.
# `|| true` — "no matches" is a normal outcome here, not a failure.
local_defs=$(echo "$css_files" | xargs grep -hoE '^[[:blank:]]*--[a-z0-9-]+[[:blank:]]*:' 2>/dev/null \
  | sed -E 's/^[[:blank:]]*--//; s/[[:blank:]]*:$//' | sort -u || true)

# Capture the whole name up to `)` or `,` — NOT just [a-z0-9-]+. Stopping at the
# first invalid char would silently truncate `--spacing-1.5` to the valid
# `--spacing-1` and let the Figma dot-vs-dash bug through.
used=$(echo "$css_files" | xargs grep -hoE 'var\(--[^),;[:space:]]+' 2>/dev/null \
  | sed -E 's/^var\(--//' | sort -u || true)

bad=0
while IFS= read -r tok; do
  if [[ -z "$tok" ]]; then
    continue
  fi
  if ! grep -Fxq "$tok" "$TOKENS" && ! echo "$local_defs" | grep -Fxq "$tok"; then
    echo "UNKNOWN TOKEN: --$tok"
    # -F: the name may contain regex metacharacters (e.g. the dot in --spacing-1.5)
    echo "$css_files" | xargs grep -nF -- "var(--$tok" | sed 's/^/    /'
    bad=1
  fi
done <<< "$used"

# ─── Step 2: hardcoded px / hex values (coding rule 3) ───
# Every visual value must be var(--token). Passes: 0, 1px hairlines, sub-px
# strokes, and `outline` rules (the kit itself hardcodes its 2px focus ring).
# Anything else needs a real token, or — only when none exists — a same-line
# `/* off-system: <reason> */` marker, which must then be listed in the page's
# drift report so nothing off-system is ever silent.
hard=$(echo "$css_files" | xargs grep -nE '([2-9]|[0-9]{2,})(\.[0-9]+)?px|#[0-9a-fA-F]{3,8}' 2>/dev/null \
  | grep -v 'off-system:' | grep -vE '^[^:]+:[0-9]+:[[:blank:]]*outline' || true)
if [[ -n "$hard" ]]; then
  echo "HARDCODED VALUE (use a token, or add a same-line /* off-system: reason */ marker):"
  echo "$hard" | sed 's/^/    /'
  bad=1
fi

if [[ $bad -eq 0 ]]; then
  echo "✓ all $(echo "$used" | grep -c . || true) tokens used in $TARGET resolve; no unmarked hardcoded values"
else
  echo "✗ check failed for $TARGET — see findings above" >&2
  exit 1
fi
