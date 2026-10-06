import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { db } from "../src/lib/db";
import { registrationSchema, type RegistrationInput } from "../src/lib/validation/registration";
import { ChallongeClient, ChallongeError, type ChallongeGateway, type RemoteParticipant } from "../src/services/challonge/client";
import { challongeRepository } from "../src/services/challonge/repository";
import { linkChallongeTournament, publishChallongeParticipants, unlinkChallongeTournament, type ChallongeRepository } from "../src/services/challonge/service";
import { persistInvitation } from "../src/services/registrations/invitations-repository";

// Explicit local-only integration test. Creates synthetic invitations, contacts the
// selected TEST tournament, and removes only fixtures owned by this exact run.
const { values } = parseArgs({ options: { tournament: { type: "string" }, run: { type: "boolean", default: false } } });
const database = new URL(process.env.DATABASE_URL ?? "http://invalid");
if (process.env.NODE_ENV !== "development" || !["db", "localhost", "127.0.0.1"].includes(database.hostname)) throw new Error("This script requires the local development database.");
if (!values.run || !values.tournament) throw new Error("Use --run --tournament=<local ID> explicitly inside the development container.");
const localId = values.tournament;
const api = new ChallongeClient(process.env.CHALLONGE_API_KEY);
const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 17);
const prefix = `QA_CDS_${stamp}`;
const reportPath = `tmp/challonge-integration-${stamp}.json`;
const fixtures: { id: string; name: string; input: RegistrationInput }[] = [];
const temporaryRemoteIds = new Set<string>();
const checks: { name: string; passed: boolean; details?: unknown }[] = [];
let baselineRemote: RemoteParticipant[] = [];
let baselineLocalIds: string[] = [];
let ref: { id: string; community?: string };
let failure = false;
let cleanupVerified = false;
let index = 0;
let contextValidated = false;
mkdirSync("tmp", { recursive: true });
function saveReport() {
  writeFileSync(reportPath, JSON.stringify({ prefix, localId, remote: ref, fixtures: fixtures.map(({ id, name }) => ({ id, name })), temporaryRemoteIds: [...temporaryRemoteIds], checks, failure, cleanupVerified }, null, 2));
}
function pass(name: string, details?: unknown) { checks.push({ name, passed: true, details }); saveReport(); console.log(JSON.stringify({ check: name, result: "PASS", details })); }
async function makeFixture(suffix = "") {
  const number = 77000000 + ++index;
  const input = registrationSchema.parse({ fullName: `QA integration fixture ${prefix} ${index}`, email: `qa.${stamp}.${index}@example.invalid`, phone: "600000000", dni: `${number}${"TRWAGMYFPDXBNJZSQVHLCKE"[number % 23]}`, postalCode: "08001", epicUsername: `${prefix}_${index}${suffix}`, discordUsername: `qa_${stamp}_${index}`, acceptedTerms: true, acceptedPrivacy: true, acceptedMarketing: false });
  const created = await persistInvitation(localId, input);
  const fixture = { id: created.id, name: input.epicUsername, input };
  fixtures.push(fixture); saveReport();
  return fixture;
}
async function publish(repo: ChallongeRepository = challongeRepository, gateway: ChallongeGateway = api) { return publishChallongeParticipants(repo, gateway, localId); }
async function remoteSnapshot(expectedCount: number) {
  const participants = await api.listParticipants(ref);
  assert.equal(participants.length, expectedCount);
  assert.equal(new Set(participants.map((p) => p.id)).size, participants.length);
  for (const original of baselineRemote) assert.deepEqual(participants.find((p) => p.id === original.id), original);
  return participants;
}
async function deleteOwnedRemote(id: string, known?: RemoteParticipant[]) {
  if (baselineRemote.some((p) => p.id === id)) throw new Error("Refusing to delete an original participant");
  const participants = known ?? await api.listParticipants(ref);
  const participant = participants.find((p) => p.id === id);
  if (!participant) { temporaryRemoteIds.delete(id); return; }
  const ownedMarkers = new Set(fixtures.map((f) => `culdesac:${f.id}`));
  if (!participant.name.startsWith(prefix) || (!temporaryRemoteIds.has(id) && !ownedMarkers.has(participant.misc ?? ""))) throw new Error("Refusing to delete a participant not owned by this run");
  const url = new URL(`https://api.challonge.com/v2.1/tournaments/${encodeURIComponent(ref.id)}/participants/${encodeURIComponent(id)}.json`);
  if (ref.community) url.searchParams.set("community_id", ref.community);
  const response = await fetch(url, { method: "DELETE", redirect: "error", signal: AbortSignal.timeout(20_000), headers: { "Authorization-Type": "v1", Authorization: process.env.CHALLONGE_API_KEY!, Accept: "application/json", "Content-Type": "application/vnd.api+json" } });
  if (![200, 204].includes(response.status)) throw new Error(`Fixture cleanup failed: HTTP ${response.status}`);
  temporaryRemoteIds.delete(id); saveReport();
}
async function expectPublishFailure(pattern: RegExp, gateway: ChallongeGateway = api, repo: ChallongeRepository = challongeRepository) {
  await assert.rejects(() => publish(repo, gateway), pattern);
}

