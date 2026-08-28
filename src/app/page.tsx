import Image from "next/image";

import { LocaleSwitcher } from "@/components/public/locale-switcher";
import { RegistrationForm } from "@/components/public/registration-form";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { localizeTournament } from "@/lib/i18n/tournament";
import { buildPublicTournamentView } from "@/lib/public-tournament";
import { getActiveTournament } from "@/services/tournaments/active";
import { prismaActiveTournamentRepository } from "@/services/tournaments/repository";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const dateTimeFormatter = (date: Date) => date.toISOString();

export default async function Home() {
  const [locale, tournament] = await Promise.all([
    getLocale(),
    getActiveTournament(prismaActiveTournamentRepository),
  ]);
  const copy = getMessages(locale);

  if (!tournament) {
    return (
      <main className={styles.emptyState}>
        <div className={styles.emptyBackdrop} />
        <div className={styles.emptyLocale}><LocaleSwitcher locale={locale} returnTo="/" /></div>
        <Image
          className={styles.emptyLogo}
          src="/brand/culdesac-logo.webp"
          alt="Culdesac"
          width={560}
          height={368}
          priority
        />
        <p className={styles.kicker}>{copy.empty.kicker}</p>
        <h1>{copy.empty.title}</h1>
        <p>{copy.empty.description}</p>
      </main>
    );
  }

  const publicView = buildPublicTournamentView(
    tournament,
    process.env.APP_TIMEZONE ?? "Europe/Madrid",
    locale,
  );
  const tournamentCopy = localizeTournament(tournament, locale);
  const rules = tournamentCopy.rules
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
        <nav className={styles.nav} aria-label={copy.navigation.aria}>
          <a href="#torneig">{copy.navigation.tournament}</a>
          <a href="#format">{copy.navigation.format}</a>
          <a href="#inscripcio">{copy.navigation.registration}</a>
        </nav>
        <div className={styles.headerActions}>
          <LocaleSwitcher locale={locale} returnTo="/" compact />
          {publicView.isOpen && (
            <a className={styles.headerCta} href="#inscripcio">
              {copy.navigation.compete}
              <span aria-hidden="true">↘</span>
            </a>
          )}
        </div>
      </header>

      <section className={styles.hero} id="inici">
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <div className={styles.liveBadge}>
            <span aria-hidden="true" />
            {publicView.statusLabel}
          </div>
          <p className={styles.kicker}>{copy.hero.kicker}</p>
          <h1>
            <span>{copy.hero.gameLine}</span>
            {copy.hero.challengeLine}
          </h1>
          <p className={styles.heroDescription}>{copy.hero.description}</p>

          <div className={styles.heroActions}>
            {publicView.isOpen && (
              <a className={styles.primaryCta} href="#inscripcio">
                {copy.hero.primaryAction(publicView.priceLabel)}
                <span aria-hidden="true">↘</span>
              </a>
            )}
            <a className={styles.secondaryCta} href="#torneig">
              {copy.hero.secondaryAction}
            </a>
          </div>

          <dl className={styles.heroStats}>
            <div>
              <dt>{copy.hero.date}</dt>
              <dd><time dateTime={dateTimeFormatter(tournament.eventDate)}>{publicView.dateLabel}</time></dd>
            </div>
            <div>
              <dt>{copy.hero.prize}</dt>
              <dd>{copy.hero.prizeValue}</dd>
            </div>
            <div>
              <dt>{copy.hero.entry}</dt>
              <dd>{publicView.priceLabel}</dd>
            </div>
            {publicView.capacityLabel && (
              <div>
                <dt>{copy.hero.bracket}</dt>
                <dd>{publicView.capacityLabel}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className={styles.heroVisual} role="img" aria-label={copy.hero.visualAria}>
          <div
            className={`${styles.characterStage} ${tournament.heroImageUrl ? styles.customHero : ""}`}
            style={tournament.heroImageUrl ? { backgroundImage: `url(${tournament.heroImageUrl})` } : undefined}
          >
            {!tournament.heroImageUrl && (
              <Image
                src="/brand/fortnite-duo.webp"
                alt={copy.hero.charactersAlt}
                fill
                sizes="(max-width: 900px) 92vw, 48vw"
                className={styles.characters}
                priority
              />
            )}
          </div>
          <div className={styles.eventPlate}>
            <span>{publicView.isOpen ? copy.hero.openNow : publicView.statusLabel}</span>
            <strong>{tournamentCopy.name}</strong>
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <Image src="/brand/culdesac-mark.webp" alt="" width={170} height={262} />
          </div>
        </div>
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>
          {[...copy.marquee, ...copy.marquee].map((item, index) => <span key={`${item}-${index}`}>{item}<i>✦</i></span>)}
        </div>
      </div>

      <section className={styles.tournamentSection} id="torneig">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionIndex}>{copy.tournament.index}</p>
          <h2>{copy.tournament.title}<br /><span>{copy.tournament.titleAccent}</span></h2>
        </div>

        <div className={styles.tournamentGrid}>
          <article className={styles.tournamentCard}>
            <div className={styles.cardTopline}>
              <span>{publicView.statusLabel}</span>
              <span>{copy.tournament.online}</span>
            </div>
            <p className={styles.cardLabel}>{copy.tournament.nextMatch}</p>
            <h3>{tournamentCopy.name}</h3>
            <p>{tournamentCopy.description}</p>
            <dl className={styles.cardFacts}>
              <div>
                <dt>{copy.tournament.when}</dt>
                <dd>{publicView.dateLabel}</dd>
              </div>
              <div>
                <dt>{copy.tournament.access}</dt>
                <dd>{publicView.priceLabel}</dd>
              </div>
              {publicView.capacityLabel && (
                <div>
                  <dt>{copy.tournament.places}</dt>
                  <dd>{publicView.capacityLabel}</dd>
                </div>
              )}
            </dl>
            {publicView.isOpen && (
              <a href="#inscripcio" className={styles.cardCta}>
                {copy.tournament.reserve} <span aria-hidden="true">→</span>
              </a>
            )}
          </article>

          <aside className={styles.rulesPanel}>
            <p className={styles.cardLabel}>{copy.tournament.beforeEntering}</p>
            <h3>{copy.tournament.rulesTitle}</h3>
            <div className={styles.rulesList}>
              {(rules.length ? rules : [copy.tournament.rulesFallback]).map((rule, index) => (
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
          <p className={styles.sectionIndex}>{copy.format.index}</p>
          <h2>{copy.format.title}<br /><span>{copy.format.titleAccent}</span></h2>
        </div>
        <div className={styles.steps}>
          {copy.format.steps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.stepIcon} aria-hidden="true">{["↳", "⚔", "♛"][index]}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.registrationSection} id="inscripcio">
        <div className={styles.registrationIntro}>
          <p className={styles.sectionIndex}>{copy.registrationSection.index}</p>
          <h2>{publicView.isOpen ? <>{copy.registrationSection.openTitle}<br /><span>{copy.registrationSection.openAccent}</span></> : <>{copy.registrationSection.closedTitle}<br /><span>{copy.registrationSection.closedAccent}</span></>}</h2>
          <p>
            {publicView.isOpen
              ? copy.registrationSection.openDescription(publicView.priceLabel)
              : copy.registrationSection.closedDescription}
          </p>
          <div className={styles.registrationTrust}>
            {copy.registrationSection.trust.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>

        {publicView.isOpen ? (
          <RegistrationForm priceLabel={publicView.priceLabel} locale={locale} />
        ) : (
          <div className={styles.closedCard}>
            <Image src="/brand/culdesac-mark.webp" alt="" width={120} height={185} />
            <p>{publicView.statusLabel}</p>
            <span>{copy.registrationSection.closedFollow}</span>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Image src="/brand/culdesac-logo.webp" alt="Culdesac" width={260} height={171} />
          <p>{copy.footer.tagline}</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="#torneig">{copy.footer.tournament}</a>
          <a href="#format">{copy.footer.format}</a>
          <a href="/legal/terms">{copy.footer.terms}</a>
          <a href="/legal/privacy">{copy.footer.privacy}</a>
        </div>
        <div className={styles.footerMeta}>
          <span>© {new Date().getFullYear()} Culdesac</span>
          <span>{copy.footer.independent}</span>
        </div>
      </footer>

      {publicView.isOpen && (
        <a href="#inscripcio" className={styles.mobileCta}>
          {copy.footer.mobileAction} <span>{publicView.priceLabel}</span>
        </a>
      )}
    </main>
  );
}
