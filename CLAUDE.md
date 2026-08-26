# CLAUDE.md — pesa-duka

## Project Overview
Marketplace product for East African markets. React/Vite frontend, Figma-Make-originated backend structure.

## Known Issue — Do Not Build On Top Of This Silently
This repo's Supabase client references project ID `lgslkpjfruygevlkqepj`, which does not exist in the organization's Supabase account. Any Supabase-backed feature is currently broken, not degraded. Flag this before adding backend-dependent features.

## Repository Structure
`supabase/functions/server/` is this repo's only edge function directory — it is NOT a duplicate of anything else and should not be removed on the assumption that it is (a genuine duplicate pattern exists in a few other repos in this org, but this repo isn't one of them).

## Technology Stack
React, Vite, TypeScript, Supabase client (currently pointing to a nonexistent project).

## CI
Build-only (`npm ci && npm run build`).

## AI Agent Rules
- Do not assume the Supabase connection works.
- Do not remove `supabase/functions/server/` as a "duplicate cleanup" — verify first; in this repo it's the only real one.

## Definition of Done
Build passes. Broken Supabase reference is flagged, not silently worked around.
