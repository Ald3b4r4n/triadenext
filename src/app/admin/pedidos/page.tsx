import { AdminOrderList } from "@/features/orders/components/admin-order-list";
import { listAdminPendingOrdersAction } from "@/features/orders/server/order-actions";
import { listAdminNotificationDeliveriesAction } from "@/features/notifications/server/notification-actions";

export default async function AdminPedidosPage() {
  const result = await listAdminPendingOrdersAction();
  const notificationResult =
    result.status === "success"
      ? await listAdminNotificationDeliveriesAction(
          result.orders.map((order) => order.id)
        )
      : null;

  return (
    <main className="page-shell admin-orders-page">
      <section className="page-intro admin-orders-page__intro">
        <h1>Pedidos</h1>
        <p>Gerencie o ciclo financeiro, a separação dos produtos e a expedição dos pedidos.</p>
      </section>
      {result.status === "success" ? (
        <AdminOrderList
          orders={result.orders}
          notificationsByOrder={
            notificationResult?.status === "success"
              ? notificationResult.deliveriesByOrder
              : {}
          }
        />
      ) : (
        <div className="placeholder-panel">
          <p className="muted">Pedidos bloqueados</p>
          <h2>Acesso ou ambiente indisponível</h2>
          <p>{result.message}</p>
        </div>
      )}
    </main>
  );
}
