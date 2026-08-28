import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

import styles from "./locale-switcher.module.css";

type LocaleSwitcherProps = {
  locale: Locale;
  returnTo: string;
  compact?: boolean;
};

export function LocaleSwitcher({ locale, returnTo, compact = false }: LocaleSwitcherProps) {
  const labels = getMessages(locale).language;
  const encodedReturnTo = encodeURIComponent(returnTo);

  return (
    <nav className={`${styles.switcher} ${compact ? styles.compact : ""}`} aria-label={labels.label}>
      <a
        className={locale === "ca" ? styles.active : undefined}
        href={`/api/locale?locale=ca&returnTo=${encodedReturnTo}`}
        aria-current={locale === "ca" ? "true" : undefined}
        aria-label={labels.catalan}
      >
        <span className={styles.catalanFlag} aria-hidden="true" />
        <span>CAT</span>
      </a>
      <a
        className={locale === "es" ? styles.active : undefined}
        href={`/api/locale?locale=es&returnTo=${encodedReturnTo}`}
        aria-current={locale === "es" ? "true" : undefined}
        aria-label={labels.spanish}
      >
        <span className={styles.spanishFlag} aria-hidden="true" />
        <span>ES</span>
      </a>
    </nav>
  );
}
