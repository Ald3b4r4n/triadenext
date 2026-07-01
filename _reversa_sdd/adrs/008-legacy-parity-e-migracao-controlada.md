# ADR 008 - Paridade Legado x Next e Migracao Controlada

## Status

Aceita em 2026-07-01.

## Contexto

A Fase 13 comparou o Laravel legado com o Next atual para decidir se o sistema novo ja pode substituir o antigo. O Next cobre o fluxo comercial central, mas go-live real depende de dados reais migrados e reconciliados.

## Decisao

- Tratar o Laravel legado apenas como fonte read-only ate aprovacao humana explicita.
- Separar lacunas em bloqueador, decisao humana, pos-go-live e fora de escopo.
- Bloquear go-live real ate catalogo real, imagens, precos, estoque, cupons ativos e frete minimo passarem por dry-run/reconciliacao aprovados.
- Manter importacao real, migration real, conexao com banco real e deploy real fora desta fase.
- Usar Laravel intacto como base de rollback ate aceite formal pos-cutover.

## Consequencias

- O Next fica tecnicamente proximo de substituir o fluxo comercial, mas nao deve receber trafego real antes da reconciliacao de dados Must.
- Fiscal/Bling/NF-e, WhatsApp, SMS, frete externo e backoffice amplo continuam como decisao humana ou pos-go-live.
- Artefatos de paridade passam a guiar a proxima etapa de dry-run controlado.
