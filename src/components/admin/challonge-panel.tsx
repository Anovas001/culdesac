"use client";

import { useActionState } from "react";
import { manageChallonge } from "@/app/admin/challonge-actions";

type Props = {
  tournamentId: string;
  url: string | null;
  configured: boolean;
  confirmed: number;
  published: number;
  withdrawn: number;
  frozen: boolean;
  lastSynced: string | null;
  lastError: string | null;
};

export function ChallongePanel({ tournamentId, url, configured, confirmed, published, withdrawn, frozen, lastSynced, lastError }: Props) {
  const [state, action, pending] = useActionState(manageChallonge, {});
  const error = state.error ?? (state.message ? null : lastError);
  return (
    <section className="admin-card challonge-panel" aria-labelledby="challonge-title">
      <div className="section-head">
        <div>
          <p className="eyebrow">QUADRE DE COMPETICIÓ</p>
          <h2 id="challonge-title">Participants a Challonge</h2>
        </div>
        {url && <a className="button subtle-button" href={url} target="_blank" rel="noopener noreferrer">Obrir Challonge ↗</a>}
      </div>
      <p className="muted">Vincula el torneig suís que heu creat a Challonge i envia-hi els nicknames de Fortnite de totes les inscripcions pagades i convidades, independentment del filtre del llistat.</p>
      {!configured && <p className="invitation-notice">Challonge encara no està configurat. Afegeix <code>CHALLONGE_API_KEY</code> a l’entorn del servidor i recrea l’app. L’enllaç del torneig s’introdueix aquí.</p>}
      <form action={action} className="form" aria-busy={pending}>
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <label htmlFor="challonge-url">Enllaç del torneig a Challonge
          <input id="challonge-url" name="url" type="url" defaultValue={url ?? ""} placeholder="https://challonge.com/nom_del_torneig" maxLength={500} readOnly={frozen} disabled={pending} />
        </label>
        {!frozen && <div className="actions">
          <button name="operation" value="link" disabled={pending || !configured}>{pending ? "Processant…" : url ? "Actualitzar vincle" : "Vincular torneig"}</button>
          {url && <button className="subtle-button" name="operation" value="unlink" disabled={pending} formNoValidate>Desvincular</button>}
        </div>}
        {frozen && <small className="muted">El vincle es manté fix perquè ja s’ha iniciat un enviament de participants.</small>}
        <div className="challonge-summary" aria-label="Resum dels enviaments a Challonge">
          <span><strong>{published}</strong> publicats</span>
          <span><strong>{confirmed - published}</strong> pendents d’enviar</span>
          <span><strong>{confirmed}</strong> confirmats</span>
        </div>
        <div className="actions">
          <button name="operation" value="publish" disabled={pending || !configured || !url} formNoValidate>
            {pending ? "Processant…" : confirmed > published ? `Enviar participants (${confirmed - published})` : "Comprovar participants"}
          </button>
          <small className="muted">Els següents enviaments afegeixen només els participants nous.</small>
        </div>
      </form>
      {lastSynced && <p className="muted">Última comprovació completada: {lastSynced}</p>}
      {withdrawn > 0 && <p className="closed">Hi ha {withdrawn} inscripcions publicades que han deixat d’estar confirmades. Revisa-les a Challonge.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {state.message && <p className="status challonge-feedback" role="status">{state.message}</p>}
      <p className="muted challonge-footnote">L’enviament prepara la llista de participants. Revisa els seeds i inicia el torneig a Challonge; els àrbitres hi gestionaran els enfrontaments.</p>
    </section>
  );
}
