import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import styles from "./success.module.css";

export const metadata: Metadata = {
  title: "Pagament rebut",
  description: "El pagament de la teva inscripció a Culdesac s’ha completat correctament.",
  robots: { index: false, follow: false },
};

const confirmationSteps = [
  {
    title: "Pagament rebut",
    description: "Stripe ha completat el pagament de manera segura.",
  },
  {
    title: "Confirmació automàtica",
    description: "Estem validant la plaça i preparant els detalls de la inscripció.",
  },
  {
    title: "Revisa el teu correu",
    description: "T’hi enviarem la confirmació i la informació necessària per competir.",
  },
];

export default function Success() {
  return (
    <main className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Tornar a Culdesac">
          <Image
            src="/brand/culdesac-logo.webp"
            alt="Culdesac"
            width={220}
            height={145}
            priority
          />
        </Link>
        <div className={styles.secureStatus}>
          <span aria-hidden="true">✓</span>
          Pagament segur completat
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.pinkGlow} aria-hidden="true" />

        <div className={styles.copy}>
          <div className={styles.receiptBadge}>
            <span aria-hidden="true">✓</span>
            Pagament rebut
          </div>

          <p className={styles.kicker}>Inscripció completada · Culdesac</p>
          <h1 aria-label="Ja ets dins del quadre.">
            <span>Ja ets dins</span>
            del quadre.
          </h1>
          <p className={styles.intro}>
            Hem rebut el pagament i estem acabant de confirmar la teva plaça. En uns instants
            rebràs un correu amb el comprovant i tota la informació de la inscripció.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/">
              Tornar a Culdesac <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.secondaryAction} href="/legal/terms">
              Consultar les normes
            </Link>
          </div>

          <p className={styles.helpText}>
            El correu pot trigar uns minuts. Si no el veus, revisa també la carpeta de correu
            brossa.
          </p>
        </div>

        <aside className={styles.confirmationCard} aria-label="Estat de la inscripció">
          <div className={styles.cardHeader}>
            <Image src="/brand/culdesac-mark.webp" alt="" width={58} height={90} />
            <div>
              <span>Estat de la plaça</span>
              <strong>En procés</strong>
            </div>
            <span className={styles.cardCode}>01 / 01</span>
          </div>

          <div className={styles.cardTitle}>
            <p>El següent pas</p>
            <h2>Prepara’t per competir.</h2>
          </div>

          <ol className={styles.steps}>
            {confirmationSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.cardFooter}>
            <span>Culdesac</span>
            <span>Competició online · Rivalitat real</span>
          </div>
        </aside>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>
          <span>PAGAMENT COMPLETAT</span><i>✦</i><span>PLAÇA EN PROCÉS</span><i>✦</i><span>ENS VEIEM AL QUADRE</span><i>✦</i>
          <span>PAGAMENT COMPLETAT</span><i>✦</i><span>PLAÇA EN PROCÉS</span><i>✦</i><span>ENS VEIEM AL QUADRE</span><i>✦</i>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Culdesac</span>
        <nav aria-label="Enllaços legals">
          <Link href="/legal/terms">Termes</Link>
          <Link href="/legal/privacy">Privacitat</Link>
        </nav>
      </footer>
    </main>
  );
}
