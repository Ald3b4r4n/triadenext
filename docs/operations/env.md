# Environment

`.env.example` contem apenas nomes de variaveis, sem valores reais.

Variaveis minimas:

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `RESEND_API_KEY`
- `SENTRY_DSN`

`src/lib/env.ts` aceita valores ausentes nesta fundacao para nao quebrar build local sem credenciais reais.

## Guardrails de runtime

`src/lib/runtime-mode.ts` expoe somente flags seguras:

- banco presente ou ausente;
- token Blob presente ou ausente;
- ambiente `development`, `test`, `preview` ou `production`;
- permissao temporaria para mutacao real.

Valores sensiveis nao sao exibidos em logs, mensagens, docs ou testes.

Sem `DATABASE_URL`, o catalogo entra em fallback explicito e nao promete gravacao real. Sem
`BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado antes de chamar Vercel Blob.
