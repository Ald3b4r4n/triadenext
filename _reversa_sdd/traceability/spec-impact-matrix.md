# Spec Impact Matrix

Atualizado em: 2026-07-02
Agente: Architect

| Componente | Catálogo | Carrinho | Cupom | Frete | Checkout | Pedido | Pagamento | Notificação | Admin | Customer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/(storefront)` | Alto | Alto | Médio | Médio | Alto | Baixo | Baixo | Baixo | Baixo | Médio |
| `src/app/(customer)` | Baixo | Baixo | Baixo | Baixo | Médio | Alto | Alto | Baixo | Baixo | Alto |
| `src/app/admin` | Alto | Baixo | Alto | Alto | Baixo | Alto | Médio | Alto | Alto | Baixo |
| `src/app/api/webhooks/stripe` | Baixo | Baixo | Médio | Baixo | Baixo | Alto | Crítico | Alto | Baixo | Baixo |
| `features/auth` | Médio | Médio | Baixo | Baixo | Alto | Alto | Alto | Alto | Crítico | Crítico |
| `features/products` | Crítico | Alto | Baixo | Baixo | Alto | Alto | Alto | Baixo | Alto | Baixo |
| `features/cart` | Médio | Crítico | Alto | Alto | Crítico | Alto | Baixo | Baixo | Baixo | Médio |
| `features/coupons` | Baixo | Alto | Crítico | Médio | Alto | Alto | Alto | Baixo | Alto | Baixo |
| `features/shipping` | Baixo | Alto | Médio | Crítico | Alto | Alto | Baixo | Baixo | Alto | Baixo |
| `features/checkout` | Médio | Alto | Alto | Alto | Crítico | Crítico | Médio | Baixo | Baixo | Alto |
| `features/orders` | Baixo | Médio | Médio | Médio | Crítico | Crítico | Crítico | Alto | Alto | Alto |
| `features/payments` | Baixo | Baixo | Alto | Baixo | Médio | Crítico | Crítico | Alto | Médio | Alto |
| `features/notifications` | Baixo | Baixo | Baixo | Baixo | Baixo | Alto | Alto | Crítico | Alto | Médio |
| `features/uploads` | Alto | Baixo | Baixo | Baixo | Baixo | Baixo | Baixo | Baixo | Alto | Baixo |
| `features/data-dry-run` | Crítico | Baixo | Alto | Alto | Baixo | Baixo | Baixo | Baixo | Médio | Baixo |
| `src/db/schema.ts` | Crítico | Crítico | Crítico | Crítico | Crítico | Crítico | Crítico | Crítico | Alto | Alto |

## Impactos Críticos

- Alterar filtros públicos de produto afeta storefront, carrinho e checkout.
- Alterar cálculo de carrinho afeta cupom, frete, checkout e pedido.
- Alterar snapshots de pedido afeta pagamento, notificação, relatórios e migração de dados.
- Alterar webhook/settlement afeta pedido, estoque, cupom e notificações.
- Alterar `notification_deliveries.idempotency_key` afeta duplicidade de envio.

## Impactos Operacionais Pos-Fase 12

| Artefato | Env | Migrations | Deploy | Stripe | Blob | Smoke |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/operations/*` | Crítico | Alto | Crítico | Alto | Alto | Alto |
| `scripts/ops/check-env-readiness.mjs` | Crítico | Baixo | Baixo | Médio | Médio | Baixo |
| `scripts/ops/check-migrations-readiness.mjs` | Baixo | Crítico | Baixo | Baixo | Baixo | Baixo |
| `scripts/ops/check-build-readiness.mjs` | Médio | Médio | Alto | Baixo | Baixo | Médio |
| `scripts/ops/check-smoke-readiness.mjs` | Médio | Baixo | Médio | Médio | Médio | Crítico |
| `scripts/ops/check-data-dry-run-readiness.mjs` | Baixo | Baixo | Baixo | Baixo | Baixo | Médio |

Guardrail: esses artefatos sao checks/documentacao; qualquer evolucao que passe a executar deploy, migration real, banco real ou provider externo deve exigir nova decisao humana.

## Impactos de Paridade e Migracao Pos-Fase 13

| Artefato | Catalogo Real | Imagens | Dados Historicos | Dry-run | Go-live | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| `_reversa_forward/021-fase-13-legacy-parity/legacy-parity-matrix.md` | Critico | Alto | Medio | Medio | Critico | Medio |
| `_reversa_forward/021-fase-13-legacy-parity/legacy-gap-register.md` | Critico | Alto | Alto | Alto | Critico | Alto |
| `_reversa_forward/021-fase-13-legacy-parity/legacy-data-inventory.md` | Critico | Alto | Alto | Critico | Alto | Medio |
| `_reversa_forward/021-fase-13-legacy-parity/controlled-migration-plan.md` | Alto | Alto | Alto | Critico | Alto | Alto |
| `_reversa_forward/021-fase-13-legacy-parity/dry-run-reconciliation.md` | Critico | Alto | Alto | Critico | Critico | Alto |
| `_reversa_forward/021-fase-13-legacy-parity/go-live-substitution-checklist.md` | Critico | Alto | Alto | Alto | Critico | Critico |
| `_reversa_forward/021-fase-13-legacy-parity/rollback-plan.md` | Medio | Medio | Alto | Alto | Critico | Critico |

Guardrail: qualquer transformacao desses artefatos em script de import real, migration real, conexao com banco real ou deploy precisa de aprovacao humana explicita.

## Impactos de Dry-run Controlado Pos-Fase 14

| Artefato | Catalogo Real | Imagens | Cupons | Frete | Reconciliacao | Privacidade | Import Futuro |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/features/data-dry-run/input-contracts.ts` | Critico | Alto | Alto | Alto | Alto | Medio | Alto |
| `src/features/data-dry-run/normalizers/*` | Critico | Critico | Critico | Critico | Alto | Baixo | Alto |
| `src/features/data-dry-run/reconciliation.ts` | Critico | Critico | Alto | Alto | Critico | Alto | Critico |
| `src/features/data-dry-run/safety.ts` | Alto | Alto | Alto | Alto | Alto | Critico | Critico |
| `scripts/ops/check-data-dry-run-readiness.mjs` | Alto | Alto | Alto | Alto | Critico | Critico | Alto |
| `_reversa_forward/022-fase-14-data-dry-run/future-import-approval-checklist.md` | Alto | Alto | Alto | Alto | Alto | Alto | Critico |

Guardrail: a Fase 14 prova o pipeline com exemplos sinteticos; qualquer uso de fonte real, importacao real, upload real, migration real, banco real ou deploy continua dependendo de aprovacao humana explicita.
