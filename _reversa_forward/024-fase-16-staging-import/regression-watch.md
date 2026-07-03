# Regression Watch - Fase 16 Approved Staging Import

> Feature: `024-fase-16-staging-import`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
| --- | --- | --- | --- | --- |
| - | - | Nenhuma regra verde foi modificada nesta rodada. | - | - |

## Histórico de re-extrações

Vazio. Deve ser preenchido pelo agente reverso quando `/reversa` for executado novamente.

## Arquivadas

Vazio.

## Observações

- A Fase 16 adiciona guardrails de staging/dev remoto, mas nao muda regras de pagamento, estoque, cupons, frete, pedidos, notificacoes ou checkout.
- O smoke remoto fica pendente quando `STAGING_IMPORT_SMOKE_URL` nao existe.
- A importacao real em producao, deploy final e migration em producao continuam proibidos.
