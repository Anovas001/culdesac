export const launchTournament = {
  name: "Culdesac Open — Fortnite 1v1",
  slug: "culdesac-open-fortnite-1v1",
  headline: "512 entren. Només un en surt campió.",
  description:
    "Competeix online des de casa en un duel individual de Fortnite, supera un quadre d’eliminació directa i guanya’t un lloc a les finals retransmeses. El campió s’emporta 300 € i el segon classificat, 50 €.",
  rules: [
    "Format Fortnite 1v1 en arena tancada, estil Box Fight o Build Fight.",
    "Sistema d’eliminació directa: qui perd queda fora del torneig.",
    "Cada enfrontament es disputa al millor de 5 rondes; el primer jugador que en guanya 3 avança.",
    "Cada ronda comença amb 100 HP i 100 d’escut, inventari idèntic i materials limitats.",
    "Límit de 2 minuts per ronda; si s’esgota el temps, guanya qui conservi més vida i escut.",
    "Dissabte es disputen les rondes simultànies fins a definir el Top 16.",
    "Diumenge se celebra la fase final retransmesa, des de vuitens fins a la gran final.",
    "Participació 100% online i oberta a jugadors d’Espanya.",
  ].join("\n"),
  eventDate: new Date("2026-10-10T16:00:00.000Z"),
  priceCents: 200,
  currency: "eur",
  capacity: 512,
  status: "OPEN" as const,
};
