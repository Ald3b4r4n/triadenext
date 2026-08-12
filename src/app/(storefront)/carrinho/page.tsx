import { CartView } from "@/features/cart/components/cart-view";
import { getActiveCartForRender } from "@/features/cart/server/cart-service";

export default async function CarrinhoPage() {
  const result = await getActiveCartForRender();
  const cart =
    result.status === "success" || result.status === "fallback"
      ? result.cart
      : {
          id: null,
          status: "active" as const,
          owner: { kind: "guest" as const, guestTokenPresent: true as const },
          currency: "BRL" as const,
          items: [],
          subtotalCents: 0,
          appliedCouponId: null,
          coupon: null,
          discountCents: 0,
          shippingPostalCode: null,
          shippingQuoteId: null,
          shippingQuote: null,
          shippingOptions: [],
          shippingAmountCents: 0,
          partialTotalCents: 0,
          partialTotalWithShippingCents: 0,
          persistence: "unavailable" as const,
          messages: [result.message]
        };

  return (
    <main className="page-shell cart-page">
      <section className="page-intro cart-page__intro">
        <p className="muted">Sessão de compra</p>
        <h1>Carrinho</h1>
        <p>Revise seus itens, escolha a entrega e avance com segurança.</p>
      </section>
      <CartView
        key={`${cart.items.map((item) => `${item.id}:${item.quantity}`).join("|")}:${cart.appliedCouponId ?? ""}:${cart.shippingQuoteId ?? ""}`}
        cart={cart}
      />
    </main>
  );
}
