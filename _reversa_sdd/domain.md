# Domain — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`  
> Data: `2026-06-08`  
> Escopo: extracao minima para desbloquear `/reversa-coding` da feature `001-fase-3-neon-drizzle`  
> Confirmacao: este documento descreve o dominio implementado/preparado no projeto Next.js atual, nao o Laravel legado.  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral do dominio

O dominio atual do projeto Next.js cobre a base de catalogo da Tríade Essenza Parfum: produtos, categorias, imagens de produto, storefront publico e admin de produtos. O sistema ainda usa fixtures/fallback em ausencia de banco real e prepara persistencia Neon/Drizzle para a Fase 3. 🟢

Dominios ja modelados no schema, mas fora do escopo funcional da Fase 3:

- usuarios/perfis/enderecos;
- carrinho;
- cupons;
- frete;
- pedidos;
- pagamentos;
- documentos fiscais;
- notificacoes admin.

Esses dominios aparecem no schema inicial, mas checkout, pagamento, frete, cupom e pedidos nao devem ser implementados na Fase 3. 🟢

## 2. Produtos

Tipo principal: `Product` em `src/features/products/types.ts`. 🟢

Campos de dominio relevantes:

| Campo | Papel | Confianca |
|-------|-------|-----------|
| `id` | Identificador interno. | 🟢 |
| `name` | Nome do produto. | 🟢 |
| `slug` | Identificador publico normalizado usado em `/produto/[slug]`. | 🟢 |
| `sku` | Identificador operacional do produto. | 🟢 |
| `shortDescription`, `description` | Conteudo de vitrine/detalhe. | 🟢 |
| `brand`, `inspirationName`, `gender`, `concentration`, `volumeMl` | Atributos de catalogo/perfumaria. | 🟢 |
| `priceCents` | Preco principal em centavos. | 🟢 |
| `compareAtPriceCents`, `costPriceCents` | Precos auxiliares em centavos. | 🟢 |
| `stockQuantity` | Quantidade em estoque. | 🟢 |
| `lowStockThreshold` | Limiar administrativo de estoque baixo. | 🟢 |
| `status` | Estado `draft`, `published` ou `inactive`. | 🟢 |
| `isFeatured` | Destaque de vitrine/admin. | 🟢 |
| `publishedAt` | Data/hora a partir da qual o produto publicado pode aparecer. | 🟢 |
| `seoTitle`, `seoDescription` | Metadados de SEO. | 🟢 |
| `categories` | Categorias associadas ao produto. | 🟢 |
| `images` | Galeria de imagens de produto. | 🟢 |

## 3. Categorias

Tipo principal: `Category` em `src/features/products/types.ts`. 🟢

Campos de dominio:

- `id`
- `name`
- `slug`
- `description`
- `parentId`
- `sortOrder`
- `isActive`
- `createdAt`
- `updatedAt`

No schema Drizzle, `categories` tambem possui `type` e `isProtected`, mas o tipo de dominio atual ainda nao expoe esses campos. 🟢

Categorias sao usadas no admin para selecao e no produto publico para contexto/rotulo. 🟢

## 4. Imagens de produto

Tipo principal: `ProductImage` em `src/features/products/types.ts`. 🟢

Campos:

- `id`
- `productId`
- `blobUrl`
- `pathname`
- `altText`
- `sortOrder`
- `isCover`
- `width`
- `height`
- `sizeBytes`
- `contentType`
- `createdAt`

Regras:

- Banco salva metadata de imagem, nunca arquivo binario. 🟢
- A imagem de capa e indicada por `isCover`. 🟢
- Se nenhuma imagem tem `isCover`, o fallback tecnico seleciona a primeira imagem por `sortOrder`; em empate, por `createdAt`. 🟢
- Upload real exige `BLOB_READ_WRITE_TOKEN`; sem token, retorna bloqueio controlado. 🟢

## 5. Produto publico

Regra implementada em `isProductPublic(product, now)` (`src/features/products/domain.ts`). 🟢

Um produto e publico somente quando todas as condicoes sao verdadeiras:

1. `product.status === "published"` 🟢
2. `product.publishedAt` existe 🟢
3. `product.publishedAt <= now` 🟢
4. `product.stockQuantity > 0` 🟢

