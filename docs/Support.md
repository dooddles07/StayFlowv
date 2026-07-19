# StayFlow — Support

> Product context: [PRD.md](PRD%20%28Product%20Requirements%20Document%29.md). Deployment details: [Architecture.md](Architecture.md#deployment).

## Getting help / reporting issues

This is a portfolio project maintained by a single author (QUAN7UM). For bugs, questions, or vulnerability reports, use the repository's GitHub Issues page. Do not include real credentials, customer data, or connection strings in any report — see [Security.md](Security.md).

## Installation

```bash
# 1. Clone
git clone https://github.com/dooddles07/StayFlow.git && cd StayFlow

# 2. Install frontend deps
bun install

# 3. Configure env
cp .env.example .env                 # set VITE_API_URL (+ backend vars if running merged server)
cp server/.env.example server/.env   # set DATABASE_URL, JWT_SECRET, CORS_ORIGIN

# 4. Backend deps + DB
cd server && npm install
npm run prisma:generate
npm run prisma:deploy                # apply migrations
npm run seed                         # optional: SEED_PASSWORD=... node prisma/seed.js
cd ..

# 5. Run (dev)
bun --bun run dev                    # http://localhost:3000

# 6. Test / build
bun --bun run test
bun --bun run build && bun --bun run start   # prod-style merged server
```

Full env var reference: [Security.md](Security.md#environment-variables).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Server exits: `Missing required env var` | `DATABASE_URL`/`JWT_SECRET` unset | Set them in `server/.env` or Railway |
| `401 Invalid or expired token` after reset | `tokenVersion` bumped → old session revoked | Sign in again |
| `429 Too many attempts` on login | rate limit / account lock | Wait window (15 min lock, 15 min login window) |
| CORS blocked in browser | origin not in `CORS_ORIGIN` | Add exact origin to allowlist |
| Reset link never arrives | mailer is stubbed | Check server console (dev); wire real provider (prod) |
| Local DB won't connect via internal host | `postgres.railway.internal` is private | Use `DATABASE_PUBLIC_URL` (proxy) locally |
| Detail page 404s only on refresh | SSR wasn't forwarding auth cookie (fixed) | Update to latest; if recurring, check `scripts/start.mjs` cookie forwarding |
| Debugging | — | Watch morgan logs + `auth_events` table |

## Demo access

See [Security.md](Security.md#demo-logins-development--preview-only) for demo portal credentials. Seeded accounts only — not real user data.

## Known limitations

- No payment/billing (see [PRD.md](PRD%20%28Product%20Requirements%20Document%29.md)).
- No background jobs/scheduler — reminders and expiry are not automated.
- Email is stubbed — password-reset links are logged to console in dev, not sent, in prod without a wired provider.
