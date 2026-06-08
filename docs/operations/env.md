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
