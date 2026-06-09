# Interface Contract: Cart Shipping Actions

> Data: `2026-06-09`
> Tipo: Next.js server actions

## Actions esperadas

| Action | Entrada confiável | Entrada não confiável |
|--------|-------------------|-----------------------|
| `quoteShippingAction` | Sessão/cookie resolvidos no servidor, CEP informado | `cartId`, `userId`, frete, total, provider, prazo, owner |
| `selectShippingOptionAction` | Sessão/cookie resolvidos no servidor, quote token opaco | `cartId`, `userId`, frete, total, owner, preço |
| `removeShippingSelectionAction` | Sessão/cookie resolvidos no servidor | `cartId`, `userId`, owner |
| `getCartAction` atualizada | Sessão/cookie resolvidos no servidor | Qualquer owner enviado pelo cliente |

## Responses conceituais

```ts
type CartShippingActionResult =
  | { ok: true; cart: CartViewWithShipping; messages: string[] }
  | { ok: false; code: string; message: string; cart?: CartViewWithShipping };
```

## Campos esperados em `CartViewWithShipping`

- `subtotalCents`
- `discountCents`
- `partialTotalCents`
- `shippingAmountCents`
- `partialTotalWithShippingCents`
- `shippingDestinationPostalCode`
- `shippingOptions`
- `selectedShippingOption`
- `shippingFallbackMode`
- `messages`

## Erros controlados

- `shipping_postal_code_invalid`
- `shipping_no_manual_rule`
- `shipping_quote_expired`
- `shipping_quote_not_owner`
- `shipping_cart_changed`
- `shipping_unavailable`
- `database_unavailable`
- `validation_error`

## Guardrails

- Não aceitar `cartId` público para mutação.
- Não aceitar preço/prazo/total do cliente.
- Não armazenar itens/preços/frete em cookie.
- Não chamar Stripe, checkout, pedido, transportadora real, reserva ou baixa de estoque.
