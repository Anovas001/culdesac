import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("public locale integration", () => {
  it("uses the persisted locale in the document and landing", () => {
    const layout = read("./layout.tsx");
    const landing = read("./page.tsx");

    expect(layout).toContain("await getLocale()");
    expect(layout).toContain("<html lang={locale} suppressHydrationWarning>");
    expect(landing).toContain("getLocale(),");
    expect(landing).toContain("getMessages(locale)");
    expect(landing).toContain("<LocaleSwitcher");
    expect(landing).toContain("buildPublicTournamentView(");
    expect(landing).toContain("locale,");
    expect(landing).toContain("<RegistrationForm priceLabel={publicView.priceLabel} locale={locale}");
  });

  it("localizes the registration and payment-result screens", () => {
    const form = read("../components/public/registration-form.tsx");
    const success = read("./registration/success/page.tsx");
    const cancelled = read("./registration/cancelled/page.tsx");

    expect(form).toContain("getMessages(locale).registration");
    expect(form).toContain("errorCode");
    expect(success).toContain("getMessages(locale).success");
    expect(success).toContain("<LocaleSwitcher");
    expect(cancelled).toContain("getMessages(locale).cancelled");
    expect(cancelled).toContain("<LocaleSwitcher");
  });

  it("localizes legal navigation and document selection", () => {
    const legal = read("./legal/legal-document.tsx");
    const terms = read("./legal/terms/page.tsx");
    const privacy = read("./legal/privacy/page.tsx");

    expect(legal).toContain("getMessages(locale).legal");
    expect(legal).toContain("<LocaleSwitcher");
    expect(terms).toContain("getTermsDocument(locale)");
    expect(privacy).toContain("getPrivacyDocument(locale)");
  });
});
