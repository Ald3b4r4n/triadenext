# Domain — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`
> Data: `2026-06-08`
> Escopo: re-extracao pos-Fase 6
> Confirmacao: este documento descreve o dominio implementado/preparado no projeto Next.js atual.
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral do dominio

O dominio funcional atual cobre catalogo de produtos, categorias, imagens de produto, storefront
publico, admin de produtos, persistencia preparada com Neon/Drizzle, autenticacao/policies reais
para admin/customer, carrinho/sessao de compra e cupons/descontos no carrinho. 🟢

Dominios modelados no schema, mas ainda fora do fluxo funcional principal:

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

## 8. Carrinho

Tipo principal: `CartView` em `src/features/cart/types.ts`. 🟢

Regras confirmadas:

- Carrinho anonimo usa cookie opaco `guestCartToken`.
- O cookie nao armazena itens, precos, subtotal, `userId`, role ou dados sensiveis.
- Carrinho autenticado e vinculado a `session.userId`.
- Owner do carrinho e resolvido no servidor; cliente nao envia owner confiavel.
- Item de carrinho guarda `productId`, snapshot de nome, snapshot de preco em centavos e quantidade.
- Subtotal do item e `unitPriceSnapshotCents * quantity`.
- Subtotal do carrinho e soma dos subtotais dos itens.
- Quantidade minima e 1.
- Quantidade maxima e `stockQuantity` no momento da validacao.

Produto compravel no carrinho reutiliza a regra publica:

1. `status = published`;
2. `publishedAt <= now`;
3. `stockQuantity > 0`.

Consequencias:

- `draft` nao entra no carrinho;
- `inactive` nao entra no carrinho;
- produto futuro nao entra no carrinho;
- produto sem estoque nao entra no carrinho;
- quantidade acima de estoque retorna erro controlado;
- admin/manager nao possuem bypass de estoque ou disponibilidade no carrinho.

## 9. Merge de carrinho no login

Ao login bem-sucedido, se houver `guestCartToken`, o service de carrinho tenta mesclar o carrinho
anonimo ao carrinho autenticado. 🟢

Regras:

- itens iguais somam quantidades;
- soma e limitada por estoque disponivel;
- indisponiveis sao ignorados/removidos com aviso controlado;
- carrinho anonimo e marcado como `converted`;
- retentativas nao devem duplicar item nem repetir soma.

## 10. Cupons e descontos

Tipo principal: `Coupon` em `src/features/coupons/types.ts`. 🟢

Campos relevantes:

| Campo | Regra/Papel | Confianca |
|---|---|---|
| `code` | Codigo normalizado com trim/uppercase e unico no schema. | 🟢 |
| `type` | `percentage`, `fixed_amount` ou `free_shipping`. | 🟢 |
| `value` | Percentual ou valor fixo em centavos, conforme tipo. | 🟢 |
| `isActive` | Cupom inativo nao aplica. | 🟢 |
| `startsAt` | Cupom futuro nao aplica antes da data inicial. | 🟢 |
| `endsAt` | Cupom expirado nao aplica apos data final. | 🟢 |
| `maxUses` | Limite global opcional. | 🟢 |
| `usedCount` | Consultado para bloquear esgotado; nao consumido no carrinho. | 🟢 |
| `minimumSubtotalCents` | Subtotal minimo opcional em centavos. | 🟢 |

Mapeamento legado confirmado:

- `percent` -> `percentage`;
- `fixed` -> `fixed_amount`.

Status operacional de cupom:

- `active`;
- `inactive`;
- `scheduled`;
- `expired`;
- `exhausted`.

Regras de aplicacao:

- apenas um cupom por carrinho;
- cupom e aplicado/removido no carrinho resolvido server-side;
- payload cliente nao define desconto, subtotal, total, owner, role, cartId ou couponId;
- desconto percentual e arredondado de forma deterministica em centavos;
- desconto fixo e valor inteiro em centavos;
- desconto nunca excede subtotal;
- `partialTotalCents = subtotalCents - discountCents`;
- carrinho revalida cupom ao listar/recalcular e ao alterar itens;
- se subtotal cair abaixo do minimo, cupom e removido/sinalizado de forma controlada;
- `free_shipping` e tipo preparado e nao aplica frete real.

