import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { createPendingOrderAndRedirect, reviewPendingCheckoutAction } from "@/features/checkout/server/checkout-actions";
import { getCustomerPendingOrderAction } from "@/features/orders/server/order-actions";
import { OrderItemsSummary, OrderSummary } from "@/features/orders/components/order-summary";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams?: Promise<{ pedido?: string }>;
}) {
  const params = await searchParams;

  if (params?.pedido) {
    const orderResult = await getCustomerPendingOrderAction(params.pedido);
    if (orderResult.status === "success") {
      return (
        <main className="page-shell">
          <section className="page-intro">
            <p className="muted">Checkout pendente</p>
            <h1>Pedido criado</h1>
            <p>Pedido aguardando pagamento. Continue pela área de pedidos para seguir com a etapa de pagamento.</p>
          </section>
          <OrderSummary order={orderResult.order} />
          <OrderItemsSummary order={orderResult.order} />
        </main>
      );
    }
  }

  const review = await reviewPendingCheckoutAction();

  if (review.status === "unauthenticated") {
    return (
      <main className="page-shell">
        <section className="page-intro">
          <p className="muted">Checkout autenticado</p>
          <h1>Entre para continuar</h1>
          <p>{review.message}</p>
          <div className="action-row">
            <Link className="primary-action" href="/login?returnTo=/checkout">
              Fazer login
            </Link>
            <Link className="secondary-action" href="/cadastro?returnTo=/checkout">
              Criar conta
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (review.status !== "success") {
    return (
      <main className="page-shell">
        <section className="page-intro">
          <p className="muted">Checkout pendente</p>
          <h1>Revise o carrinho</h1>
          <p>{review.message}</p>
          <Link className="primary-action" href="/carrinho">
            Voltar ao carrinho
          </Link>
        </section>
      </main>
    );
  }

  const { cart } = review;

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Checkout pendente</p>
        <h1>Revisao do pedido</h1>
        <p>Confira itens, frete, cupom e endereço. O pagamento será iniciado depois que o pedido for criado.</p>
      </section>

      <section className="cart-layout" aria-label="Revisao de checkout">
        <div className="cart-main">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h2>{item.productNameSnapshot}</h2>
                  <p className="muted">Quantidade: {item.quantity}</p>
                  <p>Unitario: {formatMoney(item.unitPriceSnapshotCents)}</p>
                </div>
                <strong>{formatMoney(item.itemSubtotalCents)}</strong>
              </article>
            ))}
          </div>

          <form action={createPendingOrderAndRedirect} className="checkout-form">
            <h2>Cliente e entrega</h2>
            <p className="muted">E-mail da conta: {review.email}</p>
            <label>
              <span>Nome completo</span>
              <input name="fullName" required minLength={3} />
            </label>
            <label>
              <span>Telefone</span>
              <input name="phone" required minLength={8} />
            </label>
            <label>
              <span>Destinatario, se diferente</span>
              <input name="recipient" />
            </label>
            <div className="form-grid">
              <label>
                <span>CEP</span>
                <input name="postalCode" required defaultValue={cart.shippingPostalCode ?? ""} />
              </label>
              <label>
                <span>UF</span>
                <input name="state" required maxLength={2} />
              </label>
            </div>
            <label>
              <span>Cidade</span>
              <input name="city" required />
            </label>
            <label>
              <span>Bairro</span>
              <input name="district" required />
            </label>
            <label>
              <span>Logradouro</span>
              <input name="street" required />
            </label>
            <div className="form-grid">
              <label>
                <span>Numero</span>
                <input name="number" required />
              </label>
              <label>
                <span>Complemento</span>
                <input name="complement" />
              </label>
            </div>
            <button className="primary-action" type="submit">
              Criar pedido pendente
            </button>
          </form>
        </div>

        <aside className="cart-summary" aria-label="Resumo do pedido">
          <h2>Resumo</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatMoney(cart.subtotalCents)}</strong>
          </div>
          <div className="summary-row">
            <span>Desconto</span>
            <strong>-{formatMoney(cart.discountCents)}</strong>
          </div>
          <div className="summary-row">
            <span>Frete</span>
            <strong>{formatMoney(cart.shippingAmountCents)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatMoney(cart.partialTotalWithShippingCents)}</strong>
          </div>
          <p className="muted">
            Cupom: {cart.coupon?.code ?? "nenhum"} | Frete:{" "}
            {cart.shippingQuote?.options.find((option) => option.id === cart.shippingQuote?.selectedOptionId)?.label ??
              "selecionado"}
          </p>
          <p className="muted">Pedido expira 60 minutos após a criação.</p>
          <p className="muted">Dados de cartão não são coletados neste formulário.</p>
        </aside>
      </section>
    </main>
  );
}
