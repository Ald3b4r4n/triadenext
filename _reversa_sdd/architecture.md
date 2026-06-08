# Architecture — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`  
> Data: `2026-06-08`  
> Escopo: extracao minima para desbloquear `/reversa-coding` da feature `001-fase-3-neon-drizzle`  
> Confirmacao: este documento descreve o projeto Next.js atual, nao o Laravel legado.  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral

O projeto `triade-essenza-next` e uma reconstrucao em Next.js App Router da Tríade Essenza Parfum. A arquitetura atual separa superficies de storefront, admin, customer/auth e APIs dentro de `src/app`, com dominio de catalogo em `src/features/products`, upload em `src/features/uploads`, banco em `src/db` e utilitarios em `src/lib`. 🟢

Estados ja registrados no Reversa:

- Fundacao Next.js concluida: App Router, TypeScript, Tailwind, ESLint, Vitest, Playwright, Drizzle/Neon preparado, health check e `.env.example` sem segredos reais. 🟢
- Fase 1 concluida: catalogo publico, pagina de produto por slug, imagens, fixtures e regras publicas de produto. 🟢
- Fase 2 concluida: admin de produtos com listagem, criacao, edicao, validacao, server actions, repository preparado e upload controlado. 🟢
- Fase 3 em andamento via `_reversa_forward/001-fase-3-neon-drizzle/`: persistencia real Neon/Drizzle, migrations locais, seed controlado e metadata de imagens. 🟢

Fontes principais:

- `_reversa_sdd/inventory.md`
- `.reversa/context/current-state.json`
- `docs/architecture/stack.md`
- `docs/architecture/database.md`
- `docs/architecture/uploads.md`
- `docs/features/catalog-products-images.md`
- `docs/features/admin-products.md`
- `src/app/**`
- `src/db/**`
- `src/features/products/**`
- `src/features/uploads/**`

## 2. Stack e runtime

| Camada | Tecnologia | Estado | Confianca |
|--------|------------|--------|-----------|
| App web | Next.js App Router + React | Presente em `src/app`. | 🟢 |
| Linguagem | TypeScript | Presente em codigo e config do projeto. | 🟢 |
| Estilo | Tailwind CSS | Registrado em docs e estrutura global. | 🟢 |
| Validacao | Zod | Usado em schemas de produto, upload e env. | 🟢 |
| Formulario | React Hook Form | Dependencia instalada; formulario de produto existe em componentes. | 🟢 |
| Banco alvo | Neon Postgres | Planejado/preparado via Drizzle e `DATABASE_URL`. | 🟢 |
| ORM | Drizzle ORM + Drizzle Kit | `src/db/schema.ts`, `src/db/client.ts` e scripts `db:*`. | 🟢 |
| Upload | Vercel Blob | Preparado em `src/features/uploads/product-image-upload.ts`. | 🟢 |
| Pagamento | Stripe | Dependencia e rota placeholder existem; checkout real fora do escopo atual. | 🟢 |
| Testes | Vitest + Playwright | Scripts e testes existentes. | 🟢 |

## 3. App Router

### 3.1 Storefront

Arquivos principais:

- `src/app/(storefront)/page.tsx`
- `src/app/(storefront)/produtos/page.tsx`
- `src/app/(storefront)/produto/[slug]/page.tsx`
- `src/app/(storefront)/carrinho/page.tsx`
- `src/app/(storefront)/checkout/page.tsx`

Estado:

- `/produtos` consome `listPublicProducts()` e renderiza `ProductGrid`. 🟢
- `/produto/[slug]` consome `getPublicProductBySlug()`, aplica `notFound()` quando o produto nao e publico ou nao existe, e renderiza imagem, preco, SKU, volume e descricao. 🟢
- Carrinho e checkout existem como superficies/placeholder de fase posterior; a Fase 3 nao implementa checkout, pagamento, frete, cupom ou pedidos. 🟢

### 3.2 Admin

Arquivos principais:

- `src/app/admin/page.tsx`
- `src/app/admin/produtos/page.tsx`
- `src/app/admin/produtos/novo/page.tsx`
- `src/app/admin/produtos/[id]/editar/page.tsx`
- `src/app/admin/categorias/page.tsx`
- `src/app/admin/pedidos/page.tsx`
- `src/app/admin/cupons/page.tsx`
- `src/app/admin/fretes/page.tsx`
- `src/app/admin/documentos-fiscais/page.tsx`

