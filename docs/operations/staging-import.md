# Importacao staging/dev remoto

Este runbook prepara a Fase 16: importacao controlada em ambiente remoto nao produtivo. Producao, go-live, dominio real, deploy final e migration em producao ficam fora desta fase.

## Precondicoes

- Ambiente alvo: `staging`, `preview` ou `remote-dev`.
- Preferencia: Neon dev/staging separado.
- Arquivos aprovados em `data/dry-run/input/primeira-execucao/`.
- Dry-run anterior com resultado `go` ou sem bloqueio critico aprovado.
- `STAGING_DATABASE_URL` presente somente no ambiente operacional aprovado.
- Snapshot/backup declarado antes de qualquer escrita.
- Aprovacao humana registrada para qualquer escrita.

## Comando seguro

Check sem escrita:

```bash
pnpm ops:import-staging --target staging --mode check
```

Upsert controlado:

```bash
pnpm ops:import-staging --target staging --mode upsert --confirm-staging confirmado --backup-confirmed --human-approval APROVACAO-SANITIZADA
```

Reset protegido:

```bash
pnpm ops:import-staging --target staging --mode reset-and-upsert --confirm-staging confirmado --backup-confirmed --allow-reset --human-approval APROVACAO-SANITIZADA
```

## Proibicoes

- Nao usar producao.
- Nao usar dominio real.
- Nao imprimir `DATABASE_URL`.
- Nao imprimir tokens ou secrets.
- Nao rodar migration automaticamente.
- Nao fazer deploy.
- Nao tocar no Laravel legado.
- Nao apagar dados sem snapshot, flag e aprovacao humana.

## Comportamento esperado

- Sem arquivos aprovados: `pending-input`, sem conexao e sem escrita.
- Sem ambiente remoto aprovado: escrita bloqueada, sem imprimir valor de env.
- Dry-run `no-go`: importacao bloqueada.
- Upsert: escreve somente chaves naturais aprovadas.
- Reset: limpa apenas escopo aprovado e somente com guardrails reforcados.

## Relatorios

Os relatorios saem em `data/dry-run/output/staging-import-<status>/`:

- `pre-import-report.json`
- `pre-import-report.md`
- `post-import-report.json`
- `post-import-report.md`
- `divergence-report.json`
- `human-approval-summary.md`
- `rollback-report.md`

Relatorios brutos com dados reais permanecem locais e ignorados pelo Git.
