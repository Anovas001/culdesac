import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), connect: vi.fn(), release: vi.fn(), end: vi.fn(), update: vi.fn(), registrationUpdate: vi.fn(), transaction: vi.fn() }));
vi.mock("pg", () => ({ Pool: class { connect = mocks.connect; end = mocks.end; } }));
vi.mock("@/lib/db", () => ({ db: { tournament: { update: mocks.update }, registration: { update: mocks.registrationUpdate }, $transaction: mocks.transaction } }));
vi.mock("@/lib/env", () => ({ getDatabaseUrl: () => "postgresql://local/local" }));
import { challongeRepository } from "./repository";
import { Prisma } from "@/generated/prisma/client";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.connect.mockResolvedValue({ query: mocks.query, release: mocks.release });
  mocks.query.mockResolvedValue({ rows: [{ locked: true }] }); mocks.end.mockResolvedValue(undefined);
  mocks.update.mockResolvedValue({}); mocks.registrationUpdate.mockResolvedValue({}); mocks.transaction.mockResolvedValue([]);
});
it("holds a session lock with a parameterized tournament key and releases it after work", async () => {
  const work = vi.fn().mockResolvedValue("done");
  expect(await challongeRepository.withLock("t1", work)).toBe("done");
  expect(mocks.query.mock.calls[0]).toEqual([expect.stringContaining("pg_try_advisory_lock"), ["culdesac:challonge:t1"]]);
  expect(mocks.query.mock.calls[1][0]).toContain("pg_advisory_unlock");
  expect(mocks.release).toHaveBeenCalledTimes(1); expect(mocks.end).toHaveBeenCalledTimes(1);
});
it("does not execute a concurrent operation when the database lock is occupied", async () => {
  mocks.query.mockResolvedValueOnce({ rows: [{ locked: false }] });
  const work = vi.fn();
  await expect(challongeRepository.withLock("t1", work)).rejects.toThrow(/en curs/);
  expect(work).not.toHaveBeenCalled(); expect(mocks.query).toHaveBeenCalledTimes(1);
  expect(mocks.release).toHaveBeenCalledTimes(1); expect(mocks.end).toHaveBeenCalledTimes(1);
});
it("releases the lock and connection after a failed operation", async () => {
  await expect(challongeRepository.withLock("t1", async () => { throw new Error("failed"); })).rejects.toThrow("failed");
  expect(mocks.query.mock.calls[1][0]).toContain("pg_advisory_unlock");
  expect(mocks.release).toHaveBeenCalledTimes(1); expect(mocks.end).toHaveBeenCalledTimes(1);
});
it("persists participant mappings atomically and scopes every registration to its tournament", async () => {
  await challongeRepository.saveParticipants("t1", [{ registrationId: "r1", participantId: "p1" }, { registrationId: "r2", participantId: "p2" }]);
  expect(mocks.registrationUpdate).toHaveBeenCalledWith({ where: { id: "r1", tournamentId: "t1" }, data: { challongeParticipantId: "p1", challongePublishedAt: expect.any(Date) } });
  expect(mocks.transaction).toHaveBeenCalledTimes(1);
  expect(mocks.transaction.mock.calls[0][0]).toHaveLength(2);
});
it("reports an already-linked remote tournament without exposing database details", async () => {
  mocks.update.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("private", { code: "P2002", clientVersion: "7.9.1" }));
  await expect(challongeRepository.saveLink("t1", { challongeTournamentId: "42", challongeCommunity: null, challongeUrl: "https://challonge.com/cup" })).rejects.toThrow(/ja està vinculat/);
});
