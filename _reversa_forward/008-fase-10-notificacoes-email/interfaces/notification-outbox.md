# Interface: Notification Outbox

> Feature: `008-fase-10-notificacoes-email`
> Tipo: contrato interno de persistencia

## Responsabilidade

Registrar notificacoes transacionais pos-pagamento com status, idempotencia e auditoria. A outbox nao e fila real obrigatoria nesta fase; ela permite processamento sincrono-controlado e prepara retry futuro.

## Entidade conceitual

```ts
type NotificationDelivery = {
  id: string;
  type: "order_paid_customer" | "order_paid_admin";
  channel: "email";
  recipient: string;
  recipientRole: "customer" | "admin" | "manager" | "internal";
  orderId: string;
  userId?: string | null;
  paymentEventId?: string | null;
  eventType: "order_paid";
  provider: "mock" | "resend" | "smtp" | "unavailable";
  providerMessageId?: string | null;
  idempotencyKey: string;
  status: "pending" | "sending" | "sent" | "mocked" | "failed" | "skipped" | "duplicate";
  attemptCount: number;
  lastError?: string | null;
  sentAt?: Date | null;
  failedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
```

## Operacoes esperadas

| Operacao | Entrada | Saida | Idempotencia |
|----------|---------|-------|--------------|
| `createIfNew` | draft com `idempotencyKey` | registro novo ou existente | unique `idempotencyKey` |
| `markSending` | `id` | registro atualizado | por `id` |
| `markSent` | `id`, provider result | status `sent`/`mocked` | por `id` |
| `markFailed` | `id`, erro sanitizado | status `failed` | por `id` |
| `listForAdminOrder` | `orderId` | lista segura | somente admin/manager |

## Chave de idempotencia

Formato recomendado:

```text
order_paid:<orderId>:<eventType>:<notificationType>:<recipient>
```

## Erros controlados

- `duplicate`: retorno quando chave ja existe.
- `missing_recipient`: quando admin/gestor nao esta configurado.
- `provider_unavailable`: quando preview/producao nao tem credenciais.
- `provider_failed`: falha sanitizada do provider.

## Dados proibidos

Nao armazenar payload Stripe bruto, dados de cartao, secrets, tokens, cookies, `DATABASE_URL` ou links sensiveis.
