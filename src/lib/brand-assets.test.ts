import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("definitive Culdesac logos", () => {
  it("publishes the definitive horizontal logo without altering the artwork", () => {
    const definitive = readFileSync(
      join(root, "assets", "LOGOTIP", "DEFINITIUS", "LOGO__CULDESAC_REDUIT HORITZONTAL.png"),
    );
    const published = readFileSync(join(root, "public", "brand", "culdesac-logo.png"));

    expect(published).toEqual(definitive);
  });

  it("publishes the definitive reduced vertical mark without altering the artwork", () => {
    const definitive = readFileSync(
      join(root, "assets", "LOGOTIP", "DEFINITIUS", "LOGO_VERTICAL_REDUIT_CULDESAC.png"),
    );
    const published = readFileSync(join(root, "public", "brand", "culdesac-mark.png"));

    expect(published).toEqual(definitive);
  });

  it("uses the definitive assets everywhere the public brand is rendered", () => {
    const files = [
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/registration/success/page.tsx",
      "src/app/legal/legal-document.tsx",
    ];
    const source = files.map((file) => readFileSync(join(root, file), "utf8")).join("\n");

    expect(source).not.toContain("/brand/culdesac-logo.webp");
    expect(source).not.toContain("/brand/culdesac-mark.webp");
    expect(source).toContain("/brand/culdesac-logo.png");
    expect(source).toContain("/brand/culdesac-mark.png");
  });
});
