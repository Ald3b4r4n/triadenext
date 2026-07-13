# Actions: Fase 19 — Controlled Staging Execution

> Identificador: `027-fase-19-controlled-staging`
> Data: `2026-07-13`
> Roadmap: `_reversa_forward/027-fase-19-controlled-staging/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 41 |
| Paralelizáveis (`[//]`) | 5 |
| Maior cadeia de dependência | 27 |

## Bloco 1, Preparação do diagnóstico

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Confirmar o diretório Next, a separação do Laravel legado, o estado inicial do Git e a limpeza de `next-env.d.ts`, registrando somente metadados não sensíveis. | - | - | `_reversa_forward/027-fase-19-controlled-staging/progress.jsonl` | 🟢 | `[X]` |
| T002 | Conferir no `package.json` o mapeamento dos sete comandos operacionais e garantir que nenhum deles participe de hooks automáticos de instalação, build ou deploy. | T001 | - | `package.json` | 🟢 | `[X]` |
| T003 | Inspecionar os entrypoints dos quatro checks offline e confirmar que o modo padrão não exige flags remotas, não inventa configuração e não imprime valores sensíveis. | T002 | - | `scripts/ops/check-staging-environment.mjs` | 🟢 | `[X]` |
| T004 | Inspecionar os wrappers de importação, migration e bootstrap para confirmar que o modo padrão é apenas precheck/check e bloqueia carregamento remoto sem gates completos. | T002 | - | `scripts/ops/migrate-staging.mjs` | 🟢 | `[X]` |
| T005 | Consolidar a sequência permitida, as flags proibidas, as regras de interrupção e o padrão de evidência sanitizada antes de qualquer comando diagnóstico. | T003, T004 | - | `_reversa_forward/027-fase-19-controlled-staging/interfaces/controlled-staging-diagnostic-sequence.md` | 🟢 | `[X]` |

## Bloco 2, Readiness Vercel

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T006 | Mapear os checks existentes de projeto, Preview/staging, branch e URL aprovada da Vercel, preservando somente nomes lógicos e presença/ausência. | T001 | `[//]` | `src/features/staging-environment/vercel-readiness.ts` | 🟢 | `[X]` |
| T007 | Validar por inspeção e testes existentes que a ausência de Vercel ou URL retorna `pending-config` sem CLI/API, deploy ou acesso a URL inventada. | T005, T006 | - | `src/tests/unit/staging-environment-readiness.test.ts` | 🟢 | `[X]` |
| T008 | Definir os campos de evidência e as ações humanas da seção Vercel, incluindo vínculo GitHub, ambiente não produtivo e URL controlada. | T007 | - | `_reversa_forward/027-fase-19-controlled-staging/interfaces/human-staging-checklist.md` | 🟢 | `[X]` |

## Bloco 3, Readiness Neon

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T009 | Mapear os checks existentes de Neon staging/dev, isolamento de produção, role mínima, snapshot e restore sem abrir conexão. | T001 | `[//]` | `src/features/staging-environment/neon-readiness.ts` | 🟢 | `[X]` |
| T010 | Validar por inspeção e testes existentes que Neon ausente retorna `pending-config` e que produção, snapshot ausente ou aprovação incompleta permanecem bloqueados. | T005, T009 | - | `src/tests/unit/staging-environment-gates-report.test.ts` | 🟢 | `[X]` |
| T011 | Acrescentar ao contrato de checklist as evidências humanas de banco isolado, snapshot, restore, responsável e janela aprovada, sem registrar host ou connection string. | T008, T010 | - | `_reversa_forward/027-fase-19-controlled-staging/interfaces/human-staging-checklist.md` | 🟢 | `[X]` |

## Bloco 4, Readiness Stripe test

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T012 | Mapear os checks existentes de Stripe test e webhook test, incluindo o bloqueio de live mode, sem revelar prefixos completos, chaves ou webhook secret. | T001 | `[//]` | `src/features/staging-environment/stripe-test-readiness.ts` | 🟢 | `[X]` |
| T013 | Validar por inspeção e testes existentes que configuração ou webhook ausente retorna `pending-config` e qualquer sinal live retorna `blocked` antes de chamada externa. | T005, T012 | - | `src/tests/unit/staging-environment-readiness.test.ts` | 🟢 | `[X]` |
| T014 | Acrescentar ao contrato de checklist as evidências humanas de chaves test, webhook test, eventos requeridos e bloqueio de live mode. | T011, T013 | - | `_reversa_forward/027-fase-19-controlled-staging/interfaces/human-staging-checklist.md` | 🟢 | `[X]` |

## Bloco 5, Readiness autenticação e admin

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T015 | Mapear os checks de autenticação, allowlist master, schema e bootstrap administrativo, registrando somente nomes de configuração e estados. | T001 | `[//]` | `src/features/staging-environment/admin-bootstrap-gate.ts` | 🟢 | `[X]` |
| T016 | Validar por inspeção e testes existentes que o bootstrap padrão permanece em check, exige ambiente não produtivo e aprovação humana e não imprime credenciais. | T004, T015 | - | `src/tests/unit/staging-environment-gates-report.test.ts` | 🟢 | `[X]` |
| T017 | Acrescentar ao contrato de checklist as evidências humanas de auth staging, `ADMIN_MASTER_EMAILS`, schema pronto e login admin futuro, sem senha ou sessão. | T014, T016 | - | `_reversa_forward/027-fase-19-controlled-staging/interfaces/human-staging-checklist.md` | 🟢 | `[X]` |

## Bloco 6, Readiness import staging

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T018 | Confirmar que a pasta de entrada aprovada permanece ignorada pelo Git e que ausência de arquivos reais é classificada como `pending-input`, sem criar dados fictícios no local aprovado. | T001 | `[//]` | `data/dry-run/input/primeira-execucao/.gitkeep` | 🟢 | `[X]` |
| T019 | Inspecionar os checks de dry-run e import staging smoke para confirmar validação local, ausência de upload e ausência de escrita em banco. | T005, T018 | - | `scripts/ops/check-staging-import-smoke.mjs` | 🟢 | `[X]` |
| T020 | Validar por inspeção e testes existentes que `ops:import-staging` sem flags executa somente precheck e retorna pendência ou bloqueio antes de carregar conexão. | T004, T018 | - | `src/tests/unit/staging-import-preflight.test.ts` | 🟢 | `[X]` |
| T021 | Acrescentar ao contrato de checklist as evidências humanas de arquivos aprovados, dry-run sem bloqueio crítico, ambiente não produtivo e aprovação futura de importação. | T017, T019, T020 | - | `_reversa_forward/027-fase-19-controlled-staging/interfaces/human-staging-checklist.md` | 🟢 | `[X]` |

## Bloco 7, Execução segura dos checks offline

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T022 | Executar `pnpm ops:check-staging-environment` sem flags e registrar somente exit code, status por provider e evidência sanitizada. | T005, T007, T010, T013, T016, T021 | - | `scripts/ops/check-staging-environment.mjs` | 🟢 | `[X]` |
| T023 | Executar `pnpm ops:check-staging-smoke` sem flags e confirmar `pending-config` ou `skipped` controlado quando não houver URL aprovada. | T022 | - | `scripts/ops/check-staging-smoke.mjs` | 🟢 | `[X]` |
| T024 | Executar `pnpm ops:check-staging-import-smoke` sem flags e registrar `pending-config`, `pending-input`, `blocked` ou `passed` sem importação. | T023 | - | `scripts/ops/check-staging-import-smoke.mjs` | 🟢 | `[X]` |
| T025 | Executar `pnpm ops:check-data-dry-run` sem entrada real não aprovada e manter resultados sintéticos separados de `pending-input`. | T024 | - | `scripts/ops/check-data-dry-run-readiness.mjs` | 🟢 | `[X]` |
| T026 | Executar `pnpm ops:import-staging` sem flags somente após confirmar o default de precheck, interrompendo antes de qualquer conexão ou escrita. | T020, T025 | - | `scripts/ops/import-staging.mjs` | 🟢 | `[X]` |
| T027 | Executar `pnpm ops:migrate-staging` sem flags somente no modo check, confirmando bloqueio antes de driver, connection string ou migration remota. | T004, T026 | - | `scripts/ops/migrate-staging.mjs` | 🟢 | `[X]` |
| T028 | Executar `pnpm ops:bootstrap-admin-staging` sem flags somente no modo check, confirmando bloqueio antes de conexão, alteração de usuário ou credencial remota. | T016, T027 | - | `scripts/ops/bootstrap-admin-staging.ts` | 🟢 | `[X]` |

## Bloco 8, Consolidação dos status

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T029 | Normalizar os resultados dos sete comandos na matriz `passed`, `pending-config`, `pending-input`, `blocked`, `skipped` e `failed`, preservando exit codes sem saída bruta. | T022, T023, T024, T025, T026, T027, T028 | - | `_reversa_forward/027-fase-19-controlled-staging/operational-status-matrix.md` | 🟢 | `[X]` |
| T030 | Classificar cada pendência por origem: configuração externa, input aprovado, bloqueio de segurança, problema do Next ou decisão humana. | T029 | - | `_reversa_forward/027-fase-19-controlled-staging/operational-status-matrix.md` | 🟢 | `[X]` |
| T031 | Aplicar a política conservadora de decisão, garantindo `no-go` para qualquer Must pendente, bloqueado, falho ou pulado sem autorização. | T030 | - | `_reversa_forward/027-fase-19-controlled-staging/operational-status-matrix.md` | 🟢 | `[X]` |

## Bloco 9, Relatório go/no-go

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T032 | Gerar o relatório operacional com checks executados, status, categorias, bloqueadores, evidências sanitizadas e decisão go/no-go. | T031 | - | `_reversa_forward/027-fase-19-controlled-staging/operational-go-no-go.md` | 🟢 | `[X]` |
| T033 | Revisar o relatório para remover valores de env, URLs completas, `DATABASE_URL`, chaves, tokens, cookies, senhas, payloads reais e stack traces brutos. | T032 | - | `_reversa_forward/027-fase-19-controlled-staging/operational-go-no-go.md` | 🟢 | `[X]` |
| T034 | Registrar no relatório os critérios de uma futura execução remota aprovada, sem transformar o diagnóstico em autorização de migration, bootstrap, importação, smoke ou deploy. | T033 | - | `_reversa_forward/027-fase-19-controlled-staging/operational-go-no-go.md` | 🟢 | `[X]` |

## Bloco 10, Checklist humano

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T035 | Gerar checklist humano somente com as pendências observadas de Vercel, Neon, Stripe test, auth/admin e import staging, incluindo responsável, evidência esperada e gate. | T021, T033 | - | `_reversa_forward/027-fase-19-controlled-staging/human-staging-checklist.md` | 🟢 | `[X]` |
| T036 | Ordenar o checklist por bloqueios de segurança, configurações externas, inputs aprovados e decisões humanas, deixando explícito o critério para avançar ao staging real. | T035 | - | `_reversa_forward/027-fase-19-controlled-staging/human-staging-checklist.md` | 🟢 | `[X]` |

## Bloco 11, Testes e validações finais

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T037 | Executar os testes unitários direcionados a readiness, gates, staging smoke e staging import, confirmando ausência de rede e banco nos cenários padrão. | T033 | - | `src/tests/unit/staging-environment-gates-report.test.ts` | 🟢 | `[X]` |
| T038 | Executar os E2E locais de staging environment, staging smoke e staging import sem URL externa, aceitando somente skips ou pendências previstas. | T037 | - | `src/tests/e2e/staging-environment.spec.ts` | 🟢 | `[X]` |
| T039 | Executar as validações locais de copy PT-BR, lint, tipos, testes, build e E2E sem credenciais externas e registrar resultados sanitizados. | T038 | - | `_reversa_forward/027-fase-19-controlled-staging/progress.jsonl` | 🟢 | `[X]` |
| T040 | Auditar o diff final contra secrets, dados reais, `.env`, alterações funcionais indevidas e qualquer toque no Laravel legado, restaurando `next-env.d.ts` se necessário. | T034, T036, T039 | - | `_reversa_forward/027-fase-19-controlled-staging/regression-watch.md` | 🟢 | `[X]` |
| T041 | Consolidar o progresso das 41 ações, as pendências reais e a recomendação da próxima fase sem executar operação remota nem conceder aprovação implícita. | T040 | - | `_reversa_forward/027-fase-19-controlled-staging/progress.jsonl` | 🟢 | `[X]` |

## Notas de execução

- `actions.md` é o arquivo canônico; não criar `tasks.md` como ponte.
- T006, T009, T012, T015 e T018 são paralelizáveis porque inspecionam alvos distintos e não escrevem relatório compartilhado.
- T008, T011, T014, T017 e T021 compartilham o contrato de checklist e devem ser executadas nessa ordem.
- T022 a T028 formam uma sequência deliberadamente serial; nenhum comando recebe flags remotas, destrutivas ou de aprovação.
- T026 só pode rodar depois de comprovado que o modo padrão de `ops:import-staging` é precheck sem conexão e sem escrita.
- T027 e T028 só podem rodar depois de comprovado que os wrappers permanecem em check e bloqueiam carregamento remoto.
- Se qualquer entrypoint não puder provar default seguro, a ação correspondente deve ser marcada `blocked` e o comando não deve ser executado.
- Saídas brutas não devem ser copiadas para artefatos versionados; registrar somente status, exit code, categoria e evidência sanitizada.
- `pending-config` e `pending-input` significam diagnóstico concluído, mas decisão operacional `no-go`.
- Não tocar no Laravel legado, não copiar `.env`, não conectar banco remoto, não executar migration/importação/bootstrap remotos e não fazer deploy.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-13 | Versão inicial gerada por `/reversa-to-do` | reversa |
