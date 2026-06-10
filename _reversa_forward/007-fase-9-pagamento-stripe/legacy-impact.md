# Legacy Impact: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/features/payments/**` | Pagamentos | componente-novo | HIGH | Ativa PaymentIntent, adapter Stripe/mock, webhook, idempotencia e settlement. |
| `src/app/api/webhooks/stripe/route.ts` | Integracao Stripe | delta-de-contrato-externo | HIGH | Placeholder passa a validar assinatura e processar eventos. |
| `src/db/schema.ts`, `drizzle/0006_soft_mole_man.sql` | Persistencia | delta-de-dados | HIGH | Adiciona constraints/indices de idempotencia sem aplicar migration real. |
| `src/features/orders/**` | Pedidos | regra-alterada | HIGH | Pedido pode transicionar de `aguardando_pagamento` para `pago` somente por webhook. |
| `src/app/(customer)/pedidos/**` | Customer | delta-de-contrato-externo | MEDIUM | Cliente inicia pagamento e acompanha status do proprio pedido. |
| `src/app/admin/pedidos/page.tsx` | Admin | regra-alterada | MEDIUM | Admin passa a ver status pago, mantendo leitura sem mutacao. |
| `src/app/(storefront)/checkout/page.tsx` | Checkout | regra-alterada | MEDIUM | Checkout continua criando pedido pendente e aponta para pagamento posterior. |
| `.env.example`, `src/lib/env.ts` | Configuracao | delta-de-contrato-externo | MEDIUM | Declara chaves Stripe sem valores reais. |
| `docs/**` | Documentacao | regra-alterada | LOW | Atualiza arquitetura, operacao e fora de escopo. |

## Diff conceitual por componente

### Pagamentos

PaymentIntent direto passa a ser criado server-side usando total/moeda do pedido. O client usa
Payment Element. Adapter mock explicito atende dev/test sem secrets reais.

### Webhook e settlement

`payment_intent.succeeded` validado por assinatura e `eventId` e a unica fonte final. No caminho
real, pedido, pagamento, estoque e cupom sao atualizados na mesma transacao Drizzle.

### Pedidos

Leituras customer/admin passam a incluir pedidos pagos. Nao foi criado comando administrativo para
marcar pago ou editar valores.

## Preservadas

- Checkout continua autenticado.
- Pedido anonimo continua fora de escopo.
- Valor financeiro continua vindo do snapshot server-side.
- Pedido pendente continua expirando em 60 minutos.
- Carrinho convertido continua bloqueado.
- Retorno client-side nao marca pedido como pago.
- Stripe Checkout Session nao e fluxo principal.
- Aplicacao nao coleta nem armazena cartao em formulario proprio.
- Bling/NF-e/fiscal e email transacional obrigatorio continuam fora de escopo.

## Modificadas

- `payment_intents` e `payment_events` deixam de ser superficie inerte e tornam-se operacionais.
- Pedido `aguardando_pagamento` pode transicionar para `pago` por webhook confirmado.
- Estoque passa a baixar somente no settlement do webhook.
- `usedCount` do cupom passa a ser consumido somente no settlement do webhook.
- Customer/admin passam a visualizar status financeiro pago.
