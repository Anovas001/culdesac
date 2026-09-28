import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/lib/validation/registration";
import { createInvitation, type InvitationRepository, type InvitationData } from "./invitations";

const participant = registrationSchema.parse({ fullName: "Convidat Prova", email: "guest@example.com", phone: "612345678", epicUsername: "Guest", discordUsername: "guest", dni: "12345678Z", postalCode: "08001", acceptedTerms: true, acceptedPrivacy: true });
function repository({ status = "OPEN", exists = false, confirmed = 0, capacity = 2, missing = false } = {}) {
  const records: InvitationData[] = [];
  const repo: InvitationRepository = {
    getTournament: async () => missing ? null : { id: "t1", status, currency: "eur", capacity },
    hasParticipant: async () => exists || records.length > 0,
    countConfirmed: async () => confirmed,
    create: async (data) => { records.push(data); return { id: "invitation-1" }; },
  };
  return { repo, records };
}
describe("admin invitations", () => {
  it("creates a confirmed free participation using all normalized participant fields", async () => {
    const { repo, records } = repository();
    expect(await createInvitation(repo, "t1", participant)).toEqual({ id: "invitation-1" });
    expect(records).toEqual([{ ...participant, tournamentId: "t1", status: "INVITED", amountCents: 0, currency: "eur", paidAt: null, stripeCheckoutSessionId: null, stripePaymentIntentId: null, acceptedMarketingAt: null }]);
  });
  it("allows internal invitations in closed tournaments", async () => {
    const { repo } = repository({ status: "CLOSED" });
    await expect(createInvitation(repo, "t1", participant)).resolves.toEqual({ id: "invitation-1" });
  });
  it.each(["DRAFT", "COMPLETED"])("rejects %s tournaments", async (status) => {
    const { repo, records } = repository({ status });
    await expect(createInvitation(repo, "t1", participant)).rejects.toThrow("oberts o tancats");
    expect(records).toHaveLength(0);
  });
  it("rejects missing tournaments", async () => {
    await expect(createInvitation(repository({ missing: true }).repo, "t1", participant)).rejects.toThrow("trobat");
  });
  it("rejects an existing participant regardless of payment status", async () => {
    const { repo, records } = repository({ exists: true });
    await expect(createInvitation(repo, "t1", participant)).rejects.toThrow("inscripció");
    expect(records).toHaveLength(0);
  });
  it("rejects a repeated submission", async () => {
    const { repo, records } = repository();
    await createInvitation(repo, "t1", participant);
    await expect(createInvitation(repo, "t1", participant)).rejects.toThrow("inscripció");
    expect(records).toHaveLength(1);
  });
  it("does not exceed capacity counting paid and invited places", async () => {
    const { repo, records } = repository({ confirmed: 2 });
    await expect(createInvitation(repo, "t1", participant)).rejects.toThrow("places");
    expect(records).toHaveLength(0);
  });
});
