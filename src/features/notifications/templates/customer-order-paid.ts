import type { CustomerOrderPaidTemplateInput, RenderedEmail } from "../types";
import { escapeHtml, formatNotificationMoney } from "./formatters";
import { assertSafeRenderedEmail } from "./guards";

export function renderCustomerOrderPaidEmail(
  input: CustomerOrderPaidTemplateInput
): RenderedEmail {
  const itemsText = input.items
    .map(
      (item) =>
        `${item.quantity}x ${item.name} - ${formatNotificationMoney(item.lineTotalCents)}`
    )
    .join("\n");
  const shippingText = input.shipping
    ? `${input.shipping.label} - ${formatNotificationMoney(input.shipping.amountCents)}${
        input.shipping.estimatedDays
          ? ` - até ${input.shipping.estimatedDays} dias`
          : ""
      }`
    : "Frete não informado";
  const subject = `Pedido ${input.orderNumber} pago`;
  const text = [
    `Seu pedido ${input.orderNumber} está pago.`,
    `Total: ${formatNotificationMoney(input.totalCents)}`,
    itemsText,
    `Frete: ${shippingText}`,
    `Entrega: ${input.addressSummary}`,
    "A Tríade Essenza Parfum dará sequência ao processamento do pedido."
  ].join("\n");
  const html = `<h1>Pedido ${escapeHtml(input.orderNumber)} pago</h1>
<p>Total: ${escapeHtml(formatNotificationMoney(input.totalCents))}</p>
<ul>${input.items
    .map(
      (item) =>
        `<li>${item.quantity}x ${escapeHtml(item.name)} - ${escapeHtml(
          formatNotificationMoney(item.lineTotalCents)
        )}</li>`
    )
    .join("")}</ul>
<p>Frete: ${escapeHtml(shippingText)}</p>
<p>Entrega: ${escapeHtml(input.addressSummary)}</p>
<p>A Tríade Essenza Parfum dará sequência ao processamento do pedido.</p>`;

  assertSafeRenderedEmail(`${subject}\n${text}\n${html}`);
  return { subject, text, html };
}
