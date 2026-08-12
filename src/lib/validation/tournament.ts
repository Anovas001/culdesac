import { z } from "zod";

const optionalUrl = z.string().trim().transform((value) => value || null).pipe(z.string().url().nullable());
export const tournamentSchema = z.object({
  name: z.string().trim().min(3).max(120), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), headline: z.string().trim().min(3).max(160), description: z.string().trim().min(10).max(5000), rules: z.string().trim().min(3).max(10000), eventDate: z.coerce.date(), priceCents: z.coerce.number().int().min(1).max(1_000_000), currency: z.string().trim().length(3).transform((value) => value.toLowerCase()), capacity: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().positive().nullable()), heroImageUrl: optionalUrl, status: z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED"]),
});
export type TournamentInput = z.output<typeof tournamentSchema>;
