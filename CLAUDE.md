# Pesa Duka v1 — AI Agent & gstack Guidelines

## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
_GS=""
for _D in "${GSTACK_ROOT:-}" "$HOME/.claude/skills/gstack" "$HOME/.codex/skills/gstack" "$HOME/.factory/skills/gstack" "$HOME/.kiro/skills/gstack" "$HOME/.config/opencode/skills/gstack" "$HOME/.slate/skills/gstack" "$HOME/.cursor/skills/gstack" "$HOME/.openclaw/skills/gstack" "$HOME/.hermes/skills/gstack" "$HOME/.gbrain/skills/gstack" "$HOME/.copilot/skills/gstack" "$HOME/.gstack/repos/gstack"; do
  [ -z "$_GS" ] && [ -n "$_D" ] && [ -d "$_D/bin" ] && _GS="$_D"
done
[ -n "$_GS" ] && echo "GSTACK_OK: $_GS" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing (Aside first, the bundled gstack browser as fallback).
Use the resolved install path above for gstack file paths (default: ~/.claude/skills/gstack).

---

## Local Project gstack Integration

gstack tools are integrated directly into `pesa-duka-v1`:
- **Headless Browser CLI**: `./bin/browse` or `npm run browse`
- **QA Automation**: `npm run gstack:qa` (or `bash ./scripts/gstack-qa.sh`)
- **Security / Guard Check**: `npm run gstack:guard` (or `bash ./scripts/gstack-guard.sh`)
- **Code Review**: `npm run gstack:review` (or `bash ./scripts/gstack-review.sh`)
- **Skills Directory**: `.agents/skills/` (linked to 53+ gstack specialist skills)
- **Browser Configurations**: `.gstack/config.json` & `.gstack/flows/`
- **Conductor Automation**: `conductor.json` & `.conductor/*.sh`

## Development Commands
- Start dev server: `npm run dev` (Runs Vite on `http://localhost:5173`)
- Build application: `npm run build`
- Browse command: `./bin/browse goto http://localhost:5173`

## Conductor Workspaces
When running in Conductor, lifecycle scripts are automatically picked up:
- Setup: `.conductor/setup.sh`
- Run: `.conductor/run.sh`
- QA: `.conductor/qa.sh`

## QA & Testing Policy
- Always run `npm run gstack:qa` or `./bin/browse` to verify UI rendering and capture annotated screenshots before opening PRs.
- Ensure no console errors are reported in `docs/qa/reports/console-errors.txt`.
