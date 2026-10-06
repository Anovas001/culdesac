import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { resendConfirmation } from "../../../actions";
import { cookieName, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { ExportRegistrationsButton } from "@/components/admin/export-registrations-button";
import { ChallongePanel } from "@/components/admin/challonge-panel";
import { getServerEnv } from "@/lib/env";
import { parseRegistrationFilter, registrationFilters, registrationFilterLabels, registrationStatusLabels, registrationFilterWhere } from "@/lib/registration-status";

export default async function Registrations({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; created?: string }>;
}) {
  if (!await isAdmin((await cookies()).get(cookieName)?.value)) redirect("/admin/login");

  const { id } = await params;
  const { status, created } = await searchParams;
  const activeFilter = parseRegistrationFilter(status);
  const tournament = await db.tournament.findUnique({ where: { id } });
  if (!tournament) notFound();

  const [registrations, groups, published, withdrawn] = await Promise.all([db.registration.findMany({
    where: { tournamentId: id, ...registrationFilterWhere(activeFilter) },
    orderBy: { createdAt: "desc" },
  }), db.registration.groupBy({ by: ["status"], where: { tournamentId: id }, _count: { _all: true } }),
  db.registration.count({ where: { tournamentId: id, status: { in: ["PAID", "INVITED"] }, challongeParticipantId: { not: null } } }),
  db.registration.count({ where: { tournamentId: id, status: { notIn: ["PAID", "INVITED"] }, challongeParticipantId: { not: null } } }),
  ]);
  const count = (state: string) => groups.find((group) => group.status === state)?._count._all ?? 0;
  const paid = count("PAID");
  const invited = count("INVITED");

  return (
    <main className="admin-shell">
      <Link href={`/admin/tournaments/${id}`}>← {tournament.name}</Link>
      <div className="section-head">
        <div>
          <p className="eyebrow">PARTICIPANTS</p>
          <h1>Inscripcions</h1>
        </div>
        {(tournament.status === "OPEN" || tournament.status === "CLOSED") && <Link className="button" href={`/admin/tournaments/${id}/registrations/invite`}>+ Afegir invitació</Link>}
      </div>
      {created === "1" && <p className="invitation-notice" role="status">Invitació creada i plaça confirmada. No s’ha enviat cap correu; pots fer-ho amb el botó «Enviar confirmació» de la inscripció.</p>}
      <section className="metrics" aria-label="Resum de les inscripcions del torneig">
        <div><small>Places confirmades</small><strong>{paid + invited}{tournament.capacity !== null ? ` / ${tournament.capacity}` : ""}</strong><span>Pagades + invitacions</span></div>
        <div><small>Pagades</small><strong>{paid}</strong><span>Amb pagament confirmat</span></div>
        <div><small>Invitacions</small><strong>{invited}</strong><span>Confirmades sense cobrament</span></div>
      </section>
      <div className="section-head registration-filters">
        <div className="filters">
          <Link href={`/admin/tournaments/${id}/registrations`} aria-current={!activeFilter ? "page" : undefined}>Totes</Link>
          {registrationFilters.map((filter) => (
            <Link key={filter} href={`/admin/tournaments/${id}/registrations?status=${filter}`} aria-current={activeFilter === filter ? "page" : undefined}>
              {registrationFilterLabels[filter]}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-card section-head">
        <div>
          <strong>Exportació per als àrbitres</strong>
          <p className="muted">Descarrega el filtre actual. Tria «Confirmades» per incloure les pagades i les invitacions.</p>
        </div>
        <ExportRegistrationsButton tournamentId={id} status={activeFilter} count={registrations.length} />
      </div>

      <ChallongePanel tournamentId={id} url={tournament.challongeUrl} configured={Boolean(getServerEnv().CHALLONGE_API_KEY)}
        confirmed={paid + invited} published={published} withdrawn={withdrawn} frozen={Boolean(tournament.challongePublishAttemptedAt) || published + withdrawn > 0}
        lastSynced={tournament.challongeLastSyncedAt ? new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" }).format(tournament.challongeLastSyncedAt) : null}
        lastError={tournament.challongeLastError} />

      <section className="admin-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Identificació</th>
              <th>Contacte</th>
              <th>Consentiments</th>
              <th>Estat / import</th>
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
                  {registration.challongeParticipantId && <><br /><small className="status">Publicat a Challonge</small></>}
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
                  <span className={`badge ${registration.status.toLowerCase()}`}>{registrationStatusLabels[registration.status]}</span><br />
                  <small>{registration.status === "INVITED" ? "Gratuïta · Sense cobrament" : formatMoney(registration.amountCents, registration.currency)}</small>
                </td>
                <td>{new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short" }).format(registration.createdAt)}</td>
                <td>
                  {(registration.status === "PAID" || registration.status === "INVITED") && (
                    <form action={resendConfirmation}>
                      <input type="hidden" name="id" value={registration.id} />
                      <button>{registration.confirmationEmailSentAt ? "Reenviar email" : "Enviar confirmació"}</button>
                      {registration.confirmationEmailLastError ? <p className="error">L’últim enviament ha fallat. Torna-ho a provar.</p> : registration.confirmationEmailSentAt ? <p className="muted">Confirmació enviada</p> : <p className="muted">Correu encara no enviat</p>}
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
