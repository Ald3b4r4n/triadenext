import { formatMoney } from "@/lib/money";

export function formatProductPrice(priceCents: number) {
  return formatMoney(priceCents);
}
