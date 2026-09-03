import { describe, expect, it } from "vitest";

import { getMessages } from "./messages";

describe("public translations", () => {
  it("keeps Catalan as the original public language", () => {
    const messages = getMessages("ca");

    expect(messages.navigation.tournament).toBe("Torneig");
    expect(messages.registration.submit("15 €")).toContain("Pagar 15 €");
    expect(messages.success.titleLead).toBe("Ja ets dins");
    expect(messages.registration.phone).toBe("Telèfon *");
    expect(messages.registration.marketingConsent).not.toMatch(/^Opcional:/);
  });

  it("provides a complete Spanish public experience", () => {
    const messages = getMessages("es");

    expect(messages.navigation.tournament).toBe("Torneo");
    expect(messages.registration.submit("15 €")).toContain("Pagar 15 €");
    expect(messages.registration.fullName).toBe("Nombre y apellidos *");
    expect(messages.registration.phone).toBe("Teléfono *");
    expect(messages.registration.marketingConsent).not.toMatch(/^Opcional:/);
    expect(messages.success.titleLead).toBe("Ya estás dentro");
    expect(messages.cancelled.title).toContain("todavía no está confirmada");
    expect(messages.legal.backHome).toBe("Volver al inicio");
  });
});
