import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { confirmedRegistrationStatuses } from "@/lib/registration-status";
import { InvitationForm } from "@/components/admin/invitation-form";

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");
  const { id } = await params;
  const tournament = await db.tournament.findUnique({ where: { id }, include: { _count: { select: { registrations: { where: { status: { in: confirmedRegistrationStatuses } } } } } } });
  if (!tournament) notFound();
  const allowed = tournament.status === "OPEN" || tournament.status === "CLOSED";
  const full = tournament.capacity !== null && tournament._count.registrations >= tournament.capacity;
  return <main className="admin-shell">
    <Link href={`/admin/tournaments/${id}/registrations`}>← Inscripcions de {tournament.name}</Link>
    <section className="admin-hero"><div><p className="eyebrow">ALTA MANUAL · NOMÉS ADMINISTRADORS</p><h1>Afegir invitació</h1><p>{tournament.name} · {tournament._count.registrations}{tournament.capacity !== null ? ` / ${tournament.capacity}` : ""} places confirmades</p></div></section>
    <section className="admin-card">
      {!allowed ? <p>Només es poden afegir invitacions a tornejos oberts o tancats, no a esborranys o finalitzats.</p> : full ? <p>El torneig ja té totes les places confirmades. Revisa l’aforament abans d’afegir una invitació.</p> : <InvitationForm tournamentId={id} />}
    </section>
  </main>;
}
