import { z } from "zod";

export class ChallongeError extends Error {}
export const CHALLONGE_BULK_LIMIT = 20;
export type TournamentReference = { id: string; community?: string };
export type RemoteTournament = { id: string; name: string; tournamentType: string; state: string; participantsLocked: boolean };
export type RemoteParticipant = { id: string; name: string; misc: string | null; active: boolean };
export type ParticipantInput = { name: string; misc: string };
export type ChallongeGateway = {
  getTournament(ref: TournamentReference): Promise<RemoteTournament>;
  listParticipants(ref: TournamentReference): Promise<RemoteParticipant[]>;
  bulkAdd(ref: TournamentReference, participants: ParticipantInput[]): Promise<RemoteParticipant[]>;
};

export function parseChallongeUrl(input: string): { url: string; ref: TournamentReference } {
  const invalid = () => new ChallongeError("Introdueix l’enllaç del torneig, per exemple https://challonge.com/nom_del_torneig.");
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw invalid(); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port) throw invalid();
  const host = url.hostname.toLowerCase();
  const community = host === "challonge.com" || host === "www.challonge.com" ? undefined : host.match(/^([a-z0-9-]+)\.challonge\.com$/)?.[1];
  if (!community && !["challonge.com", "www.challonge.com"].includes(host)) throw invalid();
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segments[0])) segments.shift();
  if (segments.length < 1 || segments.length > 2 || !/^[a-z0-9_-]+$/i.test(segments[0]) || (segments[1] && !["participants", "standings", "matches", "bracket"].includes(segments[1]))) throw invalid();
  return { url: `https://${community ? `${community}.` : ""}challonge.com/${segments[0]}`, ref: { id: segments[0], ...(community ? { community } : {}) } };
}

const remoteId = z.union([z.string().min(1), z.number().int().nonnegative()]).transform(String);
const tournamentSchema = z.object({
  data: z.object({ id: remoteId, attributes: z.object({
    name: z.string(), tournament_type: z.string(), state: z.string().optional(), participants_locked: z.boolean().optional(),
    states: z.object({ state: z.string().optional(), participants_locked: z.boolean().optional() }).optional(),
  }) }),
});
const participantsSchema = z.object({ data: z.array(z.object({ id: remoteId, attributes: z.object({
  name: z.string(), misc: z.string().nullish(), states: z.object({ active: z.boolean().optional() }).optional(),
}) })) });

function readParticipants(body: unknown): RemoteParticipant[] {
  const parsed = participantsSchema.safeParse(body);
  if (!parsed.success) throw new ChallongeError("Challonge ha retornat una resposta de participants inesperada. No repeteixis l’alta manualment; torna a comprovar l’enviament.");
  return parsed.data.data.map(({ id, attributes }) => ({ id, name: attributes.name, misc: attributes.misc ?? null, active: attributes.states?.active ?? true }));
}

/** Imported only from server modules. The destination is fixed, never the user-supplied URL. */
export class ChallongeClient implements ChallongeGateway {
  private readonly key: string;
  constructor(apiKey: string | undefined) {
    if (!apiKey?.trim()) throw new ChallongeError("Configura CHALLONGE_API_KEY al servidor i recrea l’app per activar Challonge.");
    this.key = apiKey.trim();
  }

  private async request(ref: TournamentReference, suffix = "", body?: unknown, page?: number): Promise<unknown> {
    const url = new URL(`https://api.challonge.com/v2.1/tournaments/${encodeURIComponent(ref.id)}${suffix}.json`);
    if (ref.community) url.searchParams.set("community_id", ref.community);
    if (page !== undefined) { url.searchParams.set("page", String(page)); url.searchParams.set("per_page", "100"); }
    let response: Response;
    try {
      response = await fetch(url, { method: body ? "POST" : "GET", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20_000), headers: {
        Accept: "application/json", "Content-Type": "application/vnd.api+json", "Authorization-Type": "v1", Authorization: this.key,
      }, ...(body ? { body: JSON.stringify(body) } : {}) });
    } catch {
      throw new ChallongeError("S’ha interromput la connexió amb Challonge. Torna a prémer «Enviar participants»: comprovarem què ha rebut abans d’enviar-ne més.");
    }
    if (!response.ok) {
      const messages: Record<number, string> = {
        401: "Challonge no accepta la clau API. Revisa CHALLONGE_API_KEY al servidor.",
        403: "El compte de Challonge no té permisos per gestionar aquest torneig o comunitat.",
        404: "No s’ha trobat el torneig a Challonge amb aquest compte. Revisa l’enllaç i els permisos.",
        422: "Challonge ha rebutjat els participants. Revisa el límit de places i la configuració del torneig abans de reintentar.",
        429: "S’ha arribat al límit de peticions de Challonge. Revisa el pla o espera abans de reintentar.",
      };
      throw new ChallongeError(messages[response.status] ?? `Challonge no ha pogut completar l’operació (HTTP ${response.status}). Revisa el torneig i torna-ho a provar.`);
    }
    try { return await response.json(); } catch { throw new ChallongeError("Challonge ha retornat una resposta inesperada. Torna a comprovar l’enviament."); }
  }

  async getTournament(ref: TournamentReference): Promise<RemoteTournament> {
    const parsed = tournamentSchema.safeParse(await this.request(ref));
    if (!parsed.success) throw new ChallongeError("Challonge ha retornat una resposta de torneig inesperada.");
    const { id, attributes } = parsed.data.data;
    const state = attributes.state ?? attributes.states?.state;
    if (!state) throw new ChallongeError("La resposta de Challonge no indica l’estat del torneig. No es poden enviar participants sense comprovar-lo.");
    return { id, name: attributes.name, tournamentType: attributes.tournament_type, state, participantsLocked: attributes.participants_locked ?? attributes.states?.participants_locked ?? false };
  }

  async listParticipants(ref: TournamentReference): Promise<RemoteParticipant[]> {
    const all: RemoteParticipant[] = [];
    const seen = new Set<string>();
    for (let page = 1; page <= 50; page++) {
      const batch = readParticipants(await this.request(ref, "/participants", undefined, page));
      for (const participant of batch) {
        if (seen.has(participant.id)) throw new ChallongeError("La llista paginada de Challonge conté participants repetits. Torna-ho a provar abans d’enviar-ne més.");
        seen.add(participant.id); all.push(participant);
      }
      // Exhaust pages instead of assuming the server honors our requested page size.
      if (batch.length === 0) return all;
    }
    throw new ChallongeError("La llista de Challonge és massa gran per completar la comprovació. No s’ha enviat cap participant.");
  }

  async bulkAdd(ref: TournamentReference, participants: ParticipantInput[]): Promise<RemoteParticipant[]> {
    if (!participants.length || participants.length > CHALLONGE_BULK_LIMIT) throw new ChallongeError("Cada enviament a Challonge ha de contenir entre 1 i 20 participants.");
    return readParticipants(await this.request(ref, "/participants/bulk_add", { data: { type: "Participants", attributes: { participants } } }));
  }
}
