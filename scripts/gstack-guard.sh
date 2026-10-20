#!/usr/bin/env bash
# Run Security / Guard audit (OWASP, dependencies, secrets check)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_FILE="$ROOT_DIR/docs/qa/reports/security-guard-report.md"

mkdir -p "$ROOT_DIR/docs/qa/reports"

echo "# gstack Security & Guard Report" > "$REPORT_FILE"
echo "Date: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "=== [gstack Guard] Checking dependencies for known CVEs ==="
echo "## 1. Dependency Audit" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
npm audit --audit-level=moderate 2>&1 | tee -a "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"

echo "=== [gstack Guard] Scanning for accidental secrets in working tree ==="
echo "" >> "$REPORT_FILE"
echo "## 2. Secrets Scan" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
SECRETS_FOUND=0
# Check for common API key patterns in git-tracked files
if git grep -E "(AIza[0-9A-Za-z\\-_]{35}|sk-[a-zA-Z0-9]{32,}|ghp_[0-9a-zA-Z]{36})" 2>/dev/null; then
  echo "WARNING: Possible API keys found in tracked files!" | tee -a "$REPORT_FILE"
  SECRETS_FOUND=1
else
  echo "✓ No high-entropy API key patterns found in tracked files." | tee -a "$REPORT_FILE"
fi
echo '```' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## 3. Environment Security" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
if git ls-files | grep -E "^\.env" >/dev/null; then
  echo "ALERT: .env file is tracked in git! Remove immediately." | tee -a "$REPORT_FILE"
else
  echo "✓ .env files are properly excluded from git tracking." | tee -a "$REPORT_FILE"
fi
echo '```' >> "$REPORT_FILE"

echo "=== [gstack Guard] Security report generated at $REPORT_FILE ==="
