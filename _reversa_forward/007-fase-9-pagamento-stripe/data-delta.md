# Data Delta: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`

## 1. Panorama

A Fase 8 ja deixou `orders`, `order_items`, `payment_intents` e `payment_events` no schema. A Fase 9 nao precisa criar um modelo paralelo de pagamento; ela deve ativar a superficie existente, reforcando idempotencia, correlacao com Stripe e transacao atomica para confirmar pedido, pagamento, estoque e cupom.

## 2. Entidades impactadas

### `orders`

Semantica nova:

- `status = aguardando_pagamento` continua elegivel para PaymentIntent se o pedido nao estiver expirado;
- `status = pago` passa a ser aplicado pelo webhook `payment_intent.succeeded`;
- `paidAt` passa a registrar o momento de confirmacao processada;
- `grandTotalCents` e `currency` sao a fonte de verdade para criar e validar PaymentIntent;
- `expiresAt` bloqueia criacao/reuso de PaymentIntent para pedido vencido.

Possivel delta de indice:

- manter indice por `status`/`expiresAt`;
- avaliar indice por `publicToken`/`number` apenas se a UI de retorno precisar buscar por token seguro.

### `payment_intents`

Campos atuais relevantes:

- `orderId`;
- `provider`;
- `providerReference`;
- `checkoutSessionId`;
- `status`;
- `amount`;
- `currency`;
- `failureReason`;
- `paidAt`;
- `refundedAt`;
- timestamps.

Semantica nova:

- `provider = stripe` para PaymentIntent real;
- `providerReference` guarda o id do PaymentIntent Stripe;
- `checkoutSessionId` nao deve ser usado como fluxo principal nesta fase;
- `status = pendente` ao criar ou reutilizar intent elegivel;
- `status = pago` no webhook `payment_intent.succeeded`;
- `status = falhou` ou `cancelado` em falhas/cancelamentos correlatos;
- `amount` e `currency` devem espelhar o snapshot do pedido.

Possiveis reforcos:

- indice unico por `providerReference`, se ainda nao existir;
- indice por `orderId/status` para lookup de intent atual;
- campo ou metadata interna para idempotency key se o modelo exigir rastreabilidade local.

### `payment_events`

Campos atuais relevantes:

- `paymentIntentId`;
- `orderId`;
- `eventId`;
- `eventType`;
- `signatureValid`;
- `payload`;
- `processingStatus`;
- `processedAt`;
- `failureReason`;
- timestamps.

Semantica nova:

- cada evento Stripe recebido deve gerar ou consultar registro por `eventId`;
- `signatureValid = false` deve registrar tentativa se isso puder ser feito sem confiar no payload;
- `processingStatus` deve distinguir ao menos processado, ignorado/duplicado e erro;
- payload persistido deve ser sanitizado quando necessario para nao expor segredo ou dado sensivel.

Possiveis reforcos:

- unique por `eventId`;
- indice por `orderId`;
- indice por `paymentIntentId`;
- limite ou estrategia de armazenamento para payload bruto/sanitizado.

### `products`

Semantica nova:

- estoque so e decrementado no webhook confirmado;
- decremento deve conferir quantidade dos `order_items` contra estoque atual;
- estoque insuficiente no webhook gera erro controlado e nao conclui estado operacional inconsistente.

### `coupons`

Semantica nova:

- `usedCount` so e incrementado no webhook confirmado;
- incremento deve acontecer uma vez por pedido pago;
- pedidos sem cupom nao tocam `usedCount`;
- webhook duplicado nao incrementa novamente.

## 3. Transacao atomica esperada

No processamento valido de `payment_intent.succeeded`:

1. bloquear ou ler de forma consistente o `payment_event` por `eventId`;
2. conferir assinatura, tipo de evento, provider reference, pedido, valor e moeda;
3. conferir que o pedido ainda nao esta `pago`;
4. conferir estoque suficiente para os itens do pedido;
5. marcar `payment_intents.status = pago` e `paidAt`;
6. marcar `orders.status = pago` e `paidAt`;
7. decrementar estoque dos produtos;
8. incrementar `coupons.usedCount` quando houver cupom no snapshot;
9. marcar o evento como processado.

Se qualquer conferencia falhar, a transacao nao deve concluir estado parcial. O evento deve registrar falha controlada.

## 4. Migracao local esperada

Pode nao haver migration se os campos e indices atuais forem suficientes. Se faltar idempotencia persistente, gerar migration local additive para:

- unique de `payment_events.event_id`;
- unique ou index de `payment_intents.provider_reference`;
- indices auxiliares de `payment_intents.order_id/status`.

Nenhuma migration deve ser aplicada em banco real durante o fluxo Reversa.

## 5. Risco de dados

| Risco | Mitigacao |
|-------|-----------|
| Duplo processamento de webhook | Unique/idempotencia por `eventId` e checagem de pedido ja pago. |
| Pedido pago sem baixa de estoque | Transacao atomica obrigatoria. |
| Estoque baixado sem pedido pago | Ordem e rollback transacional. |
| Cupom consumido duas vezes | Check de idempotencia e vinculo com pedido ja pago. |
| Divergencia Stripe x snapshot | Validar amount/currency contra `orders.grandTotalCents`/`currency`. |

## 6. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Data delta inicial gerado por `/reversa-plan` | reversa |
