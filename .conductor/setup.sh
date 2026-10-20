#!/usr/bin/env bash
set -euo pipefail

echo "=== [Conductor] Setting up Pesa Duka v1 ==="
npm install

if [ -f "./scripts/gstack-setup.sh" ]; then
  bash ./scripts/gstack-setup.sh
fi

echo "=== [Conductor] Setup complete ==="
