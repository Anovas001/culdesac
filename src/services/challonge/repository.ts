import { Pool } from "pg";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getDatabaseUrl } from "@/lib/env";
import { ChallongeError } from "./client";
import type { ChallongeRepository } from "./service";

/** A session lock survives across HTTP calls, without holding a database transaction open. */
async function withTournamentLock<T>(id: string, work: () => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: getDatabaseUrl(), max: 1, connectionTimeoutMillis: 5_000 });
  try {
    const connection = await pool.connect();
    let acquired = false;
    const lockKey = `culdesac:challonge:${id}`;
    try {
      const result = await connection.query<{ locked: boolean }>("SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS locked", [lockKey]);
      acquired = result.rows[0]?.locked === true;
      if (!acquired) throw new ChallongeError("Ja hi ha un enviament o una vinculació en curs per a aquest torneig. Espera uns segons i actualitza el llistat.");
      return await work();
    } finally {
      if (acquired) await connection.query("SELECT pg_advisory_unlock(hashtextextended($1, 0))", [lockKey]).catch(() => undefined);
      connection.release();
    }
  } finally { await pool.end(); }
}

export const challongeRepository: ChallongeRepository = {
  withLock: withTournamentLock,
  getTournament: (id) => db.tournament.findUnique({ where: { id }, select: {
    id: true, challongeTournamentId: true, challongeUrl: true, challongeCommunity: true, challongePublishAttemptedAt: true,
  } }),
  listRegistrations: (tournamentId) => db.registration.findMany({ where: { tournamentId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: {
    id: true, status: true, epicUsername: true, discordUsername: true, challongeParticipantId: true,
  } }),
  async saveLink(id, link) {
    try {
      await db.tournament.update({ where: { id }, data: { ...link, challongeLastError: null, challongeLastSyncedAt: null } });
    } catch (cause) {
      if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === "P2002") throw new ChallongeError("Aquest torneig de Challonge ja està vinculat a un altre torneig de Culdesac.");
      throw cause;
    }
  },
  async clearLink(id) {
    await db.tournament.update({ where: { id }, data: { challongeTournamentId: null, challongeCommunity: null, challongeUrl: null, challongeLastError: null, challongeLastSyncedAt: null } });
  },
  async markPublishAttempt(id) {
    await db.tournament.update({ where: { id }, data: { challongePublishAttemptedAt: new Date() } });
  },
  async saveParticipants(tournamentId, links) {
    const now = new Date();
    await db.$transaction(links.map(({ registrationId, participantId }) => db.registration.update({
      where: { id: registrationId, tournamentId }, data: { challongeParticipantId: participantId, challongePublishedAt: now },
    })));
  },
  async saveSyncResult(id, error) {
    await db.tournament.update({ where: { id }, data: { challongeLastError: error, ...(error === null ? { challongeLastSyncedAt: new Date() } : {}) } });
  },
};
