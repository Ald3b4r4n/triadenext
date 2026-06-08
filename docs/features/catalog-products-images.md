# Catalogo, Produtos e Imagens — Fase 1

## Escopo

- Categorias e produtos como dominio inicial em `src/features/products`.
- Listagem publica em `/produtos`.
- Pagina publica por slug em `/produto/[slug]`.
- Componentes reutilizaveis de card, grid, preco, imagem e status.
- Admin `/admin/produtos` em modo leitura estrutural.
- Upload de imagem preparado para Vercel Blob, sem upload real quando o token nao existe.
- Fixtures temporarias ate a persistencia Neon/Drizzle real.

## Regras herdadas do legado

- Produto publico exige `status = published`.
- `publishedAt` precisa ser menor ou igual ao horario atual.
- `stockQuantity` precisa ser maior que zero.
- Produto sem estoque nao deve aparecer como disponivel para compra.
- Produto futuro nao deve ser publico.
- Produto `draft` nao deve ser publico.
- Produto `inactive` nao deve ser publico nesta fase.
- Imagem de capa e identificada por `isCover`.
- Banco salva metadata de imagem, nao binario.
- Pagina de produto usa slug.

## Decisoes implementadas

- `inactive` foi tratado como inativo/arquivado inicial e segue pendente de validacao humana.
- Fallback tecnico de capa: se nenhuma imagem tem `isCover`, selecionar a primeira por `sortOrder`.
- Services usam fixtures quando nao ha conexao real com banco.
- Upload real retorna `blocked` quando `BLOB_READ_WRITE_TOKEN` esta ausente.
- O schema Drizzle foi ajustado para conter os campos esperados da Fase 1, sem executar migration.

## Lacunas

- Validar semanticamente `inactive` com humano antes de tratar como arquivo definitivo.
- Definir limites finais de upload de imagem.
- Definir se Blob de produto sera publico ou privado.
- Implementar repository Drizzle real com Neon.
- Substituir fixtures por seeds/dados reais controlados.

## Testes de paridade

- Produto `published`, passado e com estoque e publico.
- Produto sem estoque nao e disponivel.
- Produto futuro nao e publico.
- Produto `draft` nao e publico.
- Produto `inactive` nao e publico.
- Capa explicita por `isCover`.
- Fallback de capa por `sortOrder`.
- Slug normaliza acentos.
- Preco formata centavos em BRL.
- Playwright valida `/produtos` com produto publicado e sem produto sem estoque.

## Pendencias para a proxima fase

- Persistencia real com Neon/Drizzle.
- Migracao segura de dados e imagens do legado apos inventario.

## Fase 2 — Admin de produtos

A Fase 2 adicionou listagem administrativa, telas de novo/edicao, formulario validado com Zod,
actions server-side e upload controlado para imagens. Sem `DATABASE_URL`, as actions validam e
retornam fallback de desenvolvimento sem gravar em banco real.

## Fase 3 — Persistencia real

Quando `DATABASE_URL` existe, o storefront consome produtos via service/repository Drizzle. Quando
nao existe, continua usando fixtures explicitas.

Regra publica preservada:

- `status = published`;
- `publishedAt <= now`;
- `stockQuantity > 0`.

Metadata de imagem e persistida em `product_images` somente depois de upload real bem-sucedido no
Blob. Sem `BLOB_READ_WRITE_TOKEN`, nao ha upload nem metadata nova.

Migracao real de imagens do legado segue fora desta fase. A etapa futura deve inventariar assets,
validar origem e gravar somente metadata segura no novo banco.

## Fase 5 — Impacto do carrinho

O carrinho reutiliza a regra publica do catalogo como regra de produto compravel:

- `status = published`;
- `publishedAt <= now`;
- `stockQuantity > 0`.

Produtos `draft`, `inactive`, futuros, sem `publishedAt` ou sem estoque seguem fora da compra. A
pagina publica de produto ganhou action de adicionar ao carrinho apenas para produtos ja expostos
pelo storefront publico.
