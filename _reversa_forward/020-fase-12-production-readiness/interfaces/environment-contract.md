# Interface: Variáveis por Ambiente

> Feature: `020-fase-12-production-readiness`
> Tipo: arquivo/env
> Status: contrato documental para implementação futura.

## 1. Objetivo

Definir o contrato de variáveis para local, preview/staging e produção sem registrar valores reais.

## 2. Ambientes

| Ambiente | Objetivo | Fonte de verdade permitida |
|----------|----------|----------------------------|
| Local | Desenvolvimento, lint, typecheck, testes e build sem credenciais reais. | `.env.local` local do operador ou ausência controlada de variáveis. |
| Preview/Staging | Ambiente real controlado para smoke e validação. | Vercel Preview env vars e Neon branch/staging aprovados. |
| Produção | Ambiente futuro de go-live. | Vercel Production env vars e Neon produção, somente após checklist e aprovação. |

## 3. Variáveis obrigatórias por produção real

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

## 4. Variáveis opcionais ou condicionais

- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `EMAIL_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SENTRY_DSN`

## 5. Regras de segurança

- Nunca imprimir valores.
- Nunca copiar `.env` para docs ou artefatos Reversa.
- Nunca versionar `.env`.
- Scripts devem reportar `present`, `missing`, `optional`, `configured` ou `not configured`.
- URLs de banco devem ser tratadas como secret mesmo quando apontam para staging.

## 6. Erros esperados

| Condição | Comportamento esperado |
|----------|------------------------|
| Variável obrigatória ausente em local | Build/test deve ter fallback seguro quando permitido. |
| Variável obrigatória ausente em preview/produção | Checklist marca bloqueio para operação real. |
| Secret real encontrado em arquivo versionado | Bloquear avanço e relatar sem repetir o valor. |
| Script tenta imprimir valor | Corrigir antes de continuar. |

## 7. Idempotência e timeout

Este contrato é estático. Scripts de verificação devem ser idempotentes, sem rede obrigatória e com timeout curto se adicionarem chamadas opcionais no futuro.

## 8. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Contrato inicial gerado por `/reversa-plan` | reversa |
