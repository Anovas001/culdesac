import type { Tournament } from "@/generated/prisma/client";
import { saveTournament } from "@/app/admin/actions";

import styles from "./tournament-form.module.css";

export function TournamentForm({ tournament }: { tournament?: Tournament }) {
  const t = tournament;

  return (
    <form action={saveTournament} className="card form">
      <input type="hidden" name="id" value={t?.id ?? ""} />

      <fieldset className={styles.section}>
        <legend>Configuració general</legend>
        <div className="two">
          <label>
            Nom
            <input name="name" defaultValue={t?.name} required />
          </label>
          <label>
            Slug
            <input name="slug" defaultValue={t?.slug} required />
          </label>
        </div>
        <label>
          Titular
          <input name="headline" defaultValue={t?.headline} required />
        </label>
        <label>
          Data i hora
          <input
            name="eventDate"
            type="datetime-local"
            defaultValue={t ? new Date(t.eventDate).toISOString().slice(0, 16) : ""}
            required
          />
        </label>
        <div className="two">
          <label>
            Preu (cèntims)
            <input name="priceCents" type="number" min="1" defaultValue={t?.priceCents ?? 1500} required />
          </label>
          <label>
            Moneda
            <input name="currency" defaultValue={t?.currency ?? "eur"} maxLength={3} required />
          </label>
        </div>
        <div className="two">
          <label>
            Capacitat (opcional)
            <input name="capacity" type="number" min="1" defaultValue={t?.capacity ?? ""} />
          </label>
          <label>
            Estat
            <select name="status" defaultValue={t?.status ?? "DRAFT"}>
              {["DRAFT", "OPEN", "CLOSED", "COMPLETED"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          URL imatge hero (opcional)
          <input name="heroImageUrl" type="url" defaultValue={t?.heroImageUrl ?? ""} />
        </label>
        <label>
          Descripció
          <textarea name="description" defaultValue={t?.description} required />
        </label>
        <label>
          Normes
          <textarea name="rules" defaultValue={t?.rules} required />
        </label>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Traducció al castellà</legend>
        <div className={styles.sectionHeader}>
          <strong>Contingut visible quan l’usuari selecciona ES</strong>
          <span>Tots els camps són opcionals. Si en deixes un buit, la web mostrarà automàticament la versió catalana.</span>
        </div>
        <label>
          Nom en castellà (opcional)
          <input name="nameEs" defaultValue={t?.nameEs ?? ""} />
        </label>
        <label>
          Titular en castellà (opcional)
          <input name="headlineEs" defaultValue={t?.headlineEs ?? ""} />
        </label>
        <label>
          Descripció en castellà (opcional)
          <textarea name="descriptionEs" defaultValue={t?.descriptionEs ?? ""} />
        </label>
        <label>
          Normes en castellà (opcional)
          <textarea name="rulesEs" defaultValue={t?.rulesEs ?? ""} />
        </label>
        <span className={styles.hint}>La traducció es pot completar o modificar en qualsevol moment des d’aquest mateix formulari.</span>
      </fieldset>

      <button className={styles.submit}>Desar torneig</button>
    </form>
  );
}
