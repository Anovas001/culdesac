import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("development Docker Compose", () => {
  it("uses an image name distinct from the production app image", () => {
    const compose = readFileSync(new URL("../../compose.dev.yml", import.meta.url), "utf8");
    const appSection = compose.match(/\n  app:\n([\s\S]*?)(?=\nvolumes:)/)?.[1] ?? "";

    expect(appSection).toContain("image: culdesac-development");
  });
});
