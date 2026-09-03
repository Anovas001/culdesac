import { db } from "../../lib/db";
import type { RegistrationInput } from "../../lib/validation/registration";
import type {
  ActiveTournament,
  ExistingRegistration,
  RegistrationRepository,
} from "./service";

function toActiveTournament(tournament: {
  id: string;
  status: ActiveTournament["status"];
  priceCents: number;
  currency: string;
}): ActiveTournament {
  return tournament;
}

function toExistingRegistration(registration: {
  id: string;
  status: ExistingRegistration["status"];
}): ExistingRegistration {
  return registration;
}

export const prismaRegistrationRepository: RegistrationRepository = {
  async getActiveTournament() {
    const settings = await db.siteSettings.findUnique({
      where: { id: 1 },
      include: { activeTournament: true },
    });
    return settings?.activeTournament ? toActiveTournament(settings.activeTournament) : null;
  },

  async findExisting(tournamentId, emailNormalized, epicUsernameNormalized, dniNormalized) {
    const registration = await db.registration.findFirst({
      where: {
        tournamentId,
        OR: [{ emailNormalized }, { epicUsernameNormalized }, { dniNormalized }],
      },
      select: { id: true, status: true },
    });
    return registration ? toExistingRegistration(registration) : null;
  },

  async create(data: RegistrationInput & { tournamentId: string; amountCents: number; currency: string }) {
    const registration = await db.registration.create({
      data: {
        tournamentId: data.tournamentId,
        fullName: data.fullName,
        email: data.email,
        emailNormalized: data.emailNormalized,
        phone: data.phone,
        epicUsername: data.epicUsername,
        epicUsernameNormalized: data.epicUsernameNormalized,
        discordUsername: data.discordUsername,
        dni: data.dni,
        dniNormalized: data.dniNormalized,
        postalCode: data.postalCode,
        acceptedTerms: data.acceptedTerms,
        acceptedPrivacy: data.acceptedPrivacy,
        acceptedMarketing: data.acceptedMarketing,
        acceptedMarketingAt: data.acceptedMarketing ? new Date() : null,
        amountCents: data.amountCents,
        currency: data.currency,
      },
      select: { id: true, status: true },
    });
    return toExistingRegistration(registration);
  },

  async updateParticipant(registrationId, participant) {
    await db.registration.update({
      where: { id: registrationId },
      data: {
        fullName: participant.fullName,
        email: participant.email,
        emailNormalized: participant.emailNormalized,
        phone: participant.phone,
        epicUsername: participant.epicUsername,
        epicUsernameNormalized: participant.epicUsernameNormalized,
        discordUsername: participant.discordUsername,
        dni: participant.dni,
        dniNormalized: participant.dniNormalized,
        postalCode: participant.postalCode,
        acceptedTerms: participant.acceptedTerms,
        acceptedPrivacy: participant.acceptedPrivacy,
        acceptedMarketing: participant.acceptedMarketing,
        acceptedMarketingAt: participant.acceptedMarketing ? new Date() : null,
      },
    });
  },

  async reactivate(registrationId) {
    await db.registration.update({
      where: { id: registrationId },
      data: { status: "PENDING_PAYMENT", stripeCheckoutSessionId: null },
    });
  },
};
