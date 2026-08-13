"use client";

import { useState } from "react";

import styles from "./registration-form.module.css";

type RegistrationFormProps = {
  priceLabel: string;
};

export function RegistrationForm({ priceLabel }: RegistrationFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    const body = {
      ...Object.fromEntries(formData),
      acceptedTerms: formData.get("acceptedTerms") === "on",
      acceptedPrivacy: formData.get("acceptedPrivacy") === "on",
    };

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "No s’ha pogut iniciar el pagament.");
      }
      window.location.assign(data.url);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error inesperat.");
      setLoading(false);
    }
  }

  return (
    <form action={submit} className={styles.form}>
      <div className={styles.heading}>
        <span>Registre de jugador</span>
        <h3>Reserva la teva plaça</h3>
        <p>Tots els camps marcats amb * són obligatoris.</p>
      </div>

      {error && <p className={styles.error} role="alert" aria-live="polite">{error}</p>}

      <div className={styles.fields}>
        <label>
          <span>Nom complet *</span>
          <input name="fullName" autoComplete="name" placeholder="El teu nom i cognoms" required />
        </label>
        <label>
          <span>Correu electrònic *</span>
          <input name="email" type="email" autoComplete="email" placeholder="tu@correu.cat" required />
        </label>
        <label>
          <span>Usuari d’Epic Games *</span>
          <input name="epicUsername" autoComplete="off" placeholder="El teu nom dins del joc" required />
        </label>
        <label>
          <span>Usuari de Discord</span>
          <input name="discordUsername" autoComplete="off" placeholder="usuari" />
        </label>
        <label className={styles.wideField}>
          <span>Telèfon</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="600 000 000" />
        </label>
      </div>

      <div className={styles.consents}>
        <label>
          <input name="acceptedTerms" type="checkbox" required />
          <span>Accepto els <a href="/legal/terms" target="_blank">termes i condicions</a> del torneig.</span>
        </label>
        <label>
          <input name="acceptedPrivacy" type="checkbox" required />
          <span>He llegit i accepto la <a href="/legal/privacy" target="_blank">política de privacitat</a>.</span>
        </label>
      </div>

      <button disabled={loading} type="submit">
        <span>{loading ? "Preparant el pagament…" : `Pagar ${priceLabel} i reservar plaça`}</span>
        <span aria-hidden="true">↗</span>
      </button>
      <p className={styles.secureNote}>
        <span aria-hidden="true">◆</span>
        Pagament processat de forma segura per Stripe
      </p>
    </form>
  );
}
