import type { Metadata } from "next";

import { getLocale } from "@/lib/i18n/server";
import { getTermsDocument } from "@/lib/legal-documents";

import { LegalDocument } from "../legal-document";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const document = getTermsDocument(locale);
  return { title: document.title, description: document.description };
}

export default async function TermsPage() {
  const locale = await getLocale();
  return <LegalDocument document={getTermsDocument(locale)} locale={locale} returnTo="/legal/terms" />;
}