Consequencias:

- Produto `draft` nao e publico. 🟢
- Produto futuro nao e publico. 🟢
- Produto sem estoque nao e publico/disponivel. 🟢
- Produto `inactive` nao e publico. 🟢

`isProductAvailableForPurchase(product, now)` atualmente delega para `isProductPublic`. Portanto, disponibilidade de compra segue a mesma regra publica nesta fase. 🟢

## 6. `inactive`

Estado `inactive` existe em `ProductStatus` e no enum Drizzle `product_status`. 🟢

Decisao humana da Fase 3:

- `inactive` e tratado como equivalente funcional de inativo/arquivado nesta reconstrucao inicial. 🟢
- Produto `inactive` nao aparece publicamente. 🟢
- Produto `inactive` nao e compravel. 🟢
- Produto `inactive` permanece acessivel apenas em contexto administrativo. 🟢
- A nomenclatura final pode ser revisada futuramente. 🟢

Fontes:

- `src/features/products/domain.ts`
- `src/features/products/types.ts`
- `_reversa_forward/001-fase-3-neon-drizzle/doubts.md`
- `docs/features/catalog-products-images.md`
- `docs/features/admin-products.md`

## 7. Slug

Regras:

- Slug de produto e normalizado por `normalizeProductSlug`, que delega para `normalizeSlug` em `src/lib/slug.ts`. 🟢
- A pagina publica de produto usa slug em `/produto/[slug]`. 🟢
- No formulario admin, se o slug vier vazio, o sistema gera slug a partir do nome. 🟢
- Slugs devem permanecer normalizados na Fase 3. 🟢

## 8. Precos

Regras:

- O dominio usa precos em centavos (`priceCents`, `compareAtPriceCents`, `costPriceCents`). 🟢
- Entrada de formulario converte preco textual para centavos por `parsePriceToCents`. 🟢
- Produto publicado exige preco maior que zero via `productCanBeMarkedPublic`/`productFormSchema`. 🟢
- O schema Drizzle ainda possui `price` decimal alem de `priceCents`; a Fase 3 deve documentar/revisar a finalidade da redundancia sem abandonar a regra de centavos no dominio. 🟡

## 9. Admin de produtos

Superficies:

- `/admin/produtos`
- `/admin/produtos/novo`
- `/admin/produtos/[id]/editar`
- `/admin/categorias` como suporte inicial

Fluxo atual:

1. Formulario envia `FormData` para server actions. 🟢
2. `productFormDataToObject` transforma dados do formulario. 🟢
3. `productFormSchema` valida campos, normaliza slug e converte precos para centavos. 🟢
4. `productCanBeMarkedPublic` bloqueia produto `published` sem nome, slug, SKU, preco positivo, estoque positivo e `publishedAt <= now`. 🟢
5. Actions chamam service/repository. 🟢
6. Rotas admin/publicas sao revalidadas apos mutation. 🟢

Persistencia atual:

- Sem `DATABASE_URL`, repository usa fixtures e mutacoes retornam `dev_fallback`, indicando que nao houve gravacao real. 🟢
- Com `DATABASE_URL`, repository possui caminho Drizzle parcial para criar/editar `products` e `product_categories`, mas leituras ainda retornam fixtures. 🟢
- Fase 3 deve completar repository real e impedir falsa persistencia. 🟢

Guardrail de admin:

- Auth/policies reais ainda nao existem. 🟢
- Ate Fase 4, mutacao real de admin so deve ser permitida em desenvolvimento/local-dev, com aviso claro. 🟢
- Preview/producao devem bloquear mutacoes reais sem auth/policies. 🟢

## 10. Fallback sem `DATABASE_URL`

Regra arquitetural:

- `src/db/client.ts` exporta `db = null` quando `DATABASE_URL` esta ausente. 🟢

Regra de dominio/operacao:

- Sem banco, produtos e categorias usam `devProducts` e `devCategories` de `src/features/products/dev/fixtures.ts`. 🟢
- Mutacoes sem banco retornam `dev_fallback`. 🟢
- O sistema nao deve comunicar gravacao real quando esta em fallback. 🟢
- Build/test local devem continuar possiveis sem `DATABASE_URL`. 🟢

