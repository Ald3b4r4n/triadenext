# Products / Catalogo Publico

> Spec executavel da subunidade `products/catalogo-publico`. Foca no QUE a vitrine publica de produtos deve garantir.

## Visao Geral

Esta subunidade cobre a experiencia publica de catalogo: home com vitrine, listagem `/produtos`, detalhe `/produto/[slug]`, cards, imagem/preco e estados seguros de vazio/erro. Ela consome apenas produtos publicos e compraveis, sem expor dados administrativos ou produtos indisponiveis.

## Responsabilidades

- Renderizar home publica com marca, CTA de catalogo e acesso ao carrinho.
- Listar produtos publicos na home e em `/produtos`.
- Priorizar produtos destacados na home sem quebrar o filtro publico.
- Resolver detalhe publico por slug normalizado.
- Ocultar draft, inactive, futuro e sem estoque.
- Renderizar cards com imagem/fallback, nome, resumo, preco, disponibilidade e link.
- Renderizar detalhe com imagem, preco, SKU, volume, disponibilidade e CTA de carrinho.
- Exibir estado vazio amigavel quando nao houver produtos.
- Exibir erro seguro quando catalogo estiver indisponivel na home.
- Usar fixtures dev/test de forma explicita quando nao houver banco.

## Regras de Negocio

- 🟢 Catalogo publico so pode exibir `PublicProduct`.
- 🟢 `PublicProduct` exige `published`, `publishedAt <= now` e `stockQuantity > 0`.
- 🟢 Produto draft, inactive, futuro ou sem estoque nunca aparece em home, `/produtos` ou detalhe publico.
- 🟢 Slug de detalhe deve ser normalizado antes da busca.
- 🟢 Slug inexistente ou produto nao publico resulta em `notFound`.
- 🟢 Home deve exibir no maximo 6 produtos publicos.
- 🟢 Home deve priorizar `isFeatured`, mas sem incluir produto nao publico.
- 🟢 Card publico deve linkar para `/produto/{slug}`.
- 🟢 Card publico deve indicar `Disponível` apenas para produto ja filtrado como publico.
- 🟢 CTA de carrinho aparece apenas na pagina de produto publico.
- 🟢 Estados de erro/vazio nao podem vazar stack, `DATABASE_URL`, secrets ou detalhes de provider.
- 🟢 Checkout nao deve ser linkado diretamente da home/catalogo sem passar pelo carrinho.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-PROD-CAT-01 | Renderizar home publica real. | Must | Home mostra `Tríade Essenza Parfum`, mensagem de perfumaria arabe, CTA `Ver produtos` e link para carrinho. |
| RF-PROD-CAT-02 | Remover placeholder da home. | Must | Home nao mostra `Reconstrucao em andamento` nem `Placeholder funcional`. |
| RF-PROD-CAT-03 | Listar vitrine da home. | Must | Home recebe produtos publicos, ordena destacados primeiro e renderiza ate 6 cards. |
| RF-PROD-CAT-04 | Renderizar estado vazio na home/listagem. | Must | Com lista vazia, exibe mensagem amigavel `Nenhum produto disponível no momento.` sem erro tecnico. |
| RF-PROD-CAT-05 | Renderizar erro seguro na home. | Must | Se `listPublicProducts` falhar na home, exibe `Catálogo temporariamente indisponível` sem stack/secrets. |
| RF-PROD-CAT-06 | Renderizar `/produtos`. | Must | Ao acessar `/produtos`, usuario ve heading `Produtos` e grid de produtos publicos. |
| RF-PROD-CAT-07 | Ocultar produtos indisponiveis. | Must | Produto sem estoque, futuro, draft ou inactive nao aparece na listagem publica. |
| RF-PROD-CAT-08 | Renderizar card de produto. | Must | Card mostra categoria ou fallback, `Disponível`, nome, resumo opcional, preco e link `Ver detalhes`. |
| RF-PROD-CAT-09 | Resolver detalhe por slug. | Must | Slug publico valido renderiza pagina de detalhe; slug invalido ou nao publico chama `notFound`. |
| RF-PROD-CAT-10 | Renderizar detalhe publico. | Must | Detalhe mostra imagem/fallback, nome, preco, SKU, volume, disponibilidade, CTA de carrinho e descricao. |
| RF-PROD-CAT-11 | Usar fallback sem banco. | Must | Sem `DATABASE_URL`, catalogo usa fixtures publicas e continua navegavel em dev/test. |
| RF-PROD-CAT-12 | Manter navegacao publica segura. | Should | Links de catalogo e carrinho funcionam; checkout direto nao e exposto como atalho primario. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | O filtro publico roda no servidor antes da renderizacao. | `src/features/products/server/product-service.ts`, `src/features/products/domain.ts` | 🟢 |
| UX | Home deve parecer storefront real, nao placeholder. | `src/components/storefront/storefront-home.tsx`, `src/tests/unit/storefront-home.test.tsx` | 🟢 |
| Privacidade | Erros da home nao vazam stack, env ou secrets. | `src/app/(storefront)/page.tsx`, `src/components/storefront/storefront-home.tsx` | 🟢 |
| Disponibilidade | Ambiente sem banco usa fixtures seguras. | `src/features/products/server/product-repository.ts`, `src/features/products/dev/fixtures.ts` | 🟢 |
| Acessibilidade | Estados vazios usam `role="status"` e links semanticamente navegaveis. | `src/features/products/components/product-grid.tsx`, `src/components/storefront/storefront-home.tsx` | 🟢 |
| Testabilidade | Home e regras publicas possuem testes unitarios/E2E com fixtures. | `src/tests/unit/storefront-home.test.tsx`, `src/tests/e2e/storefront-products.spec.ts` | 🟢 |

