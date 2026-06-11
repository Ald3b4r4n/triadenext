# Products, Tarefas de Implementacao

> Sequencia executavel para reimplementar ou validar a unit `products` a partir das specs extraidas. Nao representa alteracao aplicada no codigo atual.

## Pre-requisitos

- [ ] Schema Drizzle possui `products`, `categories`, `product_images` e `product_categories`.
- [ ] `db` pode ser `null` quando `DATABASE_URL` esta ausente.
- [ ] `requireAdminLike` e `assertCanMutateRealData` estao disponiveis.
- [ ] Componentes de imagem, preco, grid e card podem renderizar sem banco real.
- [ ] Fixtures dev/test cobrem produto publicado, sem estoque, futuro e inactive.
- [ ] Carrinho possui CTA seguro para adicionar produto publico.

## Tarefas

- [ ] T-PROD-01, Definir tipos de produto, categoria, imagem e payload admin
  - Origem no sistema atual: `src/features/products/types.ts`
  - Criterio de pronto: tipos cobrem `Product`, `PublicProduct`, `Category`, `ProductImage` e `ProductMutationInput`.
  - Confianca: 🟢

- [ ] T-PROD-02, Implementar regra de produto publico
  - Origem no sistema atual: `src/features/products/domain.ts`
  - Criterio de pronto: `isProductPublic` exige `published`, `publishedAt <= now` e `stockQuantity > 0`.
  - Confianca: 🟢

- [ ] T-PROD-03, Implementar regra de produto compravel
  - Origem no sistema atual: `src/features/products/domain.ts`
  - Criterio de pronto: `isProductAvailableForPurchase` usa a mesma regra publica atual.
  - Confianca: 🟢

- [ ] T-PROD-04, Implementar normalizacao de slug
  - Origem no sistema atual: `src/features/products/domain.ts`, `src/lib/slug.ts`
  - Criterio de pronto: texto acentuado vira slug ASCII estavel.
  - Confianca: 🟢

- [ ] T-PROD-05, Implementar conversao de preco para centavos
  - Origem no sistema atual: `src/features/products/domain.ts`
  - Criterio de pronto: textos BRL como `R$ 1.234,56` viram `123456` e entradas invalidas viram `null`.
  - Confianca: 🟢

- [ ] T-PROD-06, Implementar validacao de publicacao admin
  - Origem no sistema atual: `src/features/products/domain.ts`, `src/features/products/schemas.ts`
  - Criterio de pronto: produto `published` sem nome, slug, SKU, preco positivo, estoque positivo ou `publishedAt` vigente e rejeitado.
  - Confianca: 🟢

- [ ] T-PROD-07, Implementar ordenacao e selecao de imagem de capa
  - Origem no sistema atual: `src/features/products/domain.ts`
  - Criterio de pronto: imagens ordenam por `sortOrder` e `createdAt`; capa e `isCover` ou primeira ordenada.
  - Confianca: 🟢

- [ ] T-PROD-08, Implementar service publico
  - Origem no sistema atual: `src/features/products/server/product-service.ts`
  - Criterio de pronto: `listPublicProducts` e `getPublicProductBySlug` aplicam filtro publico server-side.
  - Confianca: 🟢

- [ ] T-PROD-09, Implementar repository selector Drizzle/fixtures
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: `db === null` usa fixtures; `db !== null` usa Drizzle.
  - Confianca: 🟢

- [ ] T-PROD-10, Implementar repository Drizzle de listagem e hidratacao
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: produtos sao listados por nome e hidratados com categorias e imagens.
  - Confianca: 🟢

