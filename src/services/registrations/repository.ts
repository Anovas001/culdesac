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

  async findExisting(tournamentId, emailNormalized, epicUsernameNormalized) {
    const registration = await db.registration.findFirst({
      where: {
        tournamentId,
        OR: [{ emailNormalized }, { epicUsernameNormalized }],
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
        epicUsername: data.epicUsername,
        epicUsernameNormalized: data.epicUsernameNormalized,
        discordUsername: data.discordUsername,
        phone: data.phone,
        acceptedTerms: data.acceptedTerms,
        acceptedPrivacy: data.acceptedPrivacy,
        amountCents: data.amountCents,
        currency: data.currency,
      },
      select: { id: true, status: true },
    });
    return toExistingRegistration(registration);
  },

  async reactivate(registrationId) {
    await db.registration.update({
      where: { id: registrationId },
      data: { status: "PENDING_PAYMENT", stripeCheckoutSessionId: null },
    });
  },
};
