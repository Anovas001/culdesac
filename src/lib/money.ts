export function formatMoney(cents: number, currency: string, locale = "es-ES"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
