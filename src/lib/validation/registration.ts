import { z } from "zod";

import { normalizeEmail } from "../email";

export function normalizeEpicUsername(username: string): string {
  return username.trim().toLowerCase();
}

const identityControlLetters = "TRWAGMYFPDXBNJZSQVHLCKE";

export function normalizeSpanishIdentity(identity: string): string {
  return identity.trim().toUpperCase().replace(/[.\s-]/g, "");
}

export function isValidSpanishIdentity(identity: string): boolean {
  const normalized = normalizeSpanishIdentity(identity);
  if (!/^(?:\d{8}|[XYZ]\d{7})[A-Z]$/.test(normalized)) return false;

  const numericIdentity = normalized
    .slice(0, -1)
    .replace(/^X/, "0")
    .replace(/^Y/, "1")
    .replace(/^Z/, "2");
  const expectedLetter = identityControlLetters[Number(numericIdentity) % 23];
  return normalized.at(-1) === expectedLetter;
}

function isValidSpanishPostalCode(postalCode: string): boolean {
  if (!/^\d{5}$/.test(postalCode)) return false;
  const provinceCode = Number(postalCode.slice(0, 2));
  return provinceCode >= 1 && provinceCode <= 52;
}

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Escriu el teu nom complet.").max(120),
    email: z.string().trim().email("Escriu un correu electrònic vàlid.").max(254),
    epicUsername: z.string().trim().min(2, "Escriu el teu nickname de Fortnite.").max(64),
    discordUsername: z.string().trim().min(2, "Escriu el teu usuari de Discord.").max(100),
    dni: z
      .string()
      .transform(normalizeSpanishIdentity)
      .refine(isValidSpanishIdentity, "Escriu un DNI o NIE vàlid."),
    postalCode: z
      .string()
      .trim()
      .refine(isValidSpanishPostalCode, "Escriu un codi postal espanyol vàlid."),
    acceptedTerms: z.literal(true, { error: "Has d'acceptar els termes." }),
    acceptedPrivacy: z.literal(true, { error: "Confirma que has llegit la política de privacitat." }),
  })
  .transform((value) => ({
    ...value,
    emailNormalized: normalizeEmail(value.email),
    epicUsernameNormalized: normalizeEpicUsername(value.epicUsername),
    dniNormalized: value.dni,
  }));

export type RegistrationInput = z.output<typeof registrationSchema>;
