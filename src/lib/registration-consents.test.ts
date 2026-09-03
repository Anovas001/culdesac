import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("registration consent persistence", () => {
  const schema = readFileSync(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
  const repository = readFileSync(new URL("../services/registrations/repository.ts", import.meta.url), "utf8");
  const admin = readFileSync(new URL("../app/admin/tournaments/[id]/registrations/page.tsx", import.meta.url), "utf8");

  it("stores the decision and timestamp for marketing consent", () => {
    for (const field of [
      "acceptedMarketing",
      "acceptedMarketingAt",
    ]) {
      expect(schema).toContain(field);
      expect(repository).toContain(field);
    }
  });

  it("makes the recorded choices visible to tournament administrators", () => {
    expect(admin).toContain("acceptedMarketing");
    expect(admin).not.toContain("acceptedImageRights");
  });
});
