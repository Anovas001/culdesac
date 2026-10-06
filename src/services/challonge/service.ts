import { CHALLONGE_BULK_LIMIT, ChallongeError, parseChallongeUrl, type ChallongeGateway, type RemoteTournament, type RemoteParticipant, type TournamentReference } from "./client";

export type LocalTournament = {
  id: string;
  challongeTournamentId: string | null;
  challongeUrl: string | null;
  challongeCommunity: string | null;
  challongePublishAttemptedAt: Date | null;
};
export type LocalRegistration = { id: string; status: string; epicUsername: string; discordUsername: string; challongeParticipantId: string | null };
export type ParticipantLink = { registrationId: string; participantId: string };
export type ChallongeRepository = {
  withLock<T>(id: string, work: () => Promise<T>): Promise<T>;
  getTournament(id: string): Promise<LocalTournament | null>;
  listRegistrations(id: string): Promise<LocalRegistration[]>;
  saveLink(id: string, link: { challongeTournamentId: string; challongeUrl: string; challongeCommunity: string | null }): Promise<void>;
  clearLink(id: string): Promise<void>;
  markPublishAttempt(id: string): Promise<void>;
  saveParticipants(id: string, links: ParticipantLink[]): Promise<void>;
  saveSyncResult(id: string, error: string | null): Promise<void>;
};
export type PublishResult = { added: number; recovered: number; alreadyPublished: number; confirmed: number; withdrawn: number };
const isConfirmed = (registration: LocalRegistration) => ["PAID", "INVITED"].includes(registration.status);
const marker = (id: string) => `culdesac:${id}`;
const normalizeName = (name: string) => name.trim().toLowerCase();
const participantName = (registration: LocalRegistration) => `${registration.epicUsername.trim()} - ${registration.discordUsername.trim()}`;
export const safeChallongeError = (cause: unknown) => cause instanceof ChallongeError ? cause.message : "No s’ha pogut completar l’enviament. Torna a prémer «Enviar participants»: comprovarem la llista de Challonge abans d’afegir-ne més.";

function requireEditable(remote: RemoteTournament) {
  if (remote.tournamentType.toLowerCase() !== "swiss") throw new ChallongeError("El torneig de Challonge ha de tenir format suís (Swiss). Canvia’n el format a Challonge abans de continuar.");
  if (remote.state !== "pending") throw new ChallongeError("El torneig de Challonge ja s’ha iniciat o no està en preparació (pending). Gestiona els participants directament a Challonge.");
  if (remote.participantsLocked) throw new ChallongeError("El llistat de participants està bloquejat a Challonge. Revisa’l abans d’enviar-ne més.");
}
async function requireLocal(repo: ChallongeRepository, id: string) {
  const local = await repo.getTournament(id);
  if (!local) throw new ChallongeError("No s’ha trobat el torneig de Culdesac.");
  return local;
}
function reference(local: LocalTournament): TournamentReference {
  if (!local.challongeTournamentId) throw new ChallongeError("Primer vincula el torneig de Challonge amb el seu enllaç.");
  return { id: local.challongeTournamentId, ...(local.challongeCommunity ? { community: local.challongeCommunity } : {}) };
}

export async function linkChallongeTournament(repo: ChallongeRepository, api: ChallongeGateway, id: string, input: string) {
  const parsed = parseChallongeUrl(input);
  return repo.withLock(id, async () => {
    const local = await requireLocal(repo, id);
    const remote = await api.getTournament(parsed.ref);
    requireEditable(remote);
    const hasPublished = local.challongePublishAttemptedAt || (await repo.listRegistrations(id)).some((r) => r.challongeParticipantId);
    if (hasPublished && (local.challongeTournamentId !== remote.id || local.challongeCommunity !== (parsed.ref.community ?? null))) {
      throw new ChallongeError("Ja hi ha hagut un enviament a Challonge. No es pot canviar el torneig vinculat perquè es perdria el seguiment dels participants.");
    }
    await repo.saveLink(id, { challongeTournamentId: remote.id, challongeUrl: parsed.url, challongeCommunity: parsed.ref.community ?? null });
    return remote.name;
  });
}

export async function unlinkChallongeTournament(repo: ChallongeRepository, id: string) {
  return repo.withLock(id, async () => {
    const local = await requireLocal(repo, id);
    if (local.challongePublishAttemptedAt || (await repo.listRegistrations(id)).some((r) => r.challongeParticipantId)) {
      throw new ChallongeError("Ja hi ha hagut un enviament a Challonge. Mantén el vincle per poder comprovar els participants i els reintents.");
    }
    await repo.clearLink(id);
  });
}

function indexParticipants(participants: RemoteParticipant[]) {
  const ids = new Map<string, RemoteParticipant>();
  const markers = new Map<string, RemoteParticipant>();
  for (const participant of participants) {
    if (ids.has(participant.id) || (participant.misc?.startsWith("culdesac:") && markers.has(participant.misc))) {
      throw new ChallongeError("Hi ha participants o identificadors de Culdesac duplicats a Challonge. Revisa el llistat remot abans de continuar.");
    }
    ids.set(participant.id, participant);
    if (participant.misc?.startsWith("culdesac:")) markers.set(participant.misc, participant);
  }
  return { ids, markers };
}

