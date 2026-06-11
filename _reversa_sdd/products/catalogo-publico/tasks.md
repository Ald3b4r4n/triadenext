# Products / Catalogo Publico, Tarefas de Implementacao

> Sequencia executavel para reimplementar ou validar a subunidade `products/catalogo-publico` a partir das specs extraidas. Nao representa alteracao aplicada no codigo atual.

## Pre-requisitos

- [ ] Unit `products` fornece `PublicProduct`, filtro publico e services `listPublicProducts` / `getPublicProductBySlug`.
- [ ] Fixtures dev/test possuem produtos publicados, sem estoque, futuros e inactive para validar filtros.
- [ ] Componentes de imagem, preco, card e grid estao disponiveis.
- [ ] Carrinho possui `AddToCartForm` seguro para produto publico.
- [ ] Rotas App Router usam route group storefront sem alterar URL publica.

## Tarefas

- [ ] T-PROD-CAT-01, Implementar home storefront
  - Origem no sistema atual: `src/app/(storefront)/page.tsx`, `src/components/storefront/storefront-home.tsx`
  - Criterio de pronto: home mostra marca, hero, CTA `/produtos`, link `/carrinho`, vitrine e bloco de promessa.
  - Confianca: 🟢

- [ ] T-PROD-CAT-02, Remover qualquer placeholder da home
  - Origem no sistema atual: `src/tests/unit/storefront-home.test.tsx`
  - Criterio de pronto: textos `Reconstrucao em andamento` e `Placeholder funcional` nao aparecem.
  - Confianca: 🟢

- [ ] T-PROD-CAT-03, Carregar produtos publicos na home
  - Origem no sistema atual: `src/app/(storefront)/page.tsx`
  - Criterio de pronto: home chama `listPublicProducts` e passa apenas `PublicProduct[]` para `StorefrontHome`.
  - Confianca: 🟢

- [ ] T-PROD-CAT-04, Priorizar produtos destacados na home
  - Origem no sistema atual: `src/app/(storefront)/page.tsx`
  - Criterio de pronto: lista da home ordena `isFeatured` primeiro e limita em 6 produtos.
  - Confianca: 🟢

- [ ] T-PROD-CAT-05, Implementar erro seguro de catalogo na home
  - Origem no sistema atual: `src/app/(storefront)/page.tsx`, `src/components/storefront/storefront-home.tsx`
  - Criterio de pronto: falha em `listPublicProducts` mostra `Catálogo temporariamente indisponível` sem stack/secrets.
  - Confianca: 🟢

- [ ] T-PROD-CAT-06, Implementar pagina `/produtos`
  - Origem no sistema atual: `src/app/(storefront)/produtos/page.tsx`
  - Criterio de pronto: pagina mostra heading `Produtos`, copy publica e `ProductGrid` com produtos publicos.
  - Confianca: 🟢

- [ ] T-PROD-CAT-07, Implementar grid publico com estado vazio
  - Origem no sistema atual: `src/features/products/components/product-grid.tsx`
  - Criterio de pronto: lista vazia renderiza `Nenhum produto disponível no momento.` com `role="status"`.
  - Confianca: 🟢

- [ ] T-PROD-CAT-08, Implementar card publico
  - Origem no sistema atual: `src/features/products/components/product-card.tsx`
  - Criterio de pronto: card mostra categoria/fallback, `Disponível`, nome, resumo opcional, preco e link `Ver detalhes`.
  - Confianca: 🟢

- [ ] T-PROD-CAT-09, Implementar imagem/fallback publico
  - Origem no sistema atual: `src/features/products/components/product-image.tsx`
  - Criterio de pronto: imagem usa `blobUrl` como background; sem imagem renderiza fallback `Sem imagem` com `role="img"`.
  - Confianca: 🟢

- [ ] T-PROD-CAT-10, Implementar preco publico
  - Origem no sistema atual: `src/features/products/components/product-price.tsx`, `src/features/products/utils.ts`
  - Criterio de pronto: preco em centavos e compare-at opcional renderizam em BRL.
  - Confianca: 🟢

- [ ] T-PROD-CAT-11, Implementar pagina de detalhe por slug
  - Origem no sistema atual: `src/app/(storefront)/produto/[slug]/page.tsx`
  - Criterio de pronto: slug publico renderiza imagem, nome, descricao, preco, SKU, volume, estoque e `AddToCartForm`.
  - Confianca: 🟢

