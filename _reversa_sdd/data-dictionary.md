# Dicionario de dados Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: modelo de dados apos Fase 8.

## Convencoes

- Valores monetarios sao armazenados em centavos para calculo de dominio.
- Campos decimais permanecem para compatibilidade operacional/relatorio.
- Datas usam timestamp.
- Regras server-side sao fonte de verdade para totais.
- Migrations sao locais/versionadas; nenhuma aplicacao em banco real ocorreu nesta re-extracao.

## Enums e dominios controlados

### Status de carrinho

| Valor | Significado |
| --- | --- |
| `active` | Carrinho editavel e elegivel para checkout |
| `converted` | Carrinho gerou pedido pendente e fica bloqueado |
| `abandoned` | Carrinho abandonado |
| `expired` | Carrinho expirado |

### Status de pedido

| Valor | Significado |
| --- | --- |
| `aguardando_pagamento` | Estado inicial da Fase 8 |
| `pago` | Futuro, depende de pagamento confirmado |
| `em_preparacao` | Futuro operacional |
| `enviado` | Futuro operacional |
| `entregue` | Futuro operacional |
| `cancelado` | Futuro operacional |
| `expirado` | Futuro para pedido pendente vencido |
| `reembolsado` | Futuro financeiro |

### Tipo de cupom

| Valor | Significado |
| --- | --- |
| `percentage` | Desconto percentual sobre itens elegiveis |
| `fixed_amount` | Desconto fixo em centavos |
| `free_shipping` | Zera frete manual calculado e elegivel |

### Provider de frete

| Valor | Estado |
| --- | --- |
| `manual` | Ativo |
| `correios` | Adapter futuro inativo |
| `jadlog` | Adapter futuro inativo |
| `melhor_envio` | Adapter futuro inativo |

## `carts`

Campos relevantes:

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador do carrinho |
| `user_id` | string opcional | Usuario autenticado, quando houver |
| `guest_token` | string opcional | Visitante anonimo |
| `session_id` | string opcional | Apoio ao carrinho anonimo |
| `applied_coupon_id` | string opcional | Cupom aplicado |
| `shipping_postal_code` | string opcional | CEP usado na cotacao |
| `selected_shipping_quote_id` | string opcional | Quote selecionada |
| `selected_shipping_option` | json opcional | Snapshot/preparo da opcao selecionada |
| `shipping_amount_cents` | inteiro | Frete efetivo em centavos |
| `status` | enum | `active`, `converted`, `abandoned`, `expired` |
| `converted_at` | timestamp opcional | Momento em que gerou pedido |
| `expires_at` | timestamp opcional | Expiracao de carrinho anonimo |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

Derivados em view de carrinho:

- subtotal dos itens.
- desconto de cupom.
- valor de frete.
- total parcial com frete.

## `shipping_rules`

Tabela de regras manuais de frete.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador |
| `name` | string | Nome operacional da regra |
| `provider` | string | `manual` no fluxo atual |
| `rule_type` | string | `uf` ou `postal_range` |
| `uf` | string opcional | UF alvo |
| `postal_code_start` | string opcional | Inicio da faixa de CEP |
| `postal_code_end` | string opcional | Fim da faixa de CEP |
| `price_cents` | inteiro | Valor do frete em centavos |
| `estimated_days` | inteiro | Prazo manual estimado |
| `priority` | inteiro | Prioridade de aplicacao |
| `is_active` | booleano | Regra ativa/inativa |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

## `shipping_quotes`

Tabela de cotacoes de frete por carrinho.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador da quote |
| `cart_id` | string | Carrinho dono da cotacao |
| `postal_code` | string | CEP normalizado |
| `cart_hash` | string | Assinatura do estado do carrinho |
| `provider` | string | `manual` no fluxo atual |
| `source` | string | Origem da cotacao: manual/fixture/dev |
| `options` | json | Opcoes geradas |
| `selected_option_id` | string opcional | Opcao escolhida |
| `expires_at` | timestamp | Validade local da cotacao |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

