# Interface Contract: Cart Actions

> Data: `2026-06-08`  
> Tipo: server actions

## 1. Objetivo

Definir entradas e saidas esperadas das actions de carrinho.

## 2. Resultado comum

```ts
type CartActionResult =
  | { status: "success"; cart: CartView; message?: string }
  | { status: "validation_error"; message: string }
  | { status: "product_unavailable"; message: string }
  | { status: "insufficient_stock"; message: string; maxQuantity: number }
  | { status: "forbidden"; message: string }
  | { status: "fallback"; cart: CartView; message: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };
```

## 3. Actions

| Action | Input conceitual | Regras |
|---|---|---|
| `addCartItem` | `{ productId: string; quantity?: number }` | Quantidade default 1; valida produto compravel e estoque. |
| `updateCartItemQuantity` | `{ itemId: string; quantity: number }` | Minimo 1, maximo estoque atual. |
| `removeCartItem` | `{ itemId: string }` | Remove somente item do carrinho resolvido. |
| `clearCart` | `{}` | Limpa somente carrinho resolvido. |
| `getActiveCart` | `{}` | Resolve carrinho atual para renderizacao. |

## 4. Regras obrigatorias

- Resolver carrinho atual por sessao/cookie no servidor.
- Nao aceitar `cartId`, `userId`, role ou owner como fonte confiavel.
- Revalidar produto e estoque em toda mutation.
- Calcular subtotal em centavos.
- Retornar erro controlado; nao expor SQL, token, cookie, session ou secrets.
- Nao criar pedido, pagamento, frete, cupom ou checkout.
- Nao reservar nem baixar estoque.

## 5. Timeouts e falhas

- Falha de sessao ou ownership bloqueia operacao autenticada.
- Falha de banco com `DATABASE_URL` deve retornar erro controlado, nao fallback silencioso.
- Preview/producao sem banco devem retornar `unavailable`.
- Retentativas nao podem duplicar itens ou reexecutar merge sem idempotencia.
