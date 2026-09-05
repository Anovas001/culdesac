import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("locale preference route", () => {
  it("persists Spanish and returns to a safe page", async () => {
    const response = await GET(
      new Request("http://localhost/api/locale?locale=es&returnTo=/legal/privacy"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/legal/privacy");
    expect(response.headers.get("set-cookie")).toContain("culdesac_locale=es");
  });

  it("falls back to Catalan and blocks external redirects", async () => {
    const response = await GET(
      new Request("http://localhost/api/locale?locale=en&returnTo=//example.com"),
    );

    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.get("set-cookie")).toContain("culdesac_locale=ca");
  });

  it("stays on the public domain behind a Docker reverse proxy", async () => {
    const response = await GET(new Request(
      "http://0.0.0.0:3000/api/locale?locale=es&returnTo=%2F%3Fx%3D1%23inscripcio",
      { headers: { host: "culdesac.gsegames.com", "x-forwarded-proto": "https" } },
    ));
    expect(response.headers.get("location")).toBe("/?x=1#inscripcio");
    expect(response.headers.get("set-cookie")).toContain("culdesac_locale=es");
  });
});
