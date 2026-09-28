import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ isAdmin: vi.fn(), persist: vi.fn(), revalidate: vi.fn(), redirect: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "session" }) }) }));
vi.mock("@/lib/auth", () => ({ cookieName: "culdesac_admin", isAdmin: mocks.isAdmin }));
vi.mock("@/services/registrations/invitations-repository", () => ({ persistInvitation: mocks.persist }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { saveInvitation } from "./invitation-actions";

function form() {
  const data = new FormData();
  Object.entries({ tournamentId: "t1", fullName: "Guest Test", email: " Guest@example.com ", phone: "612345678", dni: "12345678z", postalCode: "08001", epicUsername: "Guest", discordUsername: "guest", acceptedTerms: "on", acceptedPrivacy: "on", status: "PAID", amountCents: "999" }).forEach(([key, value]) => data.set(key, value));
  return data;
}
beforeEach(() => { vi.clearAllMocks(); mocks.isAdmin.mockResolvedValue(true); mocks.persist.mockResolvedValue({ id: "i1" }); });
it("rejects unauthenticated actions before creating anything", async () => {
  mocks.isAdmin.mockResolvedValue(false);
  expect(await saveInvitation({}, form())).toMatchObject({ error: expect.stringContaining("sessió") });
  expect(mocks.persist).not.toHaveBeenCalled();
});
it("returns field errors and retains input without writing invalid data", async () => {
  const data = form(); data.set("dni", "bad");
  expect(await saveInvitation({}, data)).toMatchObject({ fieldErrors: { dni: expect.any(String) }, values: { dni: "bad" } });
  expect(mocks.persist).not.toHaveBeenCalled();
});
it("does not silently fabricate participant consents", async () => {
  const data = form(); data.delete("acceptedTerms"); data.delete("acceptedPrivacy");
  expect(await saveInvitation({}, data)).toMatchObject({ fieldErrors: { acceptedTerms: expect.any(String), acceptedPrivacy: expect.any(String) } });
  expect(mocks.persist).not.toHaveBeenCalled();
});
it("normalizes participant data, ignores caller-supplied status and amount, and redirects to invitations", async () => {
  await saveInvitation({}, form());
  const participant = mocks.persist.mock.calls[0][1];
  expect(participant).toMatchObject({ phone: "+34612345678", emailNormalized: "guest@example.com", dniNormalized: "12345678Z", acceptedMarketing: false });
  expect(participant).not.toHaveProperty("status");
  expect(participant).not.toHaveProperty("amountCents");
  expect(mocks.redirect).toHaveBeenCalledWith("/admin/tournaments/t1/registrations?status=INVITED&created=1");
});
