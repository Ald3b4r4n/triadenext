# Products

> Spec executavel da unit `products`. Foca no QUE catalogo, vitrine publica e administracao de produtos devem garantir.

## Visao Geral

A unit `products` concentra o catalogo da loja: produto publico, produto administravel, categorias, imagens, preco em centavos, estoque disponivel e fallback dev/test sem banco. Ela alimenta home, listagem publica, pagina de produto, carrinho, admin de produtos e upload de imagens.

## Responsabilidades

- Listar apenas produtos publicos e compraveis para storefront.
- Resolver produto publico por slug normalizado.
- Impedir exposicao publica de draft, inactive, futuro ou sem estoque.
- Normalizar slug e preco vindo de formulario.
- Validar dados administrativos antes de criar/atualizar produto.
- Exigir policy admin-like antes de mutacoes administrativas.
- Persistir produtos/categorias/imagens via Drizzle quando banco e guardrails permitirem.
- Usar fixtures explicitas quando `DATABASE_URL` estiver ausente.
- Selecionar imagem de capa e ordenar imagens de produto.
- Decrementar estoque de forma protegida contra quantidade insuficiente.

## Regras de Negocio

- 🟢 Produto publico exige `status = published`, `publishedAt <= now` e `stockQuantity > 0`.
- 🟢 Produto compravel usa a mesma regra de produto publico.
- 🟢 Produto publicado exige nome, slug, SKU, preco positivo, estoque positivo e data de publicacao valida.
- 🟢 Produto draft ou inactive nao aparece no catalogo publico.
- 🟢 Produto com publicacao futura nao aparece no catalogo publico.
- 🟢 Produto sem estoque nao aparece no catalogo publico nem deve ser adicionavel ao carrinho.
- 🟢 Slug e normalizado removendo acentos e caracteres nao seguros.
- 🟢 Precos de dominio e totais usam centavos inteiros.
- 🟢 Imagens sao ordenadas por `sortOrder` e depois `createdAt`.
- 🟢 Imagem de capa e a marcada como `isCover`; se nao houver, usa a primeira ordenada.
- 🟢 Mutacao administrativa exige `requireAdminLike`.
- 🟢 Persistencia real de produto/imagem exige `assertCanMutateRealData`.
- 🟢 Sem `DATABASE_URL`, repository usa fixtures e retorna `dev_fallback` para criacao/edicao.
- 🟢 Decremento de estoque real so deve ocorrer se `stockQuantity >= quantity`.
- 🔴 Estoque auditavel por movimentos ainda nao existe.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-PROD-01 | Listar produtos publicos. | Must | Ao chamar `listPublicProducts`, retorna somente produtos `published`, vigentes e com estoque positivo. |
| RF-PROD-02 | Exibir catalogo publico. | Must | Ao acessar `/produtos`, usuario ve heading `Produtos` e cards apenas de produtos publicos. |
| RF-PROD-03 | Exibir produto publico por slug. | Must | Ao acessar `/produto/:slug` valido, pagina mostra nome, preco, SKU, estoque disponivel e CTA de carrinho. |
| RF-PROD-04 | Ocultar produto publico invalido. | Must | Draft, inactive, futuro, sem estoque ou slug inexistente retornam `notFound` ou nao aparecem na vitrine. |
| RF-PROD-05 | Alimentar home com vitrine minima. | Must | Home lista ate 6 produtos publicos, priorizando `isFeatured`, sem textos de placeholder. |
| RF-PROD-06 | Normalizar slug. | Must | Dado nome acentuado, slug final e ASCII seguro e estavel. |
| RF-PROD-07 | Converter preco para centavos. | Must | Entrada `R$ 1.234,56` vira `123456` centavos. |
| RF-PROD-08 | Validar formulario admin. | Must | Produto publicado invalido com estoque zero, preco invalido ou publicacao futura e rejeitado. |
| RF-PROD-09 | Proteger criacao/edicao admin. | Must | Sem policy admin-like `allowed`, actions retornam erro de policy antes de persistir. |
| RF-PROD-10 | Persistir produto com categorias. | Should | Em runtime apto, criacao/edicao grava produto e associa categorias em transacao. |
| RF-PROD-11 | Persistir metadata de imagem. | Should | Em runtime apto, imagem salva metadata e, se `isCover`, remove capa das demais imagens do produto. |
| RF-PROD-12 | Fallback sem banco. | Must | Sem `DATABASE_URL`, listagem usa fixtures e mutacoes retornam `dev_fallback` sem grava real. |
| RF-PROD-13 | Decrementar estoque de forma segura. | Must | Decremento retorna `false` se produto nao existe ou estoque e menor que quantidade. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Vitrine publica deve filtrar produto no servidor. | `src/features/products/domain.ts`, `src/features/products/server/product-service.ts` | 🟢 |
| Seguranca | Mutacoes admin exigem policy antes de schema/repository. | `src/features/products/server/product-actions.ts` | 🟢 |
| Confiabilidade | Estoque real deve decrementar com condicao atomica `stockQuantity >= quantity`. | `src/features/products/server/product-repository.ts` | 🟢 |
| Compatibilidade | Sem banco, repository usa fixtures e nao tenta persistencia real. | `src/features/products/server/product-repository.ts`, `src/features/products/dev/fixtures.ts` | 🟢 |
| Integridade | Criacao/edicao real de produto e categorias ocorre em transacao. | `src/features/products/server/product-repository.ts` | 🟢 |
| Usabilidade | Catalogo e produto mostram imagem de capa ou fallback visual seguro. | `src/features/products/components/product-image.tsx`, `src/features/products/domain.ts` | 🟢 |
| Testabilidade | Regras publicas aceitam `now` injetado para teste deterministico. | `src/features/products/domain.ts`, `src/tests/unit/products.test.ts` | 🟢 |

