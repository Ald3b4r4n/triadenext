# Interface: staging-env-contract

> Tipo: contrato de ambiente/configuração
> Fase: 17

## Objetivo

Definir as variáveis que a Fase 17 deve validar por presença/ausência, sem imprimir valores.

## Variáveis primárias

| Variável | Uso | Ausente |
| --- | --- | --- |
| `STAGING_SMOKE_URL` | URL pública controlada para smoke real. | `pending-config` |
| `STAGING_PREVIEW_URL` | Alias permitido para URL de preview/staging. | `pending-config` |
| `PREVIEW_SMOKE_URL` | Alias permitido para smoke remoto aprovado. | `pending-config` |
| `STAGING_SMOKE_TARGET` | Classificação do alvo: `staging`, `preview` ou `remote-dev`. | `unknown`, sem bloquear por si so |
| `STAGING_DATABASE_URL` | Banco staging/dev remoto para validações/import staging aprovados. | `pending-config` |
| `STAGING_IMPORT_SMOKE_URL` | Compatibilidade com smoke da Fase 16. | `pending-config` ou `skipped` |
| `STRIPE_SECRET_KEY` | Stripe test mode server-side. | `pending-config` para pagamento real |
| `STRIPE_WEBHOOK_SECRET` | Webhook test. | `pending-config` para confirmação real |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js test mode. | `pending-config` para checkout real |

## Variáveis indiretas relevantes

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BLOB_READ_WRITE_TOKEN`
- `ORDER_NOTIFICATION_RECIPIENTS`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`

## Guardrails

- Validar apenas presença/ausência e modo.
- Não imprimir valores.
- Bloquear strings/labels de produção quando o contexto for staging.
- Bloquear Stripe live mode.
- Não ler `.env` real diretamente.
- Não exigir essas variáveis para lint/test/build/e2e local.
- Não conectar banco apenas por variavel presente.
