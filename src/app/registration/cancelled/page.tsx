import type { Metadata } from "next";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/public/locale-switcher";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

import styles from "./cancelled.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const copy = getMessages(locale).cancelled;
  return { title: copy.eyebrow, description: copy.description, robots: { index: false, follow: false } };
}

export default async function Cancelled() {
  const locale = await getLocale();
  const copy = getMessages(locale).cancelled;

  return (
    <main className={`${styles.page} shell`}>
      <div className={styles.locale}><LocaleSwitcher locale={locale} returnTo="/registration/cancelled" /></div>
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <Link className="button" href="/">{copy.action}</Link>
    </main>
  );
}
