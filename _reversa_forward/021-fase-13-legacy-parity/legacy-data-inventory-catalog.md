# Legacy Data Inventory: Catalogo

## Entidades Must

| Entidade | Origem Laravel candidata | Destino Next | Chave | Risco |
|----------|--------------------------|--------------|-------|-------|
| Categorias | `create_catalog_tables`, admin categories | `categories`, `product_categories` | slug/nome | Medio |
| Produtos | catalog migrations/actions/admin products | `products` | SKU e slug | Alto |
| Imagens | `product_images`, `public/products`, `Imagens` | `product_images`, Blob/fallback | produto + ordem/capa | Alto |
| Precos | product/pricing fields | `products.priceCents` e campos decimais | SKU + preco | Alto |
| Estoque | inventory actions/tables | `products.stockQuantity` | SKU + quantidade | Alto |
| Cupons ativos | coupons tables/admin | `coupons` | codigo | Alto se houver campanha ativa |
| Frete/config | shipping settings/providers | `shipping_rules` | UF/faixa CEP | Alto para checkout |

## Transformacoes esperadas

- Slugs devem ser normalizados e unicos.
- Precos devem ser reconciliados em centavos.
- Produtos publicados precisam status publico, estoque positivo e `publishedAt` coerente.
- Categorias devem preservar hierarquia/tipo quando relevante.
- Imagens devem apontar para arquivo existente ou fallback aprovado.
- Cupons devem preservar tipo, valor, vigencia, limites e status.
- Frete manual deve cobrir CEP/UF usado no smoke.

## Validacao minima

| Entidade | Validacao |
|----------|-----------|
| Categorias | contagem, slug unico, amostra por nome |
| Produtos | contagem, SKU, slug, status, preco, estoque |
| Imagens | contagem por produto, capa, arquivo existente |
| Cupons | codigo uppercase, tipo, valor e vigencia |
| Frete | cobertura UF/CEP, preco e prazo |

## Bloqueio

Catalogo real e imagens sao bloqueadores de go-live ate passarem por dry-run/reconciliacao aprovados.
