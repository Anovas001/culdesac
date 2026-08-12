import { describe, expect, it } from "vitest";

import { registrationSchema } from "./registration";

const validRegistration = {
  fullName: "Ada Lovelace",
  email: " Ada@Example.COM ",
  epicUsername: "  AdaPlayer  ",
  discordUsername: "ada",
  phone: "+34 600 000 000",
  acceptedTerms: true,
  acceptedPrivacy: true,
};

describe("registrationSchema", () => {
  it("normalizes duplicate-sensitive participant fields", () => {
    const result = registrationSchema.parse(validRegistration);

    expect(result.emailNormalized).toBe("ada@example.com");
    expect(result.epicUsernameNormalized).toBe("adaplayer");
    expect(result.epicUsername).toBe("AdaPlayer");
  });

  it("requires acceptance of both legal checkboxes", () => {
    expect(
      registrationSchema.safeParse({ ...validRegistration, acceptedTerms: false }).success,
    ).toBe(false);
    expect(
      registrationSchema.safeParse({ ...validRegistration, acceptedPrivacy: false }).success,
    ).toBe(false);
  });
});
