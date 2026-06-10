# Dicionario de dados Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: modelo de dados apos Fase 9.

## Convencoes

- Valores monetarios sao armazenados em centavos para calculo de dominio.
- Campos decimais permanecem para compatibilidade operacional/relatorio.
- Datas usam timestamp.
- Regras server-side sao fonte de verdade para totais e pagamentos.
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
| `aguardando_pagamento` | Estado inicial apos checkout pendente |
| `pago` | Pagamento confirmado por webhook e settlement |
| `em_preparacao` | Futuro operacional |
| `enviado` | Futuro operacional |
| `entregue` | Futuro operacional |
| `cancelado` | Futuro operacional |
| `expirado` | Futuro para pedido pendente vencido |
| `reembolsado` | Futuro financeiro |

### Status de PaymentIntent interno

| Valor | Significado |
| --- | --- |
| `pendente` | Registro criado ou PaymentIntent aguardando conclusao |
| `requer_acao` | Stripe requer acao/confirmacao do cliente |
| `pago` | Confirmado por webhook e settlement |
| `falhou` | Falha correlata do PaymentIntent |
| `cancelado` | PaymentIntent cancelado |
| `divergente` | Valor, moeda ou pedido divergente |

### Status de evento de pagamento

| Valor | Significado |
| --- | --- |
| `received` | Evento recebido/registrado |
| `processed` | Evento processado com sucesso ou falha correlata tratada |
| `failed` | Evento valido mas impossivel de concluir com seguranca |
| `ignored` | Evento fora do escopo atual |
| `duplicate` | Evento repetido/idempotente |

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
| `applied_coupon_id` | string opcional | Cupom aplicado |
| `selected_shipping_quote_id` | string opcional | Quote selecionada |
| `selected_shipping_option` | json opcional | Snapshot/preparo da opcao selecionada |
| `shipping_amount_cents` | inteiro | Frete efetivo em centavos |
| `status` | enum | `active`, `converted`, `abandoned`, `expired` |
| `converted_at` | timestamp opcional | Momento em que gerou pedido |

## `orders`

Tabela de pedidos pendentes/pagos e futuros estados de pedido.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador do pedido |
| `user_id` | string opcional no schema | Na regra atual deve existir para pedido criado |
| `cart_id` | string opcional | Carrinho convertido que originou o pedido; indice unico |
| `number` | string | Numero operacional `TE-*` |
| `status` | enum | `aguardando_pagamento` ou `pago` na Fase 9 |
| `fulfillment_status` | enum | Inicial `unfulfilled` |
| `subtotal_cents` | inteiro | Subtotal server-side em centavos |
| `shipping_total_cents` | inteiro | Frete efetivo em centavos |
| `discount_total_cents` | inteiro | Desconto efetivo em centavos |
| `grand_total_cents` | inteiro | Total final em centavos |
| `currency` | string | `BRL` |
| `customer_snapshot` | json | Nome completo, e-mail da sessao e telefone |
| `shipping_address_snapshot` | json | Endereco completo de entrega |
| `shipping_snapshot` | json opcional | CEP, quote, opcao, provider, prazo e valores |
| `coupon_snapshot` | json opcional | Codigo, tipo, valor, desconto e `usedCount` observado |
| `public_token` | string | Token interno de visualizacao |
| `expires_at` | timestamp | `created_at + 60 minutos` |
| `placed_at` | timestamp opcional | Momento de criacao do pedido pendente |
| `paid_at` | timestamp opcional | Preenchido no settlement confirmado |
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
| `product_id` | string opcional | Produto de origem, usado na baixa de estoque |
| `sku_snapshot` | string | SKU no momento do pedido |
| `name_snapshot` | string | Nome no momento do pedido |
| `slug_snapshot` | string opcional | Slug no momento do pedido |
| `image_snapshot` | string opcional | Imagem no momento do pedido |
| `unit_price_cents` | inteiro | Preco unitario em centavos |
| `quantity` | inteiro | Quantidade pedida |
| `line_total_cents` | inteiro | Total da linha em centavos |

## `payment_intents`

Registro interno do PaymentIntent Stripe/mock.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador interno |
| `order_id` | string | Pedido associado |
| `provider` | string | `stripe` ou `stripe_mock` |
| `provider_reference` | string opcional | ID do PaymentIntent no provider; unico |
| `amount_cents` | inteiro | Valor do pedido snapshotado |
| `currency` | string | Moeda do pedido |
| `status` | enum conceitual | `pendente`, `requer_acao`, `pago`, `falhou`, `cancelado`, `divergente` |
| `client_secret` | string opcional | Nao deve ser persistido no caminho real |
| `failure_reason` | string opcional | Motivo sanitizado de falha/divergencia |
| `paid_at` | timestamp opcional | Preenchido no settlement |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

Indices relevantes:

- `payment_intents_provider_reference_unique`.
- `payment_intents_order_status_idx`.

## `payment_events`

Registro de eventos de webhook para auditoria e idempotencia.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador interno |
| `event_id` | string | ID do evento Stripe; unico |
| `event_type` | string | Ex.: `payment_intent.succeeded` |
| `payment_intent_id` | string opcional | Registro interno associado |
| `order_id` | string opcional | Pedido associado |
| `signature_valid` | booleano | Assinatura validada antes do registro |
| `processing_status` | enum conceitual | `received`, `processed`, `failed`, `ignored`, `duplicate` |
| `failure_reason` | string opcional | Motivo sanitizado |
| `payload` | json opcional | Payload reduzido/sanitizado |
| `processed_at` | timestamp opcional | Momento de processamento |
| `created_at` | timestamp | Criacao |

Indices relevantes:

- `payment_events_event_id_unique`.
- `payment_events_payment_intent_id_idx`.
- `payment_events_order_id_idx`.

## Relacoes relevantes

- `cart_items` pertence a `carts`.
- `carts.applied_coupon_id` aponta para cupom aplicado.
- `shipping_quotes.cart_id` pertence a `carts`.
- `orders.cart_id` referencia carrinho convertido.
- `orders.user_id` referencia o usuario dono.
- `order_items.order_id` pertence a `orders`.
- `payment_intents.order_id` referencia pedido pagavel.
- `payment_events.payment_intent_id` referencia registro interno de pagamento.
- `payment_events.event_id` impede reprocessamento duplicado.
- Criar pedido pendente converte/bloqueia o carrinho.
- Criar PaymentIntent nao altera pedido para `pago`.
- Webhook confirmado atualiza `orders`, `payment_intents`, `products`, `coupons` e `payment_events`.

## Migrations locais recentes

### Fase 8

- Arquivo: `drizzle/0005_glossy_talisman.sql`
- Conteudo conceitual: adiciona `cart_id`, totais em centavos e `coupon_snapshot` em `orders`; adiciona slug, imagem e centavos em `order_items`; cria indices de leitura/idempotencia.
- Estado: gerada e versionada localmente; nao aplicada em banco real nesta etapa.

### Fase 9

- Arquivo: `drizzle/0006_soft_mole_man.sql`
- Conteudo conceitual: cria indice unico para `payment_events.event_id`, indices de consulta para eventos e intents, e indice unico para `payment_intents.provider_reference`.
- Estado: gerada e versionada localmente; nao aplicada em banco real nesta etapa.
