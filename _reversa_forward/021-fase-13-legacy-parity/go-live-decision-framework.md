# Go-live Decision Framework

## Decisao possivel apos a Fase 13

| Resultado | Condicao | Acao |
|-----------|----------|------|
| `go` futuro | Todos os Must reconciliados, smoke passa, rollback aprovado e decisoes humanas fechadas | Planejar deploy/cutover em fase propria |
| `go com restricoes` futuro | Fluxo comercial passa, mas itens pos-go-live aceitos explicitamente | Registrar aceite e backlog |
| `no-go` | Catalogo real, imagens, financeiro, auth/admin, checkout ou rollback falham | Corrigir antes de deploy/cutover |
| `decisao humana` | Fiscal, frete externo, historico ou backoffice nao tem consenso | Pausar go-live ate decisao |

## Entrada obrigatoria para decisao

- `legacy-parity-matrix.md`
- `legacy-gap-register.md`
- `legacy-data-inventory.md`
- `controlled-migration-readiness.md`
- `dry-run-reconciliation.md`
- `final-substitution-checklist.md`
- `rollback-plan.md`

## Bloqueadores atuais

| Bloqueador | Por que bloqueia |
|------------|------------------|
| Catalogo real nao migrado/reconciliado | Sem dados reais, o Next ainda nao substitui producao |
| Imagens/capa/fallback nao validados | Catalogo pode ficar invendavel |
| Dry-run/reconciliacao aprovados ainda nao executados | Falta prova de integridade para cutover |

## Decisoes humanas abertas

- Aceitar frete manual ou exigir provider externo no dia zero.
- Migrar clientes e pedidos historicos ou manter consulta temporaria no legado.
- Exigir fiscal/Bling/NF-e antes do go-live ou deixar fora do dia zero.
- Criar redirects/privacidade antes do corte.

## Regra final

Sem reconciliacao de dados Must e smoke de compra aprovado, a recomendacao e `no-go` para substituicao real.
