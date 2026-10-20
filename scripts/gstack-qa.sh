#!/usr/bin/env bash
# Run automated QA using gstack browse against the local dev server
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT=5173
TARGET_URL="http://localhost:$PORT"
BROWSE="$ROOT_DIR/scripts/browse.sh"
OUT_DIR="$ROOT_DIR/docs/qa"

mkdir -p "$OUT_DIR/screenshots"
mkdir -p "$OUT_DIR/reports"

echo "=== [gstack QA] Starting QA test suite on $TARGET_URL ==="

# Check if server is running
SERVER_PID=""
if ! curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL" 2>/dev/null; then
  echo "Dev server not responding at $TARGET_URL. Starting Vite dev server..."
  npm run dev -- --port $PORT &
  SERVER_PID=$!
  trap 'if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; fi' EXIT
  
  echo "Waiting for dev server to come up..."
  for i in {1..20}; do
    if curl -s -o /dev/null "$TARGET_URL" 2>/dev/null; then
      echo "Dev server is ready!"
      break
    fi
    sleep 1
  done
else
  echo "Dev server is already running at $TARGET_URL."
fi

# Run gstack browser navigation
echo "Navigating to $TARGET_URL..."
"$BROWSE" console --clear || true
"$BROWSE" goto "$TARGET_URL"
"$BROWSE" wait --load

# Capture snapshot of interactive elements & screenshot
echo "Capturing interactive element snapshot..."
"$BROWSE" snapshot -i > "$OUT_DIR/reports/snapshot-interactive.txt"
"$BROWSE" screenshot "$OUT_DIR/screenshots/landing-page.png"

# Test POS Counter
echo "Testing POS Counter at $TARGET_URL/pos..."
"$BROWSE" goto "$TARGET_URL/pos"
"$BROWSE" wait --load
"$BROWSE" screenshot "$OUT_DIR/screenshots/pos-counter.png"

# Test Inventory & Akili ya Biashara
echo "Testing Inventory at $TARGET_URL/inventory..."
"$BROWSE" goto "$TARGET_URL/inventory"
"$BROWSE" wait --load
"$BROWSE" screenshot "$OUT_DIR/screenshots/inventory-page.png"

# Check for console errors
echo "Checking console errors..."
ERRORS="$("$BROWSE" console --errors 2>&1 || true)"
if [ -n "$ERRORS" ]; then
  echo "Console errors detected:"
  echo "$ERRORS" | tee "$OUT_DIR/reports/console-errors.txt"
else
  echo "✓ No console errors found."
  echo "No errors" > "$OUT_DIR/reports/console-errors.txt"
fi

# Capture responsive layouts for POS
echo "Testing responsive layouts for POS..."
"$BROWSE" goto "$TARGET_URL/pos"
"$BROWSE" wait --load

"$BROWSE" viewport 1440x900
"$BROWSE" screenshot "$OUT_DIR/screenshots/desktop-1440.png"

"$BROWSE" viewport 768x1024
"$BROWSE" screenshot "$OUT_DIR/screenshots/tablet-768.png"

"$BROWSE" viewport 390x844
"$BROWSE" screenshot "$OUT_DIR/screenshots/mobile-390.png"

echo "=== [gstack QA] QA run complete. Artifacts saved to $OUT_DIR ==="
