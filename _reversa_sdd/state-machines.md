# Maquinas de estado Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: estados apos Fase 8.

## Carrinho

```mermaid
stateDiagram-v2
  [*] --> empty
  empty --> active: adicionar item
  active --> active: alterar quantidade
  active --> coupon_applied: aplicar cupom valido
  coupon_applied --> active: remover cupom
  active --> shipping_quoted: cotar frete por CEP
  coupon_applied --> shipping_quoted: cotar frete por CEP
  shipping_quoted --> shipping_selected: selecionar opcao
  shipping_selected --> checkout_review: usuario autenticado inicia checkout
  checkout_review --> converted: pedido pendente criado
  shipping_selected --> shipping_invalidated: alterar itens
  shipping_selected --> shipping_removed: remover frete
  shipping_invalidated --> shipping_quoted: recotar CEP
  shipping_removed --> shipping_quoted: recotar CEP
  converted --> [*]
```

Estados relevantes:

- `empty`: sem itens.
- `active`: com itens e sem checkout.
- `coupon_applied`: cupom valido aplicado.
- `shipping_quoted`: quote gerada para CEP.
- `shipping_selected`: opcao de frete persistida.
- `checkout_review`: usuario autenticado revisa pedido.
- `converted`: pedido pendente criado; carrinho bloqueado.
- `shipping_invalidated`: frete descartado apos mudanca de itens.
- `shipping_removed`: usuario removeu a selecao de frete.

## Checkout pendente

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> unauthenticated: sem sessao
  requested --> invalid_cart: carrinho vazio ou convertido
  requested --> invalid_product: produto indisponivel
  requested --> insufficient_stock: quantidade acima do estoque
  requested --> invalid_coupon: cupom invalido ou esgotado
  requested --> invalid_shipping: frete ausente, expirado ou de outro carrinho
  requested --> invalid_address: endereco incompleto ou CEP divergente
  requested --> reviewed: carrinho valido e usuario autenticado
  reviewed --> pending_order_created: criar pedido pendente
  pending_order_created --> cart_converted: marcar carrinho converted
```

Regras:

- Visitante nao cria pedido.
- Carrinho anonimo nao vira pedido diretamente.
- O servidor recalcula tudo antes de criar pedido.
- Payload financeiro do cliente e ignorado.
- Nenhum pagamento real e iniciado.

## Pedido

```mermaid
stateDiagram-v2
  [*] --> aguardando_pagamento
  aguardando_pagamento --> expirado: 60 minutos sem pagamento futuro
  aguardando_pagamento --> pago: fase futura de pagamento confirmado
  pago --> em_preparacao: fase futura operacional
  em_preparacao --> enviado: fase futura operacional
  enviado --> entregue: fase futura operacional
  aguardando_pagamento --> cancelado: fase futura
```

Estado implementado na Fase 8:

- `aguardando_pagamento`: criado sem pagamento real, com snapshots e expiracao de 60 minutos.

Estados futuros modelados:

- `pago`, `em_preparacao`, `enviado`, `entregue`, `cancelado`, `expirado`, `reembolsado`.

## Cotacao de frete

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> invalid_postal_code: CEP invalido
  requested --> no_coverage: nenhuma regra aplicavel
  requested --> valid_quote: regras manuais encontradas
  valid_quote --> option_selected: selecionar opcao
  valid_quote --> expired: validade encerrada
  option_selected --> forbidden: quote nao pertence ao carrinho ativo
  option_selected --> persisted: quote pertence ao carrinho ativo
  persisted --> snapshotted: pedido pendente criado
```

Regras:

- CEP deve ter 8 digitos numericos.
- Apenas regras manuais ativas sao usadas.
- Providers externos nao participam do fluxo atual.
- Selecao exige ownership da quote pelo carrinho ativo.
- Checkout copia snapshot do frete.

## Cupom `free_shipping`

```mermaid
stateDiagram-v2
  [*] --> applied
  applied --> waiting_shipping: sem frete cotado
  applied --> manual_freight_zeroed: frete manual elegivel cotado
  applied --> no_effect: frete inexistente ou nao elegivel
  manual_freight_zeroed --> snapshotted: pedido pendente criado
```

Regras:

- O cupom nao cria frete.
- O cupom nao altera desconto monetario de produtos.
- O cupom zera somente frete manual calculado e elegivel.
- Pedido pendente nao consome `usedCount`.

## Admin de pedidos

```mermaid
stateDiagram-v2
  [*] --> access_requested
  access_requested --> blocked: sem auth/policy admin-like
  access_requested --> allowed: admin ou manager
  allowed --> pending_orders_listed: listar pendentes
  pending_orders_listed --> detail_viewed: ver detalhe basico
```

Permissao:

- `admin` e `manager` podem listar pedidos pendentes.
- Nao ha transicao para marcar pago, editar valores, baixar estoque ou criar pagamento.

## Fluxos ainda inexistentes

- Pagamento real.
- Stripe real.
- PaymentIntent real.
- Coleta de cartao.
- Captura de pagamento.
- Reserva definitiva de estoque.
- Baixa definitiva de estoque.
