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

## Fase 5 — Carrinho

`carts` e `cart_items` passam a ser operacionais para carrinho de visitante e carrinho autenticado.

Delta local gerado:

- `carts.session_id`: apoio ao identificador anonimo de sessao/carrinho.
- `carts.expires_at`: preparo para expiracao de carrinho anonimo.
- `carts.converted_at`: marca conversao/merge do carrinho anonimo.
- `cart_items.unit_price_snapshot_cents`: snapshot inteiro em centavos para subtotal sem float.
- indices por `user_id/status`, `guest_token/status`, `session_id/status` e `cart_id`.
- unique por `cart_id/product_id` para impedir linhas duplicadas do mesmo produto.

Migration local: `drizzle/0002_tiny_enchantress.sql`.

Essa migration foi gerada localmente. Nao foi aplicada contra banco real nesta etapa.

## Fase 6 — Cupons no carrinho

Cupons passam a ser operacionais no carrinho, sem ativar checkout/frete/pedido.

Delta local gerado:

- `carts.applied_coupon_id`: FK nullable para `coupons.id`, com `ON DELETE SET NULL`.
- `carts_applied_coupon_id_idx`: índice de apoio para cupom aplicado.
- `coupons.minimum_subtotal_cents`: subtotal mínimo opcional em centavos.
- `coupons_code_unique`: código de cupom normalizado e único.
- `coupons_active_window_idx`: apoio para consulta por ativo/janela.

Migration local: `drizzle/0003_elite_titanium_man.sql`.

Essa migration foi gerada localmente. Nao foi aplicada contra banco real nesta etapa.

Mapeamento legado documentado:

- `percent` -> `percentage`;
- `fixed` -> `fixed_amount`.

`free_shipping` fica modelado e passa a aplicar beneficio de frete manual na Fase 7.

## Fase 7 — Frete manual

Frete manual passa a ser operacional no carrinho, sem checkout/pagamento/pedido.

Delta local gerado:

- `shipping_quotes`: cotacao por carrinho, CEP, hash dos itens, opcoes JSON e expiracao.
- `carts.shipping_postal_code`: CEP normalizado da cotacao selecionada.
- `carts.selected_shipping_quote_id`: referencia da cotacao selecionada.
- `carts.selected_shipping_option`: preparo JSON para detalhe da opcao selecionada.
- `carts.shipping_amount_cents`: valor de frete em centavos.
- `shipping_rules.uf`, `postal_code_start`, `postal_code_end`, `price_cents` e `priority`.

Migration local: `drizzle/0004_mute_ghost_rider.sql`.

Essa migration foi gerada localmente. Nao foi aplicada contra banco real nesta etapa.

## Fase 8 — Pedido pendente

Checkout pendente amplia `orders` e `order_items` para snapshots historicos.

Delta local gerado:

- `orders.cart_id`: vinculo unico com carrinho convertido para idempotencia.
- `orders.subtotal_cents`, `shipping_total_cents`, `discount_total_cents`, `grand_total_cents`.
- `orders.coupon_snapshot`: snapshot do cupom sem consumir `usedCount`.
- `order_items.slug_snapshot`, `image_snapshot`, `unit_price_cents`, `line_total_cents`.
- indices por `orders.user_id`, `orders.status/expires_at`, `orders.cart_id` unico e
  `order_items.order_id`.

Migration local: `drizzle/0005_glossy_talisman.sql`.

Essa migration foi gerada localmente. Nao foi aplicada contra banco real nesta etapa.

## Fase 9 — Idempotencia de pagamentos

`payment_intents` e `payment_events` passam a sustentar o fluxo Stripe real/mock:

- unique em `payment_intents.provider_reference`;
- indice por `payment_intents.order_id/status`;
- unique em `payment_events.event_id`;
- indices por `payment_events.payment_intent_id` e `payment_events.order_id`.

Migration local: `drizzle/0006_soft_mole_man.sql`.

Essa migration foi gerada localmente e nao foi aplicada contra banco real.

## Fase 10 - Outbox de notificacoes

`notification_deliveries` registra e-mails transacionais pos-pagamento com:

- tipos `customer_order_paid` e `admin_order_paid`;
- estados `pending`, `sending`, `sent`, `mocked`, `failed` e `skipped`;
- chave unica de idempotencia;
- referencias a pedido e usuario opcional;
- provider, tentativa, timestamps e erro sanitizado;
- indices por pedido, status, evento de pagamento e criacao.

Migration local: `drizzle/0007_outstanding_midnight.sql`.

Essa migration foi apenas gerada e revisada. Nao foi aplicada contra banco real.
