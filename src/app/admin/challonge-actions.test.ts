import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), link: vi.fn(), unlink: vi.fn(), publish: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "session" }) }) }));
vi.mock("@/lib/auth", () => ({ cookieName: "culdesac_admin", isAdmin: mocks.admin }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/env", () => ({ getServerEnv: () => ({ CHALLONGE_API_KEY: "secret" }) }));
vi.mock("@/services/challonge/repository", () => ({ challongeRepository: {} }));
vi.mock("@/services/challonge/service", async (importOriginal) => ({ ...await importOriginal<typeof import("@/services/challonge/service")>(), linkChallongeTournament: mocks.link, unlinkChallongeTournament: mocks.unlink, publishChallongeParticipants: mocks.publish }));
import { manageChallonge } from "./challonge-actions";
import { ChallongeError } from "@/services/challonge/client";
function form(operation: string, id = "t1") {
  const data = new FormData(); data.set("operation", operation); data.set("tournamentId", id); data.set("url", "https://challonge.com/test_cup");
  // Caller-supplied participant filters must never affect publishing.
  data.set("status", "PENDING_PAYMENT"); data.set("participantIds", "unpaid");
  return data;
}
beforeEach(() => { vi.clearAllMocks(); mocks.admin.mockResolvedValue(true); mocks.link.mockResolvedValue("Cup"); mocks.publish.mockResolvedValue({ added: 2, recovered: 1, alreadyPublished: 0, confirmed: 3, withdrawn: 0 }); });
it.each(["link", "unlink", "publish"])("requires an admin for %s", async (operation) => {
  mocks.admin.mockResolvedValue(false);
  expect(await manageChallonge({}, form(operation))).toMatchObject({ error: expect.stringContaining("sessió") });
  expect(mocks.link).not.toHaveBeenCalled(); expect(mocks.unlink).not.toHaveBeenCalled(); expect(mocks.publish).not.toHaveBeenCalled();
});
it("rejects invalid operation or missing tournament before contacting Challonge", async () => {
  expect(await manageChallonge({}, form("reset"))).toHaveProperty("error");
  expect(await manageChallonge({}, form("publish", ""))).toHaveProperty("error");
  expect(mocks.publish).not.toHaveBeenCalled();
});
it("links with the authenticated server gateway and revalidates the registrations page", async () => {
  expect(await manageChallonge({}, form("link"))).toMatchObject({ message: expect.stringContaining("Cup") });
  expect(mocks.link).toHaveBeenCalledWith(expect.anything(), expect.anything(), "t1", "https://challonge.com/test_cup");
  expect(mocks.revalidate).toHaveBeenCalledWith("/admin/tournaments/t1/registrations");
});
it("publishes without accepting caller-supplied filters and reports recoveries", async () => {
  expect(await manageChallonge({}, form("publish"))).toMatchObject({ message: expect.stringContaining("recuperat") });
  expect(mocks.publish.mock.calls[0]).toHaveLength(3);
  expect(mocks.publish.mock.calls[0][2]).toBe("t1");
});
it("unlinks through the protected domain service", async () => {
  expect(await manageChallonge({}, form("unlink"))).toHaveProperty("message");
  expect(mocks.unlink).toHaveBeenCalledWith(expect.anything(), "t1");
});
it("returns actionable known errors and hides unexpected exception details", async () => {
  mocks.publish.mockRejectedValueOnce(new ChallongeError("Torneig iniciat"));
  expect(await manageChallonge({}, form("publish"))).toMatchObject({ error: "Torneig iniciat" });
  mocks.publish.mockRejectedValueOnce(new Error("password=secret"));
  const result = await manageChallonge({}, form("publish"));
  expect(result.error).not.toContain("secret");
});
