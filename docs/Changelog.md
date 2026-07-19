# StayFlow — Changelog

> Full history: `git log`. This file curates notable changes; not every commit is listed.

## Unreleased / Recent

- **fix(ssr):** forward auth cookie and resolve absolute API URL during server-side rendering — fixes false 404 on facility/dining detail page refresh.
- **fix(booking):** make slot-conflict check atomic with a serializable transaction — closes a double-booking race under concurrent requests.
- **fix(management):** clamp facility capacity and restaurant max party size to positive integers.
- **fix(booking):** enforce party size against facility capacity and restaurant max party size, server-side.
- **fix(booking):** validate party size as a positive integer, client and server.
- **fix(dining):** release assigned table when a reservation is deleted — prevents permanently stranded tables.
- **fix(member):** clear message for accounts with no resident profile linked, instead of dead-end retry loops.
- **fix(auth):** redirect to login on 401 instead of leaving a dead portal shell.
- **docs:** rewrote README as client-facing overview, moved technical deep-dive into structured docs (this file and its siblings) — supersedes `docs/technical-overview.md`.
- **docs:** unmasked demo login password in README (portfolio project, seeded test accounts only).

## Feature milestones

- **feat(dining):** realistic per-restaurant max party size, replacing a hardcoded cap of 12.
- **feat(member):** dining confirm step, RSVP filter on events, unread filter on notices.
- **perf(member):** shared TTL read cache with in-flight dedupe and write invalidation.
- **feat(member):** collapsible show/hide toggle + full booking/reservation history sections (completed/cancelled, sortable).
- **feat(notifications):** live per-resident notification bell with scoped read / mark-all.
- **feat(nav):** unread badge on Notices nav item (sidebar + mobile).
- **feat(search):** global Cmd+K search, portal-isolated, matching each portal's nav categories.
- **fix(a11y):** skip link, larger touch targets, password visibility toggle, structured guest arrival-time picker.
- **feat(dashboard):** live Open-Meteo weather/sunset data, replacing mocked values.
- **feat:** responsive pass — data tables collapse to stacked cards on mobile.
- **feat:** abstract SVG hero art for facilities, restaurants, and events.
- **feat(server):** Express + Prisma MVC backend with JWT auth for all StayFlow resources (initial backend, reverted once then reapplied after fixes).
- **feat:** built out Member, Staff, and Management portals (dashboards, facilities, dining, guests, events, notices, analytics/reports).
- **chore:** scaffolded TanStack Start app with shadcn/ui, Tailwind v4, sonner, Recharts, zustand.

## 2026-07-15 — UI redesign pass

- New stat-tile, `.reveal`, and `.ambient-wash` primitives.
- Profile page fix.
- Table overflow-x-auto pattern adopted for wide data tables.

## Security fixes

- Broken-access-control gap closed 2026-07-15 (see [Security.md](Security.md)).
