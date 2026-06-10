# Dependencias Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: dependencias apos Fase 8.

## Dependencias de runtime observadas

| Area | Uso |
| --- | --- |
| Next.js App Router | Rotas, server components e server actions |
| React | Componentes de UI |
| Drizzle | Schema, queries, transacoes e migrations locais |
| Zod | Validacao de formularios, cupons, carrinho, frete e checkout |
| server-only | Isolamento de modulos server-side |
| Better Auth | Sessao e autenticacao |
| Stripe | Dependencia instalada para futuro; nao acionada pela Fase 8 |

## Modulos internos

| Modulo | Dependencias internas principais |
| --- | --- |
| `products` | Schema de produtos/categorias, imagens e fixtures |
| `auth` | Sessao, papeis, policies e login/cadastro |
| `cart` | Produtos, cupons, frete, repository de carrinho |
| `coupons` | Carrinho e regras de desconto |
| `shipping` | Carrinho, auth admin, Drizzle/fallback local |
| `checkout` | Auth, cart, products, coupons, shipping e orders |
| `orders` | Auth policies, cart convertido, Drizzle/fallback e snapshots |

## Checkout e pedidos

O modulo `src/features/checkout` depende de:

- `getCurrentSession` para exigir usuario autenticado;
- `cartRepository` e `recalculateCartView` para resolver carrinho ativo proprio;
- `productRepository` para revalidar disponibilidade e estoque;
- `findCouponById` e dominio de cupons para revalidar cupom;
- dominio de frete para validar quote expirada;
- dominio/repository de orders para gerar snapshots e persistir pedido.

O modulo `src/features/orders` depende de:

- `src/db/schema.ts` para `orders`, `order_items` e `carts`;
- Drizzle transaction para criar pedido, itens e converter carrinho no caminho real;
- fallback dev/test explicito sem banco;
- policies `requireCustomer` e `requireAdminLike` para leitura.

## Frete

O modulo `src/features/shipping` nao adiciona dependencia externa de provider. Ele usa:

- Tipos e dominio locais.
- Zod para formularios e actions.
- Drizzle/fallback para regras e cotacoes.
- `requireAdminLike` para admin de frete.
- Integracao com carrinho por servicos server-side.

Providers externos mapeados:

| Provider | Estado | Dependencia externa |
| --- | --- | --- |
| Correios | Futuro inativo | Nenhuma |
| Jadlog | Futuro inativo | Nenhuma |
| Melhor Envio | Futuro inativo | Nenhuma |

Nao ha chamada real a API de frete, nem leitura de credenciais de frete na Fase 8.

## Persistencia

- Schema Drizzle atualizado para `orders.cart_id`, totais em centavos e snapshots.
- `order_items` atualizado para slug, imagem e centavos.
- `carts.status = converted` e `converted_at` sustentam bloqueio/conversao.
- Migration local gerada: `drizzle/0005_glossy_talisman.sql`.
- Nenhuma migration foi aplicada em banco real nesta etapa.

## Scripts validados na Fase 8

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` - 27 arquivos / 79 testes
- `pnpm build`
- `pnpm test:e2e` - 26 testes

## Riscos de dependencia

- Ativar Stripe real exigira nova camada de credenciais, PaymentIntent, webhooks, idempotencia externa e testes dedicados.
- Ativar baixa/reserva de estoque exigira contrato novo com pedido pago e estoque.
- Consumir `usedCount` de cupom deve ficar acoplado a pagamento confirmado ou pedido efetivamente confirmado, nao ao pedido pendente.
- Aplicar migrations em banco real deve ser tratado em etapa operacional separada.
