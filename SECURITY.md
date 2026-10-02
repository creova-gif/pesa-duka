# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately — **do not open a public issue**.

**Contact:** creativeinnovationspace@gmail.com

Include:
- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any relevant logs, screenshots, or proof-of-concept code

You should receive an acknowledgment within a reasonable timeframe. This is a small team — please be patient, but we take security reports seriously and will prioritize accordingly.

## Scope

This applies to the code in this repository. It does not cover third-party dependencies (report those upstream) or infrastructure outside this repo's control.

## Handling Credentials

- Never commit `.env` files, API keys, tokens, or any other credentials to this repository.
- If you believe you've found a credential committed to git history, report it via the contact above rather than opening a public issue — the fix requires history rewriting, not just deletion of the current file.
- Check `.gitignore` before adding any new file that stores configuration or secrets.

## Payments

- Payment provider integrations (ClickPesa or any other) **must run server-side**. The server holds the provider credentials, creates the payment request, and confirms the result via a signed webhook before a sale is marked paid.
- Provider secrets (client IDs paired with API keys, API keys, webhook secrets) must **never** appear in client code or client bundles. Anything shipped to the browser is public. Do not replace a hard-coded key with a `VITE_*` / browser-exposed environment variable either; that ships it in the bundle as well.
- The client must never collect or hold raw card data (PAN, CVV, expiry). Use a provider-hosted checkout or a tokenized flow.
- The client must never fabricate a transaction ID or show payment success without server confirmation.
- Until a server-side integration exists, the in-app payment modal is intentionally disabled (CRE-107).

## Disclosure

We aim to handle reports responsibly and will credit reporters (with permission) once a fix is released, unless anonymity is requested.
