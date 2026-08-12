import { describe, expect, it, vi } from "vitest";

import {
  ClosedTournamentError,
  createOrReuseRegistration,
  DuplicatePaidRegistrationError,
  type RegistrationRepository,
} from "./service";
import type { RegistrationInput } from "../../lib/validation/registration";

const participant: RegistrationInput = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  emailNormalized: "ada@example.com",
  epicUsername: "AdaPlayer",
  epicUsernameNormalized: "adaplayer",
  discordUsername: null,
  phone: null,
  acceptedTerms: true,
  acceptedPrivacy: true,
};

const openTournament = { id: "tournament-1", status: "OPEN" as const, priceCents: 1500, currency: "eur" };

function repository(overrides: Partial<RegistrationRepository> = {}): RegistrationRepository {
  return {
    getActiveTournament: vi.fn().mockResolvedValue(openTournament),
    findExisting: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: "registration-1", status: "PENDING_PAYMENT" }),
    reactivate: vi.fn(),
    ...overrides,
  };
}

describe("createOrReuseRegistration", () => {
  it("rejects registrations when the active tournament is closed", async () => {
    const db = repository({
      getActiveTournament: vi.fn().mockResolvedValue({ ...openTournament, status: "CLOSED" }),
    });

    await expect(createOrReuseRegistration(db, participant)).rejects.toBeInstanceOf(ClosedTournamentError);
    expect(db.create).not.toHaveBeenCalled();
  });

  it("snapshots the server tournament price instead of a caller-supplied price", async () => {
    const db = repository();

    await createOrReuseRegistration(db, participant);

    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 1500, currency: "eur" }));
  });

  it("does not allow a paid participant to start another checkout", async () => {
    const db = repository({
      findExisting: vi.fn().mockResolvedValue({ id: "registration-1", status: "PAID" }),
    });

    await expect(createOrReuseRegistration(db, participant)).rejects.toBeInstanceOf(DuplicatePaidRegistrationError);
    expect(db.create).not.toHaveBeenCalled();
  });
});
