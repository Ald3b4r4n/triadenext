# Data Dictionary — triade-essenza-next

> Data: 2026-06-08  
> Escopo: catalogo e persistencia da Fase 3  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## `categories`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `name` | text | Obrigatorio. |
| `slug` | text | Obrigatorio e unico. |
| `description` | text nullable | Descricao admin/publica. |
| `parent_id` | uuid nullable | Hierarquia futura. |
| `type` | text nullable | Campo de classificacao ainda nao exposto no dominio. |
| `is_active` | boolean | Categoria ativa/inativa. |
| `is_protected` | boolean | Protecao operacional futura. |
| `sort_order` | integer | Ordenacao. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

## `products`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `category_id` | uuid nullable | Categoria primaria opcional. |
| `name` | text | Obrigatorio. |
| `slug` | text | Obrigatorio e unico. |
| `sku` | text | Obrigatorio e unico. |
| `short_description`, `description` | text nullable | Conteudo de catalogo. |
| `brand`, `inspiration_name`, `gender`, `concentration` | text nullable | Atributos de perfumaria. |
| `volume_ml` | integer nullable | Volume. |
| `dimensions` | jsonb nullable | Dimensoes futuras. |
| `price` | numeric | Decimal operacional. |
| `price_cents` | integer | Fonte de calculo do dominio. |
| `compare_at_price`, `compare_at_price_cents` | numeric/integer nullable | Preco comparativo. |
| `cost_price_cents` | integer nullable | Custo admin. |
| `status` | enum | `draft`, `published`, `inactive`. |
| `stock_quantity` | integer | Deve ser > 0 para produto publico. |
| `low_stock_threshold` | integer | Alerta admin. |
| `is_featured` | boolean | Destaque. |
| `published_at` | timestamp nullable | Deve existir e ser <= agora para produto publico. |
| `seo_title`, `seo_description` | text nullable | SEO. |
| `bling_*` | text/timestamp nullable | Campos preparados; fiscal/comercial fora da Fase 3. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

## `product_categories`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `product_id` | uuid | FK para `products`; cascade delete. |
| `category_id` | uuid | FK para `categories`; cascade delete. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

Invariante: par produto/categoria e unico.

## `product_images`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `product_id` | uuid | FK para `products`; cascade delete. |
| `blob_url` | text | URL publica/Blob. |
| `pathname` | text | Caminho Blob. |
| `alt_text` | text nullable | Acessibilidade/SEO. |
| `sort_order` | integer | Ordenacao. |
| `is_cover` | boolean | Capa. |
| `width`, `height` | integer nullable | Dimensoes. |
| `size_bytes` | integer nullable | Tamanho. |
| `content_type` | text nullable | MIME type. |
| `created_at` | timestamp tz | Auditoria tecnica. |

Invariante: no maximo uma imagem de capa por produto via unique parcial.

## Tabelas fora do foco funcional atual

O schema tambem modela `users`, `customer_profiles`, `addresses`, `carts`, `cart_items`, `coupons`,
`shipping_rules`, `orders`, `order_items`, `order_events`, `payment_intents`, `payment_events`,
`fiscal_documents` e `admin_notifications`. Essas tabelas estao preparadas, mas Fase 3 nao ativou
checkout, pagamento, frete, cupom, pedido, fiscal ou auth real.