> Inferido a partir de dominio, service, repository, schemas, rotas storefront/admin e testes existentes.

## Criterios de Aceitacao

```gherkin
Cenario: produto publicado vigente aparece no catalogo
  Dado um produto com status published
  E publishedAt menor ou igual ao momento atual
  E stockQuantity maior que zero
  Quando a vitrine publica lista produtos
  Entao o produto aparece no catalogo

Cenario: produto sem estoque nao aparece
  Dado um produto published e vigente
  E stockQuantity igual a zero
  Quando a vitrine publica lista produtos
  Entao o produto nao aparece

Cenario: produto futuro nao aparece
  Dado um produto published
  E publishedAt maior que o momento atual
  Quando a vitrine publica lista produtos
  Entao o produto nao aparece

Cenario: pagina de produto publico
  Dado slug de produto publico
  Quando o usuario acessa "/produto/:slug"
  Entao ve nome, preco, SKU, estoque Disponivel e CTA de carrinho

Cenario: admin tenta criar produto sem permissao
  Dado policy admin-like diferente de allowed
  Quando createProductAction e chamada
  Entao retorna erro com policyMessage
  E nao persiste produto

Cenario: formulario tenta publicar produto invalido
  Dado status published
  E estoque zero ou publishedAt futuro
  Quando productFormSchema valida o payload
  Entao retorna erro em status
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Filtro publico de produto | Must | Evita expor draft, futuro, inactive ou sem estoque. |
| Listagem e pagina publica | Must | Base da vitrine e entrada para carrinho. |
| Validacao admin de produto publicado | Must | Mantem consistencia da vitrine e regras de compra. |
| Policy admin-like antes de mutacao | Must | Evita gravacao indevida. |
| Fallback sem banco | Must | Permite dev/test seguro sem DATABASE_URL. |
| Imagens e capa | Should | Essencial para UX, mas produto pode ter fallback visual. |
| Estoque auditavel por movimentos | Could | Lacuna futura fora do estado atual. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/features/products/domain.ts` | `isProductPublic`, `toPublicProduct`, `filterPublicProducts`, `selectCoverImage`, `parsePriceToCents` | 🟢 |
| `src/features/products/server/product-service.ts` | `listPublicProducts`, `getPublicProductBySlug`, admin service wrappers | 🟢 |
| `src/features/products/server/product-repository.ts` | `createProductRepository`, Drizzle/fixture repositories, `decrementStock` | 🟢 |
| `src/features/products/schemas.ts` | `productFormSchema`, `productFormDataToObject` | 🟢 |
| `src/features/products/dev/fixtures.ts` | Produtos/categorias de fallback | 🟢 |
| `src/app/(storefront)/page.tsx` | Home com vitrine | 🟢 |
| `src/app/(storefront)/produtos/page.tsx` | Listagem publica | 🟢 |
| `src/app/(storefront)/produto/[slug]/page.tsx` | Detalhe publico | 🟢 |
| `src/features/products/server/product-actions.ts` | `createProductAction`, `updateProductAction` | 🟢 |
| `src/features/products/components/product-grid.tsx` | Grid publico | 🟢 |
| `src/features/products/components/product-card.tsx` | Card publico | 🟢 |
| `src/features/products/components/product-image.tsx` | Imagem/fallback visual | 🟢 |
| `src/features/products/components/product-form.tsx` | Form admin | 🟢 |
| `src/tests/unit/products.test.ts` | Regras de dominio/schema | 🟢 |
| `src/tests/e2e/storefront-products.spec.ts` | Vitrine publica e bloqueio admin | 🟢 |

## Lacunas e Riscos

- 🔴 Estoque auditavel por movimentos ainda nao existe; decremento atual e direto no produto.
- 🔴 Nao ha provider externo de catalogo/ERP/Bling para produto fiscal/comercial.
- 🟡 Mutacao admin em fallback retorna sucesso `dev_fallback`, exigindo mensagem clara para nao confundir com persistencia real.
- 🟡 Produto sem imagem depende de fallback visual; cobertura visual completa ainda pode ser ampliada.
- 🟡 A pagina `/produtos` nao envolve try/catch como a home; falha de repository real pode quebrar a rota se nao tratada por boundary superior.
