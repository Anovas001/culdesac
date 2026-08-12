import { RegistrationForm } from "@/components/public/registration-form";
import { formatMoney } from "@/lib/money";
import { prismaActiveTournamentRepository } from "@/services/tournaments/repository";
import { getActiveTournament } from "@/services/tournaments/active";

export const dynamic = "force-dynamic";
export default async function Home() {
  const tournament = await getActiveTournament(prismaActiveTournamentRepository);
  if (!tournament) return <main className="shell"><p className="eyebrow">CULDESAC · ESPORTS</p><h1>Proper torneig aviat</h1><p>Estem preparant la pròxima competició.</p></main>;
  const closed = tournament.status !== "OPEN";
  return <main className="shell"><section className="hero"><p className="eyebrow">TORNEIG FORTNITE</p><h1>{tournament.headline}</h1><p className="lead">{tournament.description}</p><div className="facts"><span>{new Intl.DateTimeFormat("ca-ES", { dateStyle: "full", timeStyle: "short", timeZone: process.env.APP_TIMEZONE ?? "Europe/Madrid" }).format(tournament.eventDate)}</span><strong>{formatMoney(tournament.priceCents, tournament.currency)}</strong>{tournament.capacity && <span>Fins a {tournament.capacity} jugadors</span>}</div></section><section className="grid"><article className="card"><h2>{tournament.name}</h2><h3>Normes i informació</h3><p className="rules">{tournament.rules}</p><p className={closed ? "status closed" : "status"}>{closed ? tournament.status === "COMPLETED" ? "Torneig finalitzat" : "Inscripcions tancades" : "Inscripcions obertes"}</p></article>{!closed && <RegistrationForm />}</section></main>;
}
