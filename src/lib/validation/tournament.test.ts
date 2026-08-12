import { describe, expect, test } from "vitest";
import { tournamentSchema } from "./tournament";

describe("tournamentSchema", () => {
  test("converts admin form values to persistent tournament data", () => {
    const result = tournamentSchema.parse({ name: "Cup", slug: "cup-2026", headline: "Juga", description: "Descripció prou llarga", rules: "Regles", eventDate: "2026-10-10T18:00", priceCents: "1500", currency: "EUR", capacity: "64", heroImageUrl: "", status: "OPEN" });
    expect(result).toMatchObject({ priceCents: 1500, currency: "eur", capacity: 64, heroImageUrl: null, status: "OPEN" });
  });
});
