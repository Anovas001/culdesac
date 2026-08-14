import type { RegistrationInput } from "../../lib/validation/registration";

export type ActiveTournament = {
  id: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED";
  priceCents: number;
  currency: string;
};

export type ExistingRegistration = {
  id: string;
  status: "PENDING_PAYMENT" | "PAID" | "EXPIRED" | "CANCELLED" | "REFUNDED";
};

export type RegistrationRepository = {
  getActiveTournament(): Promise<ActiveTournament | null>;
  findExisting(tournamentId: string, emailNormalized: string, epicUsernameNormalized: string, dniNormalized: string): Promise<ExistingRegistration | null>;
  create(data: RegistrationInput & { tournamentId: string; amountCents: number; currency: string }): Promise<ExistingRegistration>;
  updateParticipant(registrationId: string, participant: RegistrationInput): Promise<void>;
  reactivate(registrationId: string): Promise<void>;
};

export class ClosedTournamentError extends Error {
  constructor() {
    super("Les inscripcions no estan obertes ara mateix.");
    this.name = "ClosedTournamentError";
  }
}

export class DuplicatePaidRegistrationError extends Error {
  constructor() {
    super("Aquesta persona ja està inscrita en aquest torneig.");
    this.name = "DuplicatePaidRegistrationError";
  }
}

export type RegistrationPreparation = {
  tournament: ActiveTournament;
  registration: ExistingRegistration;
  isNew: boolean;
};

/** Creates a pending registration or reuses a safely retryable one. Payment is deliberately separate. */
export async function createOrReuseRegistration(
  repository: RegistrationRepository,
  participant: RegistrationInput,
): Promise<RegistrationPreparation> {
  const tournament = await repository.getActiveTournament();
  if (!tournament || tournament.status !== "OPEN") {
    throw new ClosedTournamentError();
  }

  const existing = await repository.findExisting(
    tournament.id,
    participant.emailNormalized,
    participant.epicUsernameNormalized,
    participant.dniNormalized,
  );
  if (existing) {
    if (existing.status === "PAID") {
      throw new DuplicatePaidRegistrationError();
    }

    await repository.updateParticipant(existing.id, participant);

    if (existing.status === "EXPIRED") {
      await repository.reactivate(existing.id);
      return { tournament, registration: { ...existing, status: "PENDING_PAYMENT" }, isNew: false };
    }

    return { tournament, registration: existing, isNew: false };
  }

  const registration = await repository.create({
    ...participant,
    tournamentId: tournament.id,
    amountCents: tournament.priceCents,
    currency: tournament.currency,
  });
  return { tournament, registration, isNew: true };
}
