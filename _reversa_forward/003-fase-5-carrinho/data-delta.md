# Data Delta: Fase 5 - Carrinho

> Data: `2026-06-08`  
> Escopo: diff conceitual de dados, sem alterar schema nesta etapa.

## 1. Estado atual

`src/db/schema.ts` ja define:

- enum `cart_status`: `active`, `converted`, `abandoned`, `expired`;
- tabela `carts` com `id`, `userId`, `guestToken`, `status`, `currency`, `createdAt`, `updatedAt`;
- tabela `cart_items` com `cartId`, `productId`, `productNameSnapshot`, `unitPriceSnapshot`, `quantity`, timestamps;
- FK de `cart_items.cart_id` com cascade;
- FK de `cart_items.product_id` com restrict.

## 2. Delta conceitual

| Objeto | Delta esperado | Motivo |
|---|---|---|
| `carts.user_id` | Usar como dono do carrinho autenticado. | Persistencia entre dispositivos e ownership. |
| `carts.guest_token` | Usar como associacao de visitante com `guestCartToken`. | Carrinho anonimo persistido sem dados sensiveis no cookie. |
| `carts.status` | Usar `active`, `converted`, `abandoned`, `expired`. | Merge, abandono e expiracao. |
| `carts.currency` | Manter `BRL`. | Subtotal em moeda local, sem multi-moeda nesta fase. |
| `cart_items.product_name_snapshot` | Manter snapshot no momento da adicao/atualizacao validada. | Paridade com legado e estabilidade de exibicao. |
| `cart_items.unit_price_snapshot` | Avaliar campo em centavos ou conversao segura para centavos. | Requisito exige subtotal em centavos sem float. |
| `cart_items.quantity` | Validar inteiro positivo e maximo `stockQuantity`. | Evitar quantidade invalida. |

## 3. Constraints e indices recomendados

| Invariante | Implementacao provavel | Observacao |
|---|---|---|
| Um carrinho ativo principal por usuario | unique parcial em `carts(user_id)` quando `status='active'` e `user_id IS NOT NULL` | Validar suporte no Drizzle migration. |
| Um carrinho ativo principal por guest token | unique parcial em `carts(guest_token)` quando `status='active'` e `guest_token IS NOT NULL` | Evita duplicidade anonima. |
| Um produto por carrinho | unique em `cart_items(cart_id, product_id)` | Necessario para somar quantidades. |
| Busca rapida por carrinho | indices em `carts.user_id`, `carts.guest_token`, `carts.status` | Repository precisa resolver carrinho ativo. |
| Busca de itens | indice em `cart_items.cart_id` | Listagem do carrinho. |
| Quantidade positiva | check `quantity > 0`, se adotado | Tambem validar em Zod/service. |

## 4. Migrations

- A etapa de coding pode gerar migration local se as invariantes acima exigirem alteração do schema.
- `pnpm db:generate` pode gerar SQL local.
- Nao executar `db:migrate` nem conectar banco real sem aprovacao humana explicita.
- Se Drizzle exigir `DATABASE_URL` para alguma acao, registrar pendencia em vez de conectar banco real.

## 5. Expiracao/conversao/abandono

| Estado | Regra planejada |
|---|---|
| `active` | Carrinho atual, anonimo ou autenticado. |
| `converted` | Carrinho anonimo mesclado ao login ou futuro carrinho usado em pedido. |
| `abandoned` | Carrinho antigo que deixou de ser ativo por regra operacional futura. |
| `expired` | Carrinho anonimo expirado por idade/token. |

Expiracao pode ser calculada por `updatedAt` inicialmente ou ganhar campo dedicado em schema se a implementacao demonstrar necessidade.

## 6. Fora de escopo de dados

Sem dados funcionais novos para:

- pedido;
- pagamento;
- frete;
- cupom/desconto;
- reserva de estoque;
- fiscal/documentos;
- migracao de carrinhos reais do Laravel.

## 7. Rollback conceitual

Antes de aplicar migration real, rollback e descartar arquivos locais gerados e manter `/carrinho` como placeholder/fallback. Depois de migration real futura, rollback exige migration reversa revisada e bloqueio seguro das actions de carrinho.
