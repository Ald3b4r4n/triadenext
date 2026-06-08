# Domain — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`
> Data: `2026-06-08`
> Escopo: re-extracao pos-Fase 4
> Confirmacao: este documento descreve o dominio implementado/preparado no projeto Next.js atual.
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral do dominio

O dominio funcional atual cobre catalogo de produtos, categorias, imagens de produto, storefront
publico, admin de produtos, persistencia preparada com Neon/Drizzle e autenticacao/policies reais
para admin e customer. 🟢

Dominios modelados no schema, mas ainda fora do fluxo funcional principal:

- carrinho;
- cupons;
- frete;
- pedidos;
- pagamentos;
- documentos fiscais;
- notificacoes admin.

## 2. Identidade, roles e sessao

Usuario autenticado e representado por `AppSession` em `src/features/auth/server/session.ts`. 🟢

Roles confirmadas:

| Role | Papel | Permissao MVP | Confianca |
|---|---|---|---|
| `customer` | Cliente publico cadastrado | Area customer e recursos proprios. | 🟢 |
| `admin` | Administrador | Area admin e mutacoes administrativas. | 🟢 |
| `manager` | Gestor operacional | Equivalente a `admin` no MVP. | 🟢 |

O cadastro publico cria apenas `customer`; `admin` e `manager` nao podem ser criados publicamente
por payload de formulario. 🟢

## 3. Login, cadastro e logout

Fluxos confirmados:

- Login por e-mail/senha em `/login`.
- Cadastro por e-mail/senha em `/cadastro`.
- Logout server-side via `auth.api.signOut`.
- `returnTo` e validado para aceitar apenas rotas internas seguras.
- Credenciais invalidas retornam erro generico/controlado.
- Google OAuth e magic link ficam fora do escopo atual.

## 4. Produto

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

## 5. Produto publico

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

## 6. Categorias e imagens

Categorias continuam com `slug` unico, ordenacao por `sortOrder`/nome e uso principal no admin e
catalogo. 🟢

Imagens de produto continuam como metadata:

- banco salva metadata, nunca binario;
- capa usa `isCover`;
- fallback de capa usa primeira imagem ordenada por `sortOrder` e `createdAt`;
- schema tem unique parcial para uma capa por produto;
- upload real exige token Blob e policy admin-like.

## 7. Persistencia e fallback

Sem `DATABASE_URL`:

- `db = null`;
- produtos/categorias/imagens usam fixtures;
- mutacoes retornam `dev_fallback` ou bloqueio controlado;
- mensagens nao prometem persistencia real;
- build/test continuam funcionando.

Com `DATABASE_URL` e auth pronta:

- repository usa Drizzle/Neon;
- leituras reais substituem fixtures;
- produtos sao hidratados com categorias e imagens;
- criacao/edicao de produto e categorias ocorre em transacao;
- erro real nao vira fixture;
- mutations admin exigem `admin` ou `manager`.

## 8. Policies reais

Regras confirmadas:

| Regra | Fonte | Confianca |
|---|---|---|
| Qualquer usuario autenticado passa em `requireAuthenticated`. | `policies.ts` | 🟢 |
| `admin` e `manager` passam em `requireAdminLike`. | `policies.ts` | 🟢 |
| `customer` nao passa em `requireAdminLike`. | `policies.ts` | 🟢 |
| Area customer exige sessao autenticada via `requireCustomer`. | `policies.ts`, `(customer)/layout.tsx` | 🟢 |
| Ownership compara `session.userId` com `resourceUserId`. | `policies.ts` | 🟢 |
| Auth/banco indisponivel bloqueia operacao admin real. | `runtime-mode.ts`, `policies.ts` | 🟢 |

## 9. Seed admin dev

Seed de admin dev:

- arquivo `scripts/db/seed-admin-dev.ts`;
- apenas development/local-dev;
- exige `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`;
- valida senha minima;
- cria usuario via Better Auth quando ausente e promove role para `admin`;
- nao contem senha hardcoded;
- falha com mensagens controladas quando pre-requisitos faltam.

## 10. Regras preservadas para regressao

| ID | Regra | Fonte | Confianca |
|---|---|---|---|
| RN-PUB-001 | Produto publico exige `status = published`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-002 | Produto publico exige `publishedAt <= now`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-003 | Produto publico exige `stockQuantity > 0`. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-004 | Produto `draft` nao e publico. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-005 | Produto futuro nao e publico. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-006 | Produto sem estoque nao e publico/disponivel. | `src/features/products/domain.ts` | 🟢 |
| RN-PUB-007 | Produto `inactive` e inativo/arquivado inicial e nao publico. | `src/features/products/domain.ts` | 🟢 |
| RN-IMG-001 | Imagem de capa usa `isCover`. | `src/features/products/domain.ts`, `src/db/schema.ts` | 🟢 |
| RN-IMG-002 | Banco salva metadata de imagem, nao binario. | `src/features/uploads/*`, `src/db/schema.ts` | 🟢 |
| RN-PRICE-001 | Precos do dominio ficam em centavos. | `types.ts`, `schemas.ts`, `product-repository.ts` | 🟢 |
| RN-SLUG-001 | Slug de produto e normalizado. | `domain.ts`, `schemas.ts`, `src/lib/slug.ts` | 🟢 |
| RN-FALLBACK-001 | Sem `DATABASE_URL`, fallback e explicito e nao finge persistencia. | `runtime-mode.ts`, `product-repository.ts` | 🟢 |
| RN-UPLOAD-001 | Sem `BLOB_READ_WRITE_TOKEN`, upload real fica bloqueado. | `product-image-upload.ts` | 🟢 |
| RN-AUTH-001 | Cadastro publico cria somente `customer`. | `auth.ts`, `actions.ts`, `schemas.ts` | 🟢 |
| RN-AUTH-002 | `admin` e `manager` sao equivalentes no MVP. | `policies.ts` | 🟢 |
| RN-AUTH-003 | Mutacao admin real exige policy admin-like. | `product-actions.ts`, `product-image-upload.ts` | 🟢 |

## 11. Lacunas para proxima fase

- Implementar dados reais de conta customer, enderecos e pedidos quando a proxima feature decidir. 🟡
- Definir granularidade fina futura para permissoes administrativas. 🟡
- Ativar Google OAuth ou magic link somente em fase propria. 🟢
- Aplicar migrations em banco real somente com validacao humana explicita. 🟢
