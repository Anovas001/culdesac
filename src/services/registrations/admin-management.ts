import { z } from "zod";
import { normalizeEpicUsername } from "@/lib/validation/registration";

export const registrationEditSchema = z.object({
  fullName: z.string().trim().min(2, "Escriu el nom i cognoms.").max(120, "El nom és massa llarg."),
  epicUsername: z.string().trim().min(2, "Escriu el nickname de Fortnite.").max(64, "El nickname és massa llarg."),
  discordUsername: z.string().trim().min(2, "Escriu l’usuari de Discord.").max(100, "L’usuari de Discord és massa llarg."),
}).transform((value) => ({ ...value, epicUsernameNormalized: normalizeEpicUsername(value.epicUsername) }));
export type RegistrationEditInput = z.output<typeof registrationEditSchema>;
export class RegistrationManagementError extends Error {}
export type RegistrationManagementRepository = {
  get(tournamentId: string, id: string): Promise<{ id: string } | null>;
  hasNickname(tournamentId: string, normalizedNickname: string, exceptId: string): Promise<boolean>;
  update(tournamentId: string, id: string, input: RegistrationEditInput): Promise<void>;
  remove(tournamentId: string, id: string): Promise<void>;
};

async function requireRegistration(repo: RegistrationManagementRepository, tournamentId: string, id: string) {
  if (!await repo.get(tournamentId, id)) throw new RegistrationManagementError("No s’ha trobat aquesta inscripció al torneig. Pot haver estat eliminada.");
}
export async function editRegistration(repo: RegistrationManagementRepository, tournamentId: string, id: string, input: RegistrationEditInput) {
  await requireRegistration(repo, tournamentId, id);
  if (await repo.hasNickname(tournamentId, input.epicUsernameNormalized, id)) throw new RegistrationManagementError("Ja hi ha una altra inscripció amb aquest nickname de Fortnite en aquest torneig.");
  await repo.update(tournamentId, id, { fullName: input.fullName, epicUsername: input.epicUsername, epicUsernameNormalized: input.epicUsernameNormalized, discordUsername: input.discordUsername });
}
export async function deleteRegistration(repo: RegistrationManagementRepository, tournamentId: string, id: string) {
  await requireRegistration(repo, tournamentId, id);
  await repo.remove(tournamentId, id);
}
