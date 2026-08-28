import { describe, expect, it } from "vitest";

import { launchTournament } from "./launch-tournament";

describe("launchTournament", () => {
  it("contains the approved Culdesac Open competition data", () => {
    expect(launchTournament).toMatchObject({
      name: "Culdesac Open — Fortnite 1v1",
      slug: "culdesac-open-fortnite-1v1",
      nameEs: "Culdesac Open — Fortnite 1v1",
      headlineEs: "512 entran. Solo uno se proclama campeón.",
      headline: "512 entren. Només un en surt campió.",
      eventDate: new Date("2026-10-10T16:00:00.000Z"),
      priceCents: 200,
      currency: "eur",
      capacity: 512,
      status: "OPEN",
    });
    expect(launchTournament.description).toContain("300 €");
    expect(launchTournament.description).toContain("50 €");
    expect(launchTournament.rules).toContain("eliminació directa");
    expect(launchTournament.rules).toContain("Top 16");
    expect(launchTournament.descriptionEs).toContain("300 €");
    expect(launchTournament.rulesEs).toContain("eliminación directa");
  });
});
