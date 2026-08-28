import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("locale switcher", () => {
  it("offers accessible Catalan and Spanish controls with brand-compatible flags", () => {
    const component = readFileSync(new URL("./locale-switcher.tsx", import.meta.url), "utf8");
    const stylesheet = readFileSync(new URL("./locale-switcher.module.css", import.meta.url), "utf8");

    expect(component).toContain("/api/locale");
    expect(component).toContain("aria-current");
    expect(component).toContain("catalanFlag");
    expect(component).toContain("spanishFlag");
    expect(stylesheet).toContain("repeating-linear-gradient");
  });

  it("uses document navigation so the server reads the newly written locale cookie", () => {
    const component = readFileSync(new URL("./locale-switcher.tsx", import.meta.url), "utf8");

    expect(component).not.toContain('from "next/link"');
    expect(component.match(/<a/g)).toHaveLength(2);
  });
});