export async function publishChallongeParticipants(repo: ChallongeRepository, api: ChallongeGateway, id: string): Promise<PublishResult> {
  return repo.withLock(id, async () => {
    const local = await requireLocal(repo, id);
    try {
      const ref = reference(local);
      const remote = await api.getTournament(ref);
      if (remote.id !== ref.id) throw new ChallongeError("El torneig retornat per Challonge no coincideix amb el vinculat.");
      requireEditable(remote);
      const participants = await api.listParticipants(ref);
      const registrations = await repo.listRegistrations(id);
      const confirmed = registrations.filter(isConfirmed);
      const { ids, markers } = indexParticipants(participants);
      const pending: LocalRegistration[] = [];
      const recovered: ParticipantLink[] = [];
      let alreadyPublished = 0;
      // An uncertain earlier POST may have succeeded before a refund arrived.
      // Recover its mapping as well so the organizer sees the withdrawal warning.
      for (const registration of registrations.filter((r) => !isConfirmed(r) && !r.challongeParticipantId)) {
        const tagged = markers.get(marker(registration.id));
        if (tagged) recovered.push({ registrationId: registration.id, participantId: tagged.id });
      }
      for (const registration of confirmed) {
        const tagged = markers.get(marker(registration.id));
        const stored = registration.challongeParticipantId ? ids.get(registration.challongeParticipantId) : undefined;
        if (registration.challongeParticipantId && !stored) throw new ChallongeError(`No es troba a Challonge un participant enviat (${registration.epicUsername}). Pot haver estat eliminat manualment; revisa’l abans de continuar.`);
        if (stored && tagged && stored.id !== tagged.id) throw new ChallongeError(`Hi ha un identificador duplicat per a ${registration.epicUsername} a Challonge. Revisa el llistat.`);
        const existing = stored ?? tagged;
        if (existing) {
          if (!existing.active) throw new ChallongeError(`El participant ${registration.epicUsername} està desactivat a Challonge. Revisa’l abans de continuar.`);
          if (stored?.misc?.startsWith("culdesac:") && stored.misc !== marker(registration.id)) throw new ChallongeError("Un participant de Challonge està associat a una altra inscripció. Revisa el llistat abans de continuar.");
          if (stored) alreadyPublished++; else recovered.push({ registrationId: registration.id, participantId: existing.id });
        } else {
          const matchingNames = new Set([normalizeName(registration.epicUsername), normalizeName(participantName(registration))]);
          if (participants.some((p) => matchingNames.has(normalizeName(p.name)))) throw new ChallongeError(`Ja existeix el nickname «${registration.epicUsername}» a Challonge sense vincle amb aquesta inscripció. Revisa el participant introduït manualment per evitar duplicats.`);
          pending.push(registration);
        }
      }
      if (recovered.length) await repo.saveParticipants(id, recovered);
      let added = 0;
      for (let start = 0; start < pending.length; start += CHALLONGE_BULK_LIMIT) {
        // Recheck before each mutation: a referee may have started the tournament meanwhile.
        const currentRemote = await api.getTournament(ref);
        if (currentRemote.id !== ref.id) throw new ChallongeError("El torneig retornat per Challonge no coincideix amb el vinculat.");
        requireEditable(currentRemote);
        const stillConfirmed = new Set((await repo.listRegistrations(id)).filter(isConfirmed).map((r) => r.id));
        const batch = pending.slice(start, start + CHALLONGE_BULK_LIMIT).filter((r) => stillConfirmed.has(r.id));
        if (!batch.length) continue;
        await repo.markPublishAttempt(id);
        const response = await api.bulkAdd(ref, batch.map((r) => ({ name: participantName(r), misc: marker(r.id) })));
        const created = indexParticipants(response).markers;
        const links = batch.map((r) => {
          const participant = created.get(marker(r.id));
          if (!participant) throw new ChallongeError("Challonge no ha confirmat tots els participants de l’enviament. Torna a comprovar-lo: recuperarem els que ja hi siguin.");
          return { registrationId: r.id, participantId: participant.id };
        });
        await repo.saveParticipants(id, links);
        added += links.length;
      }
      const currentRegistrations = await repo.listRegistrations(id);
      await repo.saveSyncResult(id, null);
      return { added, recovered: recovered.length, alreadyPublished, confirmed: currentRegistrations.filter(isConfirmed).length, withdrawn: currentRegistrations.filter((r) => !isConfirmed(r) && r.challongeParticipantId).length };
    } catch (cause) {
      const error = safeChallongeError(cause);
      // Preserve the original failure even if the database is temporarily unavailable.
      await repo.saveSyncResult(id, error).catch(() => undefined);
      throw new ChallongeError(error);
    }
  });
}
