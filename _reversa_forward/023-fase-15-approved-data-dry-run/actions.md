# Actions: Fase 15 - Approved Data Dry-run Execution and Blocker Fixes

> Identificador: `023-fase-15-approved-data-dry-run`
> Data: `2026-07-02`
> Roadmap: `_reversa_forward/023-fase-15-approved-data-dry-run/roadmap.md`

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de acoes | 36 |
| Paralelizaveis (`[//]`) | 7 |
| Maior cadeia de dependencia | 15 |

## Bloco 1, Preparacao e auditoria do input

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T001 | Consolidar tipos de estado de execucao para `pending-input`, `go` e `no-go`. | - | `[//]` | `src/features/data-dry-run/types.ts` | 🟢 | `[X]` |
| [//] T002 | Alinhar o contrato documental dos arquivos esperados e aliases aceitos da primeira execucao. | - | `[//]` | `_reversa_forward/023-fase-15-approved-data-dry-run/interfaces/data-dry-run-files.md` | 🟢 | `[X]` |
| [//] T003 | Conferir ou ajustar regra de ignore para manter `data/dry-run/input/primeira-execucao/` e `data/dry-run/output/` fora do Git. | - | `[//]` | `.gitignore` | 🟢 | `[X]` |
| T004 | Implementar helper seguro para referenciar a pasta aprovada `data/dry-run/input/primeira-execucao/`. | T001, T003 | - | `src/features/data-dry-run/input-discovery.ts` | 🟢 | `[X]` |

## Bloco 2, Deteccao de arquivos ausentes/presentes

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T005 | Detectar pasta aprovada ausente, vazia ou preenchida sem criar nem copiar dados reais. | T004 | - | `src/features/data-dry-run/input-discovery.ts` | 🟢 | `[X]` |
| T006 | Resolver arquivos esperados usando nomes primarios da Fase 15 e aliases compativeis da Fase 14. | T002, T005 | - | `src/features/data-dry-run/input-contracts.ts` | 🟡 | `[X]` |
| T007 | Representar `pending-input` no resultado do dry-run sem confundir com divergencia `no-go`. | T001, T005 | - | `src/features/data-dry-run/types.ts` | 🟢 | `[X]` |
| T008 | Ajustar o resumo de execucao para diferenciar `pending-input`, `go` e `no-go`. | T007 | - | `src/features/data-dry-run/run-dry-run.ts` | 🟢 | `[X]` |

## Bloco 3, Validacao estrutural dos arquivos

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T009 | Aceitar `product_images.csv/json` como nome primario sem quebrar `product-images.csv/json`. | T006 | - | `src/features/data-dry-run/input-contracts.ts` | 🟡 | `[X]` |
| T010 | Aceitar `shipping.csv/json` como nome primario sem quebrar `shipping-rules.csv/json`. | T006 | - | `src/features/data-dry-run/input-contracts.ts` | 🟡 | `[X]` |
| T011 | Adicionar contrato de entrada `inventory.csv/json` com campos minimos de estoque. | T006 | - | `src/features/data-dry-run/input-contracts.ts` | 🟡 | `[X]` |
| T012 | Criar normalizador de inventario para quantidade disponivel por SKU sem persistencia em banco. | T011 | - | `src/features/data-dry-run/normalizers/inventory.ts` | 🟡 | `[X]` |
| T013 | Integrar inventario ao dataset normalizado preservando compatibilidade com `products.stock_quantity`. | T012 | - | `src/features/data-dry-run/normalize.ts` | 🟡 | `[X]` |

## Bloco 4, Execucao segura do dry-run

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T014 | Curto-circuitar a execucao como `pending-input` quando a pasta aprovada nao tiver arquivos reais suficientes. | T005, T008, T013 | - | `src/features/data-dry-run/run-dry-run.ts` | 🟢 | `[X]` |
| T015 | Garantir que o script operacional continue apenas encaminhando argumentos para a CLI sem ler `.env`. | T014 | - | `scripts/ops/check-data-dry-run-readiness.mjs` | 🟢 | `[X]` |
| T016 | Garantir escrita de relatorios apenas em `data/dry-run/output/` com caminho seguro por execucao. | T014 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |
| T017 | Impedir fallback silencioso para `examples` quando o comando apontar para `primeira-execucao`. | T014 | - | `src/features/data-dry-run/input-discovery.ts` | 🟢 | `[X]` |

## Bloco 5, Classificacao de divergencias

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T018 | Introduzir origem de divergencia `dados`, `next`, `mapeamento` e `humana`. | T001 | - | `src/features/data-dry-run/divergences.ts` | 🟢 | `[X]` |
| T019 | Mapear codigos de divergencia existentes para origem e acao recomendada padrao. | T018 | - | `src/features/data-dry-run/divergences.ts` | 🟢 | `[X]` |
| T020 | Enriquecer a reconciliacao com dominio, severidade, impacto go-live e origem provavel. | T013, T019 | - | `src/features/data-dry-run/reconciliation.ts` | 🟢 | `[X]` |
| T021 | Marcar como corrigiveis no Next apenas divergencias de parser, contrato, normalizador, reconciliacao, relatorio ou mensagem operacional. | T020 | - | `src/features/data-dry-run/reconciliation.ts` | 🟢 | `[X]` |

## Bloco 6, Relatorio de pendencias

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T022 | Gerar relatorio `pending-input` quando os arquivos reais/exportados ainda nao existirem. | T014, T016 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |
| T023 | Incluir no relatorio de pendencia a lista dos arquivos esperados e comandos seguros. | T022 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |
| T024 | Ajustar semantica de saida da CLI para `pending-input` nao falhar indevidamente. | T008, T022 | - | `src/features/data-dry-run/cli.ts` | 🟢 | `[X]` |
| T025 | Registrar pendencias de dados/exportacao separadas de itens corrigiveis no Next. | T020, T023 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |

## Bloco 7, Relatorio final de dry-run

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T026 | Gerar relatorio final com contagens, divergencias por dominio e status go/no-go. | T016, T020 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |
| T027 | Gerar resumo sanitizado versionavel sem linhas sensiveis, URLs privadas ou valores de secrets. | T026 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |
| T028 | Reforcar varredura contra secrets antes de imprimir ou gravar evidencias de relatorio. | T027 | - | `src/features/data-dry-run/safety.ts` | 🟢 | `[X]` |

## Bloco 8, Checklist humano

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T029 | Criar checklist humano de aprovacao para importacao real futura. | - | `[//]` | `_reversa_forward/023-fase-15-approved-data-dry-run/human-approval-checklist.md` | 🟢 | `[X]` |
| T030 | Detalhar criterios go/no-go e rollback no checklist humano. | T026, T029 | - | `_reversa_forward/023-fase-15-approved-data-dry-run/human-approval-checklist.md` | 🟢 | `[X]` |
| T031 | Atualizar onboarding com comandos para pendencia, dry-run aprovado e verificacao de Git. | T023, T030 | - | `_reversa_forward/023-fase-15-approved-data-dry-run/onboarding.md` | 🟢 | `[X]` |

## Bloco 9, Testes e fixtures

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T032 | Cobrir deteccao de `primeira-execucao` ausente, vazia e preenchida em teste unitario. | T014 | `[//]` | `src/tests/unit/data-dry-run-approved-input.test.ts` | 🟢 | `[X]` |
| [//] T033 | Cobrir aliases de contrato, `inventory.csv/json` e compatibilidade com nomes da Fase 14. | T009, T010, T011 | `[//]` | `src/tests/unit/data-dry-run-contracts.test.ts` | 🟡 | `[X]` |
| [//] T034 | Cobrir classificacao de divergencias, relatorio `pending-input` e resumo sanitizado. | T021, T027 | `[//]` | `src/tests/unit/data-dry-run-reconciliation.test.ts` | 🟢 | `[X]` |

## Bloco 10, Validacoes finais

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T035 | Executar smoke seguro do dry-run com exemplos sinteticos e cenario `primeira-execucao` sem dados reais. | T032, T033, T034 | - | `_reversa_forward/023-fase-15-approved-data-dry-run/progress.jsonl` | 🟢 | `[X]` |
| T036 | Executar validacoes finais e restaurar `next-env.d.ts` se ele sujar. | T035 | - | `_reversa_forward/023-fase-15-approved-data-dry-run/progress.jsonl` | 🟢 | `[X]` |

## Notas de execucao

- Nao versionar dados reais em `data/dry-run/input/primeira-execucao/`.
- Nao copiar dados do Laravel legado.
- Nao conectar banco real, importar dados, fazer upload real, rodar migration, fazer deploy ou push.
- T009, T010 e T011 tocam o mesmo arquivo e nao devem ser tratados como paralelos.
- T022, T023, T025, T026 e T027 tocam `report-writer.ts` e devem ser executados em sequencia.
- T032, T033 e T034 podem ser paralelizados depois que suas dependencias forem concluídas, pois miram arquivos de teste diferentes.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-07-02 | Versao inicial gerada por `/reversa-to-do` | reversa |
