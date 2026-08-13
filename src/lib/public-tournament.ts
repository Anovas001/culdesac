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

const statusLabels: Record<PublicTournamentSummary["status"], string> = {
  DRAFT: "Properament",
  OPEN: "Inscripcions obertes",
  CLOSED: "Inscripcions tancades",
  COMPLETED: "Torneig finalitzat",
};

export function buildPublicTournamentView(
  tournament: PublicTournamentSummary,
  timeZone: string,
): PublicTournamentView {
  const dateParts = new Intl.DateTimeFormat("ca-ES", {
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

  return {
    dateLabel: `${part("day")} d’${month} de ${part("year")}, ${part("hour")}:${part("minute")}`,
    priceLabel: new Intl.NumberFormat("ca-ES", {
      style: "currency",
      currency: tournament.currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
      .format(tournament.priceCents / 100)
      .replace(/\u00a0/g, " "),
    capacityLabel: tournament.capacity ? `${tournament.capacity} places` : null,
    statusLabel: statusLabels[tournament.status],
    isOpen: tournament.status === "OPEN",
  };
}
