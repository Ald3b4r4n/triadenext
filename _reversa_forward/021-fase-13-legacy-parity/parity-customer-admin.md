# Parity: Clientes, Auth e Admin

## Resumo

Auth e admin operacional basico existem no Next. O Laravel legado tem backoffice mais amplo: clientes, usuarios admin, relatorios, analytics, fiscal, OS, alertas, Bling, metas e exportacoes. Para go-live inicial, a decisao precisa separar operacao minima de backoffice desejavel.

## Customer

| Item | Laravel legado | Next atual | Status | Classificacao |
|------|----------------|------------|--------|---------------|
| Login/cadastro | Laravel auth | Better Auth | `substituido` | nao bloqueador |
| Minha conta | dashboard, perfil, senha | `/minha-conta` | `parcial` | decisao humana |
| Enderecos | CRUD completo | `/enderecos` | `parcial` | decisao humana conforme uso |
| Pedidos | historico e detalhe | `/pedidos`, pedido/pagamento | `substituido` para novo fluxo | historico legado e decisao humana |
| Documentos fiscais | lista/download | ausente funcional completo | `ausente` | fora de escopo/decisao humana |

## Admin

| Item | Laravel legado | Next atual | Status | Classificacao |
|------|----------------|------------|--------|---------------|
| Dashboard | dashboard/metrics | `/admin` | `parcial` | nao bloqueador se operador aceitar |
| Produtos/categorias/imagens | CRUD amplo | produtos/categorias/admin imagens | `parcial` | depende de dados reais |
| Cupons | CRUD/toggle | admin cupons | `substituido` | nao bloqueador se cupons migrados |
| Frete | providers/configs | frete manual admin | `parcial` | decisao humana |
| Pedidos | list/show/status/cancel/notes/OS/shipping | admin pedidos basico | `parcial` | decisao humana |
| Clientes | list/show/export | nao detectado como admin completo | `ausente` | pos-go-live/decisao humana |
| Usuarios admin | CRUD/promote | policies/roles, sem CRUD amplo detectado | `parcial` | decisao humana |
| Fiscal/Bling | funcional/documentado | schema/roadmap/documentos fiscais parcial | `ausente` | fora de escopo/decisao humana |
| Relatorios/analytics | pages/actions/exports | ausente completo | `ausente` | pos-go-live |
| Alertas/OS/metas/settings | legado amplo | parcial/ausente | `ausente` | pos-go-live |

## Bloqueadores potenciais

- Falta de operacao admin minima acordada para pedidos no dia zero.
- Falta de migracao de clientes/enderecos se login de clientes existentes for exigido no corte.
- Fiscal/documentos se a operacao exigir NF-e no mesmo dia do go-live.

## Conclusao

Cliente/admin nao impedem necessariamente go-live comercial, mas exigem decisao humana sobre o que e minimo para o dia zero.
