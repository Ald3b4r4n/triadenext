# Stripe

Stripe deve ser preparado primeiro em test mode. Live mode, pagamento real e chaves reais em
codigo ficam fora da execucao automatica da Fase 12.

## Variaveis

- `STRIPE_SECRET_KEY`: server-only.
- `STRIPE_WEBHOOK_SECRET`: server-only.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: chave publica usada pelo Payment Element.

Nunca registrar valores dessas variaveis em codigo, logs, documentacao ou respostas.

## Test mode

- Usar chaves `test` para preview/staging.
- Usar test cards ou mock/dev conforme ambiente aprovado.
- Nunca usar cartao real.
- Nunca usar `sk_live` ou live webhook secret nesta fase.
- Confirmar que retorno do navegador nao marca pedido como pago.

## Webhook

Endpoint existente: `POST /api/webhooks/stripe`.

Eventos minimos:

- `payment_intent.succeeded`: confirma settlement.
- `payment_intent.payment_failed`: falha sem marcar pedido pago.
- `payment_intent.canceled`: cancelamento sem marcar pedido pago.

O body bruto e o header `Stripe-Signature` validam assinatura. `eventId` protege idempotencia.
`payment_intent.succeeded` confirma pedido/pagamento, estoque e cupom em transacao atomica.

## Smoke seguro

- [ ] Usar URL de preview/staging aprovada.
- [ ] Usar test mode.
- [ ] Nao imprimir `sk_*`, `whsec_*`, PaymentIntent secret ou payload bruto.
- [ ] Validar evento duplicado sem repetir settlement.
- [ ] Confirmar notificacao mock/skipped ou provider seguro.

## Fora de escopo

- Checkout Session como fluxo principal.
- Formulario proprio ou armazenamento de cartao.
- Refund/disputa completos.
- Bling, NF-e, fiscal, WhatsApp e SMS.