Admin de cupons:

- `/admin/cupons` lista cupons;
- `/admin/cupons/novo` cria cupom basico;
- `/admin/cupons/[id]/editar` edita cupom basico;
- todas as superficies exigem `requireAdminLike`;
- admin e recorte minimo, nao paridade administrativa completa do legado.

## 11. Checkout fora de escopo

Checkout aparece apenas desabilitado/placeholder na UI de `/carrinho`. 🟢

Continuam fora do dominio funcional implementado:

- checkout real;
- pagamento/Stripe;
- frete real;
- criacao de pedido;
- reserva definitiva de estoque;
- baixa de estoque.

## 12. Policies reais

Regras confirmadas:

| Regra | Fonte | Confianca |
|---|---|---|
| Qualquer usuario autenticado passa em `requireAuthenticated`. | `policies.ts` | 🟢 |
| `admin` e `manager` passam em `requireAdminLike`. | `policies.ts` | 🟢 |
| `customer` nao passa em `requireAdminLike`. | `policies.ts` | 🟢 |
| Area customer exige sessao autenticada via `requireCustomer`. | `policies.ts`, `(customer)/layout.tsx` | 🟢 |
| Ownership compara `session.userId` com `resourceUserId`. | `policies.ts` | 🟢 |
| Auth/banco indisponivel bloqueia operacao admin real. | `runtime-mode.ts`, `policies.ts` | 🟢 |

## 13. Seed admin dev

Seed de admin dev:

- arquivo `scripts/db/seed-admin-dev.ts`;
- apenas development/local-dev;
- exige `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`;
- valida senha minima;
- cria usuario via Better Auth quando ausente e promove role para `admin`;
- nao contem senha hardcoded;
- falha com mensagens controladas quando pre-requisitos faltam.

## 14. Regras preservadas para regressao

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
| RN-CART-001 | Carrinho anonimo usa token opaco sem itens/precos no cookie. | `cart-session.ts` | 🟢 |
| RN-CART-002 | Carrinho autenticado usa `session.userId`. | `cart-service.ts`, `cart-repository.ts` | 🟢 |
| RN-CART-003 | Carrinho bloqueia produto indisponivel e quantidade acima do estoque. | `cart-service.ts` | 🟢 |
| RN-CART-004 | Merge no login soma quantidades e limita por estoque. | `cart-service.ts`, `auth/actions.ts` | 🟢 |
| RN-CART-005 | Carrinho nao implementa checkout, pedido, frete real, pagamento ou reserva/baixa de estoque. | `cart-view.tsx`, `cart-actions.ts` | 🟢 |
| RN-COUPON-001 | Codigo de cupom e normalizado com trim/uppercase. | `src/features/coupons/domain.ts` | 🟢 |
| RN-COUPON-002 | Tipo legado `percent` mapeia para `percentage`; `fixed` mapeia para `fixed_amount`. | `src/features/coupons/domain.ts` | 🟢 |
| RN-COUPON-003 | Cupom inativo, futuro, expirado ou esgotado nao aplica. | `src/features/coupons/domain.ts` | 🟢 |
| RN-COUPON-004 | Desconto em cupom nunca excede subtotal. | `src/features/coupons/domain.ts` | 🟢 |
| RN-COUPON-005 | Aplicar/remover cupom no carrinho nao incrementa `usedCount`. | `src/features/cart/server/cart-service.ts` | 🟢 |
| RN-COUPON-006 | `free_shipping` nao aplica frete real na Fase 6. | `src/features/coupons/domain.ts` | 🟢 |

## 15. Lacunas para proxima fase

- Implementar dados reais de conta customer, enderecos e pedidos quando a proxima feature decidir. 🟡
- Definir granularidade fina futura para permissoes administrativas. 🟡
- Ativar Google OAuth ou magic link somente em fase propria. 🟢
- Aplicar migrations em banco real somente com validacao humana explicita. 🟢
- Definir proxima etapa de compra: enderecos, frete real, pre-checkout, pedidos ou pagamento. 🟡
- Definir quando `usedCount` sera consumido em pedido/checkout futuro. 🟡
