import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAdmin: vi.fn(), cookies: vi.fn(), findTournament: vi.fn(), findRegistrations: vi.fn(), build: vi.fn(),
}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/auth", () => ({ cookieName: "culdesac_admin", isAdmin: mocks.isAdmin }));
vi.mock("@/lib/db", () => ({ db: { tournament: { findUnique: mocks.findTournament }, registration: { findMany: mocks.findRegistrations } } }));
vi.mock("@/lib/registrations-excel", () => ({ buildRegistrationsExcel: mocks.build }));

import { GET } from "./route";

const context = { params: Promise.resolve({ id: "tournament-a" }) };
const request = (query = "") => new Request(`http://localhost/api/admin/tournaments/tournament-a/registrations/export${query}`);

beforeEach(() => {
  vi.resetAllMocks();
  mocks.cookies.mockResolvedValue({ get: () => ({ value: "session" }) });
  mocks.isAdmin.mockResolvedValue(true);
  mocks.findTournament.mockResolvedValue({ name: "Cup", slug: "cup", eventDate: new Date() });
  mocks.findRegistrations.mockResolvedValue([]);
  mocks.build.mockResolvedValue({ buffer: Buffer.from("xlsx"), filename: "inscripcions-cup.xlsx" });
});

describe("protected registration export route", () => {
  it("rejects unauthenticated downloads before accessing participant data", async () => {
    mocks.isAdmin.mockResolvedValue(false);
    const response = await GET(request(), context);
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(mocks.findTournament).not.toHaveBeenCalled();
    expect(mocks.findRegistrations).not.toHaveBeenCalled();
  });

  it("scopes exports to the requested tournament and status and never caches them", async () => {
    const response = await GET(request("?status=PAID"), context);
    expect(response.status).toBe(200);
    expect(mocks.findRegistrations).toHaveBeenCalledWith(expect.objectContaining({ where: { tournamentId: "tournament-a", status: "PAID" } }));
    expect(mocks.build).toHaveBeenCalledWith(expect.objectContaining({ status: "PAID" }));
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="inscripcions-cup.xlsx"');
    expect(response.headers.get("Content-Type")).toContain("spreadsheetml");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.text()).toBe("xlsx");
  });

  it("includes all statuses when no filter is selected", async () => {
    await GET(request(), context);
    expect(mocks.findRegistrations).toHaveBeenCalledWith(expect.objectContaining({ where: { tournamentId: "tournament-a" } }));
  });

  it("does not silently export all records for an invalid filter", async () => {
    expect((await GET(request("?status=UNKNOWN"), context)).status).toBe(400);
    expect(mocks.findRegistrations).not.toHaveBeenCalled();
  });

  it("returns not found without exporting other tournaments", async () => {
    mocks.findTournament.mockResolvedValue(null);
    expect((await GET(request(), context)).status).toBe(404);
    expect(mocks.findRegistrations).not.toHaveBeenCalled();
  });

  it("returns a useful error if generation fails", async () => {
    mocks.build.mockRejectedValue(new Error("Internal error"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await GET(request(), context);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "No s’ha pogut generar l’Excel. Torna-ho a provar." });
    } finally { log.mockRestore(); }
  });
});
