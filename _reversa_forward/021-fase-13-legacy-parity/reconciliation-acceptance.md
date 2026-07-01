# Reconciliation Acceptance

## Criterios por tipo

| Tipo | Entidades | Criterio minimo |
|------|-----------|-----------------|
| Contagem | categorias, produtos, imagens, cupons, frete, pedidos | Contagem bate ou divergencia tem justificativa aprovada |
| Chave comercial | SKU, slug, codigo de cupom, numero de pedido | Sem duplicidade e sem ausencia em itens Must |
| Valor financeiro | preco, subtotal, desconto, frete, total | Comparar em centavos; divergencia nao justificada bloqueia |
| Status | produto, cupom, pedido, pagamento | Todo status legado relevante tem mapping ou decisao humana |
| Amostra mascarada | cliente, endereco, pedido | Sem dado pessoal cru em relatorio versionado |
| Asset | imagens | Produto possui imagem esperada ou fallback aprovado |

## Divergencia zero obrigatoria

- SKU/slug de produtos publicados que entram no go-live.
- Preco em centavos de produtos vendidos.
- Cupom ativo no go-live.
- Total financeiro de pedido em smoke controlado.
- Status de pedido/pagamento usado no fluxo de venda.

## Divergencia aceitavel com justificativa

- Produtos inativos/rascunho nao migrados para go-live.
- Pedidos historicos deixados para fase posterior.
- Imagens antigas sem uso comercial, desde que produto tenha capa/fallback aprovado.
- Relatorios, analytics e fiscal se aceitos como pos-go-live/out-of-scope.
