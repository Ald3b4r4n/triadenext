# Environment

`.env.example` contem apenas nomes de variaveis, sem valores reais. Para uma primeira
producao, trate os nomes abaixo como checklist de presenca, nunca como lugar para copiar
credenciais.

## Obrigatorias para producao real

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_NAME`

## Opcionais ou condicionais

- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `ORDER_NOTIFICATION_RECIPIENTS`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `EMAIL_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SENTRY_DSN`

`src/lib/env.ts` aceita valores ausentes nesta fundacao para nao quebrar build local sem credenciais reais.
O script `pnpm ops:check-env` informa apenas presenca ou ausencia, sem imprimir valores e sem
conectar banco, Stripe, Blob, SMTP ou qualquer provedor externo.

## Guardrails de runtime

`src/lib/runtime-mode.ts` expoe somente flags seguras:

- banco presente ou ausente;
- auth real pronta ou nao;
- token Blob presente ou ausente;
- ambiente `development`, `test`, `preview` ou `production`;
- permissao temporaria para mutacao real.

Valores sensiveis nao sao exibidos em logs, mensagens, docs ou testes.

Sem `DATABASE_URL`, o catalogo entra em fallback explicito e nao promete gravacao real. Sem
`BETTER_AUTH_SECRET` e `DATABASE_URL`, auth real nao fica ativa e mutacoes admin seguem bloqueadas.
Sem `BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado antes de chamar Vercel Blob.

## Stripe

- `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` sao server-only.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` e a unica chave Stripe destinada ao client.
- Dev/test podem executar com adapter mock explicito sem qualquer chave real.
- Preview/producao sem as tres variaveis nao iniciam pagamento real.
- Nenhuma chave deve ser copiada do legado, commitada, registrada em logs ou incluida em docs.

## E-mail transacional

- `ORDER_NOTIFICATION_RECIPIENTS` aceita lista separada por virgula, ponto e virgula ou linha.
- Dev/test usam mock explicito sem rede e sem credenciais.
- Preview/producao sem provider real usam estado indisponivel/falha segura, nunca mock.
- Os placeholders de provider existem para extensao futura; provider real nao e requisito de
  lint, typecheck, testes, build ou E2E.
- Nao hardcodar e-mails reais, copiar `.env` do legado ou registrar secrets em logs/templates.

Canais externos de mensagem, retry automatico, reenvio admin e integracoes fiscais permanecem fora da Fase 11.
