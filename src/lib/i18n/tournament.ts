import type { Locale } from "./config";

type TranslatableTournament = {
  name: string;
  headline: string;
  description: string;
  rules: string;
  nameEs?: string | null;
  headlineEs?: string | null;
  descriptionEs?: string | null;
  rulesEs?: string | null;
};

function translated(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized || fallback;
}

export function localizeTournament(tournament: TranslatableTournament, locale: Locale) {
  if (locale === "ca") {
    return {
      name: tournament.name,
      headline: tournament.headline,
      description: tournament.description,
      rules: tournament.rules,
    };
  }

  return {
    name: translated(tournament.nameEs, tournament.name),
    headline: translated(tournament.headlineEs, tournament.headline),
    description: translated(tournament.descriptionEs, tournament.description),
    rules: translated(tournament.rulesEs, tournament.rules),
  };
}
