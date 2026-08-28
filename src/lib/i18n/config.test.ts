import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, LOCALE_COOKIE, resolveLocale, safeReturnPath } from "./config";

describe("locale configuration", () => {
  it("supports Catalan and Spanish while defaulting unknown values to Catalan", () => {
    expect(resolveLocale("ca")).toBe("ca");
    expect(resolveLocale("es")).toBe("es");
    expect(resolveLocale("en")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(LOCALE_COOKIE).toBe("culdesac_locale");
  });

  it("accepts only safe internal return paths", () => {
    expect(safeReturnPath("/registration/success?session_id=cs_test_123")).toBe(
      "/registration/success?session_id=cs_test_123",
    );
    expect(safeReturnPath("https://example.com")).toBe("/");
    expect(safeReturnPath("//example.com")).toBe("/");
    expect(safeReturnPath(undefined)).toBe("/");
  });
});
