export function formatMoney(valueInCents: number, currency = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(valueInCents / 100);
}

export function clampDiscount(subtotalInCents: number, discountInCents: number) {
  return Math.min(Math.max(discountInCents, 0), Math.max(subtotalInCents, 0));
}
