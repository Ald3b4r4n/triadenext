# Domain — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`  
> Data: `2026-06-08`  
> Escopo: re-extracao pos-Fase 3  
> Confirmacao: este documento descreve o dominio implementado/preparado no projeto Next.js atual.  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral do dominio

O dominio funcional atual cobre catalogo de produtos, categorias, imagens de produto, storefront
publico, admin de produtos e persistencia preparada com Neon/Drizzle. 🟢

Dominios modelados no schema, mas ainda fora do fluxo funcional principal:

- usuarios/perfis/enderecos;
- carrinho;
- cupons;
- frete;
- pedidos;
- pagamentos;
- documentos fiscais;
- notificacoes admin.

## 2. Produto

Tipo principal: `Product` em `src/features/products/types.ts`. 🟢

Campos relevantes:

| Campo | Regra/Papel | Confianca |
|---|---|---|
| `id` | Identificador interno. | 🟢 |
| `name` | Nome exibido/admin. | 🟢 |
| `slug` | Identificador publico normalizado. | 🟢 |
| `sku` | Identificador operacional unico no schema. | 🟢 |
| `priceCents` | Preco principal em centavos; fonte de calculo do dominio. | 🟢 |
| `compareAtPriceCents`, `costPriceCents` | Precos auxiliares em centavos. | 🟢 |
| `status` | `draft`, `published` ou `inactive`. | 🟢 |
| `stockQuantity` | Estoque usado na regra publica. | 🟢 |
| `publishedAt` | Data minima de publicacao publica. | 🟢 |
| `categories` | Categorias hidratadas pelo repository. | 🟢 |
| `images` | Galeria ordenada pelo dominio/repository. | 🟢 |

`price` decimal existe no schema para compatibilidade operacional, mas o dominio preserva centavos
como fonte de calculo. 🟢

## 3. Produto publico

Regra implementada em `isProductPublic(product, now)`. 🟢

Um produto e publico somente quando:

1. `status === "published"`;
2. `publishedAt` existe;
3. `publishedAt <= now`;
4. `stockQuantity > 0`.

Consequencias:

- `draft` nao e publico;
- futuro nao e publico;
- sem estoque nao e publico/disponivel;
- `inactive` nao e publico.

## 4. `inactive`

Decisao humana validada: `inactive` e tratado como inativo/arquivado inicial, nao publico e nao
compravel. 🟢

Ele permanece acessivel apenas em contexto administrativo. A nomenclatura final pode ser revisada
futuramente, mas a regra funcional atual esta confirmada. 🟢

## 5. Categorias

Tipo principal: `Category`. 🟢

Campos: `id`, `name`, `slug`, `description`, `parentId`, `sortOrder`, `isActive`, `createdAt`,
`updatedAt`.

Regras:

- `slug` e unico no schema;
- categorias sao ordenadas por `sortOrder` e nome;
- categorias inativas aparecem como contexto admin, mas nao sao selecionaveis no formulario atual.

## 6. Imagens de produto

Tipo principal: `ProductImage`. 🟢

Regras:

- banco salva metadata, nunca binario;
- capa usa `isCover`;
- fallback de capa usa a primeira imagem ordenada por `sortOrder` e `createdAt`;
- schema tem unique parcial para uma capa por produto;
- metadata inclui `blobUrl`, `pathname`, `altText`, ordenacao, dimensoes, tamanho e content type.

## 7. Persistencia e fallback

Sem `DATABASE_URL`:

- `db = null`;
- produtos/categorias/imagens usam fixtures;
- mutacoes retornam `dev_fallback`;
- mensagens nao prometem persistencia real;
- build/test continuam funcionando.

Com `DATABASE_URL`:

- repository usa Drizzle/Neon;
- leituras reais substituem fixtures;
- produtos sao hidratados com categorias e imagens;
- criacao/edicao de produto e categorias ocorre em transacao;
- erro real nao vira fixture.

## 8. Admin sem auth real

Auth/policies reais ainda nao existem. 🟢

Ate a Fase 4:

- mutacao real so e permitida em `development` ou `test`;
- preview/producao bloqueiam mutacao real;
- admin mostra aviso de painel sem autenticacao real;
- actions retornam `error` quando o repository responde `blocked`.

## 9. Upload

Regras confirmadas:

- tipos aceitos: `image/jpeg`, `image/png`, `image/webp`;
- limite: 5 MB;
- sem `BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado;
- sem token, metadata tambem nao e persistida;
- apos upload real bem-sucedido, metadata e salva via repository quando permitido.

## 10. Seed

Seed de desenvolvimento:

- arquivo `scripts/db/seed.mjs`;
- falha sem `DATABASE_URL`;
- usa IDs/slugs estaveis;
- cria categorias ficticias e produtos ficticios cobrindo publicado, draft, futuro, sem estoque e
  inactive;
- usa imagem placeholder segura;
- nao copia Laravel legado.

## 11. Regras preservadas para regressao

| ID | Regra | Fonte | Confianca |
|---|---|---|---|
| RN-PUB-001 | Produto publico exige `status = published`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-002 | Produto publico exige `publishedAt <= now`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-003 | Produto publico exige `stockQuantity > 0`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-004 | Produto `draft` nao e publico. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-005 | Produto futuro nao e publico. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-006 | Produto sem estoque nao e publico/disponivel. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-007 | Produto `inactive` e inativo/arquivado inicial e nao publico. | `src/features/products/domain.ts` + Fase 3 | 🟢 |
| RN-IMG-001 | Imagem de capa usa `isCover`. | `src/features/products/domain.ts`, `src/db/schema.ts` | 🟢 |
| RN-IMG-002 | Banco salva metadata de imagem, nao binario. | `src/features/uploads/*`, `src/db/schema.ts` | 🟢 |
| RN-PRICE-001 | Precos do dominio ficam em centavos. | `types.ts`, `schemas.ts`, `product-repository.ts` | 🟢 |
| RN-SLUG-001 | Slug de produto e normalizado. | `domain.ts`, `schemas.ts`, `src/lib/slug.ts` | 🟢 |
| RN-FALLBACK-001 | Sem `DATABASE_URL`, fallback e explicito e nao finge persistencia. | `runtime-mode.ts`, `product-repository.ts` | 🟢 |
| RN-UPLOAD-001 | Sem `BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado. | `product-image-upload.ts` | 🟢 |
| RN-ADMIN-001 | Sem auth/policies, mutacao real admin fica restrita a dev/test. | `runtime-mode.ts`, `product-repository.ts` | 🟢 |

## 12. Lacunas para Fase 4

- Auth real de admin/customer. 🟢
- Policies reais por papel/ambiente. 🟢
- Protecao definitiva de rotas admin. 🟢
- Estrategia de sessao/login/customer. 🟢
- Politica final para mutacoes em preview/producao. 🟢
