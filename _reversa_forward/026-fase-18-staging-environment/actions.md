# Actions: Fase 18 — Staging Environment Setup

> Identificador: `026-fase-18-staging-environment`
> Data: `2026-07-11`
> Roadmap: `_reversa_forward/026-fase-18-staging-environment/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 44 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 12 |

## Bloco 1, Readiness offline e pending-config

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T001 | Criar tipos canônicos do orquestrador para targets não produtivos, providers, aprovações, checks e status `passed`, `pending-config`, `pending-input`, `blocked`, `failed` e `skipped`. | - | `[//]` | `src/features/staging-environment/types.ts` | 🟢 | `[X]` |
| T002 | Implementar resolver offline de configuração a partir de `process.env`, sem ler `.env`, sem rede e sem expor valores. | T001 | - | `src/features/staging-environment/config.ts` | 🟢 | `[X]` |
| T003 | Implementar inventário offline de Vercel, Neon, Stripe test, auth, admin e input aprovado, registrando apenas presença/ausência. | T002 | - | `src/features/staging-environment/readiness.ts` | 🟢 | `[X]` |
| T004 | Implementar gerador de `pending-config`/`pending-input` com checklist específico e decisão preliminar `no-go`. | T003 | - | `src/features/staging-environment/pending-status.ts` | 🟢 | `[X]` |

## Bloco 2, Vercel preview/staging

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Implementar readiness de Vercel por presença lógica de projeto, ambiente Preview/staging, branch e URL aprovada, sem chamar CLI/API ou registrar URL. | T002, T016 | - | `src/features/staging-environment/vercel-readiness.ts` | 🟢 | `[X]` |
| [//] T006 | Criar checklist operacional de vínculo GitHub, ambiente Preview/staging, envs por escopo, logs, URL controlada e proibição de promoção para produção. | - | `[//]` | `docs/operations/vercel-staging.md` | 🟢 | `[X]` |
| T007 | Integrar o resultado Vercel ao inventário geral, retornando `pending-config` sem deploy quando projeto, acesso ou URL estiverem ausentes. | T003, T005 | - | `src/features/staging-environment/provider-readiness.ts` | 🟢 | `[X]` |

## Bloco 3, Neon staging/dev

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Implementar readiness de Neon staging/dev por presença, classificação não produtiva, role mínima e restore/snapshot, sem abrir conexão. | T002, T016 | - | `src/features/staging-environment/neon-readiness.ts` | 🟢 | `[X]` |
| T009 | Implementar catálogo estático das migrations `0000` a `0007`, incluindo ordem, área e risco operacional, sem executá-las. | T008 | - | `src/features/staging-environment/migration-catalog.ts` | 🟢 | `[X]` |
| [//] T010 | Criar checklist operacional de projeto/branch Neon isolado, role, snapshot, restore, aprovação e bloqueio de produção. | - | `[//]` | `docs/operations/neon-staging.md` | 🟢 | `[X]` |
| T011 | Integrar Neon e snapshot ao inventário geral, retornando `pending-config` sem conexão quando o ambiente estiver ausente. | T003, T008 | - | `src/features/staging-environment/provider-readiness.ts` | 🟢 | `[X]` |

## Bloco 4, Stripe test/webhook

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T012 | Implementar readiness de Stripe que diferencia configuração test/sandbox de sinais live sem revelar prefixos completos ou valores. | T002, T016 | - | `src/features/staging-environment/stripe-test-readiness.ts` | 🟢 | `[X]` |
| T013 | Implementar readiness do webhook test por presença, endpoint lógico, eventos exigidos, assinatura e aprovação, sem chamar Stripe. | T012 | - | `src/features/staging-environment/stripe-webhook-readiness.ts` | 🟢 | `[X]` |
| [//] T014 | Criar checklist operacional de chaves test, webhook HTTPS, eventos PaymentIntent, assinatura, idempotência e proibição de live mode. | - | `[//]` | `docs/operations/stripe-staging.md` | 🟢 | `[X]` |
| T015 | Integrar Stripe test/webhook ao inventário geral, retornando `pending-config` e bloqueando pagamento externo quando incompleto. | T003, T013 | - | `src/features/staging-environment/provider-readiness.ts` | 🟢 | `[X]` |

## Bloco 5, Validação segura de envs

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T016 | Implementar sanitização central para URLs, connection strings, tokens, senhas, cookies, chaves Stripe, webhook secrets e payloads. | - | `[//]` | `src/features/staging-environment/safety.ts` | 🟢 | `[X]` |
| [//] T017 | Revisar `.env.example` e consolidar somente nomes necessários para local, Preview/staging e produção futura, sem adicionar valores. | - | `[//]` | `.env.example` | 🟢 | `[X]` |
| T018 | Implementar matriz de envs obrigatórias/opcionais por ambiente e validação por presença, reutilizando redaction e mantendo checks locais independentes. | T002, T016, T017 | - | `src/features/staging-environment/env-readiness.ts` | 🟢 | `[X]` |

## Bloco 6, Gates de execução

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T019 | Implementar guard de alvo para bloquear produção, domínio definitivo e labels produtivas antes de qualquer adapter externo. | T002, T016 | - | `src/features/staging-environment/production-guard.ts` | 🟢 | `[X]` |
| T020 | Implementar gate de aprovação humana com ação, alvo lógico, janela e validade explícitos, sem usar aprovação genérica reutilizável. | T001 | - | `src/features/staging-environment/human-approval.ts` | 🟢 | `[X]` |
| T021 | Implementar orquestrador de gates para migration, bootstrap e smoke, exigindo envs, target, aprovação e pré-condições específicas. | T018, T019, T020 | - | `src/features/staging-environment/execution-gates.ts` | 🟢 | `[X]` |
| T022 | Implementar preflight offline consolidado que nunca abre rede/banco e produz inventário, checklists e bloqueios sanitizados. | T004, T007, T011, T015, T021 | - | `src/features/staging-environment/preflight.ts` | 🟢 | `[X]` |

## Bloco 7, Migration staging com aprovação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T023 | Implementar gate de migration staging com migrations selecionadas, revisão estática, alvo não produtivo, snapshot, rollback e aprovação cumulativos. | T009, T021 | - | `src/features/staging-environment/migration-gate.ts` | 🟢 | `[X]` |
| T024 | Criar wrapper de migration staging que avalia todos os gates antes de carregar driver/URL e nunca participa de build, install ou deploy hook. | T023 | - | `scripts/ops/migrate-staging.mjs` | 🟢 | `[X]` |
| T025 | Expor comando `ops:migrate-staging` sem execução automática e preservar `db:migrate` existente. | T024 | - | `package.json` | 🟢 | `[X]` |
| [//] T026 | Criar runbook de revisão, snapshot, aprovação, execução, verificação de schema e rollback da migration staging. | - | `[//]` | `docs/operations/staging-migrations.md` | 🟢 | `[X]` |

## Bloco 8, Bootstrap admin master staging

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T027 | Implementar gate staging-only para o master `rafasouzacruz@gmail.com`, exigindo schema, auth, allowlist, aprovação e bloqueio de produção. | T021 | - | `src/features/staging-environment/admin-bootstrap-gate.ts` | 🟢 | `[X]` |
| T028 | Criar wrapper idempotente de bootstrap staging que reutiliza o serviço existente, carrega conexão somente após o gate e não imprime credenciais. | T027 | - | `scripts/ops/bootstrap-admin-staging.ts` | 🟢 | `[X]` |
| T029 | Expor comando `ops:bootstrap-admin-staging` de forma serializada após a inclusão do comando de migration no `package.json`. | T025, T028 | - | `package.json` | 🟢 | `[X]` |
| [//] T030 | Criar runbook de bootstrap, promoção, login master, validação de customer bloqueado e parada segura sem remoção automática de usuário. | - | `[//]` | `docs/operations/staging-admin-bootstrap.md` | 🟢 | `[X]` |

## Bloco 9, Smoke real staging

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T031 | Criar bridge entre o novo orquestrador e `staging-smoke`, repassando somente configuração aprovada e preservando `pending-config`. | T007, T011, T015, T021 | - | `src/features/staging-environment/staging-smoke-bridge.ts` | 🟢 | `[X]` |
| T032 | Integrar validação de login master e bloqueio de customer ao smoke admin, sem expor sessão, cookie ou credenciais. | T028, T031 | - | `src/features/staging-environment/admin-login-smoke.ts` | 🟢 | `[X]` |
| T033 | Orquestrar smoke de storefront, checkout/pagamento test, pedido, admin e outbox com gates independentes e status por etapa. | T031, T032 | - | `src/features/staging-environment/smoke-orchestrator.ts` | 🟢 | `[X]` |
| T034 | Criar CLI `check-staging-environment` que executa o caminho offline por padrão e só permite smoke externo com flag e aprovação explícitas. | T022, T033 | - | `scripts/ops/check-staging-environment.mjs` | 🟢 | `[X]` |

## Bloco 10, Relatório go/no-go

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T035 | Expor `ops:check-staging-environment` no `package.json`, depois dos outros comandos staging para evitar conflito no mesmo arquivo. | T029, T034 | - | `package.json` | 🟢 | `[X]` |
| T036 | Implementar tipos e builder do relatório sanitizado com seções Vercel, Neon, migration, auth, Stripe, smoke, import opcional e rollback. | T001, T004, T007, T011, T015, T016 | - | `src/features/staging-environment/report.ts` | 🟢 | `[X]` |
| T037 | Implementar política determinística de go/no-go: qualquer Must pendente, bloqueado, falho ou skip não autorizado produz `no-go`. | T033, T036 | - | `src/features/staging-environment/go-no-go.ts` | 🟢 | `[X]` |
| T038 | Integrar relatório e decisão à CLI, gravando apenas saída local ignorada ou versão explicitamente sanitizada. | T034, T037 | - | `src/features/staging-environment/report-output.ts` | 🟢 | `[X]` |

## Bloco 11, Rollback e checklist operacional

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T039 | Consolidar runbook da Fase 18 com sequência, gates, `pending-config`, parada segura e rollback separado de deployment e banco. | T006, T010, T014, T026, T030, T037 | - | `docs/operations/staging-environment.md` | 🟢 | `[X]` |
| T040 | Atualizar checklist go-live para exigir relatório staging `go`, rollback confirmado e nova aprovação, sem autorizar produção nesta fase. | T037, T039 | - | `docs/operations/go-live-readiness.md` | 🟢 | `[X]` |

## Bloco 12, Testes e validações finais

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T041 | Criar testes unitários de readiness, `pending-config`, redaction, envs e bloqueio de produção/Stripe live sem rede ou banco. | T007, T011, T015, T018, T021 | - | `src/tests/unit/staging-environment-readiness.test.ts` | 🟢 | `[X]` |
| T042 | Criar testes unitários de gates de migration/bootstrap e relatório go/no-go, cobrindo ausência de aprovação, snapshot e configuração. | T023, T027, T037 | - | `src/tests/unit/staging-environment-gates-report.test.ts` | 🟢 | `[X]` |
| T043 | Criar E2E/CLI seguro que retorna `pending-config` sem infraestrutura e só habilita smoke remoto com URL e aprovação explícitas. | T034, T035, T037 | - | `src/tests/e2e/staging-environment.spec.ts` | 🟡 | `[X]` |
| T044 | Executar `pnpm ops:check-ptbr-copy`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`, registrar resultados e restaurar `next-env.d.ts` se necessário. | T035, T038, T040, T041, T042, T043 | - | `_reversa_forward/026-fase-18-staging-environment/progress.jsonl` | 🟢 | `[X]` |

## Notas de execução

- Não implementar durante `/reversa-to-do`.
- Não tocar no Laravel legado.
- Não copiar `.env` nem executar comando que exporte envs remotas para arquivo local.
- Não imprimir `DATABASE_URL`, URL externa, chave Stripe, webhook secret, senha, token ou cookie.
- Não conectar Neon, executar migration, bootstrap remoto, smoke externo ou deploy sem aprovação humana explícita posterior.
- `pending-config` e `pending-input` têm exit code operacional seguro, mas sempre resultam em `no-go`.
- T007, T011 e T015 compartilham `provider-readiness.ts` e devem ser executadas nessa ordem.
- T025, T029 e T035 compartilham `package.json` e devem ser executadas nessa ordem.
- T031, T032 e T033 formam a cadeia do smoke real e não são paralelizáveis.
- T036, T037 e T038 formam a cadeia de relatório e decisão e não são paralelizáveis.
- T024 apenas cria o wrapper protegido; a implementação da fase não autoriza executar migration remota.
- T028 apenas cria o wrapper protegido; a implementação da fase não autoriza executar bootstrap remoto.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-11 | Versão inicial gerada por `/reversa-to-do` | reversa |
