# Maquinas de estado Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: estados apos Fase 9.

## Carrinho

```mermaid
stateDiagram-v2
  [*] --> empty
  empty --> active: adicionar item
  active --> active: alterar quantidade
  active --> coupon_applied: aplicar cupom valido
  coupon_applied --> active: remover cupom
  active --> shipping_quoted: cotar frete por CEP
  coupon_applied --> shipping_quoted: cotar frete por CEP
  shipping_quoted --> shipping_selected: selecionar opcao
  shipping_selected --> checkout_review: usuario autenticado inicia checkout
  checkout_review --> converted: pedido pendente criado
  shipping_selected --> shipping_invalidated: alterar itens
  shipping_selected --> shipping_removed: remover frete
  shipping_invalidated --> shipping_quoted: recotar CEP
  shipping_removed --> shipping_quoted: recotar CEP
  converted --> [*]
```

Carrinho `converted` e terminal para novas mutacoes. Pagamento nao reabre carrinho.

## Checkout pendente

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> unauthenticated: sem sessao
  requested --> invalid_cart: carrinho vazio ou convertido
  requested --> invalid_product: produto indisponivel
  requested --> insufficient_stock: quantidade acima do estoque
  requested --> invalid_coupon: cupom invalido ou esgotado
  requested --> invalid_shipping: frete ausente, expirado ou de outro carrinho
  requested --> invalid_address: endereco incompleto ou CEP divergente
  requested --> reviewed: carrinho valido e usuario autenticado
  reviewed --> pending_order_created: criar pedido pendente
  pending_order_created --> cart_converted: marcar carrinho converted
```

Regras:

- Visitante nao cria pedido.
- O servidor recalcula tudo antes de criar pedido.
- Payload financeiro do cliente e ignorado.
- Nenhum pagamento e confirmado no checkout.

## Pedido

```mermaid
stateDiagram-v2
  [*] --> aguardando_pagamento
  aguardando_pagamento --> expirado: 60 minutos sem pagamento confirmado
  aguardando_pagamento --> pago: webhook payment_intent.succeeded valido
  aguardando_pagamento --> cancelado: fase futura ou falha operacional controlada
  pago --> em_preparacao: fase futura operacional
  em_preparacao --> enviado: fase futura operacional
  enviado --> entregue: fase futura operacional
  pago --> reembolsado: fase futura financeira
```

Estado implementado na Fase 9:

- `aguardando_pagamento`: criado sem pagamento confirmado.
- `pago`: somente por settlement de webhook assinado/idempotente.

Estados futuros:

- `em_preparacao`, `enviado`, `entregue`, `cancelado`, `expirado`, `reembolsado`.

## PaymentIntent

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> not_payable: pedido alheio, expirado, pago ou invalido
  requested --> unavailable: Stripe indisponivel fora de dev/test
  requested --> internal_pending: registro interno criado
  internal_pending --> provider_created: PaymentIntent Stripe/mock criado
  provider_created --> requires_action: Stripe exige acao do cliente
  provider_created --> pending_confirmation: aguardando webhook
  requires_action --> pending_confirmation: Payment Element confirmado
  pending_confirmation --> paid: webhook succeeded processado
  pending_confirmation --> failed: webhook failed
  pending_confirmation --> canceled: webhook canceled
  pending_confirmation --> divergent: valor/moeda/pedido divergente
```

Regras:

- PaymentIntent usa valor e moeda do pedido no servidor.
- Client nao define amount/currency.
- PaymentIntent pode ser reutilizado quando ainda e seguro.
- Client secret nao e secret key e nao deve ser confundido com credencial server-side.
- Retorno client-side nao muda pedido para `pago`.

## Webhook Stripe

```mermaid
stateDiagram-v2
  [*] --> received
  received --> rejected: assinatura ausente ou invalida
  received --> duplicate: eventId ja registrado
  received --> unresolved: PaymentIntent interno ausente
  received --> succeeded: payment_intent.succeeded
  received --> failed_or_canceled: payment_failed ou canceled
  received --> ignored: evento fora do escopo
  succeeded --> settlement_validation
  settlement_validation --> divergent: valor, moeda ou pedido divergente
  settlement_validation --> insufficient_stock: estoque insuficiente
  settlement_validation --> settled: pedido, pagamento, estoque e cupom atualizados
  failed_or_canceled --> payment_status_updated: sem marcar pedido como pago
```

Regras:

- Assinatura valida e pre-condicao.
- `eventId` unico torna o processamento idempotente.
- Evento duplicado nao baixa estoque nem consome cupom de novo.
- Falha/cancelamento nao marca pedido como pago.
- Divergencia nao conclui estado operacional parcial.

## Settlement

```mermaid
stateDiagram-v2
  [*] --> validate_order
  validate_order --> validate_amount_currency
  validate_amount_currency --> validate_stock
  validate_stock --> consume_coupon
  consume_coupon --> decrement_stock
  decrement_stock --> mark_payment_paid
  mark_payment_paid --> mark_order_paid
  mark_order_paid --> mark_event_processed
  validate_amount_currency --> failed: divergencia
  validate_stock --> failed: estoque insuficiente
  consume_coupon --> failed: cupom ausente quando exigido
```

No banco real, o settlement e executado em transacao Drizzle. Em mock dev/test, os efeitos simulam a mesma ordem conceitual sobre fixtures.

## Cotacao de frete

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> invalid_postal_code: CEP invalido
  requested --> no_coverage: nenhuma regra aplicavel
  requested --> valid_quote: regras manuais encontradas
  valid_quote --> option_selected: selecionar opcao
  valid_quote --> expired: validade encerrada
  option_selected --> forbidden: quote nao pertence ao carrinho ativo
  option_selected --> persisted: quote pertence ao carrinho ativo
  persisted --> snapshotted: pedido pendente criado
```

## Cupom `free_shipping`

```mermaid
stateDiagram-v2
  [*] --> applied
  applied --> waiting_shipping: sem frete cotado
  applied --> manual_freight_zeroed: frete manual elegivel cotado
  applied --> no_effect: frete inexistente ou nao elegivel
  manual_freight_zeroed --> snapshotted: pedido pendente criado
  snapshotted --> consumed: webhook succeeded confirmado
```

Pedido pendente nao consome `usedCount`; webhook confirmado consome uma vez.

## Admin de pedidos

```mermaid
stateDiagram-v2
  [*] --> access_requested
  access_requested --> blocked: sem auth/policy admin-like
  access_requested --> allowed: admin ou manager
  allowed --> orders_listed: listar pedidos
  orders_listed --> detail_viewed: ver detalhe basico
```

Permissao:

- `admin` e `manager` podem listar pedidos.
- Nao ha transicao admin para marcar pago, editar valores, baixar estoque, consumir cupom ou criar pagamento.

## Fluxos ainda inexistentes

- Stripe Checkout Session como fluxo principal.
- Coleta propria de cartao.
- Armazenamento de dados sensiveis de cartao.
- Refund/disputa completos.
- Fiscal/Bling/NF-e.
- E-mail transacional real obrigatorio.
