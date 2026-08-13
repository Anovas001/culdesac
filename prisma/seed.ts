import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TournamentStatus } from "../src/generated/prisma/client";
import { Pool } from "pg";

import { getDatabaseUrl } from "../src/lib/env";
import { launchTournament } from "../src/lib/launch-tournament";

const pool = new Pool({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const tournament = await prisma.tournament.upsert({
    where: { slug: launchTournament.slug },
    update: launchTournament,
    create: {
      ...launchTournament,
      status: TournamentStatus.OPEN,
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { activeTournamentId: tournament.id },
    create: { id: 1, activeTournamentId: tournament.id },
  });
}

main()
  .then(() => console.info("Culdesac Open tournament seeded."))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
