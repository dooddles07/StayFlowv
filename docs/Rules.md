# StayFlow — Business Rules

> Data model backing these rules: [Schema.md](Schema.md). Endpoint-level enforcement: [Architecture.md](Architecture.md#api-documentation). Threat model: [Security.md](Security.md).

## Authentication & Authorization

- **Scheme:** hand-rolled JWT (no Passport/NextAuth). Payload: `{sub,email,role,residentId,tokenVersion}`, default expiry `7d`.
- **Transport:** `Set-Cookie stayflow_token` — `httpOnly`, `sameSite=lax`, `secure` in prod, `maxAge 7d`. JWT never touches JS; frontend persists only the non-sensitive user profile. `Authorization: Bearer` also accepted.
- **Verification (`requireAuth`):** verify signature → load auth state → reject if user missing, `!isActive`, or `tokenVersion` mismatch (password reset bumps `tokenVersion`, instantly revoking old sessions).
- **Guards:** `requireRole(...roles)`, `requireOwnResidentParam`, `requireOwnResidentBody` (forces own `residentId`), `requireOwnerRecord(model, ownerField)` (loads record, checks ownership for MEMBER only).
- **Account protection:** lock 15 min after 5 consecutive failed logins (per-account, defeats IP rotation); disabled-account state only revealed to someone with the correct password.
- **No staff/management self-registration** — those accounts are created manually (seed / Prisma Studio) by design.

## User Roles

| Role | Portal | Can do |
| --- | --- | --- |
| **Guest (unauthenticated)** | login pages, landing | Log in, register (member), request/reset password |
| **MEMBER** (resident) | `/member/*` | Manage own bookings, dining, guests, event RSVPs; read facilities/events/notices/notifications |
| **STAFF** | `/staff/*` | All bookings/dining/guests (list, confirm, check-in/out), manage facilities/restaurants/tables/events/notices |
| **MANAGEMENT** | `/management/*` | Everything Staff + manage staff directory & residents + analytics/reports |

### Access Matrix (write)

| Resource | MEMBER | STAFF | MANAGEMENT |
| --- | --- | --- | --- |
| Own bookings/dining/guests | ✅ | ✅ | ✅ |
| All bookings/dining/guests | ❌ | ✅ | ✅ |
| Facilities / Restaurants / Tables / Events / Notices | ❌ | ✅ | ✅ |
| Residents directory | ❌ | ✅ | ✅ |
| Staff directory | ❌ | ❌ | ✅ |

## Ownership rules

- A member can only ever act on records where `residentId` matches their own JWT — enforced server-side (`requireOwnResidentBody`/`requireOwnerRecord`), not just hidden in the UI.
- Bookings and dining reservations: `residentId` is **forced from the JWT** on create, never trusted from the request body.

## Booking / capacity rules

- **Party size** must be a positive integer, validated both client and server side.
- **Capacity enforcement:** party size is checked server-side against the facility's capacity or the restaurant's max party size — a client-side bypass cannot exceed it.
- **Capacity/max-party-size values** are clamped to positive integers at the management layer (can't configure a facility with capacity 0 or negative).
- **Slot-conflict check is atomic:** wrapped in a serializable DB transaction to close a double-booking race under concurrent requests for the same slot.
- **Per-restaurant max party size** replaces an earlier hardcoded cap — each restaurant defines its own realistic limit.
- **Table release on delete:** deleting a dining reservation releases its assigned table so it doesn't stay permanently stranded as occupied.

## Guest pass lifecycle

```
PENDING --(staff approves)--> APPROVED --(staff check-in)--> CHECKED_IN --(staff check-out)--> CHECKED_OUT
```

- Member registers a guest → `passNumber` + QR issued.
- Only STAFF/MANAGEMENT can approve, check in, or check out.
- Member can create/edit their own guest records; cannot self-approve or self-check-in.

## Session / SSR rules

- Server-side rendering forwards the auth cookie and resolves an absolute API URL — without this, a page refresh on a detail route can falsely 404 because SSR has no session context.
- On a `401` from the API, the client redirects to login rather than leaving a dead portal shell rendered.

## Notices / Notifications

- Notices and notifications are readable by any authenticated user; only STAFF/MANAGEMENT can create/delete them.
- Notifications support per-user read state (`/:id/read`).

## Payments

> No payment or billing rules exist — out of scope for current implementation. See [PRD.md](PRD%20%28Product%20Requirements%20Document%29.md) roadmap.
