# ADR 011 - Importacao staging controlada antes de go-live

Data: 2026-07-03

## Status

Aceito.

## Contexto

A Fase 15 deixou o dry-run local preparado para `data/dry-run/input/primeira-execucao/`, mas a substituicao do Laravel ainda depende de validar dados reais em ambiente remoto controlado. A Fase 16 move a migracao para staging/dev remoto sem permitir producao, deploy final ou migration real em producao.

## Decisao

Adicionar uma etapa operacional de importacao staging controlada:

- alvo permitido: staging/dev remoto, preferencialmente Neon dev/staging separado;
- alvo proibido: producao, dominio real e go-live;
- execucao real depende de arquivos aprovados, dry-run `go` ou sem bloqueio critico, `STAGING_DATABASE_URL` fora do Git, aprovacao humana e backup/snapshot quando aplicavel;
- modo padrao: upsert seguro;
- reset/limpeza: somente com backup confirmado, flag explicita, aprovacao humana e ambiente nao produtivo;
- logs e relatorios nao devem imprimir `DATABASE_URL`, tokens, secrets ou dados sensiveis crus.

## Consequencias

- `pending-input` segue sendo estado seguro quando faltam arquivos aprovados.
- A Fase 16 pode preparar e validar scripts sem conectar producao.
- Smoke pos-importacao pode ficar skipped localmente quando `STAGING_IMPORT_SMOKE_URL` nao existe.
- Go-live continua fase posterior e exige aprovacao humana separada.

## Guardrails

- Nao alterar Laravel legado.
- Nao copiar `.env`.
- Nao expor secrets.
- Nao conectar producao.
- Nao rodar migration real em producao.
- Nao fazer deploy.
- Nao apagar dados sem backup/snapshot, flag explicita e aprovacao humana.
