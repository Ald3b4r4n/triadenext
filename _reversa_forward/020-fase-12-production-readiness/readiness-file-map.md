# Readiness File Map - Fase 12

Data: 2026-07-01

## Mapa de arquivos por contrato

| Contrato | Arquivos principais |
|----------|---------------------|
| Env | `.env.example`, `docs/operations/env.md`, `scripts/ops/check-env-readiness.mjs`, `src/tests/unit/env-readiness.test.ts` |
| Migrations | `docs/operations/database-migrations.md`, `scripts/ops/check-migrations-readiness.mjs`, `src/tests/unit/migration-readiness.test.ts`, `_reversa_forward/020-fase-12-production-readiness/migration-readiness.md` |
| Neon | `docs/operations/neon.md`, `_reversa_forward/020-fase-12-production-readiness/neon-readiness.md` |
| Vercel | `docs/operations/vercel.md`, `_reversa_forward/020-fase-12-production-readiness/vercel-readiness.md` |
| Stripe | `docs/operations/stripe.md`, `_reversa_forward/020-fase-12-production-readiness/stripe-readiness.md`, `src/tests/e2e/production-readiness-payment.spec.ts` |
| Blob | `docs/operations/blob.md`, `_reversa_forward/020-fase-12-production-readiness/blob-readiness.md` |
| Smoke | `scripts/ops/check-smoke-readiness.mjs`, `src/tests/e2e/production-readiness-smoke.spec.ts`, `docs/operations/production-checklist.md` |

## Ordem sensivel

- `T023` deve ocorrer antes de `T034`, pois ambos tocam `docs/operations/production-checklist.md`.
- Scripts ops entram em `package.json` apenas depois de existirem.
- Validações finais nao executam deploy, migration, banco real ou e-mail real.
