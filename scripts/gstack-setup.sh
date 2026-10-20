#!/usr/bin/env bash
# Initialize and verify gstack integration for pesa-duka-v1
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GSTACK_SOURCE="${GSTACK_DIR:-/Users/justinmafie/.gemini/antigravity/scratch/gstack}"

echo "=== Initializing gstack in pesa-duka-v1 ==="

# 1. Ensure output directories exist
mkdir -p "$ROOT_DIR/docs/qa/screenshots"
mkdir -p "$ROOT_DIR/docs/qa/reports"
mkdir -p "$ROOT_DIR/bin"

# 2. Ensure .agents/skills links
mkdir -p "$ROOT_DIR/.agents/skills"
if [ -d "$GSTACK_SOURCE/.agents/skills" ]; then
  for skill in "$GSTACK_SOURCE/.agents/skills"/*; do
    skill_name="$(basename "$skill")"
    ln -snf "$skill" "$ROOT_DIR/.agents/skills/$skill_name"
  done
  echo "✓ Linked gstack skills into .agents/skills/"
fi

# 3. Create local bin/browse symlink or executable wrapper
ln -snf "$ROOT_DIR/scripts/browse.sh" "$ROOT_DIR/bin/browse"
chmod +x "$ROOT_DIR/bin/browse"
echo "✓ Local binary wrapper created at bin/browse"

# 4. Verify browse binary
if [ -x "$GSTACK_SOURCE/browse/dist/browse" ]; then
  echo "✓ Found compiled browse binary ($GSTACK_SOURCE/browse/dist/browse)"
else
  echo "! Warning: browse binary not compiled at $GSTACK_SOURCE/browse/dist/browse"
fi

echo "=== gstack setup complete ==="
