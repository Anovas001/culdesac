import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { deleteRegistration, editRegistration, RegistrationManagementError, type RegistrationEditInput, type RegistrationManagementRepository } from "./admin-management";

const repository: RegistrationManagementRepository = {
  get: (tournamentId, id) => db.registration.findUnique({ where: { id, tournamentId }, select: { id: true } }),
  hasNickname: async (tournamentId, epicUsernameNormalized, exceptId) => Boolean(await db.registration.findFirst({ where: { tournamentId, epicUsernameNormalized, id: { not: exceptId } }, select: { id: true } })),
  async update(tournamentId, id, input) { await db.registration.update({ where: { id, tournamentId }, data: input }); },
  async remove(tournamentId, id) { await db.registration.delete({ where: { id, tournamentId } }); },
};
async function persist(work: () => Promise<void>) {
  try { await work(); } catch (cause) {
    if (cause instanceof Prisma.PrismaClientKnownRequestError) {
      if (cause.code === "P2002") throw new RegistrationManagementError("Ja hi ha una altra inscripció amb aquest nickname de Fortnite en aquest torneig.");
      if (cause.code === "P2025") throw new RegistrationManagementError("No s’ha trobat aquesta inscripció al torneig. Pot haver estat eliminada.");
    }
    throw cause;
  }
}
export async function persistRegistrationEdit(tournamentId: string, id: string, input: RegistrationEditInput) { await persist(() => editRegistration(repository, tournamentId, id, input)); }
export async function persistRegistrationDelete(tournamentId: string, id: string) { await persist(() => deleteRegistration(repository, tournamentId, id)); }
