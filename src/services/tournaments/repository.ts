import { db } from "../../lib/db";
import type { ActiveTournamentRepository } from "./active";

export const prismaActiveTournamentRepository: ActiveTournamentRepository = {
  async findSettings() {
    return db.siteSettings.findUnique({
      where: { id: 1 },
      include: { activeTournament: true },
    });
  },
};
