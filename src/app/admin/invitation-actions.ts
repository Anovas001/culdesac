"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { registrationSchema } from "@/lib/validation/registration";
import { InvitationError } from "@/services/registrations/invitations";
import { persistInvitation } from "@/services/registrations/invitations-repository";

export type InvitationFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function saveInvitation(_previous: InvitationFormState, formData: FormData): Promise<InvitationFormState> {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) {
    return { error: "La sessió ha caducat. Torna a iniciar sessió al backoffice." };
  }
  const fields = ["tournamentId", "fullName", "email", "phone", "dni", "postalCode", "epicUsername", "discordUsername", "acceptedTerms", "acceptedPrivacy", "acceptedMarketing"];
  const values = Object.fromEntries(fields.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = registrationSchema.safeParse({
    ...values, acceptedTerms: values.acceptedTerms === "on", acceptedPrivacy: values.acceptedPrivacy === "on", acceptedMarketing: values.acceptedMarketing === "on",
  });
  if (!parsed.success) {
    return { error: "Revisa els camps indicats abans de crear la invitació.", values,
      fieldErrors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])),
    };
  }
  const tournamentId = values.tournamentId;
  if (!tournamentId || tournamentId.length > 100) return { error: "No s’ha trobat el torneig.", values };
  try {
    await persistInvitation(tournamentId, parsed.data);
  } catch (error) {
    if (error instanceof InvitationError) return { error: error.message, values };
    console.error("[admin-invitation] Could not create invitation", { tournamentId });
    return { error: "No s’ha pogut crear la invitació. Revisa el llistat abans de tornar-ho a provar.", values };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/registrations`);
  redirect(`/admin/tournaments/${tournamentId}/registrations?status=INVITED&created=1`);
}
