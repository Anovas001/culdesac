import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { confirmedRegistrationStatuses } from "@/lib/registration-status";
import type { RegistrationInput } from "@/lib/validation/registration";
import { createInvitation, InvitationError } from "./invitations";

export async function persistInvitation(tournamentId: string, participant: RegistrationInput) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction((tx) => createInvitation({
        getTournament: (id) => tx.tournament.findUnique({ where: { id }, select: { id: true, status: true, currency: true, capacity: true } }),
        hasParticipant: async (id, person) => Boolean(await tx.registration.findFirst({
          where: { tournamentId: id, OR: [
            { emailNormalized: person.emailNormalized },
            { dniNormalized: person.dniNormalized },
            { epicUsernameNormalized: person.epicUsernameNormalized },
          ] }, select: { id: true },
        })),
        countConfirmed: (id) => tx.registration.count({ where: { tournamentId: id, status: { in: confirmedRegistrationStatuses } } }),
        create: (data) => tx.registration.create({ data, select: { id: true } }),
      }, tournamentId, participant), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") throw new InvitationError("Ja hi ha una inscripció amb aquest correu, DNI/NIE o nickname de Fortnite en aquest torneig.");
        if (error.code === "P2034") continue;
      }
      throw error;
    }
  }
  throw new InvitationError("S’estan registrant altres participants alhora. Torna-ho a provar; no s’ha creat la invitació.");
}
