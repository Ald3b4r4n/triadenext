# Controlled Migration Readiness

## Prontidao documental

| Area | Status | Evidencia |
|------|--------|-----------|
| Entidades Must | Pronto para dry-run | `legacy-data-inventory.md` |
| Catalogo | Bloqueador ate reconciliar | `legacy-data-inventory-catalog.md` |
| Operacional/historico | Decisao humana | `legacy-data-inventory-operational.md` |
| Imagens | Bloqueador se sem capa/fallback | `legacy-image-inventory.md` |
| Formato intermediario | Definido | `controlled-migration-plan.md` |
| Gates de seguranca | Definidos | `dry-run-execution-model.md` |
| Reconciliacao | Definida | `dry-run-reconciliation.md` |

## Sequencia segura futura

1. Humano aprova fonte/export.
2. Export e sanitizacao fora do Git.
3. Validacao de formato intermediario.
4. Dry-run em ambiente isolado.
5. Reconciliacao por entidade.
6. Relatorio de divergencias.
7. Decisao go/no-go.
8. Nova aprovacao para import real.

## Nao pronto para import real

Esta fase nao executou nem autorizou:

- conexao com banco legado;
- import de dados reais;
- migration real;
- upload real para Blob;
- deploy/cutover.

## Recomendacao

Avancar para dry-run controlado somente depois de aprovacao humana explicita e definicao do conjunto de dados do dia zero.
