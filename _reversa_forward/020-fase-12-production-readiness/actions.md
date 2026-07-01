# Actions: Fase 12 - Production Migration Readiness

> Identificador: `020-fase-12-production-readiness`
> Data: `2026-06-26`
> Roadmap: `_reversa_forward/020-fase-12-production-readiness/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 38 |
| Paralelizáveis (`[//]`) | 20 |
| Maior cadeia de dependência | 12 |

## Blocos de escopo

| Bloco | Tema | Ações principais |
|-------|------|------------------|
| 1 | Auditoria operacional do estado atual | T001-T005 |
| 2 | Migrations Drizzle e segurança de banco | T006, T014-T016, T026 |
| 3 | Neon readiness | T017, T030 |
| 4 | Vercel readiness | T018, T031 |
| 5 | Stripe test mode e webhooks | T019, T032 |
| 6 | Uploads/blob/imagens | T020, T033 |
| 7 | `.env.example` e documentação operacional | T021-T024 |
| 8 | Scripts seguros de verificação | T025-T029 |
| 9 | Smoke tests staging/production-ready | T010-T013, T034 |
| 10 | Checklist go-live e rollback | T024, T030-T033 |
| 11 | Validações finais | T035-T038 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Confirmar checkpoint operacional: diretório Next.js, ausência do Laravel legado, branch/status Git, feature ativa e regras de não executar deploy/migration/banco real. | - | - | `_reversa_forward/020-fase-12-production-readiness/progress.jsonl` | 🟢 | [X] |
| T002 | Inventariar artefatos operacionais atuais: `.env.example`, `docs/operations`, `scripts`, `package.json`, `drizzle.config.ts` e migrations versionadas, sem ler `.env` real. | T001 | - | `_reversa_forward/020-fase-12-production-readiness/operational-audit.md` | 🟢 | [X] |
| [//] T003 | Auditar documentação operacional existente e classificar lacunas por ambiente local, preview/staging e produção. | T002 | [//] | `_reversa_forward/020-fase-12-production-readiness/docs-readiness-audit.md` | 🟢 | [X] |
| [//] T004 | Auditar scripts operacionais existentes para confirmar saída sem secrets, ausência de rede obrigatória e bloqueio de comandos reais por padrão. | T002 | [//] | `_reversa_forward/020-fase-12-production-readiness/scripts-readiness-audit.md` | 🟢 | [X] |
| [//] T005 | Auditar risco de exposição de secrets por nomes de arquivos, variáveis e padrões sensíveis versionados, sem imprimir valores. | T002 | [//] | `_reversa_forward/020-fase-12-production-readiness/secret-safety-audit.md` | 🟢 | [X] |
| T006 | Mapear migrations Drizzle `0000` a `0007` para agregados, fases Reversa e riscos de DDL, sem executar migration. | T002 | - | `_reversa_forward/020-fase-12-production-readiness/migration-readiness.md` | 🟢 | [X] |
| [//] T007 | Mapear contratos externos de readiness para env, Neon, Vercel, Stripe e Blob, identificando quais docs/scripts/testes serão tocados. | T002 | [//] | `_reversa_forward/020-fase-12-production-readiness/readiness-file-map.md` | 🟢 | [X] |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T008 | Criar ou ampliar teste unitário do check de env para provar que o relatório mostra presença/ausência e nunca valores. | T004, T005 | [//] | `src/tests/unit/env-readiness.test.ts` | 🟢 | [X] |
| [//] T009 | Criar teste unitário de readiness de migrations para validar leitura estática de migrations, bloqueio de execução real e ausência de `DATABASE_URL` em saída. | T006 | [//] | `src/tests/unit/migration-readiness.test.ts` | 🟢 | [X] |
| [//] T010 | Criar teste unitário para script de build/readiness garantindo que ele apenas orquestra comandos locais seguros e não chama deploy. | T004 | [//] | `src/tests/unit/build-readiness.test.ts` | 🟢 | [X] |
| [//] T011 | Criar teste unitário para configuração de smoke por URL garantindo default local seguro, bloqueio de URL vazia inválida e ausência de secrets na saída. | T004, T007 | [//] | `src/tests/unit/smoke-readiness.test.ts` | 🟡 | [X] |
| [//] T012 | Criar smoke E2E production-ready parametrizável por URL cobrindo home, catálogo, produto, carrinho, checkout e rotas protegidas sem ação destrutiva. | T007 | [//] | `src/tests/e2e/production-readiness-smoke.spec.ts` | 🟡 | [X] |
| T013 | Criar teste E2E ou fixture de smoke seguro para pagamento test/mock e notificações mock/skipped sem cartão real, e-mail real ou live mode. | T012 | - | `src/tests/e2e/production-readiness-payment.spec.ts` | 🟡 | [X] |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T014 | Consolidar documentação de migrations Drizzle com ordem `0000` a `0007`, comandos permitidos, comandos bloqueados, backup e aprovação humana. | T006 | - | `docs/operations/database-migrations.md` | 🟢 | [X] |
| T015 | Registrar relatório Reversa de migrations com entidades cobertas, riscos, pendências e confirmação de que nenhuma migration real foi executada. | T014 | - | `_reversa_forward/020-fase-12-production-readiness/migration-readiness.md` | 🟢 | [X] |
| T016 | Revisar `scripts/db/require-database-url.mjs` apenas se necessário para garantir mensagem segura sem imprimir valor e compatibilidade com readiness. | T014 | - | `scripts/db/require-database-url.mjs` | 🟢 | [X] |
| [//] T017 | Atualizar documentação Neon com ambientes, branch/banco alvo, backup, rollback, aprovação antes de conexão/migration e proibição de URL em logs. | T007 | [//] | `docs/operations/neon.md` | 🟢 | [X] |
| [//] T018 | Atualizar documentação Vercel com env vars por ambiente, preview/staging, production, domínio, logs, rollback e proibição de deploy automático. | T007 | [//] | `docs/operations/vercel.md` | 🟢 | [X] |
| [//] T019 | Atualizar documentação Stripe para test mode, webhook, eventos mínimos, smoke de PaymentIntent e bloqueio de live keys/live mode na fase. | T007 | [//] | `docs/operations/stripe.md` | 🟢 | [X] |
| [//] T020 | Atualizar documentação Blob/upload com token, limite de 5 MB, tipos aceitos, fallback seguro e proibição de upload real sem aprovação. | T007 | [//] | `docs/operations/blob.md` | 🟢 | [X] |
| T021 | Revisar `.env.example` para refletir contrato local, preview/staging e produção sem valores reais, sem secrets e sem copiar `.env`. | T003, T005 | - | `.env.example` | 🟢 | [X] |
| T022 | Atualizar documentação de ambiente com variáveis obrigatórias/opcionais por ambiente e critérios de bloqueio quando ausentes. | T021 | - | `docs/operations/env.md` | 🟢 | [X] |
| T023 | Atualizar checklist de produção para incluir staging readiness, env, build/test, migrations, Neon, Vercel, Stripe, Blob e secrets. | T014, T017, T018, T019, T020, T022 | - | `docs/operations/production-checklist.md` | 🟢 | [X] |
| T024 | Criar checklist de go-live posterior com janela, aprovações, backup, rollback, domínio/DNS, smoke final e decisão avançar/abortar. | T023 | - | `docs/operations/go-live-checklist.md` | 🟢 | [X] |
| T025 | Ampliar `ops:check-env` para relatório por ambiente e categorias obrigatória/opcional, mantendo saída sem valores e sem rede. | T008, T021, T022 | - | `scripts/ops/check-env-readiness.mjs` | 🟢 | [X] |
| [//] T026 | Criar script de readiness de migrations com análise estática de `drizzle/` e bloqueio explícito de execução contra banco real. | T009, T015 | [//] | `scripts/ops/check-migrations-readiness.mjs` | 🟢 | [X] |
| [//] T027 | Criar script de readiness de build que orquestra verificações locais permitidas sem chamar Vercel, banco, migration ou provider externo. | T010 | [//] | `scripts/ops/check-build-readiness.mjs` | 🟢 | [X] |
| [//] T028 | Criar script de readiness de smoke com URL configurável, default local seguro e recusa de secrets na configuração. | T011, T012 | [//] | `scripts/ops/check-smoke-readiness.mjs` | 🟡 | [X] |
| T029 | Registrar scripts operacionais seguros em `package.json` sem remover scripts existentes e sem adicionar comandos de deploy/migration real automática. | T025, T026, T027, T028 | - | `package.json` | 🟢 | [X] |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T030 | Consolidar plano Neon de staging em artefato Reversa com alvo, backup, rollback, aprovação e validações bloqueadas por segurança. | T017, T015 | [//] | `_reversa_forward/020-fase-12-production-readiness/neon-readiness.md` | 🟢 | [X] |
| [//] T031 | Consolidar plano Vercel de staging em artefato Reversa com preview, production, logs, domínio, rollback e pontos de parada. | T018, T023 | [//] | `_reversa_forward/020-fase-12-production-readiness/vercel-readiness.md` | 🟢 | [X] |
| [//] T032 | Consolidar plano Stripe test mode em artefato Reversa com webhook, eventos mínimos, smoke seguro e bloqueio de live mode. | T019, T013 | [//] | `_reversa_forward/020-fase-12-production-readiness/stripe-readiness.md` | 🟢 | [X] |
| [//] T033 | Consolidar plano Blob/upload em artefato Reversa com fallback, token, limites, aprovação para upload real e riscos. | T020 | [//] | `_reversa_forward/020-fase-12-production-readiness/blob-readiness.md` | 🟢 | [X] |
| T034 | Integrar smoke production-ready aos scripts e docs, garantindo que a execução padrão não exige URL pública, banco real, pagamento real ou e-mail real. | T012, T013, T028, T029 | - | `docs/operations/production-checklist.md` | 🟡 | [X] |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T035 | Gerar `legacy-impact.md` confirmando que não houve alteração de regra de negócio, schema planejado, Laravel legado, deploy, migration real ou banco real. | T030, T031, T032, T033, T034 | - | `_reversa_forward/020-fase-12-production-readiness/legacy-impact.md` | 🟢 | [X] |
| T036 | Gerar `regression-watch.md` com evidências de readiness, validações locais, comandos não executados por segurança e riscos remanescentes. | T035 | - | `_reversa_forward/020-fase-12-production-readiness/regression-watch.md` | 🟡 | [X] |
| T037 | Executar validações finais permitidas (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` e scripts ops seguros) e registrar resultados sem secrets. | T029, T034, T036 | - | `_reversa_forward/020-fase-12-production-readiness/regression-watch.md` | 🟢 | [X] |
| T038 | Fazer revisão final de worktree, restaurar `next-env.d.ts` se necessário e registrar que não houve commit, push, deploy, migration real, banco real ou secrets. | T037 | - | `_reversa_forward/020-fase-12-production-readiness/progress.jsonl` | 🟢 | [X] |

## Notas de execução

- Tarefas marcadas `[//]` foram escolhidas por terem arquivos alvo distintos e não dependerem diretamente umas das outras.
- T023 e T034 tocam `docs/operations/production-checklist.md`; executar T023 antes de T034.
- T015 e T026 dependem de T006 e não devem executar migration real.
- T012 e T013 não devem usar URL pública, cartão real, banco real ou e-mail real sem aprovação humana explícita.
- T037 executa somente validações locais permitidas e scripts seguros.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Versão inicial gerada por `/reversa-to-do` | reversa |
