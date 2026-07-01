# Legacy Gap Register

## Bloqueadores para go-live real

| ID | Lacuna | Impacto | Evidencia | Proxima acao |
|----|--------|---------|-----------|--------------|
| G-B01 | Catalogo real nao migrado/reconciliado | Sem produtos/categorias/precos/estoque reais, o Next nao substitui venda em producao | Laravel migrations/assets; Next schema/admin | Dry-run aprovado e reconciliacao |
| G-B02 | Imagens reais sem correspondencia produto-imagem validada | Catalogo pode ficar invendavel ou com capa incorreta | `public/products=18`, `Imagens=19` | Inventario e fallback/capa aprovados |
| G-B03 | Dry-run/reconciliacao real ainda nao executados | Nao ha prova de integridade de dados para cutover | Fase 13 prepara, nao importa | Executar etapa futura com aprovacao |

## Decisao humana antes do cutover

| ID | Lacuna | Opcao A | Opcao B |
|----|--------|---------|---------|
| G-D01 | URLs legadas `/catalogo` e `/perfumes/{slug}` | Criar redirects antes do cutover | Aceitar mudanca e comunicar |
| G-D02 | Frete externo/rastreamento | Aceitar frete manual no dia zero | Implementar provider real antes |
| G-D03 | Pedidos historicos | Migrar historico necessario | Manter consulta no legado por periodo |
| G-D04 | Clientes/endereco existentes | Migrar clientes existentes | Comecar com novos cadastros |
| G-D05 | Fiscal/Bling/NF-e | Fora do dia zero | Nova fase antes de go-live se obrigatorio |
| G-D06 | Pagina de privacidade/conteudo institucional | Criar antes do corte | Aceitar temporariamente se legal aprovar |

## Pos-go-live provavel

- Relatorios e analytics completos.
- Exportacoes PDF/CSV amplas.
- OS, alertas internos, metas mensais e settings operacionais.
- CRUD amplo de usuarios admin.
- Auditoria completa de estoque e backoffice legado 1:1.

## Fora de escopo confirmado

- Bling funcional, NF-e completa, rotinas fiscais, WhatsApp, SMS e redesign premium.
