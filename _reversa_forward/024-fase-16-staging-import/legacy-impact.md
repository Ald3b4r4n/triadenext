# Legacy Impact - Fase 16 Approved Staging Import

> Data: `2026-07-03`
> Feature: `024-fase-16-staging-import`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| --- | --- | --- | --- | --- |
| `src/features/staging-import/*` | Operational Readiness / Database / Legacy Parity Readiness | componente-novo | MEDIUM | Adiciona camada operacional staging-only para preflight, bloqueio de producao, upsert seguro, reset protegido, relatorios e smoke sem alterar regras comerciais. |
| `scripts/ops/import-staging.mjs` | scripts/ops | delta-de-contrato-externo | MEDIUM | Expoe `pnpm ops:import-staging` como wrapper seguro; nao executa automaticamente producao, deploy ou migration. |
| `scripts/ops/check-staging-import-smoke.mjs` | scripts/ops | delta-de-contrato-externo | LOW | Adiciona check operacional de smoke remoto nao produtivo, com `pending-input` quando URL ausente. |
| `docs/operations/staging-import*.md` | docs/operations | componente-novo | LOW | Documenta runbook, aprovacao humana e rollback da importacao staging. |
| `src/tests/unit/staging-import-*.test.ts` | Testabilidade operacional | componente-novo | LOW | Cobre guards, preflight, pending-input, dry-run no-go, upsert em memoria e relatorios sem banco real. |
| `src/tests/e2e/staging-import-smoke.spec.ts` | Smoke pos-importacao | componente-novo | LOW | Adiciona smoke remoto pendente por padrao, executado apenas com URL nao produtiva aprovada. |
| `package.json` | scripts operacionais | delta-de-contrato-externo | LOW | Registra scripts `ops:import-staging` e `ops:check-staging-import-smoke`. |
| `_reversa_forward/024-fase-16-staging-import/*` | Reversa Forward | delta-de-contrato-externo | LOW | Atualiza actions, progress, onboarding, interfaces e auditoria da feature. |

## Diff conceitual por componente

### Operational Readiness / staging-import

A Fase 16 cria uma camada operacional nova sobre o dry-run da Fase 15. Ela valida alvo `staging`, `preview` ou `remote-dev`, bloqueia qualquer sinal de producao antes de conexao, trata entrada ausente como `pending-input`, exige dry-run `go` ou aprovacao sem bloqueio critico, e so permite escrita com backup/snapshot e aprovacao humana.

### Database / Drizzle staging

Foi adicionado um adaptador Drizzle para `STAGING_DATABASE_URL`, separado de `DATABASE_URL`, com upsert por chaves naturais aprovadas. A conexao so e aberta depois de preflight `planned`, e a string de conexao nunca e retornada em logs ou relatorios.

### scripts/ops

Dois wrappers foram adicionados: importacao staging e check de smoke staging. Ambos sao seguros por padrao e nao fazem deploy, migration, envio real, pagamento real ou toque no Laravel legado.

### Docs operacionais

Runbook, checklist humano e rollback foram adicionados para permitir execucao assistida por humano em ambiente remoto nao produtivo.

## Preservadas

- 🟢 Laravel legado continua somente leitura e nao foi alterado.
- 🟢 Producao, go-live, dominio real, deploy final e migration em producao seguem fora do escopo.
- 🟢 `DATABASE_URL`, tokens e secrets nao sao impressos em comandos, relatorios ou testes.
- 🟢 Ausencia de arquivos aprovados gera `pending-input`, sem inventar dados reais.
- 🟢 Dry-run `no-go` ou bloqueio critico impede escrita staging.
- 🟢 Reset/limpeza exige snapshot/backup, flag explicita, aprovacao humana e ambiente nao produtivo.
- 🟢 Relatorios brutos com dados reais permanecem fora do Git.
- 🟢 Bling, NF-e, rotinas fiscais, WhatsApp e SMS permanecem fora do escopo.

## Modificadas

Nenhuma regra verde do legado foi removida ou alterada. A fase adiciona guardrails operacionais novos para staging/dev remoto.
