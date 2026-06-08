# Parity Test Plan

A suite de paridade deve evoluir a partir do plano do Reversa.

Casos criticos confirmados:

- Produto publico exige `published`, `published_at <= now()` e estoque positivo.
- Produto `inactive` permanece como inativo/arquivado ate validacao final.
- Cupom normaliza codigo, valida ativo, datas e limite de uso.
- Desconto de cupom nao pode exceder subtotal.
- Checkout bloqueia carrinho vazio, produto indisponivel, estoque insuficiente e frete invalido.
- Pedido pendente nasce como `aguardando_pagamento` e expira em 60 minutos.
- Pagamento inicial nasce como `pendente`.
- Stripe `paid` marca pedido/pagamento como `pago`, baixa estoque, envia e-mails, registra analytics e aciona Bling.
- Admin nao marca pedido como pago manualmente.
- Cliente so acessa recursos proprios via policies.
