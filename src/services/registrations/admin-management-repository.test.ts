import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ find: vi.fn(), duplicate: vi.fn(), update: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { registration: { findUnique: mocks.find, findFirst: mocks.duplicate, update: mocks.update, delete: mocks.remove } } }));
import { persistRegistrationDelete, persistRegistrationEdit } from "./admin-management-repository";
import { Prisma } from "@/generated/prisma/client";
const input = { fullName: "New Name", epicUsername: "New Nick", epicUsernameNormalized: "new nick", discordUsername: "new.discord" };
beforeEach(() => { vi.clearAllMocks(); mocks.find.mockResolvedValue({ id: "r1" }); mocks.duplicate.mockResolvedValue(null); mocks.update.mockResolvedValue({}); mocks.remove.mockResolvedValue({}); });
it("delimits both reads and writes to the tournament and excludes the edited row from uniqueness checks", async () => {
  await persistRegistrationEdit("t1", "r1", input);
  expect(mocks.find).toHaveBeenCalledWith({ where: { id: "r1", tournamentId: "t1" }, select: { id: true } });
  expect(mocks.duplicate).toHaveBeenCalledWith({ where: { tournamentId: "t1", epicUsernameNormalized: "new nick", id: { not: "r1" } }, select: { id: true } });
  expect(mocks.update).toHaveBeenCalledWith({ where: { id: "r1", tournamentId: "t1" }, data: input });
});
it("uses a literal scoped delete and no status update", async () => {
  await persistRegistrationDelete("t1", "r1");
  expect(mocks.remove).toHaveBeenCalledWith({ where: { id: "r1", tournamentId: "t1" } });
  expect(mocks.update).not.toHaveBeenCalled();
});
it("reports a race on nickname uniqueness without exposing Prisma details", async () => {
  mocks.update.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("private SQL", { code: "P2002", clientVersion: "7.9.1" }));
  await expect(persistRegistrationEdit("t1", "r1", input)).rejects.toThrow(/nickname/);
});
it("reports that a participant removed concurrently no longer exists", async () => {
  mocks.remove.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("private SQL", { code: "P2025", clientVersion: "7.9.1" }));
  await expect(persistRegistrationDelete("t1", "r1")).rejects.toThrow(/trobat/);
});
