# Challonge participants implementation plan

**Goal:** Link an existing Swiss Challonge tournament and let an admin publish confirmed Culdesac participants in bulk.

**Approved scope:** The organizer creates and configures the tournament in Challonge. Culdesac sends PAID and INVITED registrations using their Fortnite nickname. Starting the competition, seeding, matches and Discord remain managed by the organizers. The user will perform the external end-to-end test; automated tests use simulated HTTP responses.

**Architecture:** A server-only v2.1 client validates responses and handles pagination. A domain service reconciles stable registration markers before adding participants. A PostgreSQL advisory lock serializes linking and publishing for each local tournament, including across app instances. Prisma persists the remote tournament ID, community scope and per-registration participant ID. Authenticated Next server actions feed a small client component in the registrations page.

## Tasks

- [x] Write failing client/domain tests: link parsing, Swiss/pending validation, PAID/INVITED selection, privacy, pagination, retries, ambiguous names, missing remote records and partial batches.
- [x] Implement `src/services/challonge/client.ts`, `service.ts`, and `repository.ts`; persist links using an additive migration. Freeze changing/unlinking a tournament after any remote publishing attempt, including an uncertain timeout.
- [x] Write failing server-action tests for authorization and validation; implement `src/app/admin/challonge-actions.ts` with revalidation and safe errors.
- [x] Add `src/components/admin/challonge-panel.tsx` to the registrations page, with counts, pending buttons, messages, per-row published status and a remote tournament link.
- [x] Document the server-only `CHALLONGE_API_KEY`, setup/recreation commands and the user's test checklist. No secrets enter Git.
- [x] Apply migrations and regenerate Prisma in the local Docker environment. Run unit tests, lint, typecheck and production build, then leave the development services running on localhost:3000.

## Operational decisions

- Always reconcile the complete remote participant list before writing. `misc=culdesac:<registrationId>` is the recovery marker; no email, DNI, real name, telephone or Discord tag is sent.
- A stored ID missing remotely, a duplicated marker, or a manual participant with the same nickname blocks writing with an actionable message. Never clear the remote list or overwrite manual changes.
- Publish in batches of at most 20 participants (the endpoint's documented maximum), preserving completed batches if a later request fails. Do not automatically retry POST requests. A subsequent admin click reconciles remote markers first, including withdrawn registrations and a zero-confirmed list.
- Only allow writes to a Swiss tournament in `pending`, without a locked participant list. Handle individual and community-owned Challonge URLs with the documented community scope.
- The integration is optional: absent credentials do not break login, payment or the existing app. The panel explains how to configure it.

Official API references: https://challonge.apidog.io/getting-started-1726706m0, https://challonge.apidog.io/resource-scoping-1730219m0, https://challonge.apidog.io/bulk-create-participants-23619754e0, https://challonge.apidog.io/list-participants-23619749e0.
