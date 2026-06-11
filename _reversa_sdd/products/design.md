# Products, Design Tecnico

> Spec executavel da unit `products`. Foca no COMO catalogo, vitrine publica e administracao de produtos sao construidos.

## Interface

### Rotas Publicas e Administrativas

| Rota | Componente | Entrada | Saida | Observacao |
|------|------------|---------|-------|------------|
| `/` | `src/app/(storefront)/page.tsx` | Nenhuma | `StorefrontHome` com ate 6 produtos publicos | Ordena destacados antes de cortar a vitrine. |
| `/produtos` | `src/app/(storefront)/produtos/page.tsx` | Nenhuma | `ProductGrid` com produtos publicos | Lista somente produtos filtrados no servidor. |
| `/produto/[slug]` | `ProdutoPage` | `slug` | Detalhe de produto publico ou `notFound()` | Inclui imagem, preco, SKU, estoque e CTA de carrinho. |
| `/admin/produtos` | Admin products page | Sessao admin-like | Tabela administrativa | Protegida por layout/admin policy. |
| `/admin/produtos/novo` | Admin product form | Sessao admin-like | Formulario de criacao | Mutacao passa por `createProductAction`. |
| `/admin/produtos/[id]/editar` | Admin product form | `id`, sessao admin-like | Formulario de edicao | Mutacao passa por `updateProductAction`. |

### Funcoes de Dominio

| Simbolo | Assinatura | Retorno | Observacao |
|---------|-----------|---------|------------|
| `isProductPublic` | `(product: Product, now = new Date())` | `boolean` | Exige `published`, `publishedAt <= now` e estoque positivo. |
| `isProductAvailableForPurchase` | `(product, now)` | `boolean` | Alias semantico da regra publica atual. |
| `normalizeProductSlug` | `(input: string)` | `string` | Usa normalizador base de slug. |
| `parsePriceToCents` | `(input)` | `number \| null` | Converte texto/numero de preco para centavos. |
| `productCanBeMarkedPublic` | `(input, now)` | `boolean` | Valida campos minimos quando status e `published`. |
| `sortProductImages` | `(images)` | `ProductImage[]` | Ordena por `sortOrder` e `createdAt`. |
| `selectCoverImage` | `(images)` | `ProductImage \| null` | Seleciona `isCover` ou primeira imagem ordenada. |
| `toPublicProduct` | `(product, now)` | `PublicProduct \| null` | Aplica filtro publico e anexa `coverImage`. |
| `filterPublicProducts` | `(products, now)` | `PublicProduct[]` | Converte lista interna em lista publica. |

### Services e Repository

| Simbolo | Retorno | Observacao |
|---------|---------|------------|
| `listPublicProducts` | `Promise<PublicProduct[]>` | Lista repository e aplica filtro publico. |
| `getPublicProductBySlug` | `Promise<PublicProduct \| null>` | Normaliza slug, busca produto e aplica filtro publico. |
| `listAdminProducts` | `Promise<Product[]>` | Lista todos os produtos para admin. |
| `listProductCategories` | `Promise<Category[]>` | Lista categorias ordenadas pelo repository. |
| `createAdminProduct` | `Promise<ProductMutationPersistenceResult>` | Wrapper para repository. |
| `updateAdminProduct` | `Promise<ProductMutationPersistenceResult>` | Wrapper para repository. |
| `createProductRepository` | `ProductRepository` | Escolhe Drizzle real ou fixtures conforme `db`. |

### Server Actions

| Simbolo | Entrada | Saida | Observacao |
|---------|---------|-------|------------|
| `createProductAction` | `FormData` | `ProductActionState` | Exige `requireAdminLike`, valida schema e cria produto. |
| `updateProductAction` | `id`, `FormData` | `ProductActionState` | Exige `requireAdminLike`, valida schema e atualiza produto. |

## Fluxo Principal: Vitrine Publica

1. Rota publica chama `listPublicProducts`.
2. Service chama `repository.listProducts`.
3. Repository usa Drizzle se `db !== null`, ou fixtures se `db === null`.
4. Service aplica `filterPublicProducts`.
5. `filterPublicProducts` chama `toPublicProduct` produto a produto.
6. `toPublicProduct` rejeita produto nao publico.
7. Produto aprovado recebe `images` ordenadas e `coverImage`.
8. `/produtos` renderiza `ProductGrid`.
9. `ProductGrid` renderiza estado vazio amigavel se lista estiver vazia.
10. `ProductCard` renderiza imagem, categoria, disponibilidade, nome, resumo, preco e link de detalhe.

## Fluxo Principal: Detalhe Publico

1. `ProdutoPage` recebe `params.slug`.
2. Chama `getPublicProductBySlug(slug)`.
3. Service normaliza slug com `normalizeProductSlug`.
4. Repository busca produto interno por slug.
5. Produto inexistente ou nao publico vira `null`.
6. Pagina chama `notFound()` se o resultado for `null`.
7. Produto publico renderiza imagem, categoria, nome, descricao curta, preco, SKU, volume, estoque `Disponivel`, CTA `AddToCartForm` e descricao longa.

## Fluxo Principal: Admin Create/Update

