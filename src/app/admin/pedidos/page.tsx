import { OrderList } from "@/features/orders/components/order-list";
import { listAdminPendingOrdersAction } from "@/features/orders/server/order-actions";

export default async function AdminPedidosPage() {
  const result = await listAdminPendingOrdersAction();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin</p>
        <h1>Pedidos</h1>
        <p>Visualizacao financeira minima. Sem marcar como pago ou editar valores.</p>
      </section>
      {result.status === "success" ? (
        <OrderList orders={result.orders} audience="admin" />
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
