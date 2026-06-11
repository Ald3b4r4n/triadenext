# Products / Admin Produtos e Imagens, Tarefas de Implementacao

> Sequencia executavel para reimplementar ou validar a subunidade `products/admin-produtos-imagens` a partir das specs extraidas. Nao representa alteracao aplicada no codigo atual.

## Pre-requisitos

- [ ] Layout admin e policy `requireAdminLike` estao implementados.
- [ ] Unit `products` fornece tipos, schemas, services e repository.
- [ ] Runtime mode informa banco/auth/guardrails sem expor secrets.
- [ ] `BLOB_READ_WRITE_TOKEN` e opcional e tratado como ausente de forma segura.
- [ ] Tabelas de produtos, categorias, imagens e relacionamento existem no schema.
- [ ] Testes podem mockar auth, Blob e repository sem chamadas reais.

## Tarefas

- [ ] T-PROD-ADM-01, Implementar pagina admin de listagem de produtos
  - Origem no sistema atual: `src/app/admin/produtos/page.tsx`
  - Criterio de pronto: pagina carrega produtos e runtime em paralelo, mostra intro, CTA `Novo produto`, avisos e tabela.
  - Confianca: 🟢

- [ ] T-PROD-ADM-02, Implementar avisos de runtime admin
  - Origem no sistema atual: `src/app/admin/produtos/page.tsx`, `src/lib/runtime-mode.ts`
  - Criterio de pronto: `databaseNotice` e `adminAuthNotice` sao exibidos sem secrets.
  - Confianca: 🟢

- [ ] T-PROD-ADM-03, Implementar tabela administrativa
  - Origem no sistema atual: `src/features/products/components/product-admin-table.tsx`
  - Criterio de pronto: tabela mostra nome, SKU, status, estoque, preco e link de edicao por produto.
  - Confianca: 🟢

- [ ] T-PROD-ADM-04, Implementar pagina de novo produto
  - Origem no sistema atual: `src/app/admin/produtos/novo/page.tsx`
  - Criterio de pronto: pagina carrega categorias/runtime e renderiza `ProductForm` com `createProductAction`.
  - Confianca: 🟢

- [ ] T-PROD-ADM-05, Implementar pagina de edicao de produto
  - Origem no sistema atual: `src/app/admin/produtos/[id]/editar/page.tsx`
  - Criterio de pronto: id existente renderiza `ProductForm` preenchido; id inexistente chama `notFound`.
  - Confianca: 🟢

- [ ] T-PROD-ADM-06, Implementar formulario administrativo
  - Origem no sistema atual: `src/features/products/components/product-form.tsx`
  - Criterio de pronto: formulario cobre dados principais, comercial, categorias/SEO, imagens, estado pending e mensagens por campo.
  - Confianca: 🟢

- [ ] T-PROD-ADM-07, Implementar inputs auxiliares de preco e status
  - Origem no sistema atual: `src/features/products/components/price-input.tsx`, `product-status-select.tsx`, `product-status-badge.tsx`
  - Criterio de pronto: preco exibe decimal a partir de centavos; status admin permite draft/published/inactive e badge renderiza label correto.
  - Confianca: 🟢

- [ ] T-PROD-ADM-08, Implementar actions protegidas de produto
  - Origem no sistema atual: `src/features/products/server/product-actions.ts`
  - Criterio de pronto: `createProductAction` e `updateProductAction` chamam `requireAdminLike` antes de schema/repository.
  - Confianca: 🟢

- [ ] T-PROD-ADM-09, Implementar conversao e validacao de FormData
  - Origem no sistema atual: `src/features/products/schemas.ts`
  - Criterio de pronto: FormData vira objeto normalizado, preco vira centavos, slug vazio vem do nome, published invalido falha.
  - Confianca: 🟢

- [ ] T-PROD-ADM-10, Implementar persistencia transacional de produto e categorias
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: create/update usam transacao e respeitam `assertCanMutateRealData`.
  - Confianca: 🟢

- [ ] T-PROD-ADM-11, Implementar revalidacao de rotas apos mutacao
  - Origem no sistema atual: `src/features/products/server/product-actions.ts`
  - Criterio de pronto: create/update revalidam admin, catalogo e pagina de edicao quando aplicavel.
  - Confianca: 🟢

- [ ] T-PROD-ADM-12, Implementar gerenciador visual de imagens
  - Origem no sistema atual: `src/features/products/components/product-image-manager.tsx`
  - Criterio de pronto: formulario lista imagens existentes, identifica capa/galeria e informa quando nenhuma imagem esta vinculada.
  - Confianca: 🟢

- [ ] T-PROD-ADM-13, Implementar schema de upload de imagem
  - Origem no sistema atual: `src/features/uploads/schemas.ts`
  - Criterio de pronto: aceita JPEG, PNG, WebP, limite 5 MB, `productId` obrigatorio e metadata opcional validada.
  - Confianca: 🟢

