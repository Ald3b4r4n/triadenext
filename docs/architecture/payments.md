# Payments

Stripe esta preparado somente como placeholder nesta fase.

Contrato futuro:

- Checkout cria pedido `aguardando_pagamento`.
- Pagamento inicial nasce `pendente`.
- Webhook valida assinatura e idempotencia por `eventId`.
- Evento `paid` marca pedido e pagamento como `pago`.
- Evento `paid` tambem baixa estoque, envia e-mails, registra analytics e aciona Bling.
- Admin nao deve marcar pedido como pago manualmente.
