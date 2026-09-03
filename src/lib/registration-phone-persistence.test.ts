import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("registration phone persistence", () => {
  const schema = readFileSync(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
  const repository = readFileSync(new URL("../services/registrations/repository.ts", import.meta.url), "utf8");
  const admin = readFileSync(new URL("../app/admin/tournaments/[id]/registrations/page.tsx", import.meta.url), "utf8");

  it("stores and displays the participant phone number", () => {
    expect(schema).toMatch(/phone\s+String\?/);
    expect(repository).toContain("phone: data.phone");
    expect(repository).toContain("phone: participant.phone");
    expect(admin).toContain("registration.phone");
  });
});
