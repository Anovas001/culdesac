import Image from "next/image";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/public/locale-switcher";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import type { LegalDocument as LegalDocumentData } from "@/lib/legal-documents";

import styles from "./legal.module.css";

export function LegalDocument({ document, locale, returnTo }: { document: LegalDocumentData; locale: Locale; returnTo: string }) {
  const copy = getMessages(locale).legal;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label={copy.backAria}>
          <Image src="/brand/culdesac-logo.png" alt="Culdesac" width={176} height={62} priority />
        </Link>
        <div className={styles.headerActions}>
          <LocaleSwitcher locale={locale} returnTo={returnTo} compact />
          <Link className={styles.back} href="/">← {copy.backHome}</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <p className={styles.eyebrow}>{document.eyebrow}</p>
        <h1>{document.title}</h1>
        <p className={styles.intro}>{document.description}</p>
        <p className={styles.version}>{document.version}</p>
      </section>

      {document.isDraft && (
        <aside className={styles.draftNotice} role="note">
          <span aria-hidden="true">!</span>
          <div>
            <strong>{copy.draftTitle}</strong>
            <p>{copy.draftDescription}</p>
          </div>
        </aside>
      )}

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label={copy.indexAria(document.title)}>
          <span>{copy.onThisPage}</span>
          <ol>
            {document.sections.map((section) => (
              <li key={section.id}><a href={`#${section.id}`}>{section.title.replace(/^\d+\.\s*/, "")}</a></li>
            ))}
          </ol>
        </nav>

        <article className={styles.document}>
          {document.sections.map((section) => (
            <section id={section.id} key={section.id} className={styles.section}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          <aside className={styles.sources}>
            <h2>{copy.sources}</h2>
            <p>{copy.sourcesDescription}</p>
            <ul>
              {document.references.map((reference) => (
                <li key={reference.href}><a href={reference.href} target="_blank" rel="noreferrer">{reference.label} ↗</a></li>
              ))}
            </ul>
          </aside>
        </article>
      </div>

      <footer className={styles.footer}>
        <Image src="/brand/culdesac-mark.png" alt="" width={38} height={59} />
        <p>{copy.tagline}</p>
        <div><Link href="/legal/terms">{copy.terms}</Link><Link href="/legal/privacy">{copy.privacy}</Link></div>
      </footer>
    </main>
  );
}
