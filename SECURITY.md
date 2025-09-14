# Security Policy

We take security seriously and appreciate responsible disclosure.

## Supported Versions

We maintain the `main` branch and latest tagged releases. Security patches are applied on a best-effort basis.

## Reporting a Vulnerability

- Please email security@makrx.com with details and steps to reproduce.
- Do not create public GitHub issues for security vulnerabilities.
- We aim to acknowledge reports within 72 hours and provide a timeline for a fix.

## Secrets and Configuration

- Never commit real secrets. Use `.env` locally and `.env.example` in git.
- Rotate credentials if a secret is accidentally committed and scrub history if necessary.

## Frontend Security

- Use `KeycloakProvider` from `@makrx/auth` and `useAuthHeaders()` to attach tokens.
- Do not read tokens from `localStorage`. ESLint rules restrict this.
- Follow strict CSP in production; use nonces/hashes for any inline assets.

## Backend Security

- HTTPS/TLS enforced at the edge; HSTS enabled for production.
- CSRF protection via double-submit cookie pattern (`SameSite=Strict`, `Secure` in prod).
- Rate limiting backed by Redis; fail-closed for critical endpoints in production.

## Disclosure Preferences

If you prefer, you can use a PGP key for encrypted reports. Request our key via security@makrx.com.