> Inferido a partir da home storefront, rotas publicas, componentes de catalogo, services publicos e testes.

## Criterios de Aceitacao

```gherkin
Cenario: home publica renderiza storefront real
  Dado que existem produtos publicos disponiveis
  Quando o usuario acessa "/"
  Entao ve "Tríade Essenza Parfum"
  E ve CTA "Ver produtos"
  E ve link para carrinho
  E nao ve "Reconstrucao em andamento"
  E nao ve "Placeholder funcional"

Cenario: listagem publica nao mostra produto sem estoque
  Dado um produto published vigente com stockQuantity igual a zero
  Quando o usuario acessa "/produtos"
  Entao esse produto nao aparece

Cenario: detalhe de produto publico
  Dado um slug de produto publico
  Quando o usuario acessa "/produto/{slug}"
  Entao ve nome, preco, SKU, disponibilidade e CTA de carrinho

Cenario: detalhe de produto nao publico
  Dado um slug de produto draft, inactive, futuro ou sem estoque
  Quando o usuario acessa "/produto/{slug}"
  Entao o sistema responde como not found

Cenario: catalogo temporariamente indisponivel na home
  Dado falha segura ao listar produtos
  Quando a home renderiza
  Entao ve "Catálogo temporariamente indisponível"
  E nao ve stack, DATABASE_URL ou secret
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Filtro publico server-side | Must | Impede vazamento de produto nao compravel. |
| Home real sem placeholder | Must | Entrada principal da loja. |
| `/produtos` e `/produto/[slug]` | Must | Jornada publica basica ate o carrinho. |
| Estados vazio/erro seguros | Must | Evita experiencia quebrada e vazamento tecnico. |
| Fallback sem banco | Must | Mantem dev/test navegavel sem DB real. |
| Priorizacao de destacados | Should | Melhora vitrine, mas nao altera regra publica. |
| Enriquecimento visual avancado | Could | Fora do MVP publico minimo. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/(storefront)/page.tsx` | `HomePage` | 🟢 |
| `src/components/storefront/storefront-home.tsx` | `StorefrontHome` | 🟢 |
| `src/app/(storefront)/produtos/page.tsx` | `ProdutosPage` | 🟢 |
| `src/app/(storefront)/produto/[slug]/page.tsx` | `ProdutoPage` | 🟢 |
| `src/features/products/server/product-service.ts` | `listPublicProducts`, `getPublicProductBySlug` | 🟢 |
| `src/features/products/domain.ts` | `filterPublicProducts`, `toPublicProduct`, `isProductPublic` | 🟢 |
| `src/features/products/components/product-grid.tsx` | `ProductGrid` | 🟢 |
| `src/features/products/components/product-card.tsx` | `ProductCard` | 🟢 |
| `src/features/products/components/product-image.tsx` | `ProductImage` | 🟢 |
| `src/features/products/components/product-price.tsx` | `ProductPrice` | 🟢 |
| `src/features/cart/components/add-to-cart-form.tsx` | `AddToCartForm` | 🟢 |
| `src/tests/unit/storefront-home.test.tsx` | Home publica e estados seguros | 🟢 |
| `src/tests/e2e/storefront-products.spec.ts` | Catalogo publico e bloqueio admin | 🟢 |

## Lacunas e Riscos

- 🟡 `/produtos` ainda nao possui estado de erro local equivalente ao da home.
- 🟡 Catalogo publico depende do fallback visual quando produto nao possui imagem.
- 🟡 O texto `Disponível` no card assume que o filtro publico ja foi aplicado corretamente.
- 🔴 Filtros publicos avancados por categoria, genero, concentracao ou faixa de preco ainda nao existem.
