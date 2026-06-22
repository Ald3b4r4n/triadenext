import { maskEmailRecipient } from "../recipients";
import type { NotificationDelivery } from "../types";

export function NotificationStatus({
  deliveries
}: {
  deliveries: NotificationDelivery[];
}) {
  if (deliveries.length === 0) {
    return <p className="muted">Notificações: nenhuma entrega registrada.</p>;
  }

  return (
    <div className="notification-status" aria-label="Status de notificacoes">
      <strong>Notificações</strong>
      <ul>
        {deliveries.map((delivery) => (
          <li key={delivery.id}>
            {delivery.type === "customer_order_paid" ? "Cliente" : "Interna"}:{" "}
            {maskEmailRecipient(delivery.recipient)} - {notificationStatusLabel(delivery.status)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function notificationStatusLabel(status: NotificationDelivery["status"]) {
  const labels: Record<NotificationDelivery["status"], string> = {
    pending: "pendente",
    sending: "em envio",
    sent: "enviada",
    mocked: "teste local",
    failed: "falhou",
    skipped: "não aplicável"
  };

  return labels[status];
}
