import { describe, expect, it } from "vitest";

import { buildPublicTournamentView } from "./public-tournament";

describe("buildPublicTournamentView", () => {
  it("formats the active tournament data for the public landing", () => {
    const view = buildPublicTournamentView(
      {
        status: "OPEN",
        eventDate: new Date("2026-10-10T16:00:00.000Z"),
        priceCents: 1500,
        currency: "eur",
        capacity: 64,
      },
      "Europe/Madrid",
    );

    expect(view).toEqual({
      dateLabel: "10 d’octubre de 2026, 18:00",
      priceLabel: "15 €",
      capacityLabel: "64 places",
      statusLabel: "Inscripcions obertes",
      isOpen: true,
    });
  });

  it("keeps optional capacity out of the interface and closes registration", () => {
    const view = buildPublicTournamentView(
      {
        status: "CLOSED",
        eventDate: new Date("2026-10-10T16:00:00.000Z"),
        priceCents: 1500,
        currency: "eur",
        capacity: null,
      },
      "Europe/Madrid",
    );

    expect(view.capacityLabel).toBeNull();
    expect(view.statusLabel).toBe("Inscripcions tancades");
    expect(view.isOpen).toBe(false);
  });

  it("formats tournament details in Spanish", () => {
    const view = buildPublicTournamentView(
      {
        status: "OPEN",
        eventDate: new Date("2026-10-10T16:00:00.000Z"),
        priceCents: 1500,
        currency: "eur",
        capacity: 512,
      },
      "Europe/Madrid",
      "es",
    );

    expect(view.statusLabel).toBe("Inscripciones abiertas");
    expect(view.dateLabel).toBe("10 de octubre de 2026, 18:00");
    expect(view.capacityLabel).toBe("512 plazas");
  });
});
