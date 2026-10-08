import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { RegistrationEditForm } from "@/components/admin/registration-management";
import { registrationStatusLabels } from "@/lib/registration-status";

export default async function EditRegistrationPage({ params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");
  const { id, registrationId } = await params;
  const registration = await db.registration.findUnique({ where: { id: registrationId, tournamentId: id }, include: { tournament: { select: { name: true } } } });
  if (!registration) notFound();
  return <main className="admin-shell">
    <Link href={`/admin/tournaments/${id}/registrations`}>← Inscripcions de {registration.tournament.name}</Link>
    <section className="admin-hero"><div><p className="eyebrow">GESTIÓ DE PARTICIPACIONS</p><h1>Editar participació</h1><p>{registration.fullName} · {registrationStatusLabels[registration.status]}</p></div></section>
    <section className="admin-card">
      {registration.challongeParticipantId && <p className="muted">Aquesta participació ja s’ha publicat a Challonge. Els canvis es desen a Culdesac; prepara la llista definitiva abans de tornar-la a carregar.</p>}
      <RegistrationEditForm tournamentId={id} registration={{ id: registration.id, fullName: registration.fullName, epicUsername: registration.epicUsername, discordUsername: registration.discordUsername }} />
    </section>
  </main>;
}