- [ ] T-PROD-CAT-12, Implementar notFound para produto nao publico
  - Origem no sistema atual: `src/app/(storefront)/produto/[slug]/page.tsx`, `src/features/products/server/product-service.ts`
  - Criterio de pronto: slug inexistente, draft, inactive, futuro ou sem estoque chama `notFound`.
  - Confianca: 🟢

- [ ] T-PROD-CAT-13, Garantir navegacao publica sem checkout direto
  - Origem no sistema atual: `src/components/storefront/storefront-home.tsx`, `src/features/products/components/product-card.tsx`
  - Criterio de pronto: home/catalogo linkam para produtos e carrinho; checkout nao e CTA primario sem carrinho.
  - Confianca: 🟢

- [ ] T-PROD-CAT-14, Usar fixtures sem banco
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`, `src/features/products/dev/fixtures.ts`
  - Criterio de pronto: sem `DATABASE_URL`, home/listagem/detalhe usam fixtures publicas filtradas.
  - Confianca: 🟢

## Tarefas de Teste

- [ ] TT-PROD-CAT-01, Unit: `StorefrontHome` mostra marca, CTA de produtos e link para carrinho.
- [ ] TT-PROD-CAT-02, Unit: `StorefrontHome` nao mostra textos de placeholder.
- [ ] TT-PROD-CAT-03, Unit: `StorefrontHome` renderiza produto publico fixture e oculta sem estoque.
- [ ] TT-PROD-CAT-04, Unit: `StorefrontHome` renderiza estado vazio sem stack/secrets.
- [ ] TT-PROD-CAT-05, Unit: `StorefrontHome` renderiza erro seguro de catalogo sem stack/secrets.
- [ ] TT-PROD-CAT-06, Component: `ProductGrid` renderiza estado vazio com `role="status"`.
- [ ] TT-PROD-CAT-07, Component: `ProductCard` gera links `/produto/{slug}` e mostra `Disponível`.
- [ ] TT-PROD-CAT-08, Component: `ProductImage` renderiza fallback `Sem imagem`.
- [ ] TT-PROD-CAT-09, E2E: `/produtos` mostra heading `Produtos` e produto publicado de exemplo.
- [ ] TT-PROD-CAT-10, E2E: `/produtos` nao mostra produto sem estoque.
- [ ] TT-PROD-CAT-11, E2E: `/produto/produto-publicado-de-exemplo` mostra detalhe e CTA de carrinho.
- [ ] TT-PROD-CAT-12, E2E: produto nao publico por slug retorna not found ou nao fica acessivel.
- [ ] TT-PROD-CAT-13, E2E: home possui CTA de catalogo e carrinho acessivel.

## Tarefas de Migracao de Dados

- [ ] TM-PROD-CAT-01, Validar produtos legados publicos antes da importacao
  - Origem no sistema atual: `_reversa_sdd/products/requirements.md`, `_reversa_sdd/domain.md`
  - Criterio de pronto: cada produto legado importado para vitrine possui status publicado, data vigente e estoque positivo.
  - Confianca: 🔴

- [ ] TM-PROD-CAT-02, Validar URLs/imagens publicas legadas
  - Origem no sistema atual: `_reversa_sdd/products/requirements.md`
  - Criterio de pronto: imagens migradas possuem URL acessivel ou fallback aceito.
  - Confianca: 🔴

## Ordem Sugerida

1. Garantir filtro publico e services antes das rotas.
2. Implementar home com erro seguro e vitrine limitada.
3. Implementar `/produtos` com `ProductGrid`.
4. Implementar `ProductCard`, `ProductImage` e `ProductPrice`.
5. Implementar detalhe `/produto/[slug]` com `notFound` para nao publico.
6. Conectar CTA de carrinho somente no detalhe publico.
7. Cobrir unitarios de home/componentes.
8. Cobrir E2E de home, catalogo e detalhe.
9. Validar dados legados publicos antes de qualquer importacao real.

## Lacunas Pendentes (🔴)

- Filtros publicos por categoria, genero, concentracao, preco, busca e paginacao ainda nao existem.
- `/produtos` ainda nao tem erro seguro local equivalente ao da home.
- Politica de qualidade/obrigatoriedade de imagens publicas precisa de decisao humana.
