import { describe, expect, it } from "vitest";

import { brandHeroCopy } from "./brand-copy";

describe("brandHeroCopy", () => {
  it("explains the permanent Culdesac proposition before the active tournament", () => {
    expect(brandHeroCopy.kicker).toBe("Culdesac · La competició online de Fortnite");
    expect(brandHeroCopy.gameLine).toBe("Fortnite 1v1.");
    expect(brandHeroCopy.challengeLine).toBe("Tu contra el quadre.");
    expect(brandHeroCopy.description).toContain("Cada dos mesos");
    expect(brandHeroCopy.championPrize).toBe("300 €");
  });
});
