type PublicTournamentSummary = {
  status: "DRAFT" | "OPEN" | "CLOSED" | "COMPLETED";
  eventDate: Date;
  priceCents: number;
  currency: string;
  capacity: number | null;
};

export type PublicTournamentView = {
  dateLabel: string;
  priceLabel: string;
  capacityLabel: string | null;
  statusLabel: string;
  isOpen: boolean;
};

const statusLabels: Record<Locale, Record<PublicTournamentSummary["status"], string>> = {
  ca: { DRAFT: "Properament", OPEN: "Inscripcions obertes", CLOSED: "Inscripcions tancades", COMPLETED: "Torneig finalitzat" },
  es: { DRAFT: "Próximamente", OPEN: "Inscripciones abiertas", CLOSED: "Inscripciones cerradas", COMPLETED: "Torneo finalizado" },
};

export function buildPublicTournamentView(
  tournament: PublicTournamentSummary,
  timeZone: string,
  locale: Locale = "ca",
): PublicTournamentView {
  const intlLocale = locale === "es" ? "es-ES" : "ca-ES";
  const dateParts = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(tournament.eventDate);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((datePart) => datePart.type === type)?.value ?? "";
  const month = part("month").replace(/^(?:d’|de\s+)/, "");
  const dateLabel = locale === "es"
    ? `${part("day")} de ${month} de ${part("year")}, ${part("hour")}:${part("minute")}`
    : `${part("day")} d’${month} de ${part("year")}, ${part("hour")}:${part("minute")}`;

  return {
    dateLabel,
    priceLabel: new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: tournament.currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(tournament.priceCents / 100)
      .replace(/\u00a0/g, " "),
    capacityLabel: tournament.capacity ? `${tournament.capacity} ${locale === "es" ? "plazas" : "places"}` : null,
    statusLabel: statusLabels[locale][tournament.status],
    isOpen: tournament.status === "OPEN",
  };
}
import type { Locale } from "./i18n/config";
