# Regression Watch - Fase 16 Approved Staging Import

> Feature: `024-fase-16-staging-import`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
| --- | --- | --- | --- | --- |
| - | - | Nenhuma regra verde foi modificada nesta rodada. | - | - |

## Histórico de re-extrações

- 2026-07-03: re-extracao_pos_fase_16 registrou `src/features/staging-import`, preflight staging/dev remoto, bloqueio de producao, `pending-input`, upsert seguro, reset protegido, relatorios e smoke pos-importacao. Watch principal segue sem regressao funcional; regras de pagamento, estoque, cupons, frete, pedidos, notificacoes e checkout permanecem intactas.

## Arquivadas

Vazio.

## Observações

- A Fase 16 adiciona guardrails de staging/dev remoto, mas nao muda regras de pagamento, estoque, cupons, frete, pedidos, notificacoes ou checkout.
- O smoke remoto fica pendente quando `STAGING_IMPORT_SMOKE_URL` nao existe.
- A importacao real em producao, deploy final e migration em producao continuam proibidos.
