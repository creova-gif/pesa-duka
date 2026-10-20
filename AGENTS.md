# Pesa Duka v1 — Agent Workflow & Methodology

Project facts, stack and verification commands: `.ai/project.yaml`.
Claude Code: see `CLAUDE.md` (gstack required). Toolchain reference: `docs/ai/`.

Definition of done: run the commands under `verification:` in `.ai/project.yaml`; if one cannot run, report NOT VERIFIED with the reason.
Never push, force-push, or modify remotes without explicit approval.

All agents working in this repository should adhere to the **gstack virtual engineering team methodology**:

1. **Architecture & Scope**:
   - Check `conductor.json` and `CLAUDE.md` before making sweeping structural changes.
   - Run type checks and build verification with `npm run build`.

2. **Headless Browser & QA Verification**:
   - Use `./bin/browse` (or `npm run browse`) to test web interactions.
   - Target the local dev server at `http://localhost:5173`.
   - Automated test flows are located in `.gstack/flows/` and `scripts/gstack-qa.sh`.

3. **Security Auditing**:
   - Run `npm run gstack:guard` to verify dependencies and prevent accidental commits of secrets.