Fixtures cobrem:

- produto publicado valido;
- produto publicado sem estoque;
- produto publicado futuro;
- produto inactive;
- categoria ativa;
- categoria inativa;
- imagens placeholder.

## 11. Upload sem `BLOB_READ_WRITE_TOKEN`

Regras implementadas:

- `productImageUploadSchema` aceita apenas JPEG, PNG e WebP. 🟢
- Limite atual e 5 MB. 🟢
- Sem `BLOB_READ_WRITE_TOKEN`, `uploadProductImage` retorna `status: "blocked"` e `reason: "missing_blob_token"`. 🟢
- Sem token, nao deve haver upload real. 🟢
- Banco nao deve receber binario; somente metadata apos upload bem-sucedido. 🟢

Fase 3:

- Persistir metadata em `product_images` quando houver banco e upload real bem-sucedido. 🟢
- Manter bloqueio seguro sem token. 🟢

## 12. Storefront

Rotas:

- `/produtos`
- `/produto/[slug]`

Regras:

- `/produtos` lista somente produtos publicos por `listPublicProducts()`. 🟢
- `/produto/[slug]` normaliza/busca slug via service e retorna `notFound()` quando produto nao passa na regra publica. 🟢
- A capa exibida vem de `coverImage`, calculada por `selectCoverImage`. 🟢
- Sem banco real, storefront continua usando fallback de fixtures. 🟢

## 13. Regras preservadas para regressao

| ID | Regra | Fonte | Confianca |
|----|-------|-------|-----------|
| RN-PUB-001 | Produto publico exige `status = published`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-002 | Produto publico exige `publishedAt <= now`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-003 | Produto publico exige `stockQuantity > 0`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-004 | Produto `draft` nao e publico. | `src/features/products/domain.ts` + enum de status | 🟢 |
| RN-PUB-005 | Produto futuro nao e publico. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-006 | Produto sem estoque nao e publico/disponivel. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-007 | Produto `inactive` e inativo/arquivado inicial e nao publico. | `src/features/products/domain.ts` + `doubts.md` | 🟢 |
| RN-IMG-001 | Imagem de capa usa `isCover`. | `src/features/products/domain.ts` | 🟢 |
| RN-IMG-002 | Sem capa explicita, fallback usa primeira imagem ordenada por `sortOrder`. | `src/features/products/domain.ts` | 🟢 |
| RN-IMG-003 | Banco salva metadata de imagem, nao binario. | `docs/architecture/uploads.md` + schema | 🟢 |
| RN-PRICE-001 | Precos do dominio ficam em centavos. | `types.ts`, `schemas.ts`, docs | 🟢 |
| RN-SLUG-001 | Slug de produto e normalizado. | `domain.ts`, `schemas.ts`, `src/lib/slug.ts` | 🟢 |
| RN-FALLBACK-001 | Sem `DATABASE_URL`, fallback deve ser explicito e nao fingir persistencia real. | `product-repository.ts`, docs, requirements Fase 3 | 🟢 |
| RN-UPLOAD-001 | Sem `BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado. | `product-image-upload.ts` | 🟢 |
| RN-ADMIN-001 | Sem auth/policies finais, mutacao real admin deve ficar restrita a desenvolvimento/local-dev ate Fase 4. | `doubts.md`, `requirements.md`, `roadmap.md` | 🟢 |

## 14. Lacunas e pendencias conhecidas

- Repository Drizzle real ainda nao faz leituras reais de produtos/categorias/imagens; Fase 3 deve implementar. 🟢
- `product_images` ainda nao recebe metadata persistida apos upload real; Fase 3 deve implementar. 🟢
- Migrations locais e seed controlado ainda nao foram gerados nesta extracao. 🟢
- Auth/policies reais de admin seguem fora da Fase 3 e sao bloqueador para producao. 🟢
- Migracao real de imagens/dados do Laravel fica para fase posterior. 🟢

## 15. Conclusao

Este dominio minimo registra as regras confirmadas do projeto Next.js atual e fornece a ancora exigida por `/reversa-coding`. Nenhuma regra foi extraida de `.env`, nenhum banco foi conectado e nenhum arquivo do Laravel legado foi modificado.
