# Data Dictionary — triade-essenza-next

> Data: 2026-06-08
> Escopo: catalogo, persistencia, auth e carrinho da Fase 5
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Enums relevantes

| Enum | Valores | Regra |
|---|---|---|
| `user_role` | `customer`, `admin`, `manager` | `admin` e `manager` sao equivalentes no MVP; cadastro publico cria `customer`. |
| `product_status` | `draft`, `published`, `inactive` | Apenas `published` com data valida e estoque positivo e publico. |
| `cart_status` | `active`, `converted`, `abandoned`, `expired` | `active` e carrinho atual; `converted` usado no merge. |

## `users`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `name` | text | Obrigatorio para Better Auth/cadastro. |
| `email` | text | Obrigatorio e unico. |
| `email_verified` | boolean | Campo Better Auth; default `false`. |
| `image` | text nullable | Campo Better Auth para avatar/futuro OAuth. |
| `phone` | text nullable | Dado customer/admin futuro. |
| `password_hash` | text nullable | Campo legado/preparado; Better Auth usa `accounts.password`. |
| `role` | enum `user_role` | Default `customer`; valores `customer`, `admin`, `manager`. |
| `must_change_password` | boolean | Controle operacional futuro. |
| `last_login_at` | timestamp nullable | Auditoria futura. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

Indices: email unico e indice por role.

## `sessions`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `expires_at` | timestamp tz | Expiracao da sessao. |
| `token` | text | Token unico. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |
| `ip_address` | text nullable | Metadata de sessao. |
| `user_agent` | text nullable | Metadata de sessao. |
| `user_id` | uuid | FK para `users`; cascade delete. |

Indices: token unico e indice por `user_id`.

## `accounts`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `account_id` | text | Identificador do provedor/conta. |
| `provider_id` | text | Provider Better Auth; e-mail/senha nesta fase. |
| `user_id` | uuid | FK para `users`; cascade delete. |
| `access_token`, `refresh_token`, `id_token` | text nullable | Preparados para providers futuros; nao ativam OAuth nesta fase. |
| `access_token_expires_at`, `refresh_token_expires_at` | timestamp nullable | Expiracao de tokens futuros. |
| `scope` | text nullable | Escopo de provider futuro. |
| `password` | text nullable | Hash/credencial gerenciada pelo provider. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

Invariante: par `provider_id` + `account_id` e unico.

## `verifications`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `identifier` | text | Identificador do fluxo de verificacao. |
| `value` | text | Valor/token gerenciado pelo provider. |
| `expires_at` | timestamp tz | Expiracao. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

Indice por `identifier`. Magic link nao esta ativado nesta fase.

## `customer_profiles`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `user_id` | uuid | FK para `users`; cascade delete; base de ownership customer. |
| `cpf`, `document_type`, `birth_date` | dados nullable | Preparados para conta customer futura. |
| `privacy_policy_accepted_at`, `marketing_opt_in_at` | timestamp nullable | Consentimentos futuros. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

## `addresses`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `user_id` | uuid | FK para `users`; base de `requireOwner` em feature futura. |
| `recipient`, `postal_code`, `street`, `number`, `city`, `state`, `country` | endereco | Estrutura preparada; CRUD real fora da Fase 4. |
| `is_default_shipping` | boolean | Endereco padrao futuro. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

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
| `bling_*` | text/timestamp nullable | Campos preparados; fiscal/comercial fora da Fase 4. |
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

## `carts`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `user_id` | uuid nullable | Dono do carrinho autenticado; FK para `users`. |
| `guest_token` | text nullable | Identificador opaco do carrinho anonimo, associado ao cookie `guestCartToken`. |
| `session_id` | text nullable | Apoio ao identificador anonimo de sessao/carrinho. |
| `status` | enum `cart_status` | `active`, `converted`, `abandoned`, `expired`. |
| `currency` | text | Default `BRL`. |
| `expires_at` | timestamp tz nullable | Preparo para expiracao de carrinho anonimo. |
| `converted_at` | timestamp tz nullable | Marca conversao/merge do carrinho anonimo. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

Indices: `user_id/status`, `guest_token/status`, `session_id/status`.

## `cart_items`

| Campo | Tipo conceitual | Regra |
|---|---|---|
| `id` | uuid | PK. |
| `cart_id` | uuid | FK para `carts`; cascade delete. |
| `product_id` | uuid | FK para `products`; restrict delete. |
| `product_name_snapshot` | text | Nome no momento da adicao/atualizacao validada. |
| `unit_price_snapshot` | numeric | Decimal operacional do snapshot. |
| `unit_price_snapshot_cents` | integer | Fonte de subtotal em centavos. |
| `quantity` | integer | Minimo 1; maximo `stockQuantity` validado no service. |
| `created_at`, `updated_at` | timestamp tz | Auditoria tecnica. |

Invariante: unique por `cart_id/product_id`, evitando duas linhas equivalentes do mesmo produto.

## Tabelas fora do foco funcional atual

O schema tambem modela `coupons`, `shipping_rules`, `orders`, `order_items`, `order_events`,
`payment_intents`, `payment_events`, `fiscal_documents` e `admin_notifications`. Essas tabelas
estao preparadas, mas Fase 5 nao ativou checkout, pagamento, frete, cupom, pedido, reserva/baixa de
estoque ou fiscal real.
