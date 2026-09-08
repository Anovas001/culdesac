import { describe, expect, it } from "vitest";
import { renderRegistrationConfirmation } from "./confirmation-template";

const registration = { id: "registration-123", fullName: "Aniol Novas", email: "preview@example.com", epicUsername: "Anovas", amountCents: 200, currency: "eur" };
const tournament = { name: "Culdesac Open — Fortnite 1v1", eventDate: new Date("2026-10-10T16:00:00Z") };
const options = { siteUrl: "https://culdesac.gsegames.com", timeZone: "Europe/Madrid" };

describe("registration confirmation template", () => {
  it("includes the actual receipt data in HTML and plain text, with the configured time zone", () => {
    const { html, text, subject } = renderRegistrationConfirmation(registration, tournament, options);
    for (const body of [html, text]) {
      for (const value of [registration.fullName, registration.epicUsername, registration.id, tournament.name, "18:00", "2,00", "Europe/Madrid"]) expect(body).toContain(value);
    }
    expect(subject).toBe(`Inscripció confirmada — ${tournament.name}`);
    expect(html).not.toContain("MOSTRA");
    expect(html).toContain('src="https://culdesac.gsegames.com/brand/culdesac-logo.png"');
    expect(html).toContain('href="https://culdesac.gsegames.com/legal/privacy"');
  });

  it("escapes participant and tournament content so input cannot inject HTML", () => {
    const result = renderRegistrationConfirmation({ ...registration, fullName: '<img src=x onerror="alert(1)">', epicUsername: "A&B", id: "<code>" }, { ...tournament, name: "<script>test</script>" }, options);
    expect(result.html).not.toContain("<script>");
    expect(result.html).not.toContain("<img src=x");
    expect(result.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(result.html).toContain("A&amp;B");
    expect(result.html).toContain("&lt;code&gt;");
    expect(result.text).toContain("A&B");
  });

  it("labels samples without representing them as real purchases", () => {
    const result = renderRegistrationConfirmation(registration, tournament, { ...options, preview: true });
    expect(result.subject).toMatch(/^\[MOSTRA\]/);
    for (const body of [result.html, result.text]) expect(body).toContain("No s’ha creat cap inscripció ni s’ha fet cap cobrament.");
  });

  it("rejects unsafe URL schemes", () => {
    expect(() => renderRegistrationConfirmation(registration, tournament, { ...options, siteUrl: "javascript:alert(1)" })).toThrow("HTTP or HTTPS");
  });
});
