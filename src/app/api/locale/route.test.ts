import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("locale preference route", () => {
  it("persists Spanish and returns to a safe page", async () => {
    const response = await GET(
      new Request("http://localhost/api/locale?locale=es&returnTo=/legal/privacy"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/legal/privacy");
    expect(response.headers.get("set-cookie")).toContain("culdesac_locale=es");
  });

  it("falls back to Catalan and blocks external redirects", async () => {
    const response = await GET(
      new Request("http://localhost/api/locale?locale=en&returnTo=//example.com"),
    );

    expect(response.headers.get("location")).toBe("http://localhost/");
    expect(response.headers.get("set-cookie")).toContain("culdesac_locale=ca");
  });
});
