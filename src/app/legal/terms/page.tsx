import type { Metadata } from "next";

import { termsDocument } from "@/lib/legal-documents";

import { LegalDocument } from "../legal-document";

export const metadata: Metadata = {
  title: "Termes i condicions",
  description: "Termes d’inscripció i participació als tornejos Culdesac.",
};

export default function TermsPage() {
  return <LegalDocument document={termsDocument} />;
}
