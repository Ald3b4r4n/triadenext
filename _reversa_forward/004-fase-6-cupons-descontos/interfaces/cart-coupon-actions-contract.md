# Interface Contract: Cart Coupon Actions

> Data: `2026-06-08`
> Tipo: Next.js server actions

## Actions esperadas

| Action | Entrada confiável | Entrada não confiável |
|--------|-------------------|-----------------------|
| `applyCouponAction` | Sessão/cookie resolvidos no servidor, código informado | `cartId`, `userId`, `discount`, `subtotal`, `total`, `couponId`, role |
| `removeCouponAction` | Sessão/cookie resolvidos no servidor | `cartId`, `userId`, `discount`, `subtotal`, `total`, role |
| `getCartAction` atualizada | Sessão/cookie resolvidos no servidor | Qualquer owner enviado pelo cliente |

## Responses conceituais

```ts
type CartCouponActionResult =
  | { ok: true; cart: CartViewWithCoupon; messages: string[] }
  | { ok: false; code: string; message: string; cart?: CartViewWithCoupon };
```

## Erros controlados

- `coupon_not_found`
- `coupon_inactive`
- `coupon_scheduled`
- `coupon_expired`
- `coupon_exhausted`
- `coupon_minimum_subtotal_not_met`
- `coupon_type_unavailable`
- `cart_unavailable`
- `cart_not_owner`
- `database_unavailable`
- `validation_error`

## Guardrails

- Não aceitar `cartId` público para mutação.
- Não aceitar desconto/total do cliente.
- Não armazenar cupom no cookie.
- Não chamar Stripe, checkout, pedido, frete real, reserva ou baixa de estoque.
- Não incrementar `usedCount`.
