# Regression Watch - 025-fase-17-staging-smoke

## Watch Items

Nenhum watch item principal foi criado nesta rodada, pois nenhuma regra verde de dominio foi modificada ou removida.

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
| --- | --- | --- | --- | --- |

## Observações

- `pnpm ops:check-staging-smoke` deve continuar retornando `pending-config` sem URL/env/webhook e sem depender de credenciais reais.
- Ausencia de arquivos aprovados para import staging smoke deve continuar retornando `pending-input`.
- Qualquer sinal de producao ou Stripe live mode deve continuar bloqueando antes de requisicao externa.
- Relatorios em `data/dry-run/output/` devem continuar sem `DATABASE_URL`, tokens, chaves Stripe, Blob, Auth ou secrets.
- Smoke remoto deve continuar exigindo URL aprovada, `--allow-network` e aprovacao humana.
- Fase 17 nao deve executar deploy, migration, banco real, Stripe live, go-live definitivo ou alterar Laravel legado.

## Histórico de re-extrações

Vazio. A proxima re-extracao via `/reversa` deve preencher este historico.

## Arquivadas

Vazio.