Estado:

- `/admin/produtos` lista produtos administrativos via `listAdminProducts()`. 🟢
- `/admin/produtos/novo` usa `ProductForm` com `createProductAction`. 🟢
- `/admin/produtos/[id]/editar` usa `ProductForm` com `updateProductAction` e `getAdminProductById()`. 🟢
- Admin real ainda nao tem autenticacao/policies finais. A protecao completa e pendencia para fase posterior. 🟢
- Para Fase 3, mutacao real com banco deve ficar guardada por ambiente de desenvolvimento/local-dev ate Fase 4. 🟢

### 3.3 Customer/Auth

Arquivos principais:

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/cadastro/page.tsx`
- `src/app/(customer)/minha-conta/page.tsx`
- `src/app/(customer)/enderecos/page.tsx`
- `src/app/(customer)/pedidos/page.tsx`

Estado:

- As superficies existem no App Router, mas auth/policies reais nao fazem parte da Fase 3. 🟢

### 3.4 API routes

Arquivos principais:

- `src/app/api/health/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/webhooks/stripe/route.ts`

Estado:

- Health check existe como fundacao. 🟢
- Upload real permanece condicionado a `BLOB_READ_WRITE_TOKEN`. 🟢
- Webhook Stripe permanece placeholder/controlado; implementacao real e fase posterior. 🟢

## 4. Banco e schema

### 4.1 `src/db/client.ts`

`src/db/client.ts` le `env.DATABASE_URL`. Quando a string esta vazia, exporta `db = null`; quando existe, cria client Neon HTTP e instancia Drizzle com schema. 🟢

Implicacoes arquiteturais:

- Build/test local nao devem exigir banco real. 🟢
- Repository pode selecionar fallback quando `db === null`. 🟢
- Erros com `DATABASE_URL` presente nao devem ser mascarados como fallback na Fase 3. 🟡

### 4.2 `src/db/schema.ts`

O schema Drizzle ja define tabelas para ecommerce completo, incluindo:

- `users`, `customer_profiles`, `addresses`
- `categories`, `products`, `product_images`, `product_categories`
- `carts`, `cart_items`
- `coupons`, `shipping_rules`
- `orders`, `order_items`, `order_events`
- `payment_intents`, `payment_events`
- `fiscal_documents`, `admin_notifications`

Para a Fase 3, o escopo operacional e catalogo:

- `categories`
- `products`
- `product_images`
- `product_categories`

Migrations contra banco real nao foram executadas nesta extracao. 🟢

## 5. Dominio de produtos

Diretorio: `src/features/products`

Subareas:

- `components/`: componentes de card, grid, imagem, preco, formulario e tabela admin. 🟢
- `dev/fixtures.ts`: produtos/categorias temporarios para fallback sem banco. 🟢
- `domain.ts`: regras puras de publicacao, disponibilidade, slug, preco, ordenacao e capa. 🟢
- `schemas.ts`: validacao Zod de produto e formulario admin. 🟢
- `server/product-repository.ts`: contrato repository, fallback fixture e caminho Drizzle parcial. 🟢
- `server/product-service.ts`: camada de service usada por storefront/admin. 🟢
- `server/product-actions.ts`: server actions para criar/editar produto. 🟢
- `types.ts`: tipos de dominio `Product`, `Category`, `ProductImage`, `PublicProduct` e input de mutacao. 🟢

Estado arquitetural:

- Services centralizam acesso para paginas publicas e admin. 🟢
- Repository escolhe fallback quando `db === null`. 🟢
- Caminho Drizzle ja cria/atualiza parcialmente `products` e `product_categories`, mas ainda usa fixtures para leituras quando `db` existe. 🟢
- Fase 3 deve completar leituras reais, categorias, imagens e guardrails. 🟢

## 6. Uploads

Diretorio: `src/features/uploads`

Arquivos:

- `schemas.ts`
- `product-image-upload.ts`

Regras atuais:

- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`. 🟢
- Limite atual: 5 MB. 🟢
- Sem `BLOB_READ_WRITE_TOKEN`, upload retorna `blocked/missing_blob_token`. 🟢
- Com token, `put()` do Vercel Blob e usado e retorna metadata (`blobUrl`, `pathname`, `altText`, `sortOrder`, `isCover`, dimensoes, `contentType`, `sizeBytes`). 🟢
- Banco deve persistir somente metadata; binario nao entra no banco. 🟢

