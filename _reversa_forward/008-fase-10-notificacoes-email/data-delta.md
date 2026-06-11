# Data Delta: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`

## Delta conceitual

A Fase 10 adiciona uma outbox/registro de notificacoes. O modelo atual ja possui `orders`, `payment_intents` e `payment_events`; a nova estrutura deve referenciar pedido e, quando possivel, evento de pagamento, sem modificar a regra de pagamento da Fase 9.

## Nova entidade proposta: `notification_deliveries`

| Campo | Tipo conceitual | Obrigatorio | Observacao |
|-------|-----------------|-------------|------------|
| `id` | string | sim | Identificador interno. |
| `type` | string/enum | sim | Ex.: `order_paid_customer`, `order_paid_admin`. |
| `channel` | string/enum | sim | Fase 10 usa `email`; WhatsApp/SMS fora. |
| `recipient` | string | sim | E-mail destino; deve ser fonte server-side/config segura. |
| `recipient_role` | string/enum | sim | `customer`, `admin`, `manager` ou `internal`. |
| `order_id` | string | sim | Pedido pago associado. |
| `user_id` | string opcional | nao | Usuario cliente quando aplicavel. |
| `payment_event_id` | string opcional | nao | Evento Stripe/webhook relacionado, se disponivel. |
| `event_type` | string | sim | Ex.: `order_paid`. |
| `provider` | string | sim | `mock`, `resend`, `smtp`, `unavailable` ou equivalente. |
| `provider_message_id` | string opcional | nao | Retorno do provider real, quando existir. |
| `idempotency_key` | string | sim | Chave unica por `orderId + eventType + notificationType + recipient`. |
| `status` | string/enum | sim | `pending`, `sending`, `sent`, `mocked`, `failed`, `skipped`, `duplicate`. |
| `attempt_count` | inteiro | sim | Prepara retry futuro; sem retry automatico completo na fase. |
| `last_error` | string opcional | nao | Erro sanitizado. |
| `metadata` | json opcional | nao | Resumo seguro, sem payload bruto ou secrets. |
| `sent_at` | timestamp opcional | nao | Momento de envio real/mock bem-sucedido. |
| `failed_at` | timestamp opcional | nao | Momento de falha. |
| `created_at` | timestamp | sim | Criacao. |
| `updated_at` | timestamp | sim | Atualizacao. |

## Indices e constraints

- Unique em `idempotency_key`.
- Indice por `order_id`.
- Indice por `status`.
- Indice opcional por `payment_event_id`.
- Indice opcional por `created_at` para auditoria/admin.

## Estados

| Status | Significado |
|--------|-------------|
| `pending` | Registro criado, envio ainda nao tentado. |
| `sending` | Tentativa em andamento, se usado. |
| `sent` | Provider real confirmou envio. |
| `mocked` | Mock dev/test simulou envio. |
| `failed` | Envio falhou com erro seguro. |
| `skipped` | Ausencia de destinatario/config tornou envio inaplicavel. |
| `duplicate` | Tentativa bloqueada por idempotencia. |

## Relacoes

- `notification_deliveries.order_id` referencia `orders.id`.
- `notification_deliveries.user_id` referencia usuario quando cliente.
- `notification_deliveries.payment_event_id` pode referenciar `payment_events.id` ou registrar o `event_id` conforme schema final.
- A entidade nao altera `orders.status`, `products.stock_quantity` ou `coupons.used_count`.

## Migration

- Deve ser gerada localmente no coding futuro.
- Nao deve ser aplicada em banco real sem validacao humana explicita.
- Deve ser documentada em `docs/architecture/database.md`.

## Fallback sem banco

Em dev/test sem banco real, repository fallback pode manter registros em memoria/fixture, com mensagem explicita de nao persistencia real.

## Dados proibidos

- Payload Stripe bruto.
- Dados de cartao.
- Secrets/API keys/SMTP password.
- Tokens/cookies/session.
- Links com token sensivel.
- Informacoes fiscais sensiveis.
