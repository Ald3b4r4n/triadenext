# Payments — Fase 9

## Fluxo

- Cliente autenticado inicia pagamento de pedido proprio em `aguardando_pagamento`.
- O servidor usa `grandTotalCents` e `currency` do snapshot do pedido.
- O servidor cria PaymentIntent direto; Stripe Checkout Session nao e o fluxo principal.
- O client usa Stripe.js/Payment Element e nao coleta cartao em formulario proprio.
- Retorno client-side apenas informa processamento.
- `payment_intent.succeeded` por webhook assinado e a fonte final para marcar pago.

## Webhook e atomicidade

O endpoint `/api/webhooks/stripe` valida assinatura e registra `eventId`. Evento duplicado vira no-op.
No caminho com banco real, uma transacao marca pagamento e pedido como pagos, baixa estoque e
incrementa `usedCount` do cupom. Divergencia de pedido, valor, moeda ou estoque impede conclusao
parcial e fica registrada como erro controlado.

## Ambiente

- Dev/test sem chaves Stripe usam adapter mock explicito.
- Preview/producao sem Stripe configurado falham de forma segura.
- Client secret, secret key e webhook secret nao sao gravados em logs.
- Mock nao representa cobranca real.

## Fora de escopo

- Stripe Checkout Session como fluxo principal.
- Formulario proprio ou armazenamento de dados sensiveis de cartao.
- Marcacao manual de pago pelo admin.
- Bling, NF-e, fiscal e email transacional obrigatorio.
