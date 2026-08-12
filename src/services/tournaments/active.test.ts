import { describe, expect, it, vi } from "vitest";

import { getActiveTournament, type ActiveTournamentRepository } from "./active";

describe("getActiveTournament", () => {
  it("returns null when no public tournament has been selected", async () => {
    const repository: ActiveTournamentRepository = {
      findSettings: vi.fn().mockResolvedValue(null),
    };

    await expect(getActiveTournament(repository)).resolves.toBeNull();
  });
});
