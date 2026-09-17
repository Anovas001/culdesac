import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { resendConfirmation } from "../../../actions";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { ExportRegistrationsButton } from "@/components/admin/export-registrations-button";
import { parseRegistrationStatus, registrationStatuses, registrationStatusLabels } from "@/lib/registration-status";

export default async function Registrations({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");

  const { id } = await params;
  const { status } = await searchParams;
  const activeFilter = parseRegistrationStatus(status);
  const tournament = await db.tournament.findUnique({ where: { id } });
  if (!tournament) notFound();

  const registrations = await db.registration.findMany({
    where: { tournamentId: id, ...(activeFilter ? { status: activeFilter } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="admin-shell">
      <Link href={`/admin/tournaments/${id}`}>← {tournament.name}</Link>
      <div className="section-head">
        <div>
          <p className="eyebrow">PARTICIPANTS</p>
          <h1>Inscripcions</h1>
        </div>
        <div className="filters">
          <Link href={`/admin/tournaments/${id}/registrations`} aria-current={!activeFilter ? "page" : undefined}>Totes</Link>
          {registrationStatuses.map((filter) => (
            <Link key={filter} href={`/admin/tournaments/${id}/registrations?status=${filter}`} aria-current={activeFilter === filter ? "page" : undefined}>
              {registrationStatusLabels[filter]}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card section-head">
        <div>
          <strong>Exportació per als àrbitres</strong>
          <p className="muted">Descarrega el filtre actual. Tria «Pagada» per obtenir només les places confirmades.</p>
        </div>
        <ExportRegistrationsButton tournamentId={id} status={activeFilter} count={registrations.length} />
      </div>

      <section className="admin-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Identificació</th>
              <th>Contacte</th>
              <th>Consentiments</th>
              <th>Pagament</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr key={registration.id}>
                <td>
                  <strong>{registration.fullName}</strong><br />
                  <small>Fortnite: {registration.epicUsername}</small><br />
                  <small>Discord: {registration.discordUsername}</small>
                </td>
                <td>
                  <strong>{registration.dni}</strong><br />
                  <small>CP {registration.postalCode}</small>
                </td>
                <td>
                  {registration.email}<br />
                  <small>{registration.phone ?? "Sense telèfon"}</small>
                </td>
                <td>
                  <strong>Màrqueting: {registration.acceptedMarketing ? "Sí" : "No"}</strong><br />
                  {registration.acceptedMarketingAt && (
                    <small>{new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short" }).format(registration.acceptedMarketingAt)}</small>
                  )}
                </td>
                <td>
                  <span className={`badge ${registration.status.toLowerCase()}`}>{registration.status}</span><br />
                  <small>{formatMoney(registration.amountCents, registration.currency)}</small>
                </td>
                <td>{new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short" }).format(registration.createdAt)}</td>
                <td>
                  {registration.status === "PAID" && (
                    <form action={resendConfirmation}>
                      <input type="hidden" name="id" value={registration.id} />
                      <button>Reenviar email</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {registrations.length === 0 && <p>No hi ha inscripcions amb aquest filtre.</p>}
      </section>
    </main>
  );
}
