# Actions: Fase 17 - Staging Smoke Real / Go-live Readiness

> Identificador: `025-fase-17-staging-smoke`
> Data: `2026-07-03`
> Roadmap: `_reversa_forward/025-fase-17-staging-smoke/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 39 |
| Paralelizáveis (`[//]`) | 5 |
| Maior cadeia de dependência | 13 |

## Bloco 1, Prechecks de configuração staging

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T001 | Criar tipos canonicos para status `passed`, `pending-config`, `pending-input`, `blocked`, `failed`, `skipped`, target staging e go/no-go. | - | `[//]` | `src/features/staging-smoke/types.ts` | 🟢 | `[X]` |
| [//] T002 | Criar runbook operacional de smoke staging/preview com precondicoes, comandos esperados, aprovacoes humanas e proibicoes. | - | `[//]` | `docs/operations/staging-smoke.md` | 🟢 | `[X]` |
| [//] T003 | Atualizar contrato do comando staging smoke com entradas, status, exit codes e regras de `pending-config`/`pending-input`. | - | `[//]` | `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-smoke-command.md` | 🟢 | `[X]` |
| [//] T004 | Atualizar contrato de env staging com nomes primarios, aliases permitidos e classificacao de ausencia sem valores. | - | `[//]` | `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-env-contract.md` | 🟢 | `[X]` |
| T005 | Implementar resolver de configuracao staging a partir de `process.env`, sem ler `.env`, com aliases seguros para URL e import smoke. | T001, T004 | - | `src/features/staging-smoke/config.ts` | 🟢 | `[X]` |

## Bloco 2, Pending-config e pending-input

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T006 | Implementar normalizador de URL staging que retorna `pending-config` quando `STAGING_SMOKE_URL` ou equivalente estiver ausente. | T005 | - | `src/features/staging-smoke/smoke-target.ts` | 🟢 | `[X]` |
| T007 | Implementar builder de resultados operacionais para `pending-config`, `pending-input`, `blocked`, `failed`, `skipped` e `passed`. | T001, T005 | - | `src/features/staging-smoke/result.ts` | 🟢 | `[X]` |
| T008 | Implementar detector de arquivos aprovados para import staging que retorna `pending-input` sem conectar banco quando a entrada estiver ausente. | T007 | - | `src/features/staging-smoke/approved-input.ts` | 🟢 | `[X]` |
| T009 | Consolidar matriz de status para que ausencia de URL/env/webhook nao falhe lint/test/build/e2e local. | T006, T007, T008 | - | `src/features/staging-smoke/status-policy.ts` | 🟢 | `[X]` |

## Bloco 3, Validação segura de envs

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T010 | Implementar redacao de secrets para mensagens e relatorios, cobrindo `DATABASE_URL`, tokens, chaves Stripe, Blob e Auth. | - | `[//]` | `src/features/staging-smoke/safety.ts` | 🟢 | `[X]` |
| T011 | Implementar validador de envs staging que reporta somente presenca/ausencia e nunca valores. | T005, T007, T010 | - | `src/features/staging-smoke/env-checks.ts` | 🟢 | `[X]` |
| T012 | Implementar readiness de Neon staging/dev como check de configuracao, bloqueando conexao quando `STAGING_DATABASE_URL` ou aprovacao estiver ausente. | T011 | - | `src/features/staging-smoke/database-readiness.ts` | 🟢 | `[X]` |
| T013 | Implementar readiness de migrations staging como checklist seguro, sem executar migration e sem imprimir URL. | T012 | - | `src/features/staging-smoke/migration-readiness.ts` | 🟢 | `[X]` |

## Bloco 4, Bloqueio de produção e Stripe live

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T014 | Implementar guard de producao para URL, target, host, labels e variaveis, abortando antes de qualquer acao externa. | T006, T010 | - | `src/features/staging-smoke/production-guard.ts` | 🟢 | `[X]` |
| T015 | Implementar guard de Stripe test mode que classifica ausencia de webhook como `pending-config` e live mode como `blocked`. | T011, T010 | - | `src/features/staging-smoke/stripe-readiness.ts` | 🟢 | `[X]` |
| T016 | Integrar guards de producao e Stripe live ao preflight geral do smoke staging. | T009, T014, T015 | - | `src/features/staging-smoke/preflight.ts` | 🟢 | `[X]` |

## Bloco 5, Smoke storefront

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T017 | Implementar plano de smoke storefront para home, header/nav e ausencia de placeholders em URL staging aprovada. | T016 | - | `src/features/staging-smoke/storefront-smoke.ts` | 🟢 | `[X]` |
| T018 | Implementar checks de catalogo e pagina de produto, registrando falha funcional sem alterar dados. | T017 | - | `src/features/staging-smoke/catalog-smoke.ts` | 🟢 | `[X]` |
| T019 | Implementar checks de carrinho e checkout inicial em modo staging, sem pagamento real e sem dependencias de credenciais locais. | T017 | - | `src/features/staging-smoke/cart-checkout-smoke.ts` | 🟢 | `[X]` |
| T020 | Orquestrar smoke storefront/cart/checkout com status por etapa e respeito a `pending-config`. | T018, T019 | - | `src/features/staging-smoke/smoke-runner.ts` | 🟢 | `[X]` |

## Bloco 6, Smoke checkout/pedido/pagamento teste

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T021 | Implementar gate de checkout/pedido para ambiente staging aprovado, preservando regras de pedido e snapshots existentes. | T015, T020 | - | `src/features/staging-smoke/order-payment-smoke.ts` | 🟡 | `[X]` |
| T022 | Implementar smoke de pagamento teste que exige Stripe test mode e webhook test, retornando `pending-config` quando ausentes. | T021 | - | `src/features/staging-smoke/payment-test-smoke.ts` | 🟡 | `[X]` |
| T023 | Implementar verificacao de pedido pos-pagamento em staging quando webhook test estiver disponivel, sem confirmar pagamento por browser/admin. | T022 | - | `src/features/staging-smoke/order-status-smoke.ts` | 🟡 | `[X]` |

## Bloco 7, Smoke admin/notificações/outbox

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T024 | Implementar smoke admin protegido para acesso a produtos/pedidos em URL staging aprovada, com falha segura quando auth/env estiver ausente. | T016 | - | `src/features/staging-smoke/admin-smoke.ts` | 🟢 | `[X]` |
| T025 | Implementar smoke de pedidos admin e historico/status, sem mutar regras de pedidos. | T023, T024 | - | `src/features/staging-smoke/admin-orders-smoke.ts` | 🟡 | `[X]` |
| T026 | Implementar smoke de notificacoes/outbox para status mock/seguro, sem envio real de e-mail e sem WhatsApp/SMS. | T025 | - | `src/features/staging-smoke/notification-outbox-smoke.ts` | 🟢 | `[X]` |

## Bloco 8, Import staging smoke opcional

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T027 | Integrar check de disponibilidade de import staging usando arquivos aprovados e status `pending-input` quando ausentes. | T008, T012, T014 | - | `src/features/staging-smoke/import-staging-smoke.ts` | 🟢 | `[X]` |
| T028 | Reutilizar bridge com `ops:check-staging-import-smoke`/Fase 16 para validar dados importados apenas quando staging e input estiverem aprovados. | T027 | - | `src/features/staging-smoke/import-staging-bridge.ts` | 🟢 | `[X]` |
| T029 | Classificar divergencias do import staging smoke como `dados`, `next`, `mapeamento` ou `humana`, sem importar nem conectar quando pendente. | T028 | - | `src/features/staging-smoke/divergences.ts` | 🟢 | `[X]` |

## Bloco 9, Relatórios e checklist go-live

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T030 | Criar tipos de relatorio de smoke staging, go/no-go, pendencias e checks por etapa. | T001, T007 | - | `src/features/staging-smoke/report-types.ts` | 🟢 | `[X]` |
| T031 | Implementar writer de relatorio sanitizado para `pending-config`, `pending-input`, `blocked`, `failed` e `passed`. | T010, T030 | - | `src/features/staging-smoke/report-writer.ts` | 🟢 | `[X]` |
| T032 | Orquestrar relatorio final incluindo envs, Neon, migrations, Stripe, storefront, checkout, admin, outbox e import staging. | T013, T020, T026, T029, T031 | - | `src/features/staging-smoke/report-orchestrator.ts` | 🟢 | `[X]` |
| T033 | Criar checklist go-live/go-no-go posterior com dominio, producao, envs, rollback, smoke pos-deploy e criterios de abortar. | T032 | - | `docs/operations/go-live-readiness.md` | 🟢 | `[X]` |
| T034 | Criar CLI/wrapper operacional para `ops:check-staging-smoke`, sem deploy, migration, banco sem aprovacao ou secrets. | T032 | - | `scripts/ops/check-staging-smoke.mjs` | 🟢 | `[X]` |
| T035 | Expor script `ops:check-staging-smoke` no `package.json`, sem executar automaticamente em build/test. | T034 | - | `package.json` | 🟢 | `[X]` |

## Bloco 10, Testes e validações finais

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T036 | Criar testes unitarios para `pending-config`, `pending-input`, redacao de secrets, bloqueio de producao e Stripe live. | T009, T014, T015, T031 | - | `src/tests/unit/staging-smoke-guards.test.ts` | 🟢 | `[X]` |
| T037 | Criar testes unitarios para orquestracao de relatorio e checks de env/Neon/migrations sem conexao real. | T011, T012, T013, T032 | - | `src/tests/unit/staging-smoke-report.test.ts` | 🟢 | `[X]` |
| T038 | Criar E2E de smoke staging que fica skipped/pending-config sem URL e cobre fluxo real somente com URL staging aprovada. | T020, T023, T026, T034 | - | `src/tests/e2e/staging-smoke-real.spec.ts` | 🟡 | `[X]` |
| T039 | Executar validacoes finais (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`) e restaurar `next-env.d.ts` se sujar. | T035, T036, T037, T038 | - | `_reversa_forward/025-fase-17-staging-smoke/progress.jsonl` | 🟢 | `[X]` |

## Notas de execução

- Nao implementar durante `/reversa-to-do`.
- Nao tocar no Laravel legado.
- Nao copiar `.env`.
- Nao imprimir `DATABASE_URL`, chaves Stripe, tokens ou secrets.
- Nao conectar banco sem aprovacao humana.
- Nao rodar migration ou deploy.
- Nao usar Stripe live mode.
- Relatorios reais com dados sensiveis devem ficar fora do Git.
- T021, T022 e T023 compartilham fluxo de pagamento/pedido; executar nessa ordem.
- T030, T031 e T032 compartilham relatorios; executar nessa ordem.
- T034 deve preceder T035 porque o script em `package.json` depende do wrapper existir.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-03 | Versão inicial gerada por `/reversa-to-do` | reversa |
