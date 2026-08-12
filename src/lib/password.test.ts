import { compare } from "bcryptjs";
import { describe, expect, it } from "vitest";

import { hashAdminPassword } from "./password";

describe("hashAdminPassword", () => {
  it("creates a bcrypt hash that verifies the supplied password", async () => {
    const hash = await hashAdminPassword("correct horse battery staple");

    await expect(compare("correct horse battery staple", hash)).resolves.toBe(true);
  });
});
