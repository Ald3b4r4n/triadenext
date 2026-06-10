# Dependencias Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: dependencias apos Fase 9.

## Dependencias de runtime observadas

| Area | Uso |
| --- | --- |
| Next.js App Router | Rotas, server components, server actions e webhook route handler |
| React | Componentes de UI |
| Drizzle | Schema, queries, transacoes e migrations locais |
| Zod | Validacao de formularios, cupons, carrinho, frete, checkout e pagamentos |
| server-only | Isolamento de modulos server-side |
| Better Auth | Sessao e autenticacao |
| Stripe | SDK server-side para PaymentIntent e assinatura de webhook |
| `@stripe/stripe-js` | Stripe.js no client |
| `@stripe/react-stripe-js` | Payment Element no client |

## Modulos internos

| Modulo | Dependencias internas principais |
| --- | --- |
| `products` | Schema de produtos/categorias, imagens, fixtures e decremento de estoque |
| `auth` | Sessao, papeis, policies e login/cadastro |
| `cart` | Produtos, cupons, frete, repository de carrinho |
| `coupons` | Carrinho, regras de desconto e incremento de `usedCount` |
| `shipping` | Carrinho, auth admin, Drizzle/fallback local |
| `checkout` | Auth, cart, products, coupons, shipping e orders |
| `orders` | Auth policies, cart convertido, Drizzle/fallback, snapshots e status `pago` |
| `payments` | Orders, products, coupons, Stripe adapter, Drizzle/fallback e webhook |

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
- policies `requireCustomer` e `requireAdminLike` para leitura;
- payments para expor status financeiro e permitir transicao interna para `pago`.

## Pagamentos

O modulo `src/features/payments` depende de:

- `orders` para validar pedido proprio, status `aguardando_pagamento`, expiracao, total e moeda;
- `products` para baixa de estoque no settlement;
- `coupons` para consumo de `usedCount` no settlement;
- `src/db/schema.ts` para `payment_intents`, `payment_events`, `orders`, `order_items`, `products` e `coupons`;
- Stripe SDK server-side para criar/reutilizar PaymentIntent e validar assinatura de webhook;
- Stripe.js/React Stripe.js no client para Payment Element;
- fallback/mock explicito em dev/test sem credenciais reais.

Contratos importantes:

- PaymentIntent usa valor/moeda snapshotados no servidor.
- Client recebe apenas publishable key, client secret e estado sanitizado.
- Secrets Stripe ficam apenas server-side.
- Webhook exige assinatura antes de qualquer mutacao.
- `eventId` unico sustenta idempotencia.
- Settlement real usa transacao Drizzle.

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

Nao ha chamada real a API de frete, nem leitura de credenciais de frete na Fase 9.

## Persistencia

- Schema Drizzle contem `payment_intents` e `payment_events` ativos na Fase 9.
- `payment_intents.provider_reference` tem indice unico.
- `payment_events.event_id` tem indice unico para idempotencia.
- Indices adicionais apoiam consulta por pedido/status e por evento/pedido.
- `orders.status = pago` e `orders.paid_at` sao atualizados apenas pelo settlement.
- `products.stock_quantity` e decrementado somente apos webhook confirmado.
- `coupons.used_count` e incrementado somente apos webhook confirmado.
- Migration local gerada: `drizzle/0006_soft_mole_man.sql`.
- Nenhuma migration foi aplicada em banco real nesta etapa.

## Scripts validados na Fase 9

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` - 82 testes
- `pnpm build`
- `pnpm test:e2e` - 27 testes

## Riscos de dependencia

- Configurar Stripe real exige variaveis seguras fora do repositorio.
- Assinatura de webhook incorreta deve falhar sem mutar estado.
- Replays/duplicidade de webhook nao podem duplicar baixa de estoque nem consumo de cupom.
- Divergencia de valor/moeda/pedido deve ficar auditavel e nao concluir pedido pago.
- Refunds, disputas, fiscal, Bling/NF-e e e-mails transacionais permanecem fora do fluxo atual.
- Aplicar migrations em banco real deve ser tratado em etapa operacional separada.
