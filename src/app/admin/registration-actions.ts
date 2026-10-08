"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { registrationEditSchema, RegistrationManagementError } from "@/services/registrations/admin-management";
import { persistRegistrationDelete, persistRegistrationEdit } from "@/services/registrations/admin-management-repository";

export type RegistrationActionState = { error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };
function identifiers(data: FormData) {
  const tournamentId = String(data.get("tournamentId") ?? "");
  const registrationId = String(data.get("registrationId") ?? "");
  return [tournamentId, registrationId].every((value) => /^[a-z0-9_-]{1,100}$/i.test(value)) ? { tournamentId, registrationId } : null;
}
function refresh(tournamentId: string) {
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath(`/admin/tournaments/${tournamentId}`); revalidatePath(`/admin/tournaments/${tournamentId}/registrations`);
}
async function authenticated() { return isAdmin((await cookies()).get(cookieName)?.value); }

export async function saveRegistrationEdit(_previous: RegistrationActionState, formData: FormData): Promise<RegistrationActionState> {
  if (!await authenticated()) return { error: "La sessió ha caducat. Torna a iniciar sessió al backoffice." };
  const ids = identifiers(formData);
  if (!ids) return { error: "La inscripció o el torneig no són vàlids." };
  const values = Object.fromEntries(["fullName", "epicUsername", "discordUsername"].map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = registrationEditSchema.safeParse(values);
  if (!parsed.success) return { error: "Revisa els camps indicats abans de desar.", values, fieldErrors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])) };
  try { await persistRegistrationEdit(ids.tournamentId, ids.registrationId, parsed.data); } catch (cause) {
    return { error: cause instanceof RegistrationManagementError ? cause.message : "No s’han pogut desar els canvis. Torna-ho a provar.", values };
  }
  refresh(ids.tournamentId);
  return redirect(`/admin/tournaments/${ids.tournamentId}/registrations?updated=1`);
}

export async function removeRegistration(_previous: RegistrationActionState, formData: FormData): Promise<RegistrationActionState> {
  if (!await authenticated()) return { error: "La sessió ha caducat. Torna a iniciar sessió al backoffice." };
  const ids = identifiers(formData);
  if (!ids) return { error: "La inscripció o el torneig no són vàlids." };
  if (formData.get("confirmed") !== "on") return { error: "Confirma que vols eliminar definitivament aquesta inscripció." };
  try { await persistRegistrationDelete(ids.tournamentId, ids.registrationId); } catch (cause) {
    return { error: cause instanceof RegistrationManagementError ? cause.message : "No s’ha pogut eliminar la inscripció. Revisa el llistat abans de reintentar." };
  }
  refresh(ids.tournamentId);
  return redirect(`/admin/tournaments/${ids.tournamentId}/registrations?deleted=1`);
}
