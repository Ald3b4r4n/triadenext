# Dry-run File Map

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Arquivos de preparação

| Área | Arquivos |
|------|----------|
| Estrutura local segura | `.gitignore`, `data/dry-run/input/.gitkeep`, `data/dry-run/input/examples/*` |
| Contrato de comando | `_reversa_forward/022-fase-14-data-dry-run/dry-run-command-contract.md` |
| Aprovação humana | `_reversa_forward/022-fase-14-data-dry-run/source-approval-template.md` |

## Arquivos de implementação

| Área | Arquivos |
|------|----------|
| Tipos | `src/features/data-dry-run/types.ts` |
| Entrada | `src/features/data-dry-run/input-discovery.ts`, `src/features/data-dry-run/input-contracts.ts` |
| Segurança | `src/features/data-dry-run/safety.ts` |
| Normalizadores | `src/features/data-dry-run/normalizers/*.ts` |
| Agregação | `src/features/data-dry-run/normalize.ts` |
| Divergências | `src/features/data-dry-run/divergences.ts` |
| Reconciliação | `src/features/data-dry-run/reconciliation.ts` |
| Relatório | `src/features/data-dry-run/report-writer.ts` |
| Runner | `src/features/data-dry-run/run-dry-run.ts`, `src/features/data-dry-run/cli.ts` |
| Script ops | `scripts/ops/check-data-dry-run-readiness.mjs`, `package.json` |

## Arquivos de teste

| Área | Arquivos |
|------|----------|
| Fixtures | `src/tests/fixtures/data-dry-run/` |
| Testes unitários | `src/tests/unit/data-dry-run-*.test.ts` |

## Arquivos Reversa finais

| Área | Arquivos |
|------|----------|
| Aprovação futura | `_reversa_forward/022-fase-14-data-dry-run/future-import-approval-checklist.md` |
| Guia operacional | `_reversa_forward/022-fase-14-data-dry-run/dry-run-operator-guide.md` |
| Validação | `_reversa_forward/022-fase-14-data-dry-run/validation-plan.md`, `validation-results.md`, `final-safety-review.md` |
| Legado/watch | `_reversa_forward/022-fase-14-data-dry-run/legacy-impact.md`, `regression-watch.md` |

## Ordem segura

1. Preparação e fixtures.
2. Tipos, entrada e segurança.
3. Normalizadores paralelizáveis.
4. Reconciliação, relatório e runner.
5. Script ops e package script.
6. Documentos finais e validações.
