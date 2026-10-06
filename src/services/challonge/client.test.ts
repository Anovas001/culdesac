import { afterEach, describe, expect, it, vi } from "vitest";
import { ChallongeClient, parseChallongeUrl } from "./client";

afterEach(() => vi.unstubAllGlobals());
const tournament = (attributes = {}) => ({ data: { id: "42", type: "tournament", attributes: { name: "Cup", tournament_type: "swiss", state: "pending", ...attributes } } });
const participant = (id: number) => ({ id: String(id), type: "participant", attributes: { name: `Player ${id}`, misc: `culdesac:r${id}`, states: { active: true } } });
function http(...bodies: unknown[]) {
  const fetcher = vi.fn();
  for (const body of bodies) fetcher.mockResolvedValueOnce(Response.json(body));
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

describe("Challonge URLs", () => {
  it("accepts localized and community links without using them as an API host", () => {
    expect(parseChallongeUrl(" https://challonge.com/es/cup_test/participants?x=1#top ")).toEqual({ url: "https://challonge.com/cup_test", ref: { id: "cup_test" } });
    expect(parseChallongeUrl("https://culdesac.challonge.com/ca/cup_test")).toEqual({ url: "https://culdesac.challonge.com/cup_test", ref: { id: "cup_test", community: "culdesac" } });
  });
  it.each(["https://evil.com/cup", "https://challonge.com.evil.com/cup", "https://user:pass@challonge.com/cup", "http://localhost/cup", "https://challonge.com/", "https://challonge.com/events/my-event", "https://challonge.com/cup/unknown", "https://challonge.com:444/cup"]) ("rejects invalid tournament URL %s", (url) => {
    expect(() => parseChallongeUrl(url)).toThrow();
  });
});

describe("v2.1 client", () => {
  it("uses server credentials, JSON:API headers and community scoping", async () => {
    const fetcher = http(tournament());
    expect(await new ChallongeClient("secret").getTournament({ id: "cup", community: "culdesac" })).toMatchObject({ id: "42", state: "pending", tournamentType: "swiss" });
    const [url, options] = fetcher.mock.calls[0];
    expect(url.toString()).toBe("https://api.challonge.com/v2.1/tournaments/cup.json?community_id=culdesac");
    expect(options).toMatchObject({ cache: "no-store", redirect: "error", headers: { "Authorization-Type": "v1", Authorization: "secret", "Content-Type": "application/vnd.api+json" } });
  });
  it("does not guess a missing tournament state", async () => {
    http(tournament({ state: undefined }));
    await expect(new ChallongeClient("secret").getTournament({ id: "42" })).rejects.toThrow(/resposta/i);
  });
  it("reads all pages even when the first page is full", async () => {
    const fetcher = http({ data: Array.from({ length: 100 }, (_, i) => participant(i)) }, { data: [participant(100)] }, { data: [] });
    const result = await new ChallongeClient("secret").listParticipants({ id: "42" });
    expect(result).toHaveLength(101);
    expect(fetcher.mock.calls[1][0].toString()).toContain("page=2");
  });
  it("does not truncate the list if Challonge returns fewer entries per page than requested", async () => {
    const fetcher = http({ data: [participant(1), participant(2)] }, { data: [participant(3)] }, { data: [] });
    expect(await new ChallongeClient("secret").listParticipants({ id: "42" })).toHaveLength(3);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("bulk sends only nicknames and stable recovery markers", async () => {
    const fetcher = http({ data: [participant(1)] });
    await new ChallongeClient("secret").bulkAdd({ id: "42" }, [{ name: "Player 1", misc: "culdesac:r1" }]);
    expect(fetcher.mock.calls[0][0].toString()).toContain("/42/participants/bulk_add.json");
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ data: { type: "Participants", attributes: { participants: [{ name: "Player 1", misc: "culdesac:r1" }] } } });
  });
  it("rejects batches exceeding the documented 20-participant limit before making a request", async () => {
    const fetcher = http({ data: [] });
    await expect(new ChallongeClient("secret").bulkAdd({ id: "42" }, Array.from({ length: 21 }, (_, i) => ({ name: `Guest ${i}`, misc: `culdesac:r${i}` })))).rejects.toThrow(/20/);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([401, 403, 404, 422, 429, 500])("reports HTTP %s without exposing provider messages or credentials", async (status) => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ errors: [{ detail: "secret participant@example.com" }] }, { status }));
    vi.stubGlobal("fetch", fetcher);
    const error = await new ChallongeClient("secret").getTournament({ id: "42" }).catch((cause: Error) => cause);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain("secret");
    expect((error as Error).message).not.toContain("participant@example.com");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not automatically repeat a POST after a network timeout", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("timeout with secret"));
    vi.stubGlobal("fetch", fetcher);
    await expect(new ChallongeClient("secret").bulkAdd({ id: "42" }, [{ name: "Guest", misc: "culdesac:r1" }])).rejects.toThrow(/connexió/i);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("fails clearly when credentials are absent", () => {
    expect(() => new ChallongeClient("")).toThrow(/CHALLONGE_API_KEY/);
  });
});
