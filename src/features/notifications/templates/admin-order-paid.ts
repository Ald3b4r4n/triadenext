import type { AdminOrderPaidTemplateInput, RenderedEmail } from "../types";
import { escapeHtml, formatNotificationMoney } from "./formatters";
import { assertSafeRenderedEmail } from "./guards";

export function renderAdminOrderPaidEmail(input: AdminOrderPaidTemplateInput): RenderedEmail {
  const subject = `Novo pedido pago: ${input.orderNumber}`;
  const itemsText = input.items
    .map(
      (item) =>
        `${item.quantity}x ${item.name} - ${formatNotificationMoney(item.lineTotalCents)}`
    )
    .join("\n");
  const shippingText = input.shipping
    ? `${input.shipping.label} - ${formatNotificationMoney(input.shipping.amountCents)}`
    : "Frete nao informado";
  const text = [
    `Novo pedido pago: ${input.orderNumber}.`,
    `Cliente: ${input.customerName} (${input.customerEmail})`,
    `Total: ${formatNotificationMoney(input.totalCents)}`,
    itemsText,
    `Frete: ${shippingText}`,
    `Entrega: ${input.addressSummary}`,
    "Pedido pronto para continuidade operacional."
  ].join("\n");
  const html = `<h1>Novo pedido pago: ${escapeHtml(input.orderNumber)}</h1>
<p>Cliente: ${escapeHtml(input.customerName)} (${escapeHtml(input.customerEmail)})</p>
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
<p>Pedido pronto para continuidade operacional.</p>`;

  assertSafeRenderedEmail(`${subject}\n${text}\n${html}`);
  return { subject, text, html };
}
