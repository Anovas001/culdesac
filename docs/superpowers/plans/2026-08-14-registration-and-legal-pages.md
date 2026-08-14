# Registration Fields and Legal Pages Implementation Plan

> **For Codex:** Execute this plan directly in the current session. The user explicitly requested autonomous implementation through verification.

**Goal:** Expand tournament registration with DNI/NIE and postal code, remove phone, and replace placeholder legal routes with polished, structured Catalan drafts.

**Architecture:** Keep the public registration API as the single validation boundary. Normalize duplicate-sensitive identity fields before persistence, enforce tournament-scoped uniqueness in PostgreSQL, and expose the new data only inside the authenticated backoffice. Drive both legal routes from typed document data rendered by one reusable, brand-aligned server component.

**Tech Stack:** Next.js 16, React 19, Zod 4, Prisma 7, PostgreSQL, CSS Modules, Vitest, Docker Compose.

---

### Task 1: Specify registration behavior with tests

**Files:**
- Modify: `src/lib/validation/registration.test.ts`
- Modify: `src/services/registrations/service.test.ts`

1. Add valid DNI/NIE, postal-code, normalization, and invalid-input cases.
2. Add a service expectation proving DNI participates in duplicate lookup.
3. Run targeted tests and confirm the new assertions fail before implementation.

### Task 2: Migrate and implement registration data flow

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260814190000_registration_identity_fields/migration.sql`
- Modify: `src/lib/validation/registration.ts`
- Modify: `src/services/registrations/service.ts`
- Modify: `src/services/registrations/repository.ts`
- Modify: `src/components/public/registration-form.tsx`
- Modify: `src/components/public/registration-form.module.css`
- Modify: `src/app/admin/tournaments/[id]/registrations/page.tsx`

1. Add required identity fields and a tournament-scoped identity unique constraint.
2. Backfill any legacy rows safely before making columns required; remove phone.
3. Validate and normalize DNI/NIE and Spanish postal code on the server.
4. Update the public form and authenticated administration view.
5. Generate Prisma Client and get targeted tests green.

### Task 3: Specify and build legal documents

**Files:**
- Create: `src/lib/legal-documents.test.ts`
- Create: `src/lib/legal-documents.ts`
- Create: `src/app/legal/legal-document.tsx`
- Create: `src/app/legal/legal.module.css`
- Modify: `src/app/legal/terms/page.tsx`
- Modify: `src/app/legal/privacy/page.tsx`

1. Test required sections, collected-data disclosure, and explicit placeholders.
2. Write readable Catalan drafts grounded in official GDPR, LOPDGDD, LSSI, and consumer-law requirements.
3. Render both pages with a shared responsive layout, table of contents, draft notice, and Culdesac branding.

### Task 4: Verify end to end

1. Run all unit tests, type checking, lint, Prisma validation, and production build.
2. Apply the migration through Docker Compose and verify health plus database columns.
3. Exercise the public route/form in localhost and confirm the legal routes render.
4. Commit only implementation files, preserving the user-provided source assets and PDFs.
