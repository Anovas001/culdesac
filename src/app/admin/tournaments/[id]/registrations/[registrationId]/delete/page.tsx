import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { RegistrationDeleteForm } from "@/components/admin/registration-management";
import { registrationStatusLabels } from "@/lib/registration-status";
import { formatMoney } from "@/lib/money";

export default async function DeleteRegistrationPage({ params }: { params: Promise<{ id: string; registrationId: string }> }) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");
  const { id, registrationId } = await params;
  const registration = await db.registration.findUnique({ where: { id: registrationId, tournamentId: id }, include: { tournament: { select: { name: true } } } });
  if (!registration) notFound();
  return <main className="admin-shell">
    <Link href={`/admin/tournaments/${id}/registrations`}>← Inscripcions de {registration.tournament.name}</Link>
    <section className="admin-hero"><div><p className="eyebrow">GESTIÓ DE PARTICIPACIONS</p><h1>Eliminar participació</h1><p>Revisa que sigui la participació que vols esborrar.</p></div></section>
    <section className="admin-card form">
      <div><h2>{registration.fullName}</h2><p>Fortnite: {registration.epicUsername}<br />Discord: {registration.discordUsername}</p><p className="muted">{registrationStatusLabels[registration.status]} · {formatMoney(registration.amountCents, registration.currency)}</p></div>
      <RegistrationDeleteForm tournamentId={id} registrationId={registrationId} />
    </section>
  </main>;
}
