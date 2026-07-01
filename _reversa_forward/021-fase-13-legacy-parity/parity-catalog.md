# Parity: Catalogo, Produtos, Categorias, Imagens, Precos e Estoque

## Resumo

O Next possui schema, admin e storefront para catalogo, mas ainda nao substitui o Laravel em producao enquanto os dados reais de produtos, categorias, imagens, precos e estoque nao forem migrados e reconciliados.

## Matriz

| Item | Laravel legado | Next atual | Status | Classificacao | Evidencia |
|------|----------------|------------|--------|---------------|-----------|
| Categorias | `create_catalog_tables`, admin categories | `categories`, `product_categories`, `/admin/categorias` | `parcial` | bloqueador ate migrar dados reais | Schema e admin existem; dados reais nao reconciliados |
| Produtos | catalog actions, admin products, migrations | `products`, `/produtos`, `/admin/produtos` | `parcial` | bloqueador ate migrar dados reais | Fluxo existe; catalogo real pendente |
| Imagens | `product_images`, `public/products`, `Imagens` | `product_images`, upload/Blob/fallback | `parcial` | bloqueador se capa/fallback ausente | 37 assets candidatos contados |
| Precos | pricing/admin/product fields | precos em decimal/centavos no schema | `parcial` | bloqueador financeiro | Precisa reconciliar em centavos |
| Estoque | inventory actions e ajustes | `stockQuantity`, decremento pos-pagamento | `parcial` | bloqueador para produtos vendidos | Estoque auditavel legado e mais amplo |
| Export PDF/CSV | admin exports | nao detectado equivalente completo | `ausente` | pos-go-live | Nao impede venda se operador aceitar workaround |

## Bloqueadores de catalogo

- Migracao/reconciliacao de produtos publicados com SKU, slug, preco em centavos, status, estoque e categoria.
- Correspondencia produto-imagem com capa ou fallback aprovado.
- Validacao de estoque inicial para produtos vendaveis.

## Nao bloqueadores provaveis

- Export PDF/CSV de produtos.
- Auditoria completa de estoque e ajustes administrativos avancados.
- Pricing dashboard legado, se preco final ja estiver correto nos produtos.
