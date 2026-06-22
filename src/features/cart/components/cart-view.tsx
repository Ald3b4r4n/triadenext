import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { CartCouponPanel } from "./cart-coupon-panel";
import { ShippingQuotePanel } from "@/features/shipping/components/shipping-quote-panel";
import {
  clearCartFormAction,
  removeCartItemFormAction,
  updateCartItemQuantityFormAction
} from "../server/cart-actions";
import type { CartView as CartViewModel } from "../types";

type CartViewProps = {
  cart: CartViewModel;
};

export function CartView({ cart }: CartViewProps) {
  return (
    <section className="cart-layout" aria-label="Carrinho">
      <div className="cart-main">
        {cart.messages.length > 0 ? (
          <div className="form-message form-message--error" role="status">
            {Array.from(new Set(cart.messages)).map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : null}

        {cart.items.length === 0 ? (
          <div className="placeholder-panel">
            <p className="muted">Carrinho vazio</p>
            <h2>Nenhum item adicionado</h2>
            <p>Escolha um produto publicado e com estoque para iniciar sua sessão de compra.</p>
            <Link className="primary-action" href="/produtos">
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h2>{item.productNameSnapshot}</h2>
                  <p className="muted">Preço unitário: {formatMoney(item.unitPriceSnapshotCents)}</p>
                  <p>Subtotal do item: {formatMoney(item.itemSubtotalCents)}</p>
                </div>
                <form action={updateCartItemQuantityFormAction} className="cart-quantity-form">
                  <input type="hidden" name="itemId" value={item.id} />
                  <label className="quantity-field">
                    <span>Quantidade</span>
                    <input name="quantity" type="number" min="1" defaultValue={item.quantity} />
                  </label>
                  <button type="submit">Atualizar</button>
                </form>
                <form action={removeCartItemFormAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button className="icon-action" type="submit" aria-label={`Remover ${item.productNameSnapshot}`}>
                    <Trash2 aria-hidden="true" size={18} />
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className="cart-summary" aria-label="Resumo do carrinho">
        <h2>Resumo</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <strong>{formatMoney(cart.subtotalCents)}</strong>
        </div>
        <div className="summary-row">
          <span>Desconto</span>
          <strong>-{formatMoney(cart.discountCents)}</strong>
        </div>
        <div className="summary-row summary-row--total">
          <span>Total parcial</span>
          <strong>{formatMoney(cart.partialTotalCents)}</strong>
        </div>
        <div className="summary-row">
          <span>Frete</span>
          <strong>{cart.shippingAmountCents > 0 ? formatMoney(cart.shippingAmountCents) : "R$ 0,00"}</strong>
        </div>
        <div className="summary-row summary-row--total">
          <span>Total com frete</span>
          <strong>{formatMoney(cart.partialTotalWithShippingCents)}</strong>
        </div>
        <CartCouponPanel coupon={cart.coupon} />
        <ShippingQuotePanel
          cartId={cart.id}
          cartHash={cart.items.map((item) => `${item.productId}:${item.quantity}`).join("|")}
          destinationPostalCode={cart.shippingPostalCode}
          quote={cart.shippingQuote}
        />
        <p className="muted">
          O pedido é criado na próxima etapa e o pagamento aparece somente depois da revisão.
        </p>
        {cart.items.length === 0 || !cart.shippingQuoteId ? (
          <button className="primary-action" type="button" disabled>
            Selecione itens e frete
          </button>
        ) : cart.owner.kind === "guest" ? (
          <Link className="primary-action" href="/login?returnTo=/checkout">
            Entrar para checkout
          </Link>
        ) : (
          <Link className="primary-action" href="/checkout">
            Iniciar checkout
          </Link>
        )}
        {cart.items.length > 0 ? (
          <form action={clearCartFormAction}>
            <button className="text-action cart-clear" type="submit">
              Limpar carrinho
            </button>
          </form>
        ) : null}
      </aside>
    </section>
  );
}
