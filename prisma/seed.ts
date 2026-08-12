import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TournamentStatus } from "../src/generated/prisma/client";
import { Pool } from "pg";

import { getDatabaseUrl } from "../src/lib/env";

const pool = new Pool({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const tournament = await prisma.tournament.upsert({
    where: { slug: "fortnite-community-cup" },
    update: {},
    create: {
      name: "Fortnite Community Cup",
      slug: "fortnite-community-cup",
      headline: "Competeix. Sobreviu. Guanya.",
      description: "Un torneig comunitari de Fortnite per a jugadors de tots els nivells.",
      rules: "Consulta les normes definitives abans de competir.",
      eventDate: new Date("2026-10-10T16:00:00.000Z"),
      priceCents: 1500,
      currency: "eur",
      capacity: 64,
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
  .then(() => console.info("Sample tournament seeded."))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
