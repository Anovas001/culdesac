import { describe, expect, it } from "vitest";

import { getPrivacyDocument, getTermsDocument, privacyDocument, termsDocument } from "./legal-documents";

function documentText(document: typeof termsDocument): string {
  return document.sections
    .flatMap((section) => [section.title, ...section.paragraphs, ...(section.items ?? [])])
    .join(" ");
}

describe("legal document drafts", () => {
  it("covers the material tournament and purchase terms", () => {
    const ids = termsDocument.sections.map((section) => section.id);

    expect(ids).toEqual(expect.arrayContaining([
      "organizer",
      "registration",
      "payment",
      "withdrawal",
      "competition-rules",
      "prizes",
      "conduct",
      "liability",
    ]));
  });

  it("discloses every personal-data category collected by registration", () => {
    const text = documentText(privacyDocument).toLocaleLowerCase("ca");

    for (const category of ["nom i cognoms", "dni/nie", "codi postal", "correu electrònic", "discord", "fortnite"]) {
      expect(text).toContain(category);
    }
  });

  it("keeps unknown company decisions as clearly identifiable placeholders", () => {
    expect(termsDocument.isDraft).toBe(true);
    expect(privacyDocument.isDraft).toBe(true);
    expect(documentText(termsDocument)).toContain("[[RAÓ SOCIAL]]");
    expect(documentText(privacyDocument)).toContain("[[TERMINI DE CONSERVACIÓ]]");
  });

  it("provides Spanish legal documents with the same complete structure", () => {
    const termsEs = getTermsDocument("es");
    const privacyEs = getPrivacyDocument("es");

    expect(termsEs.title).toBe("Términos y condiciones");
    expect(privacyEs.title).toBe("Política de privacidad");
    expect(termsEs.sections.map((section) => section.id)).toEqual(
      termsDocument.sections.map((section) => section.id),
    );
    expect(privacyEs.sections.map((section) => section.id)).toEqual(
      privacyDocument.sections.map((section) => section.id),
    );
    expect(documentText(termsEs)).toContain("[[RAZÓN SOCIAL]]");
    expect(documentText(privacyEs).toLocaleLowerCase("es")).toContain("nombre y apellidos");
  });
});
