# Interface: staging-smoke-report

> Tipo: relatório operacional
> Fase: 17

## Objetivo

Padronizar o relatório de readiness staging/go-live sem expor secrets ou dados reais crus.

## Campos mínimos

| Campo | Tipo | Regra |
| --- | --- | --- |
| `runId` | string | Identificador local sem dado sensível. |
| `startedAt` | ISO datetime | Data/hora da execução. |
| `targetKind` | enum | `staging`, `preview`, `remote-dev`, `unknown`. |
| `overallStatus` | enum | `passed`, `pending-config`, `pending-input`, `blocked`, `failed`, `skipped`. |
| `checks` | array | Lista de checks por etapa. |
| `goNoGo` | enum | `go`, `no-go`, `pending-config`, `pending-input`. |
| `humanApprovalRequired` | boolean | `true` para qualquer avanço real. |
| `secretsPrinted` | boolean | Deve ser sempre `false`. |

## Checks planejados

- env safety
- production guard
- URL staging
- Neon staging/dev readiness
- migrations/snapshot/rollback
- Stripe test mode
- webhook test
- storefront home
- catalog/product
- cart/checkout
- payment test
- orders/admin
- notifications/outbox
- import staging smoke
- go-live checklist

## Arquivos gerados

- `data/dry-run/output/staging-smoke-<status>/staging-smoke-report.json`
- `data/dry-run/output/staging-smoke-<status>/staging-smoke-report.md`
- `data/dry-run/output/staging-smoke-<status>/go-live-checklist.md`

## Sanitização

- Mascarar URLs privadas quando necessário.
- Nunca incluir `DATABASE_URL`.
- Nunca incluir chaves Stripe, Blob, Auth ou tokens.
- Não incluir dados pessoais crus de clientes/pedidos.
- Relatórios brutos com dados reais devem ficar fora do Git.
