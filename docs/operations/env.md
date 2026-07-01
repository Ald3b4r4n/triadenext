# Environment

`.env.example` contem apenas nomes de variaveis, sem valores reais. O contrato de ambiente e
separado em local, preview/staging e producao para evitar deploy incompleto e exposicao de
credenciais.

## Local

Local deve permitir `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`
sem credenciais reais. Variaveis podem ficar ausentes quando o runtime tiver fallback seguro.

Recomendadas:

- `NEXT_PUBLIC_SITE_NAME`

Opcionais para simular capacidades:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`

## Preview/Staging

Preview/staging e o primeiro ambiente real controlado. Configurar no provedor de ambiente, nunca
em arquivo versionado:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

`BLOB_READ_WRITE_TOKEN` pode ser obrigatorio se o smoke incluir upload real aprovado. Sem token,
upload definitivo deve falhar de modo seguro.

## Producao real futura

Obrigatorias antes de go-live:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `ORDER_NOTIFICATION_RECIPIENTS`

Opcionais ou condicionais:

- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `EMAIL_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SENTRY_DSN`

## Checks seguros

- `pnpm ops:check-env`
- `pnpm ops:check-env -- --preview`
- `pnpm ops:check-env -- --production`

Esses scripts reportam apenas presenca/ausencia. Eles nao conectam banco, Stripe, Blob, SMTP,
Neon ou Vercel, e nao imprimem valores.

## Guardrails de runtime

`src/lib/runtime-mode.ts` expoe somente flags seguras: banco presente/ausente, auth pronta,
token Blob presente/ausente e ambiente `development`, `test`, `preview` ou `production`.

Sem `DATABASE_URL`, o catalogo entra em fallback explicito e nao promete gravacao real. Sem
`BETTER_AUTH_SECRET` e `DATABASE_URL`, auth real nao fica ativa e mutacoes admin seguem
bloqueadas. Sem `BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado antes de chamar Vercel Blob.

Nunca copiar `.env`, registrar secrets em logs ou validar credenciais colando valores em docs.
