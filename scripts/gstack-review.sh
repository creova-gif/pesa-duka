#!/usr/bin/env bash
# Run automated code review checklist based on gstack methodology
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_FILE="$ROOT_DIR/docs/qa/reports/code-review-report.md"

mkdir -p "$ROOT_DIR/docs/qa/reports"

echo "# gstack Code Review Report" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "=== [gstack Review] Inspecting working branch changes ==="

echo "## 1. Git Status & Changed Files" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
git status -s >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## 2. TypeScript / Build Verification" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
npm run build 2>&1 | tee -a "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## 3. Large or Binary Files in Commit Scope" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
git diff --cached --stat | grep -E "(\.png|\.jpg|\.pdf|\.zip|\.bin)" || echo "✓ No uncompressed binaries staged." >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "=== [gstack Review] Code review report generated at $REPORT_FILE ==="
