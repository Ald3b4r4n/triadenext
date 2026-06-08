# Interface interna: Product Persistence Contract

> Feature: `001-fase-3-neon-drizzle`  
> Tipo: contrato interno repository/service/actions  
> Nao ha novo endpoint HTTP publico nesta fase.

## 1. Objetivo

Definir o contrato entre actions, services, repository Drizzle e fallback de desenvolvimento para produtos, categorias e imagens.

## 2. ProductRepository

```ts
type ProductRepository = {
  listProducts(): Promise<Product[]>;
  listCategories(): Promise<Category[]>;
  findProductById(id: string): Promise<Product | null>;
  findProductBySlug(slug: string): Promise<Product | null>;
  createProduct(input: ProductMutationInput): Promise<ProductMutationPersistenceResult>;
  updateProduct(id: string, input: ProductMutationInput): Promise<ProductMutationPersistenceResult>;
  listProductImages(productId: string): Promise<ProductImage[]>;
  persistProductImageMetadata(input: ProductImageMetadataInput): Promise<ProductImage>;
};
```

## 3. Resultado de persistencia

```ts
type ProductMutationPersistenceResult =
  | { status: "persisted"; productId: string; message: string }
  | { status: "dev_fallback"; productId: string; message: string }
  | { status: "blocked"; reason: "unsafe_environment"; message: string };
```

## 4. Regras de modo

| Condicao | Resultado esperado |
|----------|--------------------|
| `DATABASE_URL` ausente | Repository fixture, mutacoes `dev_fallback`. |
| `DATABASE_URL` presente e ambiente desenvolvimento/local-dev | Repository Drizzle real. |
| `DATABASE_URL` presente e ambiente preview/producao sem auth/policies | Leituras podem usar Drizzle; mutacoes admin reais retornam `blocked/unsafe_environment`. |
| `DATABASE_URL` presente e operacao Drizzle falha | Falha real propagada; nao cair para fixtures. |

## 5. Contrato service

- `listPublicProducts(now)` aplica regras publicas sobre produtos reais ou fixtures.
- `getPublicProductBySlug(slug, now)` normaliza slug e aplica regras publicas.
- `listAdminProducts()` lista todos os produtos administrativos da fonte ativa.
- `listProductCategories()` lista categorias administrativas.
- `createAdminProduct(input)` e `updateAdminProduct(id, input)` propagam `persisted`, `dev_fallback` ou `blocked`.

## 6. Contrato actions

| Action | Entrada | Saida esperada |
|--------|---------|----------------|
| `createProductAction` | `FormData` validado por schema existente | `success` apenas para `persisted` ou fallback explicitamente comunicado; `error` para validacao/falha; estado especifico para bloqueio se implementado. |
| `updateProductAction` | `id` + `FormData` | Mesmo contrato de criacao, revalidando rotas afetadas quando apropriado. |
| Upload de imagem | `ProductImageUploadInput` | `rejected`, `blocked/missing_blob_token` ou `uploaded`; metadata so persiste no caso `uploaded` + banco disponivel. |

## 7. Erros e idempotencia

- Criacao de produto deve respeitar slug/SKU unicos.
- Atualizacao deve substituir categorias em transacao.
- Persistencia de imagem de capa deve manter no maximo uma capa por produto, por transacao ou constraint.
- Seed deve usar slugs/SKUs estaveis para idempotencia ou documentar limpeza.

## 8. Timeouts e retries

Nao ha politica explicita de retry nesta fase. Falhas de Drizzle/Neon devem ser reportadas como erro operacional. Retry automatico fica fora de escopo ate haver observabilidade/auth mais completa.
