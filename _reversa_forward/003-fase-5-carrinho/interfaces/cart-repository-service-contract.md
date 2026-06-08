# Interface Contract: Cart Repository/Service

> Data: `2026-06-08`  
> Tipo: server-only module

## 1. Objetivo

Definir o contrato esperado para repository e service de carrinho, separando persistencia de regras de negocio.

## 2. Tipos conceituais

```ts
type CartStatus = "active" | "converted" | "abandoned" | "expired";

type CartItem = {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshotCents: number;
  quantity: number;
  itemSubtotalCents: number;
};

type CartView = {
  id: string | null;
  status: CartStatus;
  owner: { kind: "guest"; guestTokenPresent: true } | { kind: "user"; userId: string };
  currency: "BRL";
  items: CartItem[];
  subtotalCents: number;
  persistence: "real" | "dev_fallback" | "unavailable";
  messages: string[];
};
```

## 3. Repository esperado

| Metodo | Responsabilidade |
|---|---|
| `findActiveCartByGuestToken` | Buscar carrinho anonimo ativo. |
| `findActiveCartByUserId` | Buscar carrinho autenticado ativo. |
| `createGuestCart` | Criar carrinho anonimo ativo. |
| `createUserCart` | Criar carrinho autenticado ativo. |
| `listItems` | Listar itens do carrinho. |
| `upsertItem` | Inserir/somar/substituir item conforme service mandar. |
| `updateItemQuantity` | Atualizar quantidade. |
| `removeItem` | Remover item. |
| `clearCart` | Remover todos os itens. |
| `markCartConverted` | Marcar anonimo mesclado/convertido. |

## 4. Service esperado

| Metodo | Regra |
|---|---|
| `getOrCreateActiveCart` | Resolve actor, cria carrinho se permitido e respeita fallback. |
| `addItem` | Valida produto, estoque e quantidade antes de persistir. |
| `updateQuantity` | Revalida estoque atual. |
| `removeItem` | Remove apenas item do carrinho resolvido. |
| `clearCart` | Limpa carrinho resolvido. |
| `mergeGuestIntoUser` | Soma por produto, limita estoque, remove/bloqueia indisponiveis e marca anonimo convertido. |
| `recalculateCart` | Recalcula subtotal em centavos. |

## 5. Fallback

- Sem `DATABASE_URL` em dev/test: retornar `dev_fallback` explicito.
- Sem `DATABASE_URL` em preview/producao: retornar `unavailable`/bloqueio seguro.
- Com `DATABASE_URL`, erro real nao deve virar fallback silencioso.

## 6. Idempotencia e concorrencia

- Merge deve ser idempotente por status do carrinho anonimo.
- Upsert de item deve evitar linhas duplicadas por produto.
- Atualizacoes simultaneas devem respeitar estoque na transacao ou em validação imediatamente anterior.
