#!/usr/bin/env bash
# Wrapper to invoke gstack browse binary
set -euo pipefail

GSTACK_DIR="${GSTACK_DIR:-/Users/justinmafie/.gemini/antigravity/scratch/gstack}"
BROWSE_BIN=""

if [ -x "$GSTACK_DIR/browse/dist/browse" ]; then
  BROWSE_BIN="$GSTACK_DIR/browse/dist/browse"
elif [ -x "$HOME/.claude/skills/gstack/browse/dist/browse" ]; then
  BROWSE_BIN="$HOME/.claude/skills/gstack/browse/dist/browse"
elif command -v browse >/dev/null 2>&1; then
  BROWSE_BIN="$(command -v browse)"
fi

if [ -z "$BROWSE_BIN" ]; then
  echo "Error: gstack browse binary not found." >&2
  echo "Expected at: $GSTACK_DIR/browse/dist/browse" >&2
  exit 1
fi

exec "$BROWSE_BIN" "$@"
