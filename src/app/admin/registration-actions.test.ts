import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), edit: vi.fn(), remove: vi.fn(), revalidate: vi.fn(), redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "session" }) }) }));
vi.mock("@/lib/auth", () => ({ cookieName: "culdesac_admin", isAdmin: mocks.admin }));
vi.mock("@/services/registrations/admin-management-repository", () => ({ persistRegistrationEdit: mocks.edit, persistRegistrationDelete: mocks.remove }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { saveRegistrationEdit, removeRegistration } from "./registration-actions";
import { RegistrationManagementError } from "@/services/registrations/admin-management";
function form() {
  const data = new FormData();
  Object.entries({ tournamentId: "t1", registrationId: "r1", fullName: "  Correct Name ", epicUsername: "  New Nick ", discordUsername: " @new.discord ", confirmed: "on", status: "PAID", amountCents: "99999", challongeParticipantId: "new-remote-id" }).forEach(([key, value]) => data.set(key, value));
  return data;
}
beforeEach(() => { vi.clearAllMocks(); mocks.admin.mockResolvedValue(true); mocks.edit.mockResolvedValue(undefined); mocks.remove.mockResolvedValue(undefined); });
it.each([saveRegistrationEdit, removeRegistration])("requires an admin before mutating a registration", async (action) => {
  mocks.admin.mockResolvedValue(false);
  expect(await action({}, form())).toMatchObject({ error: expect.stringContaining("sessió") });
  expect(mocks.edit).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
});
it("preserves invalid submitted values and returns field errors without saving", async () => {
  const data = form(); data.set("epicUsername", " ");
  expect(await saveRegistrationEdit({}, data)).toMatchObject({ fieldErrors: { epicUsername: expect.any(String) }, values: { epicUsername: " " } });
  expect(mocks.edit).not.toHaveBeenCalled();
});
it("only accepts editable profile data and revalidates list, dashboard and public capacity", async () => {
  await saveRegistrationEdit({}, form());
  expect(mocks.edit).toHaveBeenCalledWith("t1", "r1", { fullName: "Correct Name", epicUsername: "New Nick", epicUsernameNormalized: "new nick", discordUsername: "@new.discord" });
  expect(mocks.revalidate).toHaveBeenCalledWith("/");
  expect(mocks.revalidate).toHaveBeenCalledWith("/admin");
  expect(mocks.revalidate).toHaveBeenCalledWith("/admin/tournaments/t1/registrations");
  expect(mocks.redirect).toHaveBeenCalledWith("/admin/tournaments/t1/registrations?updated=1");
});
it("requires an explicit deletion confirmation", async () => {
  const data = form(); data.delete("confirmed");
  expect(await removeRegistration({}, data)).toMatchObject({ error: expect.stringContaining("Confirma") });
  expect(mocks.remove).not.toHaveBeenCalled();
});
it("deletes only the specified registration and redirects to a success notice", async () => {
  await removeRegistration({}, form());
  expect(mocks.remove).toHaveBeenCalledWith("t1", "r1");
  expect(mocks.redirect).toHaveBeenCalledWith("/admin/tournaments/t1/registrations?deleted=1");
});
it.each([saveRegistrationEdit, removeRegistration])("rejects malformed identifiers before persisting", async (action) => {
  const data = form(); data.set("tournamentId", "../other");
  expect(await action({}, data)).toHaveProperty("error");
  expect(mocks.edit).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
});
it("returns known validation conflicts but hides unexpected persistence details", async () => {
  mocks.edit.mockRejectedValueOnce(new RegistrationManagementError("Nickname duplicat"));
  expect(await saveRegistrationEdit({}, form())).toMatchObject({ error: "Nickname duplicat" });
  mocks.remove.mockRejectedValueOnce(new Error("password=secret"));
  expect((await removeRegistration({}, form())).error).not.toContain("secret");
});
