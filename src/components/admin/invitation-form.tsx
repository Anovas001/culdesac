"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveInvitation } from "@/app/admin/invitation-actions";

const fields = [
  { name: "fullName", label: "Nom i cognoms", type: "text", autoComplete: "name", maxLength: 120 },
  { name: "email", label: "Correu electrònic", type: "email", autoComplete: "email", maxLength: 254 },
  { name: "phone", label: "Telèfon", type: "tel", autoComplete: "tel", maxLength: 30 },
  { name: "dni", label: "DNI / NIE", type: "text", autoComplete: "off", maxLength: 20 },
  { name: "postalCode", label: "Codi postal", type: "text", autoComplete: "postal-code", maxLength: 5 },
  { name: "epicUsername", label: "Nickname de Fortnite", type: "text", autoComplete: "off", maxLength: 64 },
  { name: "discordUsername", label: "Usuari de Discord", type: "text", autoComplete: "off", maxLength: 100 },
];

export function InvitationForm({ tournamentId }: { tournamentId: string }) {
  const [state, action, pending] = useActionState(saveInvitation, {});
  const consents = [
    { name: "acceptedTerms", required: true, text: <>Confirmo que el participant m’ha autoritzat a inscriure’l i ha acceptat els <Link href="/legal/terms" target="_blank" rel="noopener noreferrer">termes i condicions</Link>, inclosa l’autorització del representant legal quan correspongui. *</> },
    { name: "acceptedPrivacy", required: true, text: <>Confirmo que he facilitat la <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer">política de privacitat</Link> al participant i que n’ha confirmat la lectura. *</> },
    { name: "acceptedMarketing", required: false, text: <>El participant ha autoritzat expressament rebre comunicacions comercials. Marca-ho només si disposes d’aquesta autorització separada.</> },
  ];
  return <form action={action} className="form invitation-form">
    <input type="hidden" name="tournamentId" value={tournamentId} />
    <p className="muted">Tots els camps de dades són obligatoris. La plaça es confirmarà immediatament com a invitació gratuïta.</p>
    <fieldset disabled={pending}>
      <legend className="eyebrow">DADES DEL PARTICIPANT</legend>
      <div className="two">
        {fields.map((field) => <label key={field.name} htmlFor={`invite-${field.name}`}>
          {field.label} *
          <input name={field.name} type={field.type} autoComplete={field.autoComplete} maxLength={field.maxLength} id={`invite-${field.name}`} required defaultValue={state.values?.[field.name] ?? ""} aria-invalid={Boolean(state.fieldErrors?.[field.name])} aria-describedby={state.fieldErrors?.[field.name] ? `error-${field.name}` : undefined} />
          {state.fieldErrors?.[field.name] && <span id={`error-${field.name}`} className="error">{state.fieldErrors[field.name]}</span>}
        </label>)}
      </div>
    </fieldset>
    <fieldset disabled={pending} className="form">
      <legend className="eyebrow">AUTORITZACIONS DEL PARTICIPANT</legend>
      {consents.map((consent) => <div key={consent.name}>
        <label className="check"><input type="checkbox" name={consent.name} required={consent.required} defaultChecked={state.values?.[consent.name] === "on"} aria-invalid={Boolean(state.fieldErrors?.[consent.name])} aria-describedby={state.fieldErrors?.[consent.name] ? `error-${consent.name}` : undefined} />{consent.text}</label>
        {state.fieldErrors?.[consent.name] && <p id={`error-${consent.name}`} className="error">{state.fieldErrors[consent.name]}</p>}
      </div>)}
    </fieldset>
    <div className="invitation-notice"><strong>Invitació · 0 € · Sense Stripe</strong><p>No s’enviarà cap correu automàticament. Un cop creada, podràs enviar la confirmació des del llistat d’inscripcions.</p></div>
    {state.error && <p className="error" role="alert">{state.error}</p>}
    <div className="actions"><button type="submit" disabled={pending} aria-busy={pending}>{pending ? "Creant invitació…" : "Crear invitació i confirmar plaça"}</button><Link href={`/admin/tournaments/${tournamentId}/registrations`}>Tornar al llistat</Link></div>
  </form>;
}
