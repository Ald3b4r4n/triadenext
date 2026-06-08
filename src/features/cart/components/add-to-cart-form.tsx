import { ShoppingCart } from "lucide-react";
import { addCartItemFormAction } from "../server/cart-actions";

type AddToCartFormProps = {
  productId: string;
  disabled?: boolean;
};

export function AddToCartForm({ productId, disabled = false }: AddToCartFormProps) {
  return (
    <form action={addCartItemFormAction} className="add-to-cart-form">
      <input type="hidden" name="productId" value={productId} />
      <label className="quantity-field">
        <span>Quantidade</span>
        <input name="quantity" type="number" min="1" defaultValue="1" disabled={disabled} />
      </label>
      <button className="primary-action" type="submit" disabled={disabled}>
        <ShoppingCart aria-hidden="true" size={18} />
        Adicionar ao carrinho
      </button>
    </form>
  );
}
