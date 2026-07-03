# Legacy Impact - 025-fase-17-staging-smoke

- Data: 2026-07-03
- Feature: Fase 17 - Staging Smoke Real / Go-live Readiness
- Escopo: readiness operacional para smoke real em staging/preview/dev remoto, com `pending-config`, `pending-input`, bloqueio de producao, bloqueio de Stripe live mode e relatorios sanitizados.

## Arquivos Afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| --- | --- | --- | --- | --- |
| `.reversa/active-requirements.json` | Reversa Forward | delta-de-contrato-externo | LOW | Mantem a feature ativa do ciclo forward. |
| `_reversa_forward/025-fase-17-staging-smoke/actions.md` | Reversa Forward | delta-de-contrato-externo | LOW | Marca 39 tarefas como concluidas. |
| `_reversa_forward/025-fase-17-staging-smoke/audit/cross-check.md` | Reversa Forward | delta-de-contrato-externo | LOW | Registra auditoria aprovada antes da implementacao. |
| `_reversa_forward/025-fase-17-staging-smoke/progress.jsonl` | Reversa Forward | delta-de-contrato-externo | LOW | Registra progresso append-only das tarefas. |
| `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-smoke-command.md` | Contrato operacional | delta-de-contrato-externo | LOW | Atualiza entradas, status e regras do comando staging smoke. |
| `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-env-contract.md` | Contrato operacional | delta-de-contrato-externo | LOW | Define aliases/envs sem imprimir valores. |
| `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-smoke-report.md` | Contrato operacional | delta-de-contrato-externo | LOW | Define arquivos de relatorio sanitizado. |
| `docs/operations/staging-smoke.md` | Operational Readiness | componente-novo | LOW | Cria runbook para smoke staging/preview seguro. |
| `docs/operations/go-live-readiness.md` | Operational Readiness | componente-novo | LOW | Cria checklist preparatorio de go-live futuro, sem executar producao. |
| `package.json` | Scripts operacionais | delta-de-contrato-externo | LOW | Expoe `ops:check-staging-smoke` sem acoplar a build/test. |
| `scripts/ops/check-staging-smoke.mjs` | Scripts operacionais | componente-novo | LOW | Wrapper seguro via `tsx`, sem deploy, migration ou banco por padrao. |
| `src/features/staging-smoke/types.ts` | Staging Smoke Readiness | componente-novo | LOW | Tipos canonicos de status, checks, issues e relatorios. |
| `src/features/staging-smoke/config.ts` | Staging Smoke Readiness | componente-novo | LOW | Resolve configuracao via `process.env` sem ler `.env`. |
| `src/features/staging-smoke/safety.ts` | Staging Smoke Readiness | componente-novo | LOW | Redige valores com aparencia de secret. |
| `src/features/staging-smoke/result.ts` | Staging Smoke Readiness | componente-novo | LOW | Builder de checks/issues e matriz de status. |
| `src/features/staging-smoke/smoke-target.ts` | Staging Smoke Readiness | componente-novo | LOW | Normaliza URL staging e retorna `pending-config` quando ausente. |
| `src/features/staging-smoke/approved-input.ts` | Staging Smoke Readiness | componente-novo | LOW | Reusa input aprovado da Fase 16 sem conectar banco. |
| `src/features/staging-smoke/status-policy.ts` | Staging Smoke Readiness | componente-novo | LOW | Consolida status operacional e go/no-go. |
| `src/features/staging-smoke/env-checks.ts` | Staging Smoke Readiness | componente-novo | LOW | Valida presenca/ausencia de envs sem valores. |
| `src/features/staging-smoke/database-readiness.ts` | Staging Smoke Readiness | componente-novo | LOW | Bloqueia conexao quando env/aprovacao de banco estao ausentes. |
| `src/features/staging-smoke/migration-readiness.ts` | Staging Smoke Readiness | componente-novo | LOW | Checklist de migration staging sem execucao. |
| `src/features/staging-smoke/production-guard.ts` | Staging Smoke Readiness | componente-novo | MEDIUM | Bloqueia sinais de producao antes de qualquer smoke remoto. |
| `src/features/staging-smoke/stripe-readiness.ts` | Staging Smoke Readiness | componente-novo | MEDIUM | Bloqueia Stripe live mode e deixa webhook ausente como `pending-config`. |
| `src/features/staging-smoke/preflight.ts` | Staging Smoke Readiness | componente-novo | MEDIUM | Orquestra guards de env, producao, Stripe, banco, migration e input. |
| `src/features/staging-smoke/storefront-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Smoke de home somente com URL/aprovacao/flag de rede. |
| `src/features/staging-smoke/catalog-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Smoke de catalogo sem mutacao de dados. |
| `src/features/staging-smoke/cart-checkout-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Smoke de carrinho/checkout sem pagamento real. |
| `src/features/staging-smoke/smoke-runner.ts` | Staging Smoke Readiness | componente-novo | LOW | Orquestra smoke storefront/cart/checkout. |
| `src/features/staging-smoke/order-payment-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Gate de pedido/pagamento sem alterar regras existentes. |
| `src/features/staging-smoke/payment-test-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Classifica pagamento teste como `pending-config` sem Stripe test/webhook. |
| `src/features/staging-smoke/order-status-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Verifica status pos-pagamento somente quando webhook test estiver disponivel. |
| `src/features/staging-smoke/admin-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Smoke admin protegido sem expor secrets. |
| `src/features/staging-smoke/admin-orders-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Smoke de pedidos admin sem mutar pedidos. |
| `src/features/staging-smoke/notification-outbox-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Smoke de notificacoes/outbox sem envio real e sem WhatsApp/SMS. |
| `src/features/staging-smoke/import-staging-smoke.ts` | Staging Smoke Readiness | componente-novo | LOW | Integra disponibilidade de import staging como opcional. |
| `src/features/staging-smoke/import-staging-bridge.ts` | Staging Smoke Readiness | componente-novo | LOW | Bridge seguro para smoke pos-importacao da Fase 16. |
| `src/features/staging-smoke/divergences.ts` | Staging Smoke Readiness | componente-novo | LOW | Classifica divergencias por origem operacional. |
| `src/features/staging-smoke/report-types.ts` | Staging Smoke Readiness | componente-novo | LOW | Tipos de relatorio e checklist. |
| `src/features/staging-smoke/report-writer.ts` | Staging Smoke Readiness | componente-novo | LOW | Escreve relatorios sanitizados em `data/dry-run/output/`. |
| `src/features/staging-smoke/report-orchestrator.ts` | Staging Smoke Readiness | componente-novo | MEDIUM | Consolida preflight, smoke, import opcional, relatorios e go/no-go. |
| `src/features/staging-smoke/cli.ts` | Staging Smoke Readiness | componente-novo | LOW | CLI operacional com exit code seguro. |
| `src/tests/unit/staging-smoke-guards.test.ts` | Testes | componente-novo | LOW | Testa pending states, redaction, producao e Stripe live. |
| `src/tests/unit/staging-smoke-report.test.ts` | Testes | componente-novo | LOW | Testa relatorios sem banco/migration/secrets. |
| `src/tests/e2e/staging-smoke-real.spec.ts` | Testes E2E | componente-novo | LOW | Smoke remoto fica skipped sem `STAGING_SMOKE_URL`. |

## Diff Conceitual por Componente

### Operational Readiness

A Fase 17 adiciona uma camada operacional para validar staging/preview real quando a infraestrutura externa existir. A ausencia de URL, envs, webhook ou aprovacao humana vira `pending-config`, nao falha indevida de CI local. A ausencia de arquivos aprovados para import staging vira `pending-input`.

### Scripts operacionais

Foi adicionado `pnpm ops:check-staging-smoke`, que chama a CLI TypeScript via `tsx`, gera relatorios sanitizados e retorna exit code 0 para `pending-config`/`pending-input`, e exit code 1 para `blocked`/`failed`. O script nao faz deploy, migration, conexao com banco ou envio real.

### Storefront, checkout, pedidos, admin e notificacoes

Nao houve alteracao nas regras funcionais existentes. A nova camada apenas observa superficies em staging aprovado e registra falhas ou pendencias sem mudar pagamento, estoque, cupom, frete, pedido ou notificacao.

### Segurança operacional

O preflight bloqueia sinais de producao e Stripe live mode antes de qualquer requisicao remota. O smoke remoto exige URL, `--allow-network` e aprovacao humana. Relatorios redigem valores com aparencia de secrets e nunca devem imprimir `DATABASE_URL`.

## Preservadas

- Produto publico continua exigindo publicado, vigente e estoque positivo.
- Carrinho convertido continua terminal para mutacoes de compra.
- Recálculo do carrinho continua removendo item indisponivel, limitando estoque e removendo cupom invalido.
- Checkout continua exigindo customer autenticado.
- Pedido continua nascendo de carrinho ativo com snapshots server-side.
- Retorno client-side continua sem confirmar pagamento.
- Webhook `payment_intent.succeeded` continua fonte de verdade financeira.
- Settlement real continua transacional.
- Falha de notificacao posterior continua sem desfazer settlement.
- Ausencia de destinatarios admin continua gerando `skipped`, nao envio implicito.
- `ops:*` continuam reportando apenas presenca/ausencia e sem imprimir secrets.
- Importacao staging continua restrita a staging/dev remoto, sem producao e sem `DATABASE_URL` impresso.
- Laravel legado permanece somente leitura e fora de qualquer escrita.

## Modificadas

Nenhuma regra verde de dominio foi alterada ou removida. A Fase 17 adiciona readiness/smoke operacional ao redor dos fluxos existentes.
