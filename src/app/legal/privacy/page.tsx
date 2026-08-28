import type { Metadata } from "next";

import { getLocale } from "@/lib/i18n/server";
import { getPrivacyDocument } from "@/lib/legal-documents";

import { LegalDocument } from "../legal-document";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const document = getPrivacyDocument(locale);
  return { title: document.title, description: document.description };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  return <LegalDocument document={getPrivacyDocument(locale)} locale={locale} returnTo="/legal/privacy" />;
}
