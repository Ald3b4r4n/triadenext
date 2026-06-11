# ADR 004 - Webhook como fonte financeira

## Status

Aceito retroativamente.

## Contexto

O browser pode fechar, repetir retorno ou ser manipulado. Pagamento precisa de fonte confiável.

## Decisão

Somente webhook Stripe assinado, especialmente `payment_intent.succeeded`, pode iniciar settlement e marcar pedido como `pago`.

## Alternativas consideradas

- Confirmar pagamento no retorno client-side.
- Permitir marcação manual por admin.
- Confirmar por polling sem webhook.

## Consequências

- 🟢 Reduz risco de falso positivo financeiro.
- 🟢 Permite idempotência por `payment_events.event_id`.
- 🟡 Depende de webhook configurado corretamente em ambiente real.
