# Checklist seguro de producao

Este checklist prepara staging/preview e producao futura da Tríade Essenza Parfum. Ele nao
executa deploy, nao conecta banco real, nao roda migration real, nao envia e-mail real e nao
valida credenciais imprimindo valores.

## 1. Baseline local

- [ ] `pnpm lint` passa.
- [ ] `pnpm typecheck` passa.
- [ ] `pnpm test` passa.
- [ ] `pnpm build` passa.
- [ ] `pnpm test:e2e` passa em ambiente seguro.
- [ ] `pnpm ops:check-env` passa para local sem exigir credenciais reais.
- [ ] `pnpm ops:check-build` confirma scripts locais seguros.
- [ ] `pnpm ops:check-migrations` revisa migrations sem conectar banco.
- [ ] `pnpm ops:check-smoke` valida URL padrao local segura.

## 2. Variaveis por ambiente

- [ ] `.env.example` lista nomes esperados sem valores reais.
- [ ] Secrets reais ficam somente no provedor de deploy/ambiente seguro.
- [ ] Local nao exige credenciais reais para lint/test/build/E2E.
- [ ] Preview/staging tem variaveis configuradas no provedor, sem valores em docs.
- [ ] Producao futura tem lista separada e bloqueia go-live se obrigatorias faltarem.

Obrigatorias para producao real:

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

## 3. Neon e migrations

- [ ] Migrations `0000` a `0007` revisadas.
- [ ] `pnpm ops:check-migrations` executado localmente.
- [ ] Projeto/branch Neon de staging identificado sem string de conexao em logs.
- [ ] Backup/restore ou branch de rollback confirmado.
- [ ] `pnpm db:migrate` bloqueado ate aprovacao humana explicita.
- [ ] Seed bloqueado para staging/producao sem aprovacao.

## 4. Vercel

- [ ] Build local verde antes de qualquer deploy.
- [ ] Env vars separadas para Preview e Production.
- [ ] URL de preview/staging aprovada para smoke sem querystring secreta.
- [ ] Logs revisados sem secrets.
- [ ] Rollback Vercel documentado separadamente do rollback de banco.
- [ ] Dominio real fica no checklist de go-live posterior.

## 5. Stripe test mode

- [ ] Usar chaves test mode em preview/staging.
- [ ] Webhook `POST /api/webhooks/stripe` configurado apenas em ambiente aprovado.
- [ ] Eventos minimos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`.
- [ ] Smoke de pagamento usa test/mock, nunca cartao real.
- [ ] Retorno client-side nao marca pedido pago.
- [ ] Live mode fica fora desta fase.

## 6. Blob/upload

- [ ] Decidir se staging validara upload real ou apenas fallback.
- [ ] `BLOB_READ_WRITE_TOKEN` configurado apenas no provedor aprovado.
- [ ] Ausencia de token bloqueia upload definitivo de forma controlada.
- [ ] Limite de 5 MB e tipos JPEG/PNG/WebP confirmados.
- [ ] Smoke padrao nao exige upload real.

## 7. Smoke production-ready

- [ ] Home carrega sem placeholder.
- [ ] Catalogo e pagina de produto carregam produto publicado.
- [ ] Carrinho funciona em fallback/dev sem compra real.
- [ ] Checkout nao expoe campos de cartao ou secrets.
- [ ] Pedidos/customer redirecionam visitante para login.
- [ ] Admin permanece bloqueado sem auth real.
- [ ] Pagamento test/mock nao usa live mode.
- [ ] Notificacoes mock/skipped nao fingem envio real.

## 8. Fora do escopo desta fase

- Deploy real automatico.
- Migration real automatica.
- Banco real sem aprovacao.
- Credenciais reais no repositorio.
- Bling.
- NF-e.
- Rotinas fiscais.
- WhatsApp.
- SMS.
- Laravel legado.

## 9. Gate para go-live posterior

Use `docs/operations/go-live-checklist.md`. Esta fase termina com readiness, nao com go-live.
