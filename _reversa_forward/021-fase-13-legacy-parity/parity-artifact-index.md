# Parity Artifact Index

## Ordem de preenchimento

| Ordem | Artefato | Papel |
|-------|----------|-------|
| 1 | `legacy-module-inventory.md` | Mapa read-only do legado |
| 2 | `next-capability-inventory.md` | Mapa do Next atual |
| 3 | `parity-*.md` | Analises por dominio |
| 4 | `legacy-parity-matrix.md` | Consolidado de paridade |
| 5 | `legacy-gap-register.md` | Lacunas e severidade de go-live |
| 6 | `legacy-data-inventory*.md` | Dados migraveis |
| 7 | `controlled-migration-*.md` | Estrategia de dry-run |
| 8 | `dry-run-reconciliation.md` | Validacao e divergencias |
| 9 | `go-live-*`, `rollback-plan.md` | Decisao de substituicao |
| 10 | `legacy-impact.md`, `regression-watch.md`, `validation-results.md` | Rastro Reversa |

## Donos logicos

| Area | Artefatos |
|------|-----------|
| Paridade funcional | `parity-storefront.md`, `parity-catalog.md`, `parity-commerce-flow.md`, `parity-customer-admin.md`, `parity-integrations-out-of-scope.md` |
| Dados | `legacy-data-inventory-catalog.md`, `legacy-data-inventory-operational.md`, `legacy-image-inventory.md`, `legacy-data-inventory.md` |
| Migracao | `controlled-migration-plan.md`, `dry-run-execution-model.md`, `controlled-migration-readiness.md` |
| Decisao | `legacy-gap-register.md`, `go-live-decision-framework.md`, `final-substitution-checklist.md`, `go-live-readiness-note.md` |

## Regra anti-conflito

Cada tarefa paralelizavel escreve em arquivo proprio. Arquivos consolidados dependem dos artefatos de dominio e sao sequenciais.
