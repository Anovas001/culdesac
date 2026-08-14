import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("registration success experience", () => {
  it("uses the Culdesac brand and explains what happens after payment", () => {
    const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
    const stylesheet = readFileSync(new URL("./success.module.css", import.meta.url), "utf8");

    expect(page).toContain('src="/brand/culdesac-logo.webp"');
    expect(page).toContain("Pagament rebut");
    expect(page).toContain("Ja ets dins del quadre");
    expect(page).toContain("Confirmació automàtica");
    expect(page).toContain("Revisa el teu correu");
    expect(page).toContain('href="/legal/privacy"');
    expect(stylesheet).toContain('url("/brand/culdesac-arena.webp")');
    expect(stylesheet).toContain("--yellow: #fff200");
    expect(stylesheet).toContain("@media (max-width: 720px)");
  });
});
