import Image from "next/image";
import Link from "next/link";

import type { LegalDocument as LegalDocumentData } from "@/lib/legal-documents";

import styles from "./legal.module.css";

export function LegalDocument({ document }: { document: LegalDocumentData }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Tornar a Culdesac">
          <Image src="/brand/culdesac-logo.webp" alt="Culdesac" width={176} height={62} priority />
        </Link>
        <Link className={styles.back} href="/">← Tornar a l’inici</Link>
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
            <strong>Esborrany pendent de completar</strong>
            <p>Els camps entre dobles claudàtors necessiten dades o decisions de l’organitzador. Aquest text s’ha de revisar jurídicament abans de publicar-lo com a versió definitiva.</p>
          </div>
        </aside>
      )}

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label={`Índex de ${document.title}`}>
          <span>En aquesta pàgina</span>
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
            <h2>Fonts oficials de referència</h2>
            <p>Aquest esborrany s’ha estructurat a partir de normativa i guies oficials. La versió final ha de reflectir la realitat operativa de l’organitzador.</p>
            <ul>
              {document.references.map((reference) => (
                <li key={reference.href}><a href={reference.href} target="_blank" rel="noreferrer">{reference.label} ↗</a></li>
              ))}
            </ul>
          </aside>
        </article>
      </div>

      <footer className={styles.footer}>
        <Image src="/brand/culdesac-mark.webp" alt="" width={38} height={59} />
        <p>Culdesac · Competicions online</p>
        <div><Link href="/legal/terms">Termes</Link><Link href="/legal/privacy">Privacitat</Link></div>
      </footer>
    </main>
  );
}
