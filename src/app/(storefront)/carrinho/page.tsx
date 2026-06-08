import { CartView } from "@/features/cart/components/cart-view";
import { getActiveCartAction } from "@/features/cart/server/cart-actions";

export default async function CarrinhoPage() {
  const result = await getActiveCartAction();
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
          persistence: "unavailable" as const,
          messages: [result.message]
        };

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Sessão de compra</p>
        <h1>Carrinho</h1>
      </section>
      <CartView cart={cart} />
    </main>
  );
}
