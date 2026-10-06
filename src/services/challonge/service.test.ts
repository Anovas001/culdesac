import { beforeEach, describe, expect, it } from "vitest";
import { linkChallongeTournament, publishChallongeParticipants, unlinkChallongeTournament, type ChallongeRepository, type LocalTournament, type LocalRegistration } from "./service";
import type { ChallongeGateway, RemoteParticipant, RemoteTournament } from "./client";

let local: LocalTournament;
let registrations: LocalRegistration[];
let remote: RemoteTournament;
let participants: RemoteParticipant[];
let bulkCalls: { name: string; misc: string }[][];
let lastError: string | null;
let locked: boolean;
let failBulkAt: number;
let failSave: boolean;
const repository: ChallongeRepository = {
  async withLock(_id, work) { if (locked) throw new Error("ocupat"); locked = true; try { return await work(); } finally { locked = false; } },
  async getTournament() { return local; },
  async listRegistrations() { return registrations.map((r) => ({ ...r })); },
  async saveLink(_id, link) { Object.assign(local, link); },
  async clearLink() { local.challongeTournamentId = null; local.challongeUrl = null; local.challongeCommunity = null; },
  async markPublishAttempt() { local.challongePublishAttemptedAt = new Date(); },
  async saveParticipants(_id, links) { if (failSave) throw new Error("DB unavailable"); for (const link of links) registrations.find((r) => r.id === link.registrationId)!.challongeParticipantId = link.participantId; },
  async saveSyncResult(_id, error) { lastError = error; },
};
const gateway: ChallongeGateway = {
  async getTournament() { return remote; },
  async listParticipants() { return participants.map((p) => ({ ...p })); },
  async bulkAdd(_ref, input) {
    bulkCalls.push(input);
    const added = input.map((p, i) => ({ id: String(participants.length + i + 1), name: p.name, misc: p.misc, active: true }));
    participants.push(...added);
    if (bulkCalls.length === failBulkAt) throw new Error("Lost response");
    return added;
  },
};
function registration(id: string, status = "INVITED", linked: string | null = null): LocalRegistration {
  return { id, status, epicUsername: `Guest ${id}`, challongeParticipantId: linked };
}
beforeEach(() => {
  local = { id: "t1", challongeTournamentId: "42", challongeUrl: "https://challonge.com/cup", challongeCommunity: null, challongePublishAttemptedAt: null };
  registrations = [registration("r1", "PAID"), registration("r2"), registration("r3", "PENDING_PAYMENT"), registration("r4", "REFUNDED"), registration("r5", "CANCELLED"), registration("r6", "EXPIRED")];
  remote = { id: "42", name: "Cup", tournamentType: "swiss", state: "pending", participantsLocked: false };
  participants = []; bulkCalls = []; lastError = null; locked = false; failBulkAt = -1; failSave = false;
});
describe("linking", () => {
  it("resolves a URL to its stable remote ID and scope", async () => {
    await linkChallongeTournament(repository, gateway, "t1", "https://club.challonge.com/cup");
    expect(local).toMatchObject({ challongeTournamentId: "42", challongeCommunity: "club", challongeUrl: "https://club.challonge.com/cup" });
  });
  it("blocks switching or unlinking after an uncertain publishing attempt", async () => {
    local.challongePublishAttemptedAt = new Date(); remote.id = "99";
    await expect(linkChallongeTournament(repository, gateway, "t1", "https://challonge.com/other")).rejects.toThrow(/enviament/i);
    await expect(unlinkChallongeTournament(repository, "t1")).rejects.toThrow(/enviament/i);
    expect(local.challongeTournamentId).toBe("42");
  });
  it("allows unlinking a mistaken link before publishing", async () => {
    await unlinkChallongeTournament(repository, "t1");
    expect(local.challongeTournamentId).toBeNull();
  });
});
describe("publishing", () => {
  it("includes only PAID and INVITED, and a second click creates no duplicates", async () => {
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 2, confirmed: 2 });
    expect(bulkCalls[0]).toEqual([{ name: "Guest r1", misc: "culdesac:r1" }, { name: "Guest r2", misc: "culdesac:r2" }]);
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 0, alreadyPublished: 2 });
    expect(bulkCalls).toHaveLength(1);
  });
  it("adds only a new invitation on subsequent sends", async () => {
    await publishChallongeParticipants(repository, gateway, "t1");
    registrations.push(registration("new"));
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 1 });
    expect(bulkCalls[1]).toEqual([{ name: "Guest new", misc: "culdesac:new" }]);
  });
  it("recovers a remotely successful batch after a lost response", async () => {
    failBulkAt = 1;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow();
    expect(registrations[0].challongeParticipantId).toBeNull();
    failBulkAt = -1;
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 0, recovered: 2 });
    expect(bulkCalls).toHaveLength(1);
    expect(registrations[0].challongeParticipantId).toBe("1");
  });
  it("recovers if local persistence failed after Challonge accepted the batch", async () => {
    failSave = true;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow();
    failSave = false;
    await publishChallongeParticipants(repository, gateway, "t1");
    expect(bulkCalls).toHaveLength(1);
  });
  it("recovers and flags a refunded registration from an uncertain earlier send", async () => {
    failBulkAt = 1;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow();
    registrations[0].status = "REFUNDED"; failBulkAt = -1;
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 0, recovered: 2, withdrawn: 1, confirmed: 1 });
    expect(registrations[0].challongeParticipantId).toBe("1");
    expect(bulkCalls).toHaveLength(1);
  });
  it("preserves completed batches and recovers a later ambiguous batch", async () => {
    registrations = Array.from({ length: 105 }, (_, i) => registration(String(i)));
    failBulkAt = 2;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow();
    expect(registrations.filter((r) => r.challongeParticipantId)).toHaveLength(20);
    failBulkAt = -1;
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 65, recovered: 20 });
    expect(participants).toHaveLength(105);
  });
  it("respects the documented maximum of 20 participants per bulk request", async () => {
    registrations = Array.from({ length: 21 }, (_, i) => registration(String(i)));
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 21 });
    expect(bulkCalls.map((batch) => batch.length)).toEqual([20, 1]);
  });
  it.each(["single elimination", "double elimination"])("rejects a %s tournament", async (type) => {
    remote.tournamentType = type;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/suís/);
    expect(bulkCalls).toHaveLength(0);
  });
  it.each(["underway", "complete", "checking_in", "checked_in"])("refuses to publish in state %s", async (state) => {
    remote.state = state;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/iniciat|preparació/i);
    expect(bulkCalls).toHaveLength(0);
  });
  it("rejects a locked participants list", async () => {
    remote.participantsLocked = true;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/bloquejat/i);
  });
  it("does not write if the tournament identity changes during the preflight", async () => {
    let checks = 0;
    const changingGateway = { ...gateway, async getTournament() { return { ...remote, id: ++checks === 1 ? "42" : "99" }; } };
    await expect(publishChallongeParticipants(repository, changingGateway, "t1")).rejects.toThrow(/coincideix/);
    expect(bulkCalls).toHaveLength(0);
  });
  it("does not publish a participant whose payment was refunded during the preflight", async () => {
    const refundingGateway = { ...gateway, async listParticipants() { registrations[0].status = "REFUNDED"; return []; } };
    expect(await publishChallongeParticipants(repository, refundingGateway, "t1")).toMatchObject({ added: 1, confirmed: 1 });
    expect(bulkCalls[0]).toEqual([{ name: "Guest r2", misc: "culdesac:r2" }]);
  });
  it("blocks an unlinked tournament", async () => {
    local.challongeTournamentId = null;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/vincula/i);
  });
  it("refuses to recreate a published participant manually removed remotely", async () => {
    registrations[0].challongeParticipantId = "missing";
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/eliminat|troba/i);
    expect(bulkCalls).toHaveLength(0);
  });
  it("does not duplicate a manually entered participant with the same nickname", async () => {
    participants.push({ id: "p1", name: " guest R1 ", misc: null, active: true });
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/nickname/i);
    expect(bulkCalls).toHaveLength(0);
  });
  it("blocks duplicate registration markers remotely", async () => {
    participants = [{ id: "p1", name: "one", misc: "culdesac:r1", active: true }, { id: "p2", name: "two", misc: "culdesac:r1", active: true }];
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/duplicat/i);
  });
  it("preserves manual nickname changes and warns about withdrawals without deleting them", async () => {
    await publishChallongeParticipants(repository, gateway, "t1");
    participants[0].name = "Changed by referee"; registrations[1].status = "REFUNDED";
    expect(await publishChallongeParticipants(repository, gateway, "t1")).toMatchObject({ added: 0, withdrawn: 1 });
    expect(participants).toHaveLength(2);
    expect(participants[0].name).toBe("Changed by referee");
  });
  it("records safe error text and serializes concurrent operations", async () => {
    locked = true;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow(/ocupat/);
    expect(bulkCalls).toHaveLength(0);
    locked = false; failBulkAt = 1;
    await expect(publishChallongeParticipants(repository, gateway, "t1")).rejects.toThrow();
    expect(lastError).not.toContain("Lost response");
  });
});