## `orders`

Tabela de pedidos pendentes e futuros estados de pedido.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador do pedido |
| `user_id` | string opcional no schema | Na Fase 8 deve existir para pedido criado |
| `cart_id` | string opcional | Carrinho convertido que originou o pedido; indice unico |
| `number` | string | Numero operacional `TE-*` |
| `status` | enum | Inicial `aguardando_pagamento` |
| `fulfillment_status` | enum | Inicial `unfulfilled` |
| `subtotal` | decimal | Compatibilidade operacional |
| `subtotal_cents` | inteiro | Subtotal server-side em centavos |
| `shipping_total` | decimal | Compatibilidade operacional |
| `shipping_total_cents` | inteiro | Frete efetivo em centavos |
| `discount_total` | decimal | Compatibilidade operacional |
| `discount_total_cents` | inteiro | Desconto efetivo em centavos |
| `grand_total` | decimal | Compatibilidade operacional |
| `grand_total_cents` | inteiro | Total final em centavos |
| `currency` | string | `BRL` |
| `customer_snapshot` | json | Nome completo, e-mail da sessao e telefone |
| `shipping_address_snapshot` | json | Endereco completo de entrega |
| `shipping_snapshot` | json opcional | CEP, quote, opcao, provider, prazo e valores |
| `coupon_snapshot` | json opcional | Codigo, tipo, valor, desconto e `usedCount` observado |
| `public_token` | string | Token interno de visualizacao |
| `expires_at` | timestamp | `created_at + 60 minutos` |
| `placed_at` | timestamp opcional | Momento de criacao do pedido pendente |
| `paid_at` | timestamp opcional | Futuro, nao usado na Fase 8 |
| `cancelled_at` | timestamp opcional | Futuro |
| `completed_at` | timestamp opcional | Futuro |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

Indices relevantes:

- `orders_user_id_idx`.
- `orders_status_expires_at_idx`.
- `orders_cart_id_unique`.

## `order_items`

Tabela de snapshots de linhas do pedido.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador do item |
| `order_id` | string | Pedido dono |
| `product_id` | string opcional | Produto de origem, se ainda existir |
| `sku_snapshot` | string | SKU no momento do pedido |
| `name_snapshot` | string | Nome no momento do pedido |
| `slug_snapshot` | string opcional | Slug no momento do pedido |
| `image_snapshot` | string opcional | Imagem no momento do pedido |
| `unit_price` | decimal | Compatibilidade operacional |
| `unit_price_cents` | inteiro | Preco unitario em centavos |
| `quantity` | inteiro | Quantidade pedida |
| `line_total` | decimal | Compatibilidade operacional |
| `line_total_cents` | inteiro | Total da linha em centavos |
| `created_at` | timestamp | Criacao |

## `payment_intents` e `payment_events`

Existem no schema como superficie futura. A Fase 8 nao cria PaymentIntent real, nao chama Stripe,
nao captura pagamento e nao coleta cartao.

## Relacoes relevantes

- `cart_items` pertence a `carts`.
- `carts.applied_coupon_id` aponta para cupom aplicado.
- `shipping_quotes.cart_id` pertence a `carts`.
- `carts.selected_shipping_quote_id` referencia a quote selecionada.
- `orders.cart_id` referencia carrinho convertido.
- `orders.user_id` referencia o usuario dono.
- `order_items.order_id` pertence a `orders`.
- Alterar itens do carrinho invalida a selecao de frete.
- Criar pedido pendente converte/bloqueia o carrinho.

## Migration local da Fase 8

- Arquivo: `drizzle/0005_glossy_talisman.sql`
- Conteudo conceitual: adiciona `cart_id`, totais em centavos e `coupon_snapshot` em `orders`; adiciona slug, imagem e centavos em `order_items`; cria indices de leitura/idempotencia.
- Estado: gerada e versionada localmente; nao aplicada em banco real nesta etapa.
