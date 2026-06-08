# Database

O schema inicial esta em `src/db/schema.ts` e foi modelado a partir do `database-plan.md` do Reversa.

Tabelas iniciais:

- `users`, `sessions`, `accounts`, `verifications`, `customer_profiles`, `addresses`
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

## Fase 2 — Persistencia Preparada

`src/features/products/server/product-repository.ts` contem os contratos para:

- listar produtos;
- listar categorias;
- buscar produto por `id` ou `slug`;
- criar produto;
- atualizar produto;
- preparar relacao `product_categories`.

Quando `DATABASE_URL` existe, o repository possui caminho Drizzle para `products` e
`product_categories`. Quando `DATABASE_URL` nao existe, o repository usa fixtures e retorna
`dev_fallback` nas mutacoes, deixando claro que nao houve gravacao real.

Nenhuma migration foi executada contra banco real nesta fase.

## Fase 3 — Neon/Drizzle real

Fase 3 conecta o caminho real de catalogo a Neon/Drizzle quando `DATABASE_URL` existe, mantendo
fallback explicito quando ela esta ausente.

Atualizacoes:

- `categories.slug`, `products.slug` e `products.sku` possuem unique indexes.
- `products_public_catalog_idx` cobre `status`, `publishedAt` e `stockQuantity` para a regra
  publica: `published`, `publishedAt <= now` e estoque positivo.
- `product_categories` preserva unique N:N por produto/categoria.
- `product_images` possui ordenacao por produto e unique parcial para uma capa por produto.
- O dominio continua usando centavos (`priceCents`, `compareAtPriceCents`, `costPriceCents`);
  `price` decimal existe para compatibilidade operacional e relatorios, mas nao e a fonte de
  calculo da aplicacao.

Sem `DATABASE_URL`, `src/db/client.ts` exporta `db = null` e os services usam fixtures com aviso de
`dev_fallback`. Com `DATABASE_URL`, erros Drizzle nao viram fixtures.

## Fase 4 — Auth e policies

Tabela/contratos de auth adicionados ao schema:

- `users`: ganhou `email_verified` e `image`, preservando `role` da aplicacao.
- `sessions`: token, expiracao e referencia ao usuario.
- `accounts`: contas ligadas ao usuario para e-mail/senha e preparo futuro de OAuth.
- `verifications`: fluxo interno do provider.

Regras:

- `users.email` continua unico.
- `sessions.token` e unico.
- `sessions.user_id` tem indice para leitura por usuario/logout.
- `customer_profiles.user_id` e `addresses.user_id` continuam apontando para o usuario autenticado.
- Migrations para auth sao geradas localmente, mas nao aplicadas contra banco real sem validacao humana.
