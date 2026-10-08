"use client";

import Link from "next/link";
import { useActionState } from "react";
import { removeRegistration, saveRegistrationEdit } from "@/app/admin/registration-actions";

const fields = [
  { name: "fullName", label: "Nom i cognoms", maxLength: 120 },
  { name: "epicUsername", label: "Nickname de Fortnite", maxLength: 64 },
  { name: "discordUsername", label: "Usuari de Discord", maxLength: 100 },
] as const;
type EditableRegistration = { id: string; fullName: string; epicUsername: string; discordUsername: string };

export function RegistrationEditForm({ tournamentId, registration }: { tournamentId: string; registration: EditableRegistration }) {
  const [state, action, pending] = useActionState(saveRegistrationEdit, {});
  return <form action={action} className="form registration-edit-form">
    <input type="hidden" name="tournamentId" value={tournamentId} />
    <input type="hidden" name="registrationId" value={registration.id} />
    <fieldset disabled={pending} className="form">
      <legend className="eyebrow">DADES DEL PARTICIPANT</legend>
      {fields.map((field) => <label key={field.name} htmlFor={`edit-${field.name}`}>
        {field.label} *
        <input id={`edit-${field.name}`} name={field.name} required maxLength={field.maxLength} defaultValue={state.values?.[field.name] ?? registration[field.name]} autoComplete="off" aria-invalid={Boolean(state.fieldErrors?.[field.name])} aria-describedby={state.fieldErrors?.[field.name] ? `edit-error-${field.name}` : undefined} />
        {state.fieldErrors?.[field.name] && <span className="error" id={`edit-error-${field.name}`}>{state.fieldErrors[field.name]}</span>}
      </label>)}
    </fieldset>
    <p className="muted">Desa les correccions abans d’enviar la llista definitiva a Challonge. Es mantenen el pagament i la resta de dades de la inscripció.</p>
    {state.error && <p className="error" role="alert">{state.error}</p>}
    <div className="actions"><button type="submit" disabled={pending} aria-busy={pending}>{pending ? "Desant…" : "Desar canvis"}</button><Link href={`/admin/tournaments/${tournamentId}/registrations`}>Tornar al llistat</Link></div>
  </form>;
}

export function RegistrationDeleteForm({ tournamentId, registrationId }: { tournamentId: string; registrationId: string }) {
  const [state, action, pending] = useActionState(removeRegistration, {});
  return <form action={action} className="form">
    <input type="hidden" name="tournamentId" value={tournamentId} />
    <input type="hidden" name="registrationId" value={registrationId} />
    <div className="deletion-notice"><strong>Eliminació definitiva</strong><p>S’esborrarà aquesta participació de Culdesac i deixarà de comptar al llistat i a l’aforament. Aquesta acció no fa cap reemborsament ni elimina participants de Challonge.</p></div>
    <label className="check"><input type="checkbox" name="confirmed" required disabled={pending} />Confirmo que vull eliminar definitivament aquesta participació.</label>
    {state.error && <p className="error" role="alert">{state.error}</p>}
    <div className="actions"><button type="submit" className="danger-button" disabled={pending} aria-busy={pending}>{pending ? "Eliminant…" : "Eliminar definitivament"}</button><Link href={`/admin/tournaments/${tournamentId}/registrations`}>Cancel·lar i tornar al llistat</Link></div>
  </form>;
}
