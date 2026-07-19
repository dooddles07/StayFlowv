# StayFlow — Security

> Auth/authorization rules: [Rules.md](Rules.md). Report a vulnerability: see [Support.md](Support.md).

## Controls

| Control | Implementation |
| --- | --- |
| Authentication | JWT in httpOnly cookie, `tokenVersion` revocation |
| Authorization | `requireRole` + ownership guards; broken-access-control gap closed 2026-07-15 |
| Password hashing | bcrypt cost 12 (register/reset); seed uses 10 |
| Password policy | 8–72 bytes enforced (bcrypt truncation guarded) |
| Brute-force | per-IP rate limits + per-account 5-fail / 15-min lock |
| Enumeration | generic forgot-password + login responses (doesn't reveal which part failed) |
| Secrets | env-only, required at boot, never in tracked files |
| Security headers | helmet (HSTS, nosniff, frameguard); CORP disabled to let CORS govern |
| CORS | explicit allowlist; wildcard+credentials refused (fails closed to same-origin) |
| SQL injection | Prisma parameterized queries only |
| XSS | httpOnly cookie keeps JWT out of JS; React escaping |
| CSRF | `sameSite=lax` cookie |
| Reset tokens | 32-byte random, SHA-256 hashed at rest, single-use, 1-hour TTL |

> **CSRF note:** `sameSite=lax` mitigates cross-site cookie use, but no anti-CSRF token exists. Add CSRF tokens if introducing cookie-based state-changing HTML forms.

## Environment variables

Backend requires `DATABASE_URL` + `JWT_SECRET` (process exits at boot if missing). Frontend reads `VITE_*` at build.

| Variable | Scope | Purpose | Required | Example / placeholder |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | server | Postgres connection (Prisma) | ✅ | `postgresql://user:password@host:5432/db` |
| `DATABASE_PUBLIC_URL` | server | Public proxy DSN (local→Railway) | optional | `postgresql://user:password@public-host:5432/db` |
| `JWT_SECRET` | server | JWT signing secret | ✅ | `<random-32+-byte-secret>` |
| `JWT_EXPIRES_IN` | server | Token lifetime | optional (`7d`) | `7d` |
| `PORT` | server | API port | optional (`4000`/`3000`) | `4000` |
| `CORS_ORIGIN` | server | Comma-list allowlist; empty = same-origin only | optional | `http://localhost:3000,https://app.example` |
| `APP_URL` | server | Base URL for reset links | optional | `http://localhost:3000` |
| `NODE_ENV` | server | `production` toggles secure cookie / prod mailer | optional | `production` |
| `VITE_API_URL` | frontend | API base (defaults `/api`) | optional | `https://…/api` |
| `SEED_PASSWORD` | script | Seed users' password | optional (random) | `********` |
| `TEST_PASSWORD` | script | Reset demo passwords | required for script | `********` |

## Secret placeholders

| Service | Placeholder |
| --- | --- |
| Database | `postgresql://user:password@host:5432/db` |
| JWT secret | `<random-32+-byte-secret>` |
| SMTP / Email provider | `<not configured — mailer is stubbed>` |
| Redis / AWS / Firebase / Twilio / Stripe / Google / GitHub / OpenAI | `<not used>` |

**Never expose real secrets.** All live values belong in Railway service env vars, never in tracked files.

## Demo logins (development / preview only)

| Portal | Login page | Email |
| --- | --- | --- |
| Member | `/login/member` | `member@stayflow.io` |
| Staff | `/login/staff` | `staff@stayflow.io` |
| Management | `/login/management` | `admin@stayflow.io` |

The live demo password is shown in the root README's "Try It Live" section — seeded test accounts, not real user data. **Rotate before any production use** via the password-reset flow or `server/scripts/reset-test-passwords.js` (set `TEST_PASSWORD`).

## Third-party services

| Category | Status |
| --- | --- |
| Hosting | Railway (single service, prod) |
| Database | PostgreSQL (Railway-managed) |
| Payment / SMS / Maps / Analytics SaaS / AI / Cloud storage / OAuth / Webhooks | None wired |
| Email | Provider **stubbed** — `utils/mailer.js` logs the reset link in dev, warns + no-ops in prod |

## Logging / audit trail

- `auth_events` table records `LOGIN_SUCCESS`/`FAILED`/`LOCKED`/`DISABLED`, `LOGOUT`, `REGISTER`, `PASSWORD_RESET_REQUEST`/`SUCCESS` with ip + user-agent; immutable, no FK to `users` so history survives account deletion.
- HTTP access logged via `morgan('dev')`.
- No monitoring / tracing / APM configured.

## AI assistant restrictions (this repo)

- No customer personal data (names, contacts, account numbers, transactions) may be pasted into AI tooling without approved exemption.
- No credentials (passwords, API keys, tokens, connection strings) may be pasted into AI tooling.

## Reporting a vulnerability

See [Support.md](Support.md) for contact path. Do not open a public issue for undisclosed vulnerabilities.
