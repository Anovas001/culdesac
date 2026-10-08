import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("@/app/admin/registration-actions", () => ({ saveRegistrationEdit: async () => ({}), removeRegistration: async () => ({}) }));
import { RegistrationEditForm, RegistrationDeleteForm } from "./registration-management";

it("prepopulates all three editable fields without exposing payment or consent controls", () => {
  const html = renderToStaticMarkup(createElement(RegistrationEditForm, { tournamentId: "t1", registration: { id: "r1", fullName: "Example Name", epicUsername: "Player", discordUsername: "discord.tag" } }));
  expect(html).toContain('value="Example Name"'); expect(html).toContain('value="Player"'); expect(html).toContain('value="discord.tag"');
  expect(html).toContain("Desar canvis");
  expect(html).not.toContain('name="status"'); expect(html).not.toContain('name="acceptedPrivacy"');
});
it("requires acknowledgement of irreversible deletion and explains that it does not refund", () => {
  const html = renderToStaticMarkup(createElement(RegistrationDeleteForm, { tournamentId: "t1", registrationId: "r1" }));
  expect(html).toMatch(/<input(?=[^>]*type="checkbox")(?=[^>]*name="confirmed")(?=[^>]*required="")[^>]*>/);
  expect(html).toContain("Eliminar definitivament");
  expect(html).toContain("reemborsament");
  expect(html).not.toContain('checked=""');
});
