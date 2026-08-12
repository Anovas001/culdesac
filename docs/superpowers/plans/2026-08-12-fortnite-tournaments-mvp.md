# Fortnite Tournaments MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready monolithic app for recurrent Fortnite tournament registration, verified Stripe payments, confirmation email, and one-admin operations.

**Architecture:** Next.js App Router provides public pages, protected admin pages and route handlers. Business services isolate registrations, Stripe webhook transitions, email delivery and Prisma persistence. PostgreSQL is the only local service and Docker packages the app for a single VPS instance.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Prisma/PostgreSQL, Zod, Stripe Checkout, Resend, jose, bcryptjs, Vitest, Docker Compose.

---

## File map

- `src/lib/*`: env parsing, Prisma client, formatting, validation, auth, Stripe and email adapters.
- `src/services/*`: transaction-aware tournament, registration and webhook state transitions.
- `src/app/*`: public, legal, admin and API route UI/endpoints.
- `prisma/*`: schema, migration and idempotent seed.
- `tests/*`: focused service and validation tests with external clients mocked.
- root Docker, Compose, scripts and README: local and VPS operation.

### Task 1: Bootstrap and quality tooling

**Files:** `package.json`, Next/Tailwind configs, `.gitignore`, `tsconfig.json`, `vitest.config.ts`, `src/app/*`

- [ ] Write a failing unit test for email normalization.
- [ ] Install current stable dependencies and configure scripts: dev, build, start, lint, typecheck, test, admin:hash, db:seed.
- [ ] Add minimal app shell, styles and Vitest setup.
- [ ] Run the test red, implement normalization, then run it green.

### Task 2: Database foundation

**Files:** `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/db.ts`, `prisma/seed.ts`, `src/lib/env.ts`

- [ ] Write failing tests for amount formatting and registration normalization.
- [ ] Define Prisma models/enums, indexes and non-destructive relations, including the `SiteSettings` singleton and its active-tournament relation.
- [ ] Add modern Prisma client initialization and environment validation.
- [ ] Generate the initial migration and create idempotent sample tournament seed.
- [ ] Run targeted tests and Prisma generation.

### Task 3: Core registration service

**Files:** `src/lib/validation/registration.ts`, `src/services/registrations/*`, `tests/registration-service.test.ts`

- [ ] Write failing tests for invalid form data, closed tournaments, duplicate paid registrations, and server-owned pricing.
- [ ] Implement shared Zod schema and normalized field helpers.
- [ ] Implement safe create-or-reuse registration persistence, including unique-constraint translation.
- [ ] Run test red/green for each behavior.

### Task 4: Stripe Checkout and webhook service

**Files:** `src/lib/stripe/*`, `src/services/payments/*`, `src/app/api/stripe/webhook/route.ts`, tests

- [ ] Write failing tests for checkout payload authority and webhook state transitions.
- [ ] Implement server-created hosted Checkout sessions and best-effort old-session expiry.
- [ ] Implement raw-body signature verification route.
- [ ] Implement transactional, idempotent completed/expired/refund event processing with amount and currency verification.
- [ ] Run webhook and service tests green.

### Task 5: Email service

**Files:** `src/lib/email/*`, `tests/email-service.test.ts`

- [ ] Write failing tests for console mode and no duplicate confirmation after a successful send.
- [ ] Implement Resend/console adapters and sanitized failure recording.
- [ ] Trigger post-payment delivery after the database transaction has committed.
- [ ] Run focused tests green.

### Task 6: Public experience

**Files:** `src/app/page.tsx`, `src/components/public/*`, registration routes, legal pages, `src/app/api/registrations/route.ts`

- [ ] Write failing request-level/service tests for registration endpoint errors.
- [ ] Build responsive landing states, registration client form, success and cancelled pages.
- [ ] Keep all price/status validation server-side; redirect only to a server-returned Stripe URL.
- [ ] Run tests and visual/build checks.

### Task 7: Admin authentication and dashboard

**Files:** `src/lib/auth/*`, `src/app/admin/*`, `src/components/admin/*`, admin actions/tests

- [ ] Write failing tests for password/session verification and unauthenticated access.
- [ ] Implement signed HttpOnly sessions and login/logout.
- [ ] Implement tournament create/edit/activate/open/close actions (activation transactionally updates the `SiteSettings` singleton) and registrations table.
- [ ] Implement paid-email resend action.
- [ ] Run focused tests and typecheck.

### Task 8: Docker, documentation and final verification

**Files:** `Dockerfile`, `compose.yml`, `compose.dev.yml`, `.dockerignore`, `.env.example`, `scripts/*`, `README.md`

- [ ] Implement `src/app/api/health/route.ts` with a minimal Prisma query and a request-level health test.
- [ ] Add Docker multi-stage standalone build, internal PostgreSQL, app/db health checks and migration command.
- [ ] Document local development, Stripe CLI/test workflow, Resend setup, production variables, VPS/reverse-proxy options, backups and updates.
- [ ] Run fresh `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, Docker build and Compose validation.
- [ ] Record actual command results and any credential-dependent manual steps in README.
