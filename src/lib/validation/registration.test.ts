import { describe, expect, it } from "vitest";

import {
  isValidSpanishIdentity,
  normalizeSpanishIdentity,
  registrationSchema,
} from "./registration";

const validRegistration = {
  fullName: "Ada Lovelace",
  email: " Ada@Example.COM ",
  epicUsername: "  AdaPlayer  ",
  discordUsername: "ada",
  dni: " 12.345.678-z ",
  postalCode: "08001",
  acceptedTerms: true,
  acceptedPrivacy: true,
};

describe("registrationSchema", () => {
  it("normalizes duplicate-sensitive participant fields", () => {
    const result = registrationSchema.parse(validRegistration);

    expect(result.emailNormalized).toBe("ada@example.com");
    expect(result.epicUsernameNormalized).toBe("adaplayer");
    expect(result.epicUsername).toBe("AdaPlayer");
    expect(result.dni).toBe("12345678Z");
    expect(result.dniNormalized).toBe("12345678Z");
  });

  it("accepts a valid NIE and normalizes separators", () => {
    expect(normalizeSpanishIdentity(" x-1234567-l ")).toBe("X1234567L");
    expect(isValidSpanishIdentity("X1234567L")).toBe(true);
    expect(registrationSchema.safeParse({ ...validRegistration, dni: "X1234567L" }).success).toBe(true);
  });

  it("rejects invalid DNI/NIE checksums and malformed Spanish postal codes", () => {
    expect(registrationSchema.safeParse({ ...validRegistration, dni: "12345678A" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...validRegistration, postalCode: "99999" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...validRegistration, postalCode: "8001" }).success).toBe(false);
  });

  it("requires a Discord tag", () => {
    expect(registrationSchema.safeParse({ ...validRegistration, discordUsername: "" }).success).toBe(false);
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
