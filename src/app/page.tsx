import Image from "next/image";

import { RegistrationForm } from "@/components/public/registration-form";
import { buildPublicTournamentView } from "@/lib/public-tournament";
import { getActiveTournament } from "@/services/tournaments/active";
import { prismaActiveTournamentRepository } from "@/services/tournaments/repository";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const dateTimeFormatter = (date: Date) => date.toISOString();

export default async function Home() {
  const tournament = await getActiveTournament(prismaActiveTournamentRepository);

  if (!tournament) {
    return (
      <main className={styles.emptyState}>
        <div className={styles.emptyBackdrop} />
        <Image
          className={styles.emptyLogo}
          src="/brand/culdesac-logo.webp"
          alt="Culdesac"
          width={560}
          height={368}
          priority
        />
        <p className={styles.kicker}>Pròxima competició</p>
        <h1>El següent repte<br />ja s’està preparant.</h1>
        <p>Torna aviat. Anunciarem aquí el pròxim torneig Culdesac.</p>
      </main>
    );
  }

  const publicView = buildPublicTournamentView(
    tournament,
    process.env.APP_TIMEZONE ?? "Europe/Madrid",
  );
  const rules = tournament.rules
    .split(/\r?\n/)
    .map((rule) => rule.trim())
    .filter(Boolean);

  return (
    <main className={styles.site}>
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="#inici" aria-label="Culdesac, inici">
          <Image src="/brand/culdesac-logo.webp" alt="Culdesac" width={220} height={145} priority />
        </a>
        <nav className={styles.nav} aria-label="Navegació principal">
          <a href="#torneig">Torneig</a>
          <a href="#format">Com funciona</a>
          <a href="#inscripcio">Inscripció</a>
        </nav>
        {publicView.isOpen && (
          <a className={styles.headerCta} href="#inscripcio">
            Vull competir
            <span aria-hidden="true">↘</span>
          </a>
        )}
      </header>

      <section className={styles.hero} id="inici">
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <div className={styles.liveBadge}>
            <span aria-hidden="true" />
            {publicView.statusLabel}
          </div>
          <p className={styles.kicker}>Culdesac presenta · Fortnite online</p>
          <h1>{tournament.headline}</h1>
          <p className={styles.heroDescription}>{tournament.description}</p>

          <div className={styles.heroActions}>
            {publicView.isOpen && (
              <a className={styles.primaryCta} href="#inscripcio">
                Inscriu-m’hi · {publicView.priceLabel}
                <span aria-hidden="true">↘</span>
              </a>
            )}
            <a className={styles.secondaryCta} href="#torneig">
              Veure el torneig
            </a>
          </div>

          <dl className={styles.heroStats}>
            <div>
              <dt>Data</dt>
              <dd><time dateTime={dateTimeFormatter(tournament.eventDate)}>{publicView.dateLabel}</time></dd>
            </div>
            <div>
              <dt>Entrada</dt>
              <dd>{publicView.priceLabel}</dd>
            </div>
            {publicView.capacityLabel && (
              <div>
                <dt>Quadre</dt>
                <dd>{publicView.capacityLabel}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className={styles.heroVisual} aria-label="Jugadors de Fortnite preparats per competir">
          <div
            className={`${styles.characterStage} ${tournament.heroImageUrl ? styles.customHero : ""}`}
            style={tournament.heroImageUrl ? { backgroundImage: `url(${tournament.heroImageUrl})` } : undefined}
          >
            {!tournament.heroImageUrl && (
              <Image
                src="/brand/fortnite-duo.webp"
                alt="Dos personatges de Fortnite"
                fill
                sizes="(max-width: 900px) 92vw, 48vw"
                className={styles.characters}
                priority
              />
            )}
          </div>
          <div className={styles.eventPlate}>
            <span>Pròxim torneig</span>
            <strong>{tournament.name}</strong>
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <Image src="/brand/culdesac-mark.webp" alt="" width={170} height={262} />
          </div>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>
          <span>COMPETEIX</span><i>✦</i><span>SUPERA EL QUADRE</span><i>✦</i><span>ARRIBA A LA FINAL</span><i>✦</i>
          <span>COMPETEIX</span><i>✦</i><span>SUPERA EL QUADRE</span><i>✦</i><span>ARRIBA A LA FINAL</span><i>✦</i>
        </div>
      </div>

      <section className={styles.tournamentSection} id="torneig">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionIndex}>01 / TORNEIG ACTIU</p>
          <h2>No és una partida més.<br /><span>És el teu torn.</span></h2>
        </div>

        <div className={styles.tournamentGrid}>
          <article className={styles.tournamentCard}>
            <div className={styles.cardTopline}>
              <span>{publicView.statusLabel}</span>
              <span>Online</span>
            </div>
            <p className={styles.cardLabel}>Proper enfrontament</p>
            <h3>{tournament.name}</h3>
            <p>{tournament.description}</p>
            <dl className={styles.cardFacts}>
              <div>
                <dt>Quan</dt>
                <dd>{publicView.dateLabel}</dd>
              </div>
              <div>
                <dt>Accés</dt>
                <dd>{publicView.priceLabel}</dd>
              </div>
              {publicView.capacityLabel && (
                <div>
                  <dt>Places</dt>
                  <dd>{publicView.capacityLabel}</dd>
                </div>
              )}
            </dl>
            {publicView.isOpen && (
              <a href="#inscripcio" className={styles.cardCta}>
                Reservar la meva plaça <span aria-hidden="true">→</span>
              </a>
            )}
          </article>

          <aside className={styles.rulesPanel}>
            <p className={styles.cardLabel}>Abans d’entrar</p>
            <h3>Regles clares.<br />Un sol objectiu.</h3>
            <div className={styles.rulesList}>
              {(rules.length ? rules : ["Consulta les normes definitives abans de competir."]).map((rule, index) => (
                <div key={`${rule}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.formatSection} id="format">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionIndex}>02 / COM FUNCIONA</p>
          <h2>Entra. Competeix.<br /><span>Fes-te un lloc.</span></h2>
        </div>
        <div className={styles.steps}>
          <article>
            <span>01</span>
            <div className={styles.stepIcon} aria-hidden="true">↳</div>
            <h3>Inscriu-te</h3>
            <p>Deixa les teves dades, confirma l’entrada i assegura la plaça.</p>
          </article>
          <article>
            <span>02</span>
            <div className={styles.stepIcon} aria-hidden="true">⚔</div>
            <h3>Rep l’accés</h3>
            <p>T’enviarem la confirmació i tota la informació necessària per competir.</p>
          </article>
          <article>
            <span>03</span>
            <div className={styles.stepIcon} aria-hidden="true">♛</div>
            <h3>Demostra-ho</h3>
            <p>Entra al torneig, supera cada rival i avança fins al final.</p>
          </article>
        </div>
      </section>

      <section className={styles.registrationSection} id="inscripcio">
        <div className={styles.registrationIntro}>
          <p className={styles.sectionIndex}>03 / INSCRIPCIÓ</p>
          <h2>{publicView.isOpen ? <>La plaça és teva.<br /><span>Si la guanyes.</span></> : <>Aquest repte<br /><span>ja està tancat.</span></>}</h2>
          <p>
            {publicView.isOpen
              ? `Completa el registre. El pagament de ${publicView.priceLabel} es farà de forma segura a Stripe.`
              : "Les inscripcions d’aquest torneig ja no estan disponibles."}
          </p>
          <div className={styles.registrationTrust}>
            <span>Pagament segur</span>
            <span>Confirmació per correu</span>
            <span>Dades protegides</span>
          </div>
        </div>

        {publicView.isOpen ? (
          <RegistrationForm priceLabel={publicView.priceLabel} />
        ) : (
          <div className={styles.closedCard}>
            <Image src="/brand/culdesac-mark.webp" alt="" width={120} height={185} />
            <p>{publicView.statusLabel}</p>
            <span>Segueix Culdesac per assabentar-te del pròxim torneig.</span>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image src="/brand/culdesac-logo.webp" alt="Culdesac" width={260} height={171} />
          <p>Competició online. Rivalitat real.</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="#torneig">Torneig</a>
          <a href="#format">Com funciona</a>
          <a href="/legal/terms">Termes</a>
          <a href="/legal/privacy">Privacitat</a>
        </div>
        <div className={styles.footerMeta}>
          <span>© {new Date().getFullYear()} Culdesac</span>
          <span>Esdeveniment independent</span>
        </div>
      </footer>

      {publicView.isOpen && (
        <a href="#inscripcio" className={styles.mobileCta}>
          Inscriu-m’hi <span>{publicView.priceLabel}</span>
        </a>
      )}
    </main>
  );
}