- [ ] T-PROD-ADM-14, Implementar upload service protegido
  - Origem no sistema atual: `src/features/uploads/product-image-upload.ts`
  - Criterio de pronto: `uploadProductImage` exige admin-like, valida arquivo, bloqueia sem Blob token e nao vaza secrets.
  - Confianca: 🟢

- [ ] T-PROD-ADM-15, Implementar persistencia de metadata de imagem
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: metadata e salva em transacao; `isCover=true` remove capa das demais imagens do produto.
  - Confianca: 🟢

- [ ] T-PROD-ADM-16, Manter input de upload desabilitado enquanto UI completa nao estiver pronta
  - Origem no sistema atual: `src/features/products/components/product-image-manager.tsx`
  - Criterio de pronto: input informa que upload completo depende de auth, Blob e persistencia ligados.
  - Confianca: 🟡

## Tarefas de Teste

- [ ] TT-PROD-ADM-01, Unit: action de create bloqueia antes de repository quando `requireAdminLike` falha.
- [ ] TT-PROD-ADM-02, Unit: action de update bloqueia antes de repository quando `requireAdminLike` falha.
- [ ] TT-PROD-ADM-03, Unit: schema admin rejeita produto published com estoque zero ou `publishedAt` futuro.
- [ ] TT-PROD-ADM-04, Unit: schema admin normaliza slug vazio e preco textual.
- [ ] TT-PROD-ADM-05, Unit: repository fixture retorna `dev_fallback` sem banco.
- [ ] TT-PROD-ADM-06, Unit: upload bloqueia sem `BLOB_READ_WRITE_TOKEN`.
- [ ] TT-PROD-ADM-07, Unit: upload rejeita tipo invalido.
- [ ] TT-PROD-ADM-08, Unit: upload rejeita arquivo acima de 5 MB.
- [ ] TT-PROD-ADM-09, Unit: metadata de imagem com `isCover=true` limpa capas anteriores em transacao.
- [ ] TT-PROD-ADM-10, Component: `ProductAdminTable` mostra nome, SKU, status, estoque, preco e link editar.
- [ ] TT-PROD-ADM-11, Component: `ProductForm` exibe paineis principais e mensagens de erro.
- [ ] TT-PROD-ADM-12, Component: `ProductImageManager` mostra estado vazio e imagens existentes.
- [ ] TT-PROD-ADM-13, E2E: `/admin/produtos` fica bloqueado sem auth real.
- [ ] TT-PROD-ADM-14, E2E: paginas admin nao executam mutacao real sem auth/banco configurados.

## Tarefas de Migracao de Dados

- [ ] TM-PROD-ADM-01, Mapear produtos legados para formulario admin
  - Origem no sistema atual: `_reversa_sdd/products/requirements.md`, `_reversa_sdd/data-dictionary.md`
  - Criterio de pronto: campos de nome, slug, SKU, preco, estoque, status, descricao e SEO possuem correspondencia ou default.
  - Confianca: 🔴

- [ ] TM-PROD-ADM-02, Mapear categorias ativas/inativas
  - Origem no sistema atual: `src/features/products/components/product-form.tsx`
  - Criterio de pronto: categorias inativas no legado nao ficam selecionaveis indevidamente no admin.
  - Confianca: 🔴

- [ ] TM-PROD-ADM-03, Migrar imagens e capa
  - Origem no sistema atual: `src/features/products/server/product-repository.ts`
  - Criterio de pronto: cada produto migrado tem no maximo uma capa e galeria ordenada.
  - Confianca: 🔴

- [ ] TM-PROD-ADM-04, Definir estrategia para historico de estoque
  - Origem no sistema atual: `_reversa_sdd/domain.md`
  - Criterio de pronto: decisao humana define se estoque inicial vem direto do legado ou de movimentacoes auditaveis futuras.
  - Confianca: 🔴

## Ordem Sugerida

1. Implementar/listar services admin e avisos de runtime.
2. Implementar tabela admin.
3. Implementar paginas novo/editar.
4. Implementar ProductForm e componentes auxiliares.
5. Implementar schema/admin actions protegidas.
6. Implementar repository transacional de create/update.
7. Implementar schema e service de upload.
8. Implementar metadata de imagem e capa unica.
9. Cobrir unitarios de action/schema/upload.
10. Cobrir componentes e E2E admin bloqueado.
11. Habilitar UI de upload apenas quando auth, Blob e persistencia estiverem prontos.

## Lacunas Pendentes (🔴)

- Delete, reorder e troca de capa por UI ainda nao estao documentados como fluxo completo.
- Historico auditavel de alteracoes de produto/estoque ainda nao existe.
- Integracao ERP/Bling/fiscal para produtos ainda nao existe.
- Upload UI continua desabilitado ate decisao/implementacao de habilitacao segura.
