import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/public/locale-switcher";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

import styles from "./success.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = getMessages(locale).success;
  return { title: copy.metadataTitle, description: copy.metadataDescription, robots: { index: false, follow: false } };
}

export default async function Success() {
  const locale = await getLocale();
  const messages = getMessages(locale);
  const copy = getMessages(locale).success;

  return (
    <main className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label={copy.backAria}>
          <Image
            src="/brand/culdesac-logo.png"
            alt="Culdesac"
            width={220}
            height={145}
            priority
          />
        </Link>
        <div className={styles.headerActions}>
          <LocaleSwitcher locale={locale} returnTo="/registration/success" compact />
          <div className={styles.secureStatus}>
            <span aria-hidden="true">✓</span>
            {copy.secure}
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.pinkGlow} aria-hidden="true" />

        <div className={styles.copy}>
          <div className={styles.receiptBadge}>
            <span aria-hidden="true">✓</span>
            {copy.received}
          </div>

          <p className={styles.kicker}>{copy.kicker}</p>
          <h1 aria-label={`${copy.titleLead} ${copy.titleTail}`}>
            <span>{copy.titleLead}</span>
            {copy.titleTail}
          </h1>
          <p className={styles.intro}>{copy.intro}</p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/">
              {copy.back} <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.secondaryAction} href="/legal/terms">
              {copy.rules}
            </Link>
          </div>

          <p className={styles.helpText}>{copy.help}</p>
        </div>

        <aside className={styles.confirmationCard} aria-label={copy.statusAria}>
          <div className={styles.cardHeader}>
            <Image src="/brand/culdesac-mark.png" alt="" width={58} height={90} />
            <div>
              <span>{copy.placeStatus}</span>
              <strong>{copy.processing}</strong>
            </div>
            <span className={styles.cardCode}>01 / 01</span>
          </div>

          <div className={styles.cardTitle}>
            <p>{copy.nextStep}</p>
            <h2>{copy.prepare}</h2>
          </div>

          <ol className={styles.steps}>
            {copy.steps.map((step, index) => (
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
            <span>{copy.tagline}</span>
          </div>
        </aside>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>
          {[...copy.marquee, ...copy.marquee].map((item, index) => <span key={`${item}-${index}`}>{item}<i>✦</i></span>)}
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Culdesac</span>
        <nav aria-label={messages.footer.linksAria}>
          <Link href="/legal/terms">{messages.footer.terms}</Link>
          <Link href="/legal/privacy">{messages.footer.privacy}</Link>
        </nav>
      </footer>
    </main>
  );
}
