# Fortnite tournaments MVP — design

## Goal

Deliver a single-instance, Docker-deployable application for recurrent Fortnite tournaments. The critical path is registration → Stripe Checkout → verified webhook → `PAID` registration → confirmation email → admin visibility.

## Architecture

One Next.js App Router TypeScript application contains the public UI, admin UI, route handlers, server-side business services, and Prisma data access. PostgreSQL runs as the only supporting service. Stripe Checkout and Resend are external integrations behind dedicated modules.

```
Browser → Next.js routes/services → PostgreSQL
                       ├──────→ Stripe Checkout / webhook
                       └──────→ Resend
```

The application will have no participant accounts, queues, CMS, microservices, or payment-card handling.

## Data model

`Tournament` stores its public content, status, price in integer cents, optional capacity, and historical lifecycle. `SiteSettings` is a singleton holding the one public active tournament. `Registration` belongs to a tournament and snapshots its amount and currency at checkout creation. It has unique constraints for tournament/email and tournament/Epic username after normalization.

`StripeWebhookEvent` records Stripe event IDs for audit and duplicate delivery handling. It does not prevent recovery of unfinished email side effects; registration state remains the idempotency source for each effect.

## Registration and payment flow

The browser sends only participant fields to a protected server endpoint. Server validation uses a shared Zod schema. The registration service loads the active tournament from PostgreSQL, requires `OPEN`, creates or safely reuses a pending registration, and determines the amount exclusively from the tournament record.

It then creates a Stripe hosted Checkout Session with registration/tournament metadata and persists its session ID. A `PAID` registration is always rejected as a duplicate. A registration begins as `PENDING_PAYMENT`; a retry may retain that state and replace its current session ID. The prior session is expired on a best-effort basis before replacement. A matching `checkout.session.expired` changes only a still-pending registration whose persisted current session ID equals the expired session to `EXPIRED`. A later retry may reactivate `EXPIRED` as `PENDING_PAYMENT` with a new session. `CANCELLED` is reserved for an explicit future cancellation action, and `REFUNDED` for verified Stripe refund handling; neither is produced by simply viewing the cancelled page.

The success route is informational only. `POST /api/stripe/webhook` verifies Stripe’s raw payload signature. On completed sessions it verifies metadata, registration linkage, paid status, amount, and currency before updating the registration transactionally to `PAID`. Expired sessions only transition the matching current pending session. Re-delivery is safe.

After the payment transaction commits, the email service sends a confirmation if none has been recorded. Email failure never rolls back a payment; a failed send remains retryable and the admin can resend a paid registration’s email.

## UI and access control

The public landing is a dark responsive esports presentation of the active tournament. It shows status, date, price, capacity, rules and the registration form only for an open tournament. It also includes placeholder legal pages.

The admin uses one environment-configured email and bcrypt password hash. Successful login creates a signed, HttpOnly cookie. Server-side guards protect all admin routes and mutations. The admin can create and edit tournaments, select the active tournament, change opening state, inspect paid/pending history, and resend confirmations. Historical tournaments are completed rather than deleted.

## Operations

Docker uses a multi-stage Node LTS slim image and Next standalone output. Compose provides a development override with source mounting and a production configuration where PostgreSQL is internal only and the app binds to localhost by default. A documented migration command runs `prisma migrate deploy` before deployment. Health checks call an endpoint that performs a minimal database query.

Environment validation distinguishes development console email from production Resend email and prevents unsafe production startup. `.env.example`, seed data, password-hash script, Prisma migrations, test commands, deployment instructions, Stripe CLI workflow, Resend setup, backup/restore, and reverse-proxy alternatives are part of the deliverable.

## Error handling and security invariants

- The server is authoritative for tournament status, price, capacity messaging, and payment state.
- Only a valid, verified Stripe webhook can set `Registration.status` to `PAID`.
- Constraints and transactions protect duplicate registrations during concurrent submissions.
- Stripe and Resend secrets never reach browser code or repository files.
- Errors shown to participants are actionable but omit internals; logs use IDs rather than secrets.

## Test strategy

Vitest unit tests cover normalization, shared validation, closed-tournament rejection, server-side pricing, paid registration idempotency, webhook repeated delivery, expiry not overriding a completed payment, and confirmation-email idempotency. Stripe and Resend are mocked; services are separated from route handlers to keep tests focused.

## Known MVP boundary

Capacity display and dashboard counts use `PAID` registrations only. Opening can be stopped server-side, but the MVP does not make a hard distributed inventory guarantee in a checkout race. No refunds UI, participant accounts, teams, brackets, or real-time sockets are included.
