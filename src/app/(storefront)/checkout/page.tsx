import Link from "next/link";
import { ArrowRight, Check, CreditCard, ShoppingBag } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { reviewPendingCheckoutAction } from "@/features/checkout/server/checkout-actions";
import { CheckoutAddressForm } from "@/features/checkout/components/checkout-address-form";
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
        <main className="page-shell checkout-page checkout-created-page">
          <ol className="checkout-steps" aria-label="Etapas da compra">
            <li className="checkout-step checkout-step--complete"><Check aria-hidden="true" size={15} /> Carrinho</li>
            <li className="checkout-step checkout-step--complete"><Check aria-hidden="true" size={15} /> Identificação</li>
            <li className="checkout-step checkout-step--current"><CreditCard aria-hidden="true" size={15} /> Pagamento</li>
          </ol>
          <section className="checkout-created-hero">
            <div className="checkout-created-hero__icon"><ShoppingBag aria-hidden="true" size={26} /></div>
            <div>
              <span>Pedido registrado</span>
              <h1>Falta apenas o pagamento</h1>
              <p>Seus itens estão reservados. Conclua o pagamento para confirmar a compra.</p>
            </div>
            <Link className="primary-action" href={`/pedidos/${orderResult.order.id}/pagamento`}>
              Pagar agora <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </section>
          <section className="checkout-created-grid">
            <div>
              <OrderSummary order={orderResult.order} />
              <OrderItemsSummary order={orderResult.order} />
            </div>
            <aside className="checkout-next-steps">
              <h2>Próximos passos</h2>
              <ol>
                <li><span>1</span><div><strong>Conclua o pagamento</strong><p>Use o formulário seguro do provedor.</p></div></li>
                <li><span>2</span><div><strong>Aguarde a confirmação</strong><p>O status é atualizado automaticamente.</p></div></li>
                <li><span>3</span><div><strong>Acompanhe o pedido</strong><p>Consulte andamento e entrega em sua conta.</p></div></li>
              </ol>
              <Link className="secondary-action" href="/pedidos">Ver meus pedidos</Link>
            </aside>
          </section>
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
          <div className="action-row"><Link className="primary-action" href="/minha-conta#account-profile-title">Completar cadastro</Link><Link className="secondary-action" href="/carrinho">Voltar ao carrinho</Link></div>
        </section>
      </main>
    );
  }

  const { cart } = review;

  return (
    <main className="page-shell checkout-page">
      <section className="page-intro">
        <p className="muted">Finalizar compra</p>
        <h1>Revise e informe a entrega</h1>
        <p>Confira o resumo e complete o endereço. Na próxima etapa você fará o pagamento seguro.</p>
      </section>

      <ol className="checkout-steps" aria-label="Etapas da compra">
        <li className="checkout-step checkout-step--complete"><Check aria-hidden="true" size={15} /> Carrinho</li>
        <li className="checkout-step checkout-step--current">2 Identificação</li>
        <li className="checkout-step">3 Pagamento</li>
      </ol>

      <section className="cart-layout checkout-review-layout" aria-label="Revisão de checkout">
        <div className="cart-main">
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h2>{item.productNameSnapshot}</h2>
                  <p className="muted">Quantidade: {item.quantity}</p>
                  <p>Unitário: {formatMoney(item.unitPriceSnapshotCents)}</p>
                </div>
                <strong>{formatMoney(item.itemSubtotalCents)}</strong>
              </article>
            ))}
          </div>

          <CheckoutAddressForm
            email={review.email}
            initialPostalCode={cart.shippingPostalCode ?? ""}
            initialData={review.account}
          />
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
          <p className="muted">A reserva dos itens dura 60 minutos após avançar.</p>
          <p className="muted">O cartão será informado somente na próxima etapa segura.</p>
        </aside>
      </section>
    </main>
  );
}
