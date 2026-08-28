import { describe, expect, test } from "vitest";

import { localizeTournament } from "./tournament";

const tournament = {
  name: "Torneig Culdesac",
  headline: "Tu contra el quadre",
  description: "Descripció catalana",
  rules: "Normes catalanes",
  nameEs: "Torneo Culdesac",
  headlineEs: "Tú contra el cuadro",
  descriptionEs: "Descripción castellana",
  rulesEs: "Normas en castellano",
};

describe("localizeTournament", () => {
  test("uses the Spanish editorial fields for the Spanish locale", () => {
    expect(localizeTournament(tournament, "es")).toEqual({
      name: "Torneo Culdesac",
      headline: "Tú contra el cuadro",
      description: "Descripción castellana",
      rules: "Normas en castellano",
    });
  });

  test("falls back field by field to Catalan when a Spanish value is missing", () => {
    expect(localizeTournament({ ...tournament, headlineEs: null, rulesEs: "" }, "es")).toEqual({
      name: "Torneo Culdesac",
      headline: "Tu contra el quadre",
      description: "Descripción castellana",
      rules: "Normes catalanes",
    });
  });

  test("always uses the Catalan source fields for the default locale", () => {
    expect(localizeTournament(tournament, "ca")).toEqual({
      name: "Torneig Culdesac",
      headline: "Tu contra el quadre",
      description: "Descripció catalana",
      rules: "Normes catalanes",
    });
  });
});
