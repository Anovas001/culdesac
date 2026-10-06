import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("@/app/admin/challonge-actions", () => ({ manageChallonge: async () => ({}) }));
import { ChallongePanel } from "./challonge-panel";
const props = { tournamentId: "t1", url: "https://challonge.com/cup", configured: true, confirmed: 3, published: 1, withdrawn: 0, frozen: false, lastSynced: null, lastError: null };
it("renders the pending count and explains that all confirmed participants are included", () => {
  const html = renderToStaticMarkup(createElement(ChallongePanel, props));
  expect(html).toContain("Enviar participants (2)");
  expect(html).toContain("independentment del filtre");
  expect(html).toContain("Nickname Fortnite - Tag Discord");
  expect(html).toContain('target="_blank"');
});
it("shows the missing credential setup and disables publishing", () => {
  const html = renderToStaticMarkup(createElement(ChallongePanel, { ...props, configured: false }));
  expect(html).toContain("CHALLONGE_API_KEY");
  expect(html).toMatch(/<button[^>]*value="publish"[^>]*disabled=""/);
});
it("protects the link after publishing and offers reconciliation when everyone is published", () => {
  const html = renderToStaticMarkup(createElement(ChallongePanel, { ...props, frozen: true, published: 3 }));
  expect(html).toContain('readOnly=""');
  expect(html).not.toContain("Desvincular");
  expect(html).toContain("Comprovar participants");
});
it("allows checking an uncertain earlier send even when all registrations have been refunded", () => {
  const html = renderToStaticMarkup(createElement(ChallongePanel, { ...props, frozen: true, confirmed: 0, published: 0 }));
  expect(html).toContain("Comprovar participants");
  expect(html).not.toMatch(/<button[^>]*value="publish"[^>]*disabled=""/);
});
