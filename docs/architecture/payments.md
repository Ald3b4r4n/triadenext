# Payments

Stripe esta preparado somente como placeholder. Na Fase 8, checkout cria somente pedido pendente.

Contrato futuro:

- Checkout cria pedido `aguardando_pagamento`.
- Pagamento inicial nasce `pendente`.
- Webhook valida assinatura e idempotencia por `eventId`.
- Evento `paid` marca pedido e pagamento como `pago`.
- Evento `paid` tambem baixa estoque, envia e-mails, registra analytics e aciona Bling.
- Admin nao deve marcar pedido como pago manualmente.

## Fase 8

- Nenhuma chamada Stripe.
- Nenhum PaymentIntent real.
- Nenhum campo de cartao na UI.
- Nenhuma captura de pagamento.
- Pedido fica `aguardando_pagamento` por 60 minutos.
- Estoque e cupom sao validados, mas estoque nao baixa/reserva e `usedCount` nao e consumido.
