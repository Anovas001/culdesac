import { describe, expect, it } from "vitest";

import { getPrivacyDocument, getTermsDocument, privacyDocument, termsDocument } from "./legal-documents";

function documentText(document: typeof termsDocument): string {
  return [document.version, ...document.sections
    .flatMap((section) => [section.title, ...section.paragraphs, ...(section.items ?? [])])]
    .join(" ");
}

describe("definitive legal documents", () => {
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

    for (const category of ["nom i cognoms", "dni/nie", "codi postal", "correu electrònic", "telèfon", "discord", "fortnite"]) {
      expect(text).toContain(category);
    }
  });

  it("discloses the telephone field in both languages", () => {
    expect(documentText(termsDocument).toLocaleLowerCase("ca")).toContain("telèfon");
    expect(documentText(getPrivacyDocument("es")).toLocaleLowerCase("es")).toContain("teléfono");
  });

  it("contains the supplied organizer data and no draft placeholders", () => {
    for (const document of [
      termsDocument,
      privacyDocument,
      getTermsDocument("es"),
      getPrivacyDocument("es"),
    ]) {
      expect(document.isDraft).toBe(false);
      expect(documentText(document)).not.toContain("[[");
      expect(documentText(document)).toContain("B56924491");
      expect(documentText(document)).toContain("11");
      expect(documentText(document)).toContain("2026");
    }
  });

  it("defines bounded retention and separate consent safeguards", () => {
    const privacyCa = documentText(privacyDocument).toLocaleLowerCase("ca");
    const privacyEs = documentText(getPrivacyDocument("es")).toLocaleLowerCase("es");

    expect(privacyCa).toContain("sis anys");
    expect(privacyEs).toContain("seis años");
    expect(privacyCa).toContain("consentiment independent");
    expect(privacyEs).toContain("consentimiento independiente");
    expect(privacyCa).toContain("menors de catorze anys");
    expect(privacyEs).toContain("menores de catorce años");
  });

  it("reflects the agreed cancellations, claims, prizes and broadcasts", () => {
    const termsCa = documentText(termsDocument).toLocaleLowerCase("ca");
    const termsEs = documentText(getTermsDocument("es")).toLocaleLowerCase("es");

    for (const text of [termsCa, termsEs]) {
      expect(text).toContain("0,50 €");
      expect(text).toContain("60");
      expect(text).toContain("discord");
      expect(text).toContain("30 minuts".replace("minuts", text === termsEs ? "minutos" : "minuts"));
    }
    expect(termsCa).toContain("quarts de final");
    expect(termsEs).toContain("cuartos de final");
  });

  it("documents privacy acceptance for broadcasts and separate marketing consent", () => {
    const termsCa = documentText(termsDocument).toLocaleLowerCase("ca");
    const termsEs = documentText(getTermsDocument("es")).toLocaleLowerCase("es");
    const privacyCa = documentText(privacyDocument).toLocaleLowerCase("ca");
    const privacyEs = documentText(getPrivacyDocument("es")).toLocaleLowerCase("es");

    expect(termsCa).toContain("acceptar la política de privacitat");
    expect(termsEs).toContain("aceptar la política de privacidad");
    expect(privacyCa).toContain("casella opcional");
    expect(privacyEs).toContain("casilla opcional");
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
    expect(documentText(privacyEs).toLocaleLowerCase("es")).toContain("nombre y apellidos");
  });
});