Fase 3 deve conectar o resultado `uploaded` a persistencia em `product_images` quando banco existir. 🟢

## 7. Integracoes planejadas

| Integracao | Estado atual | Guardrail |
|------------|--------------|-----------|
| Neon Postgres | Preparado por `src/db/client.ts`, `src/db/schema.ts`, `drizzle.config.ts` e scripts `db:*`. | Nao conectar producao; nao rodar migrations reais sem validacao humana. |
| Drizzle ORM/Kit | Schema e scripts existem; repository parcial. | Build/test devem funcionar sem `DATABASE_URL`. |
| Vercel Blob | Upload de produto preparado e bloqueado sem token. | Nao fazer upload real sem `BLOB_READ_WRITE_TOKEN`. |
| Stripe | Dependencia e webhook placeholder. | Checkout/webhook real fora da Fase 3. |
| Vercel | Planejado para hosting. | Deploy fora desta execucao. |

## 8. Estado da Fase 3

Feature ativa:

- `_reversa_forward/001-fase-3-neon-drizzle/`

Artefatos ja criados:

- `requirements.md`
- `doubts.md`
- `audit/requirements-audit.md`
- `roadmap.md`
- `investigation.md`
- `data-delta.md`
- `onboarding.md`
- `risk-plan.md`
- `validation-plan.md`
- `interfaces/product-persistence-contract.md`
- `actions.md`
- `audit/cross-check.md`

Objetivo da Fase 3:

- Persistencia real de produtos, categorias e imagens com Neon/Drizzle quando `DATABASE_URL` existir. 🟢
- Fallback seguro e explicito quando `DATABASE_URL` estiver ausente. 🟢
- Migrations locais revisadas, sem aplicacao em banco real sem validacao humana. 🟢
- Seed controlado de desenvolvimento com dados ficticios e imagens placeholder. 🟢
- Guardrail de admin sem auth: mutacao real apenas em desenvolvimento/local-dev ate Fase 4. 🟢

## 9. Limites e lacunas

- Auth/policies reais de admin ainda nao existem; pendencia para Fase 4. 🟢
- Repository Drizzle real ainda nao consulta banco para listagens/buscas; Fase 3 deve implementar. 🟢
- Metadata de imagem ainda nao e persistida em `product_images`; Fase 3 deve implementar. 🟢
- Migrations locais ainda precisam ser geradas/revisadas; nao executar em banco real nesta extracao. 🟢
- Migracao real de imagens/dados do Laravel e fase posterior. 🟢

## 10. Arquivos relevantes para impacto futuro

| Area | Arquivos |
|------|----------|
| Banco | `src/db/client.ts`, `src/db/schema.ts`, `drizzle.config.ts` |
| Produtos/domain | `src/features/products/domain.ts`, `src/features/products/types.ts`, `src/features/products/schemas.ts` |
| Produtos/server | `src/features/products/server/product-repository.ts`, `src/features/products/server/product-service.ts`, `src/features/products/server/product-actions.ts` |
| Produtos/UI | `src/features/products/components/*` |
| Upload | `src/features/uploads/product-image-upload.ts`, `src/features/uploads/schemas.ts` |
| Storefront | `src/app/(storefront)/produtos/page.tsx`, `src/app/(storefront)/produto/[slug]/page.tsx` |
| Admin | `src/app/admin/produtos/page.tsx`, `src/app/admin/produtos/novo/page.tsx`, `src/app/admin/produtos/[id]/editar/page.tsx` |
| Docs | `docs/architecture/database.md`, `docs/architecture/uploads.md`, `docs/operations/neon.md`, `docs/operations/env.md`, `docs/features/catalog-products-images.md`, `docs/features/admin-products.md` |

## 11. Conclusao

Esta arquitetura minima e suficiente para ancorar `/reversa-coding` da Fase 3. Ela descreve o projeto Next.js atual e preserva a fronteira com o Laravel legado, que permanece apenas como referencia historica/leitura.
