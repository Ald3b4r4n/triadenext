# Product Persistence

Fase 3 prepara persistencia real de produtos com Neon/Drizzle sem perder o fallback seguro.

## Modos

- Sem `DATABASE_URL`: `db = null`, services usam fixtures e mutacoes retornam `dev_fallback`.
- Com `DATABASE_URL`: repository usa Drizzle; erros reais propagam e nao viram fixtures.
- Fora de desenvolvimento/local-dev: mutacoes reais ficam bloqueadas ate a Fase 4 de auth/policies.

## Repository

`src/features/products/server/product-repository.ts` implementa:

- listar produtos admin;
- buscar por `id`;
- buscar por `slug`;
- listar categorias;
- listar imagens por produto;
- criar produto com categorias em transacao;
- editar produto e substituir categorias em transacao;
- persistir metadata de imagem em `product_images`.

Produtos reais sao hidratados com categorias e imagens ordenadas. O storefront continua filtrando a
regra publica no dominio: `published`, `publishedAt <= now` e estoque positivo.

## Fora de escopo

- checkout;
- pagamentos;
- frete;
- cupons;
- pedidos;
- deploy;
- dominio;
- auth/policies reais;
- migracao real de imagens do Laravel legado.
