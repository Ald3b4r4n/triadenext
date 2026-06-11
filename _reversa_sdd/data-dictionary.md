# Dicionario de dados Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: modelo de dados apos Fase 10.

## Convencoes

- Valores monetarios em centavos.
- IDs e timestamps gerados server-side.
- Snapshots preservam o contexto da compra.
- Chaves externas mantem ownership e rastreabilidade.
- Migrations `drizzle/0000` a `drizzle/0007` sao locais/versionadas; nenhuma foi aplicada em banco real nesta re-extracao.

## Dominios controlados

| Dominio | Valores relevantes |
|---|---|
| Carrinho | `active`, `converted` |
| Pedido | `aguardando_pagamento`, `pago` |
| PaymentIntent interno | estados de criacao/processamento/pago/falha/cancelado |
| Evento de pagamento | recebido, processado, ignorado ou falho |
| Tipo de notificacao | `customer_order_paid`, `admin_order_paid` |
| Status de notificacao | `pending`, `sending`, `sent`, `mocked`, `failed`, `skipped` |

## `orders`

- Identifica customer e carrinho convertido.
- Persiste status, expiracao, moeda e totais.
- Mantem snapshots de itens, precos, cupom, frete, customer e endereco.
- Pedido pago e origem das notificacoes da Fase 10.

## `payment_intents`

- Liga pedido ao identificador do provider.
- Persiste valor, moeda e status interno.
- Nao armazena dados sensiveis de cartao.

## `payment_events`

- Persiste `event_id` unico e tipo recebido.
- Registra processamento idempotente do webhook.
- Fornece o evento de origem da entrega de notificacao.

## `notification_deliveries`

| Campo | Papel |
|---|---|
| `id` | Identificador da entrega |
| `type` | `customer_order_paid` ou `admin_order_paid` |
| `channel` | Canal da entrega, atualmente e-mail |
| `recipient` | Destinatario normalizado/mascaravel |
| `recipient_role` | Papel logico do destinatario |
| `order_id` | FK para pedido pago |
| `user_id` | FK opcional para usuario |
| `payment_event_id` | Referencia textual ao evento de pagamento |
| `event_type` | Tipo do evento que originou a entrega |
| `provider` | Adapter selecionado |
| `provider_message_id` | ID externo quando houver |
| `idempotency_key` | Chave unica por pedido/evento/tipo/destinatario |
| `status` | Estado atual da entrega |
| `attempt_count` | Quantidade de tentativas registradas |
| `last_error` | Erro sanitizado |
| `metadata` | Metadados seguros da entrega |
| `sent_at` / `failed_at` | Marcos de resultado |
| `created_at` / `updated_at` | Auditoria temporal |

## Relacoes e indices

- `notification_deliveries.order_id -> orders.id`.
- `notification_deliveries.user_id -> users.id`, opcional.
- Unique em `notification_deliveries.idempotency_key`.
- Indices por `order_id`, `status`, `payment_event_id` e `created_at`.
- A entrega nao possui FK que permita alterar estoque, cupom ou pagamento.

## Migrations locais recentes

### Fase 8

`drizzle/0005_glossy_talisman.sql`: pedidos, itens e snapshots de checkout.

### Fase 9

`drizzle/0006_soft_mole_man.sql`: indices de PaymentIntent e eventos.

### Fase 10

`drizzle/0007_outstanding_midnight.sql`: enums e tabela `notification_deliveries`, unique idempotente, FKs e indices. Gerada localmente e nao aplicada em banco real.
