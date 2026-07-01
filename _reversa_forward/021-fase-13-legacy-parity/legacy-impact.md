# Legacy Impact: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `_reversa_forward/021-fase-13-legacy-parity/*.md` | Operational Readiness | regra-nova | LOW | Artefatos documentais de paridade, dry-run e go-live futuro |
| `_reversa_forward/021-fase-13-legacy-parity/progress.jsonl` | Operational Readiness | componente-novo | LOW | Rastro append-only da execucao Reversa |
| `.reversa/active-requirements.json` | Reversa Workflow | regra-alterada | LOW | Avanca estado da feature para execucao |

## Diff conceitual por componente

### Operational Readiness

A Fase 13 adiciona uma camada documental de decisao de substituicao: matriz Laravel x Next, gap register, inventario de dados, plano de dry-run, reconciliacao, checklist go-live e rollback. Nenhum codigo funcional foi alterado.

### Laravel legado

O Laravel foi usado apenas como fonte read-only de evidencia. Nenhum arquivo, banco, storage, cache, rota, migration ou config do legado foi modificado.

### Domain Modules

Nao houve alteracao de regra de negocio em products, cart, coupons, shipping, checkout, orders, payments ou notifications.

## Preservadas

- Produto publico exige `published`, `publishedAt <= now` e estoque positivo.
- Carrinho convertido permanece terminal para mutacoes.
- Cupom vigente continua validado por status, janela, limite e valor.
- Frete atual continua manual por UF/faixa de CEP.
- Checkout continua exigindo customer autenticado.
- Pedido pendente continua com snapshots server-side e expiracao.
- Stripe webhook continua fonte de verdade financeira.
- Settlement continua transacional antes de notificacao.
- Readiness operacional continua sem deploy, migration real ou banco real automatico.

## Modificadas

Nenhuma regra verde do dominio foi modificada ou removida.
