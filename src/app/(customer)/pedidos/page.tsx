import { OrderList } from "@/features/orders/components/order-list";
import { listCustomerPendingOrdersAction } from "@/features/orders/server/order-actions";

export default async function CustomerPedidosPage() {
  const result = await listCustomerPendingOrdersAction();

  return (
    <main className="page-shell customer-orders-page">
      <section className="page-intro customer-orders-page__intro">
        <p className="muted">Área do cliente</p>
        <h1>Meus pedidos</h1>
        <p>Consulte pagamentos, preparação e entrega em um só lugar.</p>
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
