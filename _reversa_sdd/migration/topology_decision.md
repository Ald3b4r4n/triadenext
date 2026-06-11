# Topology Decision

## Decisão aplicada

Topologia alvo: **moderna transformacional**, derivada da decisão humana pela opção 1 do Paradigm Advisor.

## Legado

- Monólito Laravel server-rendered.
- Admin, storefront e operações no mesmo runtime.
- Banco relacional como centro.
- Integrações externas chamadas pelo backend Laravel.

## Alvo

- Aplicação Next.js App Router em fatias por domínio.
- UI pública, customer e admin no mesmo projeto, com guards claros.
- Banco Postgres/Drizzle como fonte relacional.
- Adapters externos isolados por contrato.
- Eventos/outbox para efeitos colaterais pós-transação.

## Justificativa

A decisão transformacional permite abandonar a topologia MVC/Active Record do legado. A preservação fica nos contratos de domínio, nas regras e nos dados observáveis, não na forma dos controllers e models Laravel.

## Limite

Esta topologia ainda deve ser auditada antes de features críticas como fiscal, estoque real e cutover.
