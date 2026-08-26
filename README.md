# Pesa Duka — The Business Brain for East Africa

**An all-in-one point-of-sale, inventory, and bookkeeping platform for small shop owners — built for East African regulatory requirements first, with Canadian small-business compliance as a second market.**

[![Status](https://img.shields.io/badge/status-active_development-yellow)]()
[![License](https://img.shields.io/badge/license-proprietary-red)]()

![Pesa Duka dashboard](docs/screenshots/dashboard.png)

## Overview
Pesa Duka ("money shop") gives independent shop owners point of sale, inventory, supplier management, and bookkeeping, with East African tax compliance built in from the start.

## Problem
Independent shop owners in East Africa either use informal record-keeping or generic POS software with no built-in path to mandatory fiscal compliance (e.g. Tanzania's EFD requirements).

## Solution
POS, inventory, and bookkeeping with a genuine regulatory differentiator: an EFD Z-Report generator for Tanzania Revenue Authority (TRA) fiscal compliance — daily fiscal summaries, EFD serial tracking, TIN integration, VAT calculation — aimed at the mandatory compliance threshold for businesses doing TZS 14M+ in annual turnover.

## ⚠️ Known Issue
This repo's Supabase client references a project ID that does not exist in the organization's Supabase account. Any Supabase-backed feature is currently broken. Note: `supabase/functions/server/` in this repo is the only real edge function directory — it is not a duplicate and should not be removed as one. See `CLAUDE.md`.

## Key Capabilities
- Point of sale, inventory management, cashbook
- Supplier and customer management, team/staff management
- Business performance reporting
- EFD Z-Report Generator (Tanzania TRA fiscal compliance)

## Getting Started
```bash
npm i
npm run dev
```

## Project Status
Substantial feature set with a real, specific regulatory differentiator; backend connection is currently broken.

## Roadmap
- [ ] Reconnect to a real Supabase project or migrate to an environment-variable-based config

## Contributing
See the [org-wide CONTRIBUTING.md](https://github.com/creova-gif/.github/blob/main/CONTRIBUTING.md).

## License
Proprietary — © CREOVA. All rights reserved.

## Author / Organization
Built by [Justin Mafie](https://github.com/creova-gif) under CREOVA.

## Documentation
See `CLAUDE.md` for the broken-backend flag and the duplicate-directory clarification.
