import { maskEmailRecipient } from "../recipients";
import type { NotificationDelivery } from "../types";

export function NotificationStatus({
  deliveries
}: {
  deliveries: NotificationDelivery[];
}) {
  if (deliveries.length === 0) {
    return <p className="muted">Notificacoes: nenhum registro.</p>;
  }

  return (
    <div className="notification-status" aria-label="Status de notificacoes">
      <strong>Notificacoes</strong>
      <ul>
        {deliveries.map((delivery) => (
          <li key={delivery.id}>
            {delivery.type === "customer_order_paid" ? "Cliente" : "Interna"}:{" "}
            {maskEmailRecipient(delivery.recipient)} - {delivery.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
