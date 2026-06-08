# Data Delta: Fase 3 - Neon/Drizzle

> Feature: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`

## 1. Resumo

A Fase 3 nao introduz um novo dominio de dados; ela torna operacionais as tabelas de catalogo ja planejadas. O delta principal e sair de fixtures para Neon/Drizzle em `categories`, `products`, `product_categories` e `product_images`, com migrations locais revisadas e seed ficticio de desenvolvimento.

## 2. Tabelas afetadas

| Tabela | Estado atual | Delta planejado |
|--------|--------------|-----------------|
| `categories` | Schema existe; fixtures usadas para leitura. | Consultar/gravar categorias reais, revisar unique/index para `slug` e ordenacao. |
| `products` | Schema existe; criacao/edicao parcial ja usam Drizzle; leituras ainda fixtures. | Leituras reais, buscas por `id`/`slug`, filtros publicos, unique/index para `slug` e `sku`, conversao row -> dominio. |
| `product_categories` | Schema existe; criacao/edicao ja grava vinculos parcialmente. | Substituicao transacional dos vinculos e leitura N:N junto aos produtos. |
| `product_images` | Schema existe; upload retorna metadata, mas nao persiste. | Persistir/listar metadata real, ordenar por `sortOrder`, capa por `isCover`. |

## 3. Campos e constraints a revisar

| Item | Acao planejada | Motivo |
|------|----------------|--------|
| `categories.slug` | Confirmar unique index. | Slugs de categoria devem ser estaveis. |
| `products.slug` | Confirmar unique index. | Busca publica por slug deve ser unica. |
| `products.sku` | Confirmar unique index ou decisao explicita. | SKU e identificador operacional do produto. |
| `product_categories(productId, categoryId)` | Manter unique existente. | Evita duplicidade N:N. |
| `product_images(productId, isCover)` | Revisar index e avaliar constraint de no maximo uma capa por produto. | Garante capa consistente. |
| `products.price` e `products.priceCents` | Documentar finalidade ou revisar redundancia. | Requirements determinam precos em centavos no dominio. |
| timestamps `updatedAt` | Garantir update em mutacoes. | Admin precisa refletir alteracao real. |

## 4. Migrations

- `db:generate` deve gerar migrations locais a partir de `src/db/schema.ts`.
- Nenhuma migration deve ser aplicada em banco real sem validacao humana.
- Se Drizzle exigir `DATABASE_URL` para algum passo, registrar pendencia em docs/operacao.
- Arquivos SQL gerados devem ser revisados antes de `db:migrate`.
- Preview/producao ficam fora do escopo da aplicacao nesta fase.

## 5. Seed de desenvolvimento

| Dado | Conteudo esperado |
|------|-------------------|
| Categorias | Categorias ficticias ativas/inativas com slugs estaveis. |
| Produto publicado | `published`, `publishedAt` passado, estoque positivo, imagem placeholder. |
| Produto draft | Nao publico. |
| Produto futuro | `publishedAt` futuro, nao publico. |
| Produto sem estoque | Estoque zero, nao publico. |
| Produto inactive | Inativo/arquivado inicial, nao publico, admin-only. |
| Imagens | URLs placeholder ou pathnames ficticios, sem copiar Laravel. |

## 6. Rollback de dados

- Rollback automatico em producao nao se aplica nesta fase.
- Para banco local-dev, rollback e limpeza manual ou script documentado apos confirmacao humana.
- Migrations locais podem ser descartadas antes de aplicacao se a revisao detectar erro.
- Seed deve ser reexecutavel ou documentar como limpar dados ficticios.

## 7. Fora de escopo de dados

- Migracao real de produtos do Laravel.
- Migracao real de imagens/arquivos do Laravel.
- Dados de checkout, pedidos, pagamento, frete, cupom ou usuario.
- Conexao com banco de producao.
