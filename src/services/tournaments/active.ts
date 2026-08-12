export type PublicTournament = {
  id: string;
  name: string;
  slug: string;
  headline: string;
  description: string;
  rules: string;
  eventDate: Date;
  priceCents: number;
  currency: string;
  capacity: number | null;
  heroImageUrl: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED";
};

export type ActiveTournamentRepository = {
  findSettings(): Promise<{ activeTournament: PublicTournament | null } | null>;
};

/** The single public-tournament lookup; callers never infer activity from a tournament flag. */
export async function getActiveTournament(
  repository: ActiveTournamentRepository,
): Promise<PublicTournament | null> {
  const settings = await repository.findSettings();
  return settings?.activeTournament ?? null;
}
