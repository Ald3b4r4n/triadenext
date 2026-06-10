# Investigation: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`

## 1. Pergunta investigada

Como ativar pagamento Stripe para pedidos pendentes sem quebrar os guardrails da Fase 8: valor server-side, cliente autenticado, webhook como fonte final, idempotencia e efeitos atomicos sobre pedido, estoque e cupom.

## 2. Fontes locais

| Fonte | Uso no plano |
|-------|--------------|
| `_reversa_sdd/architecture.md#Checkout` | Checkout ja e server-side, autenticado e nao coleta cartao. |
| `_reversa_sdd/architecture.md#Orders` | Pedido pendente ja possui snapshots, expiracao e idempotencia por carrinho convertido. |
| `_reversa_sdd/data-dictionary.md#payment_intents-e-payment_events` | Tabelas de pagamento existem como superficie futura. |
| `_reversa_sdd/state-machines.md#Pedido` | Transicao `aguardando_pagamento -> pago` era futura e passa a ser alvo da fase. |
| `_reversa_sdd/permissions.md#Matriz de acesso` | Admin nao marca pago e cliente acessa somente pedidos proprios. |
| `src/app/api/webhooks/stripe/route.ts` | Endpoint de webhook existe como placeholder seguro. |

## 3. Fontes externas primarias

| Fonte | Conclusao aplicada |
|-------|-------------------|
| Stripe Payment Element / PaymentIntent quickstart: https://docs.stripe.com/payments/quickstart | O servidor cria PaymentIntent e retorna client secret para finalizar no cliente. |
| Stripe Payment Intents API: https://docs.stripe.com/payments/payment-intents | PaymentIntent acompanha o ciclo de vida do pagamento; client secret deve ser tratado com cuidado e nao logado. |
| Stripe webhook docs: https://docs.stripe.com/webhooks | Webhook deve verificar assinatura com payload bruto, header `Stripe-Signature` e endpoint secret. |
| Stripe payment status updates: https://docs.stripe.com/payments/payment-intents/verifying-status | Fulfillment nao deve depender do client-side; `payment_intent.succeeded` deve ser monitorado por webhook. |
| Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests | POSTs para Stripe devem usar idempotency key para retries seguros. |

## 4. Alternativas avaliadas

### Alternativa A - PaymentIntent direto + Payment Element

- Status: escolhida.
- Motivo: bate com decisao humana, preserva controle server-side do valor e evita Checkout Session como fluxo principal.
- Custo: exige camada client com Stripe.js e contrato de client secret.

### Alternativa B - Stripe Checkout Session

- Status: descartada.
- Motivo: decisao humana explicita excluiu Checkout Session como fluxo principal.
- Risco evitado: duplicar checkout externo quando a aplicacao ja tem pedido pendente e snapshot completo.

### Alternativa C - Confirmar pagamento pelo retorno client-side

- Status: descartada.
- Motivo: Stripe recomenda webhook para fulfillment; retorno do browser pode nao acontecer ou ser manipulado.
- Risco evitado: pedido pago sem evento confiavel.

### Alternativa D - Baixar estoque na criacao do PaymentIntent

- Status: descartada.
- Motivo: decisao humana definiu consumo de estoque e cupom apenas no webhook confirmado.
- Risco evitado: estoque retido ou cupom consumido em pagamento abandonado.

## 5. Padrao proposto

1. Server action/API autenticada recebe `orderId`.
2. Servidor valida owner, status `aguardando_pagamento`, expiracao, valor e moeda do snapshot.
3. Servidor cria ou reutiliza payment intent interno elegivel.
4. Adapter Stripe cria PaymentIntent real com idempotency key derivada de `orderId`/payment intent interno.
5. Cliente recebe client secret e usa Stripe.js/Payment Element.
6. Retorno client-side atualiza somente estado visual.
7. Webhook assinado processa `payment_intent.succeeded`.
8. Transacao confere evento, pedido, valor, moeda e idempotencia.
9. Transacao marca pagamento interno/pedido como pago, baixa estoque e incrementa `usedCount`.

## 6. Pontos de atencao para coding

- Em Next.js, a validacao de assinatura Stripe precisa do body bruto do request.
- Client secret nao deve ir para logs, URL ou storage persistente.
- Metadata Stripe deve conter identificador interno suficiente para correlacionar pedido/payment intent, mas nao deve carregar dados sensiveis.
- Falhas correlatas do PaymentIntent devem atualizar o pagamento interno para `falhou` ou `cancelado` sem tocar pedido como pago.
- Eventos fora de ordem devem consultar estado atual antes de aplicar efeito.

## 7. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Investigacao inicial gerada por `/reversa-plan` | reversa |