- [ ] T-PROD-11, Implementar repository fixture
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`, `src/features/products/dev/fixtures.ts`
  - Criterio de pronto: listagens usam `devProducts`/`devCategories`; mutacoes retornam `dev_fallback`.
  - Confianca: 🟢

- [ ] T-PROD-12, Implementar schema de formulario admin
  - Origem no sistema atual: `src/features/products/schemas.ts`
  - Criterio de pronto: schema transforma FormData em `ProductMutationInput`, normaliza slug, preco, textos opcionais e categorias.
  - Confianca: 🟢

- [ ] T-PROD-13, Implementar actions admin protegidas
  - Origem no sistema atual: `src/features/products/server/product-actions.ts`
  - Criterio de pronto: actions chamam `requireAdminLike` antes de validar/persistir e retornam `ProductActionState`.
  - Confianca: 🟢

- [ ] T-PROD-14, Implementar criacao/edicao transacional com categorias
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: Drizzle cria/atualiza produto e associa categorias em transacao, respeitando `assertCanMutateRealData`.
  - Confianca: 🟢

- [ ] T-PROD-15, Implementar metadata de imagem
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: imagem `isCover` limpa capas anteriores e insere metadata nova em transacao.
  - Confianca: 🟢

- [ ] T-PROD-16, Implementar decremento seguro de estoque
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: update real inclui condicao `stockQuantity >= quantity` e retorna booleano.
  - Confianca: 🟢

- [ ] T-PROD-17, Implementar rotas publicas de vitrine e detalhe
  - Origem no sistema atual: `src/app/(storefront)/page.tsx`, `src/app/(storefront)/produtos/page.tsx`, `src/app/(storefront)/produto/[slug]/page.tsx`
  - Criterio de pronto: home, catalogo e detalhe usam services publicos e nao exibem produto nao publico.
  - Confianca: 🟢

- [ ] T-PROD-18, Implementar componentes publicos de card/grid/imagem/preco
  - Origem no sistema atual: `src/features/products/components/product-grid.tsx`, `product-card.tsx`, `product-image.tsx`, `product-price.tsx`
  - Criterio de pronto: grid tem estado vazio amigavel; card mostra disponivel, preco e link de detalhe; imagem aceita fallback.
  - Confianca: 🟢

## Tarefas de Teste

- [ ] TT-PROD-01, Unit: produto `published`, vigente e com estoque positivo e publico/compravel.
- [ ] TT-PROD-02, Unit: produto sem estoque nao e publico nem compravel.
- [ ] TT-PROD-03, Unit: produto futuro nao e publico.
- [ ] TT-PROD-04, Unit: produto draft e inactive nao sao publicos.
- [ ] TT-PROD-05, Unit: slug acentuado normaliza para ASCII seguro.
- [ ] TT-PROD-06, Unit: preco BRL textual vira centavos.
- [ ] TT-PROD-07, Unit: `productFormSchema` normaliza slug vazio a partir do nome.
- [ ] TT-PROD-08, Unit: `productFormSchema` rejeita publicacao invalida.
- [ ] TT-PROD-09, Unit: `selectCoverImage` usa `isCover` ou primeira imagem ordenada.
- [ ] TT-PROD-10, Unit: repository fixture lista produtos e retorna `dev_fallback` em mutacoes sem banco.
- [ ] TT-PROD-11, Unit: `decrementStock` retorna false quando estoque insuficiente.
- [ ] TT-PROD-12, Unit: action admin bloqueia antes de repository quando `requireAdminLike` falha.
- [ ] TT-PROD-13, E2E: `/produtos` mostra produto publicado de exemplo e nao mostra produto sem estoque.
- [ ] TT-PROD-14, E2E: `/produto/produto-publicado-de-exemplo` mostra detalhe, preco, SKU e CTA de carrinho.
- [ ] TT-PROD-15, E2E: `/admin/produtos` fica bloqueado sem auth real.
- [ ] TT-PROD-16, Component: `ProductGrid` renderiza estado vazio amigavel quando lista vazia.

## Tarefas de Migracao de Dados

- [ ] TM-PROD-01, Mapear produtos legados para `products`
  - Origem no sistema atual: `src/db/schema.ts`, `_reversa_sdd/data-dictionary.md`
  - Criterio de pronto: campos de nome, slug, SKU, preco, estoque, status e publicacao possuem correspondencia validada.
  - Confianca: 🔴

- [ ] TM-PROD-02, Mapear categorias legadas para `categories` e `product_categories`
  - Origem no sistema atual: `src/db/schema.ts`
  - Criterio de pronto: hierarquia, slug e ordenacao sao preservados ou explicitamente descartados.
  - Confianca: 🔴

- [ ] TM-PROD-03, Mapear imagens legadas para `product_images`
  - Origem no sistema atual: `src/db/schema.ts`, `src/features/products/server/product-repository.ts`
  - Criterio de pronto: cada imagem tem URL/pathname, alt opcional, ordem e regra de capa definida.
  - Confianca: 🔴

- [ ] TM-PROD-04, Definir estrategia de estoque inicial
  - Origem no sistema atual: `_reversa_sdd/domain.md`
  - Criterio de pronto: decisao humana documenta se estoque inicial vem do legado, ERP ou ajuste manual.
  - Confianca: 🔴

## Ordem Sugerida

1. Definir tipos e schemas de dominio.
2. Implementar regras puras de produto publico, slug, preco e capa.
3. Implementar repository fixture para dev/test seguro.
4. Implementar repository Drizzle de leitura/hidratacao.
5. Implementar services publicos.
6. Implementar componentes e rotas publicas.
7. Implementar actions admin protegidas por policy.
8. Implementar persistencia real com guardrails e transacao.
9. Implementar decremento seguro de estoque.
10. Cobrir unitarios de dominio/schema antes dos E2E.
11. Resolver migracao de produtos/categorias/imagens com validacao humana.

## Lacunas Pendentes (🔴)

- Estoque auditavel por movimentos ainda nao existe.
- Integracao ERP/Bling/fiscal para catalogo ainda nao existe.
- Mapeamento de dados legados de produto, categoria e imagem exige validacao humana.
- Politica de reset das fixtures mutaveis de estoque precisa ser explicita em suites maiores de teste.
