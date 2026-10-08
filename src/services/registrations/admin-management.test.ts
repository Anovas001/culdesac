import { describe, expect, it } from "vitest";
import { editRegistration, deleteRegistration, registrationEditSchema, type RegistrationManagementRepository } from "./admin-management";

function repository() {
  const records = [
    { id: "r1", tournamentId: "t1", fullName: "Original", epicUsername: "OriginalNick", epicUsernameNormalized: "originalnick", discordUsername: "original", status: "PAID", amountCents: 1500, stripePaymentIntentId: "pi_original", challongeParticipantId: "p1", acceptedPrivacy: true },
    { id: "r2", tournamentId: "t1", fullName: "Other", epicUsername: "OtherNick", epicUsernameNormalized: "othernick", discordUsername: "other", status: "INVITED", amountCents: 0, stripePaymentIntentId: null, challongeParticipantId: null, acceptedPrivacy: true },
  ];
  const repo: RegistrationManagementRepository = {
    async get(tournamentId, id) { return records.find((r) => r.id === id && r.tournamentId === tournamentId) ?? null; },
    async hasNickname(tournamentId, nickname, exceptId) { return records.some((r) => r.tournamentId === tournamentId && r.id !== exceptId && r.epicUsernameNormalized === nickname); },
    async update(tournamentId, id, data) { Object.assign(records.find((r) => r.id === id && r.tournamentId === tournamentId)!, data); },
    async remove(tournamentId, id) { const index = records.findIndex((r) => r.id === id && r.tournamentId === tournamentId); records.splice(index, 1); },
  };
  return { repo, records };
}
const input = () => registrationEditSchema.parse({ fullName: "  Correct Name ", epicUsername: "  New Nick  ", discordUsername: " @correct.discord " });
describe("registration editing", () => {
  it("normalizes only the editable profile fields and ignores supplied payment/consent fields", () => {
    expect(registrationEditSchema.parse({ fullName: " Correct Name ", epicUsername: " New Nick ", discordUsername: " Discord ", status: "INVITED", amountCents: 0, challongeParticipantId: null, acceptedPrivacy: false })).toEqual({ fullName: "Correct Name", epicUsername: "New Nick", epicUsernameNormalized: "new nick", discordUsername: "Discord" });
  });
  it.each(["fullName", "epicUsername", "discordUsername"])("rejects a blank %s", (field) => {
    expect(registrationEditSchema.safeParse({ ...input(), [field]: " " }).success).toBe(false);
  });
  it("edits even a paid published participation while preserving its payment and remote link", async () => {
    const { repo, records } = repository();
    await editRegistration(repo, "t1", "r1", input());
    expect(records[0]).toMatchObject({ fullName: "Correct Name", epicUsername: "New Nick", epicUsernameNormalized: "new nick", discordUsername: "@correct.discord", status: "PAID", amountCents: 1500, stripePaymentIntentId: "pi_original", challongeParticipantId: "p1", acceptedPrivacy: true });
  });
  it("accepts saving the participant's current nickname", async () => {
    const { repo, records } = repository();
    await editRegistration(repo, "t1", "r1", registrationEditSchema.parse({ ...input(), epicUsername: "OriginalNick" }));
    expect(records[0].epicUsernameNormalized).toBe("originalnick");
  });
  it("rejects another registration's normalized nickname without changing the record", async () => {
    const { repo, records } = repository();
    await expect(editRegistration(repo, "t1", "r1", registrationEditSchema.parse({ ...input(), epicUsername: " OTHERnick " }))).rejects.toThrow(/nickname/);
    expect(records[0].fullName).toBe("Original");
  });
  it("cannot edit a participant through another tournament", async () => {
    const { repo, records } = repository();
    await expect(editRegistration(repo, "wrong", "r1", input())).rejects.toThrow(/trobat/);
    expect(records[0].fullName).toBe("Original");
  });
});
describe("literal registration deletion", () => {
  it("deletes a paid published row instead of cancelling it or touching other registrations", async () => {
    const { repo, records } = repository();
    await deleteRegistration(repo, "t1", "r1");
    expect(records.map((r) => r.id)).toEqual(["r2"]);
  });
  it("cannot delete a row using another tournament", async () => {
    const { repo, records } = repository();
    await expect(deleteRegistration(repo, "wrong", "r1")).rejects.toThrow(/trobat/);
    expect(records).toHaveLength(2);
  });
});
