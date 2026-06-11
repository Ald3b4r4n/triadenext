import { OrderList } from "@/features/orders/components/order-list";
import { listAdminPendingOrdersAction } from "@/features/orders/server/order-actions";
import { listAdminNotificationDeliveriesAction } from "@/features/notifications/server/notification-actions";

export default async function AdminPedidosPage() {
  const result = await listAdminPendingOrdersAction();
  const notificationResult =
    result.status === "success"
      ? await listAdminNotificationDeliveriesAction(result.orders.map((order) => order.id))
      : null;

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Pedidos</h1>
        <p>Visualizacao financeira minima. Sem marcar como pago ou editar valores.</p>
      </section>
      {result.status === "success" ? (
        <OrderList
          orders={result.orders}
          audience="admin"
          notificationsByOrder={
            notificationResult?.status === "success"
              ? notificationResult.deliveriesByOrder
              : {}
          }
        />
      ) : (
        <div className="placeholder-panel">
          <p className="muted">Pedidos bloqueados</p>
          <h2>Acesso ou ambiente indisponivel</h2>
          <p>{result.message}</p>
        </div>
      )}
    </main>
  );
}
