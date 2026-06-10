import { OrderList } from "@/features/orders/components/order-list";
import { listCustomerPendingOrdersAction } from "@/features/orders/server/order-actions";

export default async function CustomerPedidosPage() {
  const result = await listCustomerPendingOrdersAction();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Area do cliente</p>
        <h1>Meus pedidos</h1>
        <p>Acompanhe pedidos pendentes e pagos. O pagamento e confirmado pelo webhook Stripe.</p>
      </section>
      {result.status === "success" ? (
        <OrderList orders={result.orders} audience="customer" />
      ) : (
        <div className="placeholder-panel">
          <p className="muted">Pedidos indisponiveis</p>
          <h2>Nao foi possivel listar pedidos</h2>
          <p>{result.message}</p>
        </div>
      )}
    </main>
  );
}
