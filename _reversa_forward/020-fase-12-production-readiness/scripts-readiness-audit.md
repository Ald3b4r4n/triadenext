# Scripts Readiness Audit - Fase 12

Data: 2026-07-01

## Scripts avaliados

| Script | Tipo | Resultado |
|--------|------|-----------|
| `scripts/ops/check-env-readiness.mjs` | Env | Reporta presenca/ausencia; nao imprime valores. |
| `scripts/ops/check-migrations-readiness.mjs` | Migrations | Leitura estatica; nao conecta banco; nao executa migration. |
| `scripts/ops/check-build-readiness.mjs` | Build | Confere scripts locais; nao chama Vercel ou provider externo. |
| `scripts/ops/check-smoke-readiness.mjs` | Smoke | Valida URL segura; nao executa pagamento, e-mail, migration, banco ou deploy. |
| `scripts/db/require-database-url.mjs` | Guardiao DB | Bloqueia migrate sem `DATABASE_URL` e nao imprime valor. |

## Politica

Scripts ops podem falhar por ausencia de configuracao, mas nunca devem revelar valores reais. Qualquer
comando real de banco, deploy ou migration fica fora dos scripts ops automaticos.
