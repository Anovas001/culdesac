import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { TournamentForm } from "@/components/admin/tournament-form";
import { setActiveTournament, setTournamentStatus } from "../../actions";

export default async function TournamentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");
  const { id } = await params;
  const [tournament, settings, query] = await Promise.all([
    db.tournament.findUnique({ where: { id }, include: { _count: { select: { registrations: { where: { status: "PAID" } } } } } }),
    db.siteSettings.findUnique({ where: { id: 1 } }), searchParams,
  ]);
  if (!tournament) notFound();
  return <main className="admin-shell"><Link href="/admin">← Dashboard</Link><div className="section-head"><div><p className="eyebrow">TORNEIG</p><h1>{tournament.name}</h1></div><div className="actions"><form action={setActiveTournament}><input type="hidden" name="id" value={id}/><button disabled={settings?.activeTournamentId === id}>{settings?.activeTournamentId === id ? "Torneig actiu" : "Fer actiu"}</button></form><form action={setTournamentStatus}><input type="hidden" name="id" value={id}/><input type="hidden" name="status" value={tournament.status === "OPEN" ? "CLOSED" : "OPEN"}/><button>{tournament.status === "OPEN" ? "Tancar inscripcions" : "Obrir inscripcions"}</button></form><Link className="button" href={`/admin/tournaments/${id}/registrations`}>Inscripcions ({tournament._count.registrations})</Link></div></div>{query.error && <p className="error">No s’ha pogut desar: revisa els camps i que el slug sigui únic.</p>}<TournamentForm tournament={tournament}/></main>;
}
