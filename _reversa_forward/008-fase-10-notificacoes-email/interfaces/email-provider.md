# Interface: Email Provider Adapter

> Feature: `008-fase-10-notificacoes-email`
> Tipo: contrato interno de provider

## Responsabilidade

Isolar envio real/mock de e-mail transacional. Build/test/e2e devem funcionar sem credenciais reais e sem rede externa.

## Contrato conceitual

```ts
type TransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  metadata: {
    orderId: string;
    eventType: "order_paid";
    notificationType: "order_paid_customer" | "order_paid_admin";
  };
};

type TransactionalEmailResult =
  | { status: "sent"; provider: string; providerMessageId?: string }
  | { status: "mocked"; provider: "mock" }
  | { status: "failed"; provider: string; safeError: string }
  | { status: "unavailable"; provider: "unavailable"; safeError: string };
```

## Adapters

| Adapter | Ambiente | Regra |
|---------|----------|-------|
| `mock` | dev/test | Sempre explicito; nao envia e-mail real. |
| `unavailable` | preview/producao sem credenciais | Falha segura; nao finge envio. |
| `resend` | futuro/configuravel | Opcional, nao obrigatorio para build/test/e2e. |
| `smtp` | futuro/configuravel | Opcional, nao obrigatorio para build/test/e2e. |

## Configuracao esperada

`.env.example` pode listar placeholders sem valores reais:

```text
ORDER_NOTIFICATION_RECIPIENTS=
EMAIL_PROVIDER=
EMAIL_FROM=
EMAIL_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Os nomes finais podem ser ajustados no coding, desde que continuem sem valores reais.

## Regras de seguranca

- Secrets server-side apenas.
- Erros sanitizados antes de persistir/exibir.
- Nao logar corpo completo se contiver dados pessoais alem do minimo.
- Nao aceitar destinatario admin vindo do client.
