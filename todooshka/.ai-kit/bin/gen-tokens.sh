#!/usr/bin/env bash
# Derives .ai-kit/tokens.txt — the flat list of every CSS custom property the
# ui-kit defines — from the ui-kit source CSS.
#
# The manifest is a *pure function* of that source, which is why it never needs
# a stored checksum: it can simply be re-derived and compared. Deliberately
# reads ui-kit/src rather than ui-kit/dist, so it stays correct without a build.
#
#   bash .ai-kit/bin/gen-tokens.sh            write the manifest
#   bash .ai-kit/bin/gen-tokens.sh --stdout   print it, write nothing
#   bash .ai-kit/bin/gen-tokens.sh --check    exit 1 if the manifest is stale
set -euo pipefail

# Byte-wise collation. Without this the sort order follows the caller's locale:
# glibc's en_US.UTF-8 ignores punctuation at the primary level and orders
# `spacing-10` before `spacing-1-5`, so every --check would report phantom
# drift on Linux while passing on macOS.
export LC_ALL=C

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# Keep in sync with "tokensSource" in .ai-kit/kit.json.
SRC="$ROOT/../ui-kit/src/styles/css/_varaibles-full.css"
OUT="$ROOT/.ai-kit/tokens.txt"

MODE="${1:-write}"

if [[ ! -f "$SRC" ]]; then
  echo "error: token source not found: $SRC" >&2
  exit 2
fi

# The single place that knows the manifest format.
# Nothing emitted here may vary between runs — no timestamp, no count, no hash —
# otherwise --check could not be a plain whole-file comparison.
# The header lines start with '#', which check-tokens.sh can never match: it
# looks tokens up with `grep -Fxq`, an exact whole-line match.
emit() {
  echo "# GENERATED — do not edit by hand."
  echo "# source:     ui-kit/src/styles/css/_varaibles-full.css"
  echo "# regenerate: bash .ai-kit/bin/gen-tokens.sh"
  grep -oE '^[[:blank:]]*--[a-z0-9-]+[[:blank:]]*:' "$SRC" \
    | sed -E 's/^[[:blank:]]*--//; s/[[:blank:]]*:$//' \
    | sort -u
}

case "$MODE" in
  --stdout)
    emit
    ;;

  --check)
    if [[ ! -f "$OUT" ]]; then
      echo "manifest missing: $OUT" >&2
      exit 1
    fi
    if diff -q <(emit) "$OUT" >/dev/null 2>&1; then
      exit 0
    fi
    # Report *which* names moved so the caller sees what actually drifted.
    # Both sides are LC_ALL=C sorted, which is what comm requires.
    added="$(comm -13 <(grep -v '^#' "$OUT") <(emit | grep -v '^#') || true)"
    removed="$(comm -23 <(grep -v '^#' "$OUT") <(emit | grep -v '^#') || true)"
    if [[ -z "$added" && -z "$removed" ]]; then
      echo "manifest body matches the source but the file differs — the header was hand-edited" >&2
    else
      if [[ -n "$added" ]]; then
        echo "$added" | sed 's/^/  + /' >&2
      fi
      if [[ -n "$removed" ]]; then
        echo "$removed" | sed 's/^/  - /' >&2
      fi
    fi
    exit 1
    ;;

  write)
    if [[ -f "$OUT" ]] && diff -q <(emit) "$OUT" >/dev/null 2>&1; then
      echo "unchanged: .ai-kit/tokens.txt"
    else
      emit > "$OUT"
      count="$(grep -vc '^#' "$OUT" || true)"
      echo "updated: .ai-kit/tokens.txt ($count tokens)"
    fi
    ;;

  *)
    echo "usage: gen-tokens.sh [--stdout|--check]" >&2
    exit 2
    ;;
esac
