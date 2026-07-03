# Actions: Fase 16 - Approved Staging Import

> Identificador: `024-fase-16-staging-import`
> Data: `2026-07-02`
> Roadmap: `_reversa_forward/024-fase-16-staging-import/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 41 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 10 |

## Bloco 1, Prechecks de ambiente

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T001 | Criar tipos canonicos de alvo, modo, status, aprovacao humana e resultado da importacao staging. | - | `[//]` | `src/features/staging-import/types.ts` | 🟢 | `[X]` |
| [//] T002 | Criar runbook operacional de importacao staging/dev remoto com precondicoes, proibicoes e decisao humana. | - | `[//]` | `docs/operations/staging-import.md` | 🟢 | `[X]` |
| [//] T003 | Consolidar os contratos operacionais de comando e relatorios conforme o plano antes da implementacao. | - | `[//]` | `_reversa_forward/024-fase-16-staging-import/interfaces/staging-import-command.md` | 🟡 | `[X]` |
| T004 | Implementar resolver de ambiente alvo permitindo apenas `staging`, `preview` ou `remote-dev`. | T001 | - | `src/features/staging-import/environment.ts` | 🟢 | `[X]` |
| T005 | Implementar preflight central que agrega ambiente, aprovacao humana, backup/snapshot e estado da entrada. | T001, T004 | - | `src/features/staging-import/preflight.ts` | 🟢 | `[X]` |

## Bloco 2, Bloqueio de produção

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T006 | Implementar detector de sinais de producao em target, host, labels, flags e variaveis permitidas sem imprimir valores. | T001 | - | `src/features/staging-import/production-guard.ts` | 🟢 | `[X]` |
| T007 | Integrar bloqueio de producao ao preflight antes de qualquer conexao remota. | T005, T006 | - | `src/features/staging-import/preflight.ts` | 🟢 | `[X]` |
| T008 | Implementar redacao/mascara de valores sensiveis para logs, erros e relatorios de importacao. | T001 | - | `src/features/staging-import/safety.ts` | 🟢 | `[X]` |

## Bloco 3, Validação dos arquivos aprovados

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T009 | Criar adaptador de entrada staging que reutiliza `data/dry-run/input/primeira-execucao/` e aliases da Fase 15. | T001 | - | `src/features/staging-import/input.ts` | 🟢 | `[X]` |
| T010 | Tratar arquivos Must ausentes como `pending-input` sem conectar banco e sem falha operacional indevida. | T005, T009 | - | `src/features/staging-import/preflight.ts` | 🟢 | `[X]` |
| T011 | Gerar resumo sanitizado dos arquivos aprovados para pre-import, sem linhas de dados reais crus. | T009, T008 | - | `src/features/staging-import/input-summary.ts` | 🟢 | `[X]` |

## Bloco 4, Validação do dry-run anterior

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T012 | Implementar gate de dry-run que aceita somente `go` ou ausencia de bloqueio critico formalmente aprovada. | T009 | - | `src/features/staging-import/dry-run-gate.ts` | 🟢 | `[X]` |
| T013 | Persistir decisao de preflight como `planned`, `pending-input` ou `blocked` conforme entrada, ambiente e dry-run. | T007, T010, T012 | - | `src/features/staging-import/preflight.ts` | 🟢 | `[X]` |
| T014 | Implementar CLI inicial em modo `check`, sem escrita e sem conexao quando o preflight estiver pendente/bloqueado. | T013 | - | `src/features/staging-import/cli.ts` | 🟡 | `[X]` |

## Bloco 5, Importação staging com upsert seguro

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T015 | Transformar dataset aprovado em plano de importacao por entidade e chaves naturais existentes. | T012 | - | `src/features/staging-import/import-plan.ts` | 🟢 | `[X]` |
| T016 | Criar conexao Drizzle restrita a staging/dev remoto aprovado, sem imprimir connection string. | T007, T008 | - | `src/features/staging-import/staging-db.ts` | 🟢 | `[X]` |
| T017 | Implementar upsert seguro de categorias, produtos e relacionamentos de categoria, abortando conflitos nao mapeados. | T015, T016 | - | `src/features/staging-import/upsert-catalog.ts` | 🟢 | `[X]` |
| T018 | Implementar upsert seguro de imagens por referencia e estoque/inventario em memoria para staging. | T015, T016, T017 | - | `src/features/staging-import/upsert-assets-inventory.ts` | 🟢 | `[X]` |
| T019 | Implementar upsert seguro de cupons e frete minimo em staging. | T015, T016 | - | `src/features/staging-import/upsert-commercial.ts` | 🟢 | `[X]` |
| T020 | Orquestrar importacao `upsert` com transacao/ordem segura e sem deletes por padrao. | T017, T018, T019 | - | `src/features/staging-import/importer.ts` | 🟢 | `[X]` |

## Bloco 6, Reset protegido

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T021 | Implementar validador de reset exigindo backup/snapshot, flag explicita, aprovacao humana e nao-producao. | T001, T007 | - | `src/features/staging-import/reset-guard.ts` | 🟢 | `[X]` |
| T022 | Criar plano de reset escopado por entidades aprovadas, sem executar limpeza como padrao. | T015, T021 | - | `src/features/staging-import/reset-plan.ts` | 🟢 | `[X]` |
| T023 | Integrar `reset-and-upsert` ao orquestrador somente atras de todos os guardrails reforcados. | T020, T022 | - | `src/features/staging-import/importer.ts` | 🟢 | `[X]` |

## Bloco 7, Relatórios antes/depois

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T024 | Criar tipos/schemas de relatorio pre-import, post-import, divergencia, rollback e aprovacao humana. | T001 | `[//]` | `src/features/staging-import/report-types.ts` | 🟡 | `[X]` |
| T025 | Implementar writer de relatorio pre-import com ambiente, entrada, dry-run, backup e bloqueios sanitizados. | T013, T024, T011 | - | `src/features/staging-import/report-writer.ts` | 🟢 | `[X]` |
| T026 | Implementar writer de relatorio post-import e rollback com contagens antes/depois e status operacional. | T020, T023, T025 | - | `src/features/staging-import/report-writer.ts` | 🟢 | `[X]` |
| T027 | Garantir saida de relatorios em pasta ignorada/sanitizada, com bloqueio para relatorio bruto versionavel. | T008, T024 | - | `src/features/staging-import/report-output.ts` | 🟢 | `[X]` |

## Bloco 8, Classificação de divergências

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T028 | Mapear erros de ambiente, schema, importacao e dados para origem `dados`, `next`, `mapeamento` ou `humana`. | T001, T012 | - | `src/features/staging-import/divergences.ts` | 🟢 | `[X]` |
| T029 | Integrar resumo de divergencias aos relatorios post-import sem expor dados reais crus. | T026, T028 | - | `src/features/staging-import/report-writer.ts` | 🟢 | `[X]` |
| T030 | Implementar modelo de decisao humana: aprovado, aprovado com excecoes, no-go ou rollback. | T028 | - | `src/features/staging-import/human-approval.ts` | 🟢 | `[X]` |

## Bloco 9, Smoke pós-importação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T031 | Criar configuracao de smoke pos-importacao para URL nao produtiva e modo Stripe/teste seguro. | T007 | `[//]` | `src/features/staging-import/smoke-target.ts` | 🟢 | `[X]` |
| T032 | Criar wrapper operacional de smoke staging que aborta URL produtiva e nao aciona envio/pagamento real. | T031, T008 | - | `scripts/ops/check-staging-import-smoke.mjs` | 🟢 | `[X]` |
| T033 | Criar smoke E2E pos-importacao para home, catalogo, produto, carrinho, checkout teste, admin, pedidos e outbox. | T031 | - | `src/tests/e2e/staging-import-smoke.spec.ts` | 🟡 | `[X]` |

## Bloco 10, Rollback/checklist humano

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T034 | Criar checklist humano de aprovacao da importacao staging e criterios para proxima fase. | T002, T030 | - | `docs/operations/staging-import-approval.md` | 🟢 | `[X]` |
| T035 | Criar runbook de rollback/snapshot para importacao staging sem alterar producao ou Laravel legado. | T002, T026 | - | `docs/operations/staging-import-rollback.md` | 🟢 | `[X]` |
| T036 | Atualizar onboarding da feature com comandos finais, estados esperados e bloqueios de execucao real. | T034, T035 | - | `_reversa_forward/024-fase-16-staging-import/onboarding.md` | 🟢 | `[X]` |

## Bloco 11, Testes e validações finais

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T037 | Cobrir production guard, redacao de secrets e preflight de ambiente em testes unitarios. | T007, T008, T013 | `[//]` | `src/tests/unit/staging-import-guards.test.ts` | 🟢 | `[X]` |
| [//] T038 | Cobrir arquivos ausentes, pending-input, dry-run no-go e liberacao por dry-run go em testes unitarios. | T010, T012, T013 | `[//]` | `src/tests/unit/staging-import-preflight.test.ts` | 🟢 | `[X]` |
| [//] T039 | Cobrir upsert, reset protegido, relatorios e divergencias em testes unitarios com mocks sem banco real. | T020, T023, T029, T030 | `[//]` | `src/tests/unit/staging-import-importer.test.ts` | 🟡 | `[X]` |
| T040 | Expor scripts `ops:import-staging` e smoke staging no `package.json` e wrappers `scripts/ops`, sem execucao automatica. | T014, T020, T023, T025, T032 | - | `package.json` | 🟡 | `[X]` |
| T041 | Executar validacoes finais (`pnpm lint`, `typecheck`, `test`, `build`, `test:e2e`) e restaurar `next-env.d.ts` se sujar. | T037, T038, T039, T040 | - | `_reversa_forward/024-fase-16-staging-import/progress.jsonl` | 🟢 | `[X]` |

## Notas de execução

- Nao executar importacao real durante `/reversa-to-do`.
- Na implementacao futura, qualquer producao deve abortar antes de conectar.
- Nao copiar `.env`, nao imprimir `DATABASE_URL`, nao expor secrets.
- Nao tocar no Laravel legado.
- Nao rodar migration real automatica nem deploy.
- T020 deve ser concluida antes de T023, pois ambas tocam `src/features/staging-import/importer.ts`.
- T025 deve ser concluida antes de T026 e T029, pois todas tocam `src/features/staging-import/report-writer.ts`.
- T017 deve preceder T018 porque imagens e inventario dependem de produtos resolvidos.
- T037, T038 e T039 podem rodar em paralelo depois de suas dependencias, pois miram arquivos de teste diferentes.
- Se `next-env.d.ts` sujar nas validacoes, restaurar antes de qualquer commit futuro.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versao inicial gerada por `/reversa-to-do` | reversa |
