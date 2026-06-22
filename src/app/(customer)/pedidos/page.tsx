import { OrderList } from "@/features/orders/components/order-list";
import { listCustomerPendingOrdersAction } from "@/features/orders/server/order-actions";

export default async function CustomerPedidosPage() {
  const result = await listCustomerPendingOrdersAction();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Área do cliente</p>
        <h1>Meus pedidos</h1>
        <p>Acompanhe pedidos pendentes e pagos. A confirmação final acontece no servidor.</p>
      </section>
      {result.status === "success" ? (
        <OrderList orders={result.orders} audience="customer" />
      ) : (
        <div className="placeholder-panel">
          <p className="muted">Pedidos indisponíveis</p>
          <h2>Não foi possível listar pedidos</h2>
          <p>{result.message}</p>
        </div>
      )}
    </main>
  );
}
