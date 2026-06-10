# Stripe

## Variaveis

- `STRIPE_SECRET_KEY`: server-only.
- `STRIPE_WEBHOOK_SECRET`: server-only.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: chave publica usada pelo Payment Element.

Nunca registre valores dessas variaveis em codigo, logs, documentacao ou respostas.

## Ambientes

- Dev/test sem chaves: adapter mock explicito, assinatura `triade-mock-signature` apenas interna aos testes.
- Preview/producao sem configuracao completa: pagamento real indisponivel e falha segura.
- Stripe real: PaymentIntent direto no servidor e Payment Element no client.

## Webhook

Endpoint: `POST /api/webhooks/stripe`.

O body bruto e o header `Stripe-Signature` sao usados para validar assinatura. `eventId` e persistido
para idempotencia. `payment_intent.succeeded` confirma pedido/pagamento, estoque e cupom em transacao
atomica. Falhas e cancelamentos nao marcam pedido como pago.

## Fora de escopo

- Checkout Session como fluxo principal.
- Formulario proprio ou armazenamento de cartao.
- Refund/disputa completos.
- Bling, NF-e, fiscal e email transacional obrigatorio.
