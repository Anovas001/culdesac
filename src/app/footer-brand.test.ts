import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("public footer brand", () => {
  it("keeps the footer copy outside the logo image", () => {
    const stylesheet = readFileSync(new URL("./page.module.css", import.meta.url), "utf8");
    const logoRule = stylesheet.match(/\.footerBrand img\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(logoRule).not.toMatch(/margin:\s*-/);
    expect(logoRule).toContain("display: block");
  });
});
