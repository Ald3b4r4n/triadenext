# Staging smoke real / go-live readiness

Este runbook cobre a Fase 17. Ele prepara smoke real em staging/preview/dev remoto, mas nao autoriza producao, go-live, deploy final, migration em producao ou Stripe live mode.

## Precondicoes

- URL publica controlada em `STAGING_SMOKE_URL` ou via `--url`.
- Ambiente alvo nao produtivo: `staging`, `preview` ou `remote-dev`.
- Neon staging/dev separado, quando houver validacao de banco.
- `STAGING_DATABASE_URL` configurada fora do Git, sem imprimir valor.
- Stripe test mode e webhook test configurados fora do Git, quando o smoke de pagamento for executado.
- Arquivos aprovados em `data/dry-run/input/primeira-execucao/` apenas se o import staging smoke for usado.
- Aprovacao humana explicita para qualquer smoke remoto com rede.

## Comando seguro

Check local sem rede:

```bash
pnpm ops:check-staging-smoke
```

Smoke remoto aprovado:

```bash
pnpm ops:check-staging-smoke --target staging --url https://preview-aprovado.exemplo --allow-network --human-approval APROVACAO-SANITIZADA
```

Checklist de migration staging/dev, sem executar migration:

```bash
pnpm ops:check-staging-smoke --target staging --migration-approval APROVACAO-SANITIZADA --snapshot SNAPSHOT-SANITIZADO
```

## Status esperados

- `pending-config`: falta URL, env, webhook, aprovacao humana ou snapshot.
- `pending-input`: faltam arquivos aprovados para import staging smoke.
- `blocked`: sinal de producao, Stripe live mode ou secret em saida operacional.
- `failed`: smoke remoto executou e encontrou falha funcional.
- `passed`: checks executados sem bloqueadores.
- `skipped`: etapa opcional nao aplicavel ao contexto atual.

## Proibicoes

- Nao usar producao.
- Nao usar Stripe live mode.
- Nao imprimir `DATABASE_URL`.
- Nao imprimir tokens, chaves Stripe, Blob, Auth ou secrets.
- Nao rodar migration.
- Nao fazer deploy.
- Nao tocar no Laravel legado.
- Nao executar go-live definitivo.

## Relatorios

Os relatorios saem em `data/dry-run/output/staging-smoke-<status>/` e permanecem ignorados pelo Git:

- `staging-smoke-report.json`
- `staging-smoke-report.md`
- `go-live-checklist.md`

Relatorios reais nao devem conter dados pessoais crus, `DATABASE_URL`, chaves ou tokens.