1. Server Action chama `requireAdminLike`.
2. Se policy nao for `allowed`, retorna `ProductActionState` com `status="error"` e `policyMessage`.
3. Action converte `FormData` com `productFormDataToObject`.
4. `productFormSchema` valida e transforma campos.
5. Slug vazio vira slug normalizado a partir do nome.
6. Precos textuais viram centavos.
7. Produto `published` passa por `productCanBeMarkedPublic`.
8. Service chama repository para criar/atualizar.
9. Repository Drizzle verifica `assertCanMutateRealData`.
10. Em runtime apto, produto e categorias sao gravados em transacao.
11. Em runtime bloqueado, retorna `blocked`.
12. Em fixture mode, retorna `dev_fallback`.
13. Action revalida `/admin/produtos`, `/produtos` e rota de edicao quando aplicavel.

## Fluxo Principal: Repository Drizzle

1. `createProductRepository` detecta `db`.
2. Drizzle `listProducts` busca produtos ordenados por nome.
3. `hydrateProducts` busca categorias e imagens em paralelo para os produtos retornados.
4. Categorias sao agrupadas por `productId`.
5. Imagens sao agrupadas por `productId` e ordenadas.
6. Rows de banco viram tipos de dominio por `toProduct`, `toCategory` e `toProductImage`.
7. `createProduct` insere produto e associa categorias em transacao.
8. `updateProduct` atualiza produto, remove associacoes antigas e reinsere categorias em transacao.
9. `saveProductImageMetadata` opcionalmente limpa capas anteriores e insere metadata nova.
10. `decrementStock` atualiza estoque com `WHERE stockQuantity >= quantity`.

## Fluxos Alternativos

- **Sem banco:** `createFixtureProductRepository` lista `devProducts`/`devCategories` e mutacoes retornam `dev_fallback`.
- **Produto nao publico:** `toPublicProduct` retorna `null`; listagem filtra e detalhe retorna `notFound`.
- **Produto sem imagem:** `coverImage` fica `null` e componente de imagem usa fallback visual.
- **Formulario invalido:** action retorna erros de campo e nao chama repository.
- **Mutacao bloqueada por runtime:** repository retorna `blocked` e action converte para `status="error"`.
- **Estoque insuficiente:** `decrementStock` retorna `false`.

## Dependencias

- `src/db/client.ts`: fonte de `db` ou `null`.
- `src/db/schema.ts`: tabelas `products`, `categories`, `product_images`, `product_categories`.
- `drizzle-orm`: queries, transacoes e condicoes atomicas.
- `src/lib/runtime-mode.ts`: `assertCanMutateRealData` e mensagens de fallback/bloqueio.
- `src/lib/slug.ts`: normalizacao base de slug.
- `src/features/auth/server/policies.ts`: `requireAdminLike` para actions admin.
- `src/features/cart/components/add-to-cart-form.tsx`: CTA de compra no detalhe.
- `src/features/products/dev/fixtures.ts`: fallback dev/test sem banco.

## Decisoes de Design Identificadas

| Decisao | Evidencia no codigo | Confianca |
|---------|---------------------|-----------|
| Produto publico e filtrado por dominio, nao por UI. | `src/features/products/domain.ts`, `src/features/products/server/product-service.ts` | 🟢 |
| Repository troca automaticamente Drizzle por fixtures quando `db === null`. | `src/features/products/server/product-repository.ts` | 🟢 |
| Produtos administrados usam Server Actions protegidas por `requireAdminLike`. | `src/features/products/server/product-actions.ts` | 🟢 |
| Preco de dominio usa centavos inteiros. | `src/features/products/types.ts`, `src/features/products/domain.ts` | 🟢 |
| Slug vazio no admin e derivado do nome. | `src/features/products/schemas.ts` | 🟢 |
| Imagem de capa e calculada por regra de dominio. | `src/features/products/domain.ts` | 🟢 |
| Decremento de estoque usa condicao atomica no banco. | `src/features/products/server/product-repository.ts` | 🟢 |
| Home usa try/catch para indisponibilidade do catalogo. | `src/app/(storefront)/page.tsx` | 🟢 |

## Estado Interno

### Entidades

- `Product`: entidade administrativa completa, incluindo status, estoque, SEO, categorias e imagens.
- `PublicProduct`: `Product` aprovado pelo filtro publico, com `coverImage`.
- `Category`: categoria de catalogo.
- `ProductImage`: metadata de imagem vinculada ao produto.
- `ProductMutationInput`: payload normalizado para criacao/edicao admin.

### Status

```text
draft -> nao publico
inactive -> nao publico
published + publishedAt <= now + stockQuantity > 0 -> publico/compravel
published + futuro/sem estoque -> nao publico
```

### Persistencia

- Drizzle real: Postgres/Neon via `db`.
- Fallback: fixtures dev/test em memoria.
- Mutacoes reais: bloqueadas se `assertCanMutateRealData` nao permitir.

## Observabilidade

- Nao ha logger estruturado dedicado em `products`.
- Estados publicos sao observaveis por UI e testes de catalogo.
- Mutacoes admin retornam mensagens de `ProductActionState`.
- Fallback e bloqueio sao comunicados por mensagens de runtime.
- Testes unitarios cobrem regras de dominio/schema; E2E cobre catalogo publico e bloqueio admin.

## Riscos e Lacunas

- 🔴 Estoque auditavel por movimentos ainda nao existe; decremento direto reduz rastreabilidade operacional.
- 🔴 Integracao ERP/Bling/fiscal para produtos ainda nao existe.
- 🟡 `/produtos` nao tem try/catch local como a home; erro de repository pode depender de boundary superior.
- 🟡 Fixture repository muta estoque em memoria em `decrementStock`, o que pode exigir reset cuidadoso entre testes.
- 🟡 `ProductAdminVisualStatus` inclui `archived`, mas o status persistido atual e `draft`, `published` ou `inactive`.
