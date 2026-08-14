import type { Metadata } from "next";

import { privacyDocument } from "@/lib/legal-documents";

import { LegalDocument } from "../legal-document";

export const metadata: Metadata = {
  title: "Política de privacitat",
  description: "Informació sobre el tractament de dades personals a Culdesac.",
};

export default function PrivacyPage() {
  return <LegalDocument document={privacyDocument} />;
}
