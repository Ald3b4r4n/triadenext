# Database

O schema inicial esta em `src/db/schema.ts` e foi modelado a partir do `database-plan.md` do Reversa.

Tabelas iniciais:

- `users`, `customer_profiles`, `addresses`
- `categories`, `products`, `product_images`, `product_categories`
- `carts`, `cart_items`
- `coupons`, `shipping_rules`
- `orders`, `order_items`, `order_events`
- `payment_intents`, `payment_events`
- `fiscal_documents`, `admin_notifications`

Migrations nao devem ser executadas contra banco real nesta etapa.

## Fase 1 — Catalogo

As tabelas de catalogo preparadas para a Fase 1 sao:

- `categories`: `id`, `name`, `slug`, `description`, `parentId`, `sortOrder`, `isActive`, timestamps.
- `products`: campos publicos e administrativos de catalogo, incluindo `priceCents`,
  `compareAtPriceCents`, `costPriceCents`, `stockQuantity`, `status`, `publishedAt`,
  `seoTitle` e `seoDescription`.
- `product_images`: metadata de Blob, sem binario no banco, com `isCover` para capa.
- `product_categories`: relacao N:N entre produtos e categorias.

Decisoes:

- `status` valido nesta fase: `draft`, `published`, `inactive`.
- `inactive` nao e publico e fica documentado como inativo/arquivado pendente de validacao humana.
- Nenhuma migration foi aplicada contra banco real.
- Repository Drizzle real ainda nao consulta o banco; sem `DATABASE_URL`, os services usam fixtures
  temporarias em `src/features/products/dev/fixtures.ts`.
