import type { RegistrationInput } from "@/lib/validation/registration";

export type InvitationData = RegistrationInput & {
  tournamentId: string;
  status: "INVITED";
  amountCents: 0;
  currency: string;
  paidAt: null;
  stripeCheckoutSessionId: null;
  stripePaymentIntentId: null;
  acceptedMarketingAt: Date | null;
};

export type InvitationRepository = {
  getTournament(id: string): Promise<{ id: string; status: string; currency: string; capacity: number | null } | null>;
  hasParticipant(tournamentId: string, participant: RegistrationInput): Promise<boolean>;
  countConfirmed(tournamentId: string): Promise<number>;
  create(data: InvitationData): Promise<{ id: string }>;
};

export class InvitationError extends Error {}

/** Caller must authenticate the admin and supply an atomic repository transaction. */
export async function createInvitation(repository: InvitationRepository, tournamentId: string, participant: RegistrationInput) {
  const tournament = await repository.getTournament(tournamentId);
  if (!tournament) throw new InvitationError("No s’ha trobat el torneig.");
  if (!["OPEN", "CLOSED"].includes(tournament.status)) {
    throw new InvitationError("Només es poden afegir invitacions a tornejos oberts o tancats, no a esborranys o finalitzats.");
  }
  if (await repository.hasParticipant(tournamentId, participant)) {
    throw new InvitationError("Ja hi ha una inscripció amb aquest correu, DNI/NIE o nickname de Fortnite en aquest torneig. Revisa-la al llistat; no s’ha modificat cap registre.");
  }
  if (tournament.capacity !== null && await repository.countConfirmed(tournamentId) >= tournament.capacity) {
    throw new InvitationError("No queden places disponibles: el torneig ja té l’aforament confirmat complet.");
  }
  return repository.create({
    ...participant, tournamentId, status: "INVITED", amountCents: 0, currency: tournament.currency,
    paidAt: null, stripeCheckoutSessionId: null, stripePaymentIntentId: null,
    acceptedMarketingAt: participant.acceptedMarketing ? new Date() : null,
  });
}
