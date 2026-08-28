import { describe, expect, test } from "vitest";

import { tournamentSchema } from "./tournament";

const validTournament = {
  name: "Cup",
  slug: "cup-2026",
  headline: "Juga",
  description: "Descripció prou llarga",
  rules: "Regles",
  eventDate: "2026-10-10T18:00",
  priceCents: "1500",
  currency: "EUR",
  capacity: "64",
  heroImageUrl: "",
  status: "OPEN",
};

describe("tournamentSchema", () => {
  test("converts admin form values to persistent tournament data", () => {
    const result = tournamentSchema.parse(validTournament);

    expect(result).toMatchObject({
      priceCents: 1500,
      currency: "eur",
      capacity: 64,
      heroImageUrl: null,
      status: "OPEN",
    });
  });

  test("accepts optional Spanish editorial copy and normalizes empty fields", () => {
    const result = tournamentSchema.parse({
      ...validTournament,
      nameEs: "Copa",
      headlineEs: "Juega",
      descriptionEs: "Descripción suficientemente larga",
      rulesEs: "",
    });

    expect(result).toMatchObject({
      nameEs: "Copa",
      headlineEs: "Juega",
      descriptionEs: "Descripción suficientemente larga",
      rulesEs: null,
    });
  });
});
