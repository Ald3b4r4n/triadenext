# Architecture — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`  
> Data: `2026-06-08`  
> Escopo: re-extracao pos-Fase 3  
> Confirmacao: este documento descreve o projeto Next.js atual, nao o Laravel legado.  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral

O projeto `triade-essenza-next` e uma reconstrucao em Next.js App Router da Tríade Essenza Parfum.
A arquitetura separa superficies de storefront, admin, customer/auth e APIs em `src/app`, dominio de
catalogo em `src/features/products`, upload em `src/features/uploads`, banco em `src/db` e runtime/env
em `src/lib`. 🟢

Fases registradas:

- Fundacao Next.js concluida. 🟢
- Fase 1 de catalogo/produtos/imagens concluida. 🟢
- Fase 2 de admin de produtos concluida. 🟢
- Fase 3 de persistencia Neon/Drizzle preparada concluida no commit `3774c49`. 🟢

## 2. Stack

| Camada | Tecnologia | Estado | Confianca |
|---|---|---|---|
| App web | Next.js App Router + React | Presente em `src/app`. | 🟢 |
| Linguagem | TypeScript | Presente em codigo e config. | 🟢 |
| Estilo | Tailwind CSS | Presente em config/global CSS. | 🟢 |
| Validacao | Zod | Usado em env, produtos e upload. | 🟢 |
| Banco alvo | Neon Postgres | Preparado via Drizzle/Neon. | 🟢 |
| ORM | Drizzle ORM + Drizzle Kit | Schema, client, config, migration e scripts existem. | 🟢 |
| Upload | Vercel Blob | Integrado com bloqueio sem token. | 🟢 |
| Testes | Vitest + Playwright | Suites unit/e2e passam sem banco real. | 🟢 |

## 3. Runtime e guardrails

Arquivo central: `src/lib/runtime-mode.ts`. 🟢

Responsabilidades:

- expor flags seguras de banco e Blob sem expor valores;
- detectar `development`, `test`, `preview` e `production`;
- permitir mutacao real apenas em `development` ou `test` ate a Fase 4;
- bloquear preview/producao sem auth/policies reais;
- centralizar mensagens de fallback e bloqueio.

`src/lib/env.ts` continua validando variaveis opcionais e expondo apenas indicadores booleanos
seguros em `sensitiveRuntimeEnv`. 🟢

## 4. Banco e Drizzle

### Client

`src/db/client.ts` le `env.DATABASE_URL`. 🟢

- Sem `DATABASE_URL`: `db = null`, `hasDatabaseConnection = false`.
- Com `DATABASE_URL`: cria Neon HTTP e Drizzle com schema.
- Build/test nao exigem banco real.
- Erro real com `db !== null` nao e mascarado por fixtures.

### Schema

`src/db/schema.ts` modela ecommerce completo, mas a Fase 3 operacionalmente atua no catalogo.

Tabelas de catalogo relevantes:

- `categories`;
- `products`;
- `product_images`;
- `product_categories`.

Invariantes adicionadas/confirmadas na Fase 3:

- unique `categories.slug`;
- unique `products.slug`;
- unique `products.sku`;
- indice publico por `status`, `publishedAt`, `stockQuantity`;
- unique N:N `product_categories(productId, categoryId)`;
- indice de ordenacao de imagens por produto;
- unique parcial para uma capa por produto em `product_images`.

### Migration

Migration local gerada: `drizzle/0000_shallow_shinko_yamashiro.sql`. 🟢

Ela cria enums, tabelas, FKs e indices iniciais. Nao foi aplicada contra banco real. 🟢

### Scripts

- `db:generate`: `drizzle-kit generate`;
- `db:migrate`: exige `scripts/db/require-database-url.mjs` antes de `drizzle-kit migrate`;
- `db:studio`: `drizzle-kit studio`;
- `db:seed`: `node scripts/db/seed.mjs`.

## 5. Seed

Arquivo: `scripts/db/seed.mjs`. 🟢

Comportamento:

- falha com mensagem segura se `DATABASE_URL` estiver ausente;
- usa apenas dados ficticios de desenvolvimento;
- cobre produto publicado, draft, futuro, sem estoque e inactive;
- usa placeholder `placehold.co`;
- nao copia dados ou imagens do Laravel legado.

## 6. Catalogo e repository

Arquivo central: `src/features/products/server/product-repository.ts`. 🟢

Sem `db`, o repository usa `devProducts` e `devCategories` e retorna `dev_fallback` em mutacoes. 🟢

Com `db`, o repository Drizzle implementa:

- `listProducts`;
- `listCategories`;
- `findProductById`;
- `findProductBySlug`;
- `listProductImages`;
- `createProduct`;
- `updateProduct`;
- `saveProductImageMetadata`.

Produtos reais sao hidratados com categorias e imagens ordenadas. Criacao/edicao de produto e
metadata de imagem usam transacoes quando aplicavel. 🟢

## 7. Storefront

Rotas:

- `src/app/(storefront)/produtos/page.tsx`;
- `src/app/(storefront)/produto/[slug]/page.tsx`.

As paginas consomem `product-service`, que por sua vez usa o repository. A regra publica permanece
no dominio: `published`, `publishedAt <= now` e estoque positivo. 🟢

## 8. Admin

Rotas:

- `src/app/admin/produtos/page.tsx`;
- `src/app/admin/produtos/novo/page.tsx`;
- `src/app/admin/produtos/[id]/editar/page.tsx`.

O admin exibe:

- aviso de modo sem banco quando `DATABASE_URL` esta ausente;
- aviso de painel sem auth real quando ha banco real em desenvolvimento;
- mensagens distintas para `persisted`, `dev_fallback` e `blocked`.

Auth/policies reais permanecem lacuna da Fase 4. 🟢

## 9. Upload de imagens

Arquivos:

- `src/features/uploads/schemas.ts`;
- `src/features/uploads/product-image-upload.ts`.

Regras:

- tipos aceitos: JPEG, PNG e WebP;
- limite: 5 MB;
- sem `BLOB_READ_WRITE_TOKEN`, resultado `blocked/missing_blob_token`;
- apos upload real bem-sucedido, metadata e encaminhada para o repository;
- sem banco, metadata retorna fallback explicito;
- fora de ambiente permitido, metadata real e bloqueada.

## 10. APIs e dominios fora de escopo

Existem superficies/placeholder para customer/auth, carrinho, checkout, pedidos, cupons, fretes,
documentos fiscais e Stripe. A Fase 3 nao implementou checkout, pagamento, frete, cupom, pedidos,
deploy, dominio ou auth/policies reais. 🟢

## 11. Proxima fase

Fase 4 recomendada: autenticacao e policies reais de admin/customer, iniciada por
`/reversa-requirements`. 🟢
