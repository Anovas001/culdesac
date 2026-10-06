"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { cookieName, isAdmin } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";
import { ChallongeClient } from "@/services/challonge/client";
import { challongeRepository } from "@/services/challonge/repository";
import { linkChallongeTournament, publishChallongeParticipants, safeChallongeError, unlinkChallongeTournament } from "@/services/challonge/service";

export type ChallongeActionState = { error?: string; message?: string };

export async function manageChallonge(_previous: ChallongeActionState, formData: FormData): Promise<ChallongeActionState> {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) return { error: "La sessió ha caducat. Torna a iniciar sessió al backoffice." };
  const id = String(formData.get("tournamentId") ?? "");
  const operation = String(formData.get("operation") ?? "");
  if (!/^[a-z0-9_-]{1,100}$/i.test(id) || !["link", "unlink", "publish"].includes(operation)) return { error: "L’operació o el torneig no són vàlids." };
  let result: ChallongeActionState;
  try {
    if (operation === "unlink") {
      await unlinkChallongeTournament(challongeRepository, id);
      result = { message: "Torneig desvinculat. Pots vincular-ne un altre amb el seu enllaç." };
    } else {
      const api = new ChallongeClient(getServerEnv().CHALLONGE_API_KEY);
      if (operation === "link") {
        const url = String(formData.get("url") ?? "");
        if (url.length > 500) return { error: "L’enllaç del torneig és massa llarg." };
        const name = await linkChallongeTournament(challongeRepository, api, id, url);
        result = { message: `Torneig «${name}» vinculat. Ja pots enviar-hi els participants confirmats.` };
      } else {
        const stats = await publishChallongeParticipants(challongeRepository, api, id);
        result = { message: `${stats.added} participants afegits, ${stats.recovered} recuperats d’enviaments anteriors i ${stats.alreadyPublished} ja publicats. ${stats.confirmed} inscripcions confirmades comprovades.${stats.withdrawn ? ` Hi ha ${stats.withdrawn} inscripcions publicades que ara estan cancel·lades o no confirmades; revisa-les manualment a Challonge.` : ""} Revisa la llista i inicia el torneig des de Challonge quan estigui preparada.` };
      }
    }
  } catch (cause) { result = { error: safeChallongeError(cause) }; }
  revalidatePath(`/admin/tournaments/${id}/registrations`);
  return result;
}