try {
  const local = await db.tournament.findUniqueOrThrow({ where: { id: localId } });
  assert.ok(local.challongeTournamentId && local.challongeUrl);
  ref = { id: local.challongeTournamentId, ...(local.challongeCommunity ? { community: local.challongeCommunity } : {}) };
  const remote = await api.getTournament(ref);
  assert.match(remote.name, /test/i); assert.equal(remote.state, "pending"); assert.equal(remote.tournamentType, "swiss");
  baselineRemote = await api.listParticipants(ref);
  baselineLocalIds = (await db.registration.findMany({ where: { tournamentId: localId }, select: { id: true } })).map((r) => r.id);
  const confirmedCount = await db.registration.count({ where: { tournamentId: localId, status: { in: ["PAID", "INVITED"] } } });
  assert.ok(local.capacity === null || local.capacity - confirmedCount >= 27, "Insufficient capacity for the test fixtures");
  contextValidated = true;
  pass("Local database and existing TEST tournament preflight", { localId, remoteId: ref.id, initialRemote: baselineRemote.length, initialLocal: baselineLocalIds.length });

  const unauthorized = await fetch(`http://127.0.0.1:3000/api/admin/tournaments/${localId}/registrations/export`, { redirect: "manual" });
  assert.equal(unauthorized.status, 401);
  const invalid = await fetch("http://127.0.0.1:3000/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tournamentId: localId, fullName: "Incomplete QA" }) });
  assert.equal(invalid.status, 422);
  pass("HTTP authorization and invalid public registration rejection", { exportWithoutSession: unauthorized.status, invalidRegistration: invalid.status });

  const first = await makeFixture();
  await assert.rejects(() => persistInvitation(localId, first.input), /Ja hi ha/);
  for (let i = 1; i < 21; i++) await makeFixture();
  const pending = await makeFixture(); const cancelled = await makeFixture();
  await db.registration.update({ where: { id: pending.id }, data: { status: "PENDING_PAYMENT" } });
  await db.registration.update({ where: { id: cancelled.id }, data: { status: "CANCELLED" } });
  // This is a synthetic local payment-status fixture, never a Stripe charge.
  await db.registration.update({ where: { id: first.id }, data: { status: "PAID", paidAt: new Date(), amountCents: local.priceCents } });
  const bulkSizes: number[] = [];
  const observed: ChallongeGateway = { getTournament: api.getTournament.bind(api), listParticipants: api.listParticipants.bind(api), async bulkAdd(reference, people) { bulkSizes.push(people.length); return api.bulkAdd(reference, people); } };
  const bulk = await publish(challongeRepository, observed);
  assert.equal(bulk.added, 21); assert.deepEqual(bulkSizes, [20, 1]);
  const bulkRemote = await remoteSnapshot(baselineRemote.length + 21);
  assert.ok(!bulkRemote.some((p) => p.misc === `culdesac:${pending.id}` || p.misc === `culdesac:${cancelled.id}`));
  pass("Bulk 20+1, PAID+INVITED selection, duplicate invite rejection, unpaid/cancelled exclusion", { ...bulk, bulkSizes });

  assert.equal((await publish()).added, 0);
  await remoteSnapshot(baselineRemote.length + 21);
  pass("Repeated publish creates no duplicate");

  const unicode = await makeFixture("_Èpic_日本");
  assert.equal((await publish()).added, 1);
  const incrementalRemote = await remoteSnapshot(baselineRemote.length + 22);
  assert.equal(incrementalRemote.find((p) => p.misc === `culdesac:${unicode.id}`)?.name, unicode.name);
  pass("Incremental invitation and exact Unicode nickname preservation");

  let entered!: () => void; let release!: () => void;
  const occupied = new Promise<void>((resolve) => { entered = resolve; });
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const holding: ChallongeGateway = { getTournament: api.getTournament.bind(api), bulkAdd: api.bulkAdd.bind(api), async listParticipants(reference) { entered(); await gate; return api.listParticipants(reference); } };
  const inFlight = publish(challongeRepository, holding);
  await occupied;
  try { await expectPublishFailure(/en curs/); } finally { release(); }
  assert.equal((await inFlight).added, 0);
  await remoteSnapshot(baselineRemote.length + 22);
  pass("Concurrent double click is blocked by the real PostgreSQL lock");

  const lost = await makeFixture();
  const responseLost: ChallongeGateway = { getTournament: api.getTournament.bind(api), listParticipants: api.listParticipants.bind(api), async bulkAdd(reference, people) { await api.bulkAdd(reference, people); throw new ChallongeError("QA simulated response loss after real remote success"); } };
  await expectPublishFailure(/QA simulated response loss/, responseLost);
  assert.equal((await db.registration.findUniqueOrThrow({ where: { id: lost.id } })).challongeParticipantId, null);
  const recovered = await publish(); assert.equal(recovered.added, 0); assert.equal(recovered.recovered, 1);
  await remoteSnapshot(baselineRemote.length + 23);
  pass("Ambiguous successful POST recovered from actual Challonge marker", recovered);

  const localFailure = await makeFixture();
  const unavailableRepo: ChallongeRepository = { ...challongeRepository, async saveParticipants() { throw new Error("QA simulated mapping database failure"); } };
  await expectPublishFailure(/No s’ha pogut/, api, unavailableRepo);
  assert.equal((await db.registration.findUniqueOrThrow({ where: { id: localFailure.id } })).challongeParticipantId, null);
  const dbRecovered = await publish(); assert.equal(dbRecovered.added, 0); assert.equal(dbRecovered.recovered, 1);
  await remoteSnapshot(baselineRemote.length + 24);
  pass("Remote success with failed local mapping persistence recovers safely", dbRecovered);

  const manual = await makeFixture();
  const manualRemote = (await api.bulkAdd(ref, [{ name: manual.name, misc: `qa-manual:${prefix}` }]))[0];
  temporaryRemoteIds.add(manualRemote.id); saveReport();
  await expectPublishFailure(/nickname/);
  await remoteSnapshot(baselineRemote.length + 25);
  await deleteOwnedRemote(manualRemote.id);
  assert.equal((await publish()).added, 1);
  const reconciled = await remoteSnapshot(baselineRemote.length + 25);
  pass("Manual nickname conflict blocks duplication and resumes once resolved");

  const removable = reconciled.find((p) => p.misc === `culdesac:${unicode.id}`)!;
  await deleteOwnedRemote(removable.id, reconciled);
  await expectPublishFailure(/No es troba/);
  await remoteSnapshot(baselineRemote.length + 24);
  const restored = (await api.bulkAdd(ref, [{ name: unicode.name, misc: `culdesac:${unicode.id}` }]))[0];
  await db.registration.update({ where: { id: unicode.id }, data: { challongeParticipantId: restored.id, challongePublishedAt: new Date() } });
  assert.equal((await publish()).added, 0);
  pass("Manual remote deletion is detected instead of blindly recreating the participant");

  const duplicateMarker = (await api.bulkAdd(ref, [{ name: `${prefix}_duplicate_marker`, misc: `culdesac:${first.id}` }]))[0];
  temporaryRemoteIds.add(duplicateMarker.id); saveReport();
  await expectPublishFailure(/duplicat/);
  await deleteOwnedRemote(duplicateMarker.id);
  assert.equal((await publish()).added, 0);
  pass("Duplicate remote marker blocks unsafe synchronization");

  await db.registration.update({ where: { id: localFailure.id }, data: { status: "REFUNDED" } });
  const withdrawal = await publish(); assert.equal(withdrawal.withdrawn, 1); assert.equal(withdrawal.added, 0);
  await remoteSnapshot(baselineRemote.length + 25);
  await db.registration.update({ where: { id: localFailure.id }, data: { status: "INVITED" } });
  await assert.rejects(() => unlinkChallongeTournament(challongeRepository, localId), /enviament/);
  await assert.rejects(() => linkChallongeTournament(challongeRepository, api, localId, "https://example.com/wrong"), /enllaç/);
  pass("Withdrawal warning, published link protection and invalid link rejection");
} catch (cause) {
  failure = true;
  const message = cause instanceof ChallongeError ? cause.message : cause instanceof Error ? `${cause.name}: ${cause.message.slice(0, 350)}` : "Unknown verification failure";
  checks.push({ name: "Integration execution", passed: false, details: message }); saveReport();
  console.error(JSON.stringify({ result: "FAIL", error: message }));
} finally {
  if (contextValidated) {
    try {
      const participants = await api.listParticipants(ref!);
      const markers = new Set(fixtures.map((f) => `culdesac:${f.id}`));
      for (const participant of participants) {
        if (participant.name.startsWith(prefix) && (markers.has(participant.misc ?? "") || temporaryRemoteIds.has(participant.id))) await deleteOwnedRemote(participant.id, participants);
      }
      // Delete only explicitly tracked, synthetic local rows after their remote removal.
      const remainingRemote = await api.listParticipants(ref!);
      assert.ok(!remainingRemote.some((p) => markers.has(p.misc ?? "") || temporaryRemoteIds.has(p.id)), "Remote fixtures remain; preserving local IDs for manual cleanup");
      await db.registration.deleteMany({ where: { id: { in: fixtures.map((f) => f.id) }, tournamentId: localId, fullName: { startsWith: `QA integration fixture ${prefix}` } } });
      const remainingLocal = await db.registration.findMany({ where: { tournamentId: localId }, select: { id: true } });
      assert.deepEqual(remainingLocal.map((r) => r.id).sort(), baselineLocalIds.sort());
      assert.deepEqual(remainingRemote, baselineRemote);
      assert.equal((await publish()).added, 0);
      cleanupVerified = true;
      pass("Cleanup restores original local registrations and original Challonge participants", { deletedLocalFixtures: fixtures.length, originalLocal: remainingLocal.length, originalRemote: remainingRemote.length });
    } catch (cause) {
      failure = true;
      checks.push({ name: "Fixture cleanup", passed: false, details: cause instanceof Error ? cause.message.slice(0, 350) : "Unknown cleanup failure" }); saveReport();
      console.error(JSON.stringify({ result: "CLEANUP_FAILED", reportPath }));
    }
  }
  saveReport();
  await db.$disconnect();
  console.log(JSON.stringify({ result: failure ? "FAIL" : "PASS", checks: checks.filter((c) => c.passed).length, cleanupVerified, reportPath }));
  process.exit(failure ? 1 : 0);
}
