import { z } from "zod";

import { normalizeEmail } from "../email";

export function normalizeEpicUsername(username: string): string {
  return username.trim().toLowerCase();
}

const optionalTrimmedText = z
  .string()
  .trim()
  .max(100)
  .transform((value) => value || null)
  .optional()
  .default("");

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Escriu el teu nom complet.").max(120),
    email: z.string().trim().email("Escriu un correu electrònic vàlid.").max(254),
    epicUsername: z.string().trim().min(2, "Escriu el teu nom d'usuari d'Epic.").max(64),
    discordUsername: optionalTrimmedText,
    phone: optionalTrimmedText,
    acceptedTerms: z.literal(true, { error: "Has d'acceptar els termes." }),
    acceptedPrivacy: z.literal(true, { error: "Has d'acceptar la política de privacitat." }),
  })
  .transform((value) => ({
    ...value,
    emailNormalized: normalizeEmail(value.email),
    epicUsernameNormalized: normalizeEpicUsername(value.epicUsername),
  }));

export type RegistrationInput = z.output<typeof registrationSchema>;
