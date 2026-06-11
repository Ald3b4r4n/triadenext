# Products / Admin Produtos e Imagens

> Spec executavel da subunidade `products/admin-produtos-imagens`. Foca no QUE a administracao de produtos e imagens deve garantir.

## Visao Geral

Esta subunidade cobre a superficie administrativa de catalogo: listagem de produtos, criacao, edicao, validacao de dados comerciais, categorias, SEO, mensagens de runtime, upload/metadata de imagens e guardrails de auth, banco e Blob. Ela nao define a vitrine publica, exceto pelos efeitos que os dados administrativos causam nela.

## Responsabilidades

- Listar produtos administrativos com status, SKU, estoque, preco e acao de edicao.
- Exibir avisos de runtime sobre banco/auth para administradores.
- Criar produto por formulario validado.
- Editar produto existente por id.
- Bloquear criacao/edicao quando `requireAdminLike` nao permitir.
- Validar produto publicado antes de permitir estado publico.
- Associar categorias ativas ao produto.
- Manter campos comerciais, SEO, marca, inspiracao, genero, concentracao e volume.
- Exibir imagens vinculadas e indicar capa/galeria.
- Validar upload real de imagem por tipo e tamanho.
- Bloquear upload real sem `BLOB_READ_WRITE_TOKEN`, banco/auth ou guardrail de ambiente.
- Persistir metadata de imagem quando upload real e persistencia estiverem habilitados.

## Regras de Negocio

- 🟢 Superficie `/admin/produtos` exige layout admin protegido por `requireAdminLike`.
- 🟢 Actions de produto devem chamar `requireAdminLike` antes de validar ou persistir.
- 🟢 Produto publicado exige nome, slug, SKU, preco positivo, estoque positivo e `publishedAt <= now`.
- 🟢 Slug vazio no formulario e gerado pelo nome.
- 🟢 Preco, preco comparativo e custo sao convertidos para centavos.
- 🟢 Categorias inativas aparecem desabilitadas no picker.
- 🟢 Criacao/edicao real exige `assertCanMutateRealData`.
- 🟢 Sem `DATABASE_URL`, formularios podem validar mas repository retorna `dev_fallback`, sem persistencia real.
- 🟢 Edicao de id inexistente deve resultar em `notFound`.
- 🟢 Upload de imagem exige admin-like antes da validacao/persistencia.
- 🟢 Imagem aceita apenas JPEG, PNG ou WebP.
- 🟢 Imagem tem limite maximo de 5 MB.
- 🟢 Sem `BLOB_READ_WRITE_TOKEN`, upload real retorna bloqueio seguro.
- 🟢 Metadata de imagem com `isCover=true` deve remover capa das demais imagens do produto antes de inserir a nova.
- 🟡 O input de upload no formulario admin atual aparece desabilitado ate auth, Blob e persistencia estarem ligados.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-PROD-ADM-01 | Renderizar listagem admin de produtos. | Must | `/admin/produtos` mostra heading `Produtos`, CTA `Novo produto`, avisos de runtime e tabela administrativa. |
| RF-PROD-ADM-02 | Exibir linhas administrativas. | Must | Cada produto mostra nome, SKU, status visual, estoque, preco e link `Editar`. |
| RF-PROD-ADM-03 | Renderizar formulario de novo produto. | Must | `/admin/produtos/novo` lista categorias, avisos de runtime e `ProductForm` com action de criacao. |
| RF-PROD-ADM-04 | Renderizar formulario de edicao. | Must | `/admin/produtos/[id]/editar` carrega produto, categorias, avisos e action de update; id inexistente retorna `notFound`. |
| RF-PROD-ADM-05 | Bloquear action sem admin-like. | Must | Se `requireAdminLike` nao for `allowed`, create/update retornam erro de policy e nao persistem. |
| RF-PROD-ADM-06 | Validar payload admin. | Must | FormData invalido retorna `ProductActionState.error` com erros por campo. |
| RF-PROD-ADM-07 | Rejeitar publicacao invalida. | Must | Produto `published` sem campos minimos, estoque positivo ou data vigente retorna erro em `status`. |
| RF-PROD-ADM-08 | Persistir produto e categorias. | Should | Em runtime apto, create/update grava produto e associacoes de categoria em transacao. |
| RF-PROD-ADM-09 | Revalidar rotas apos mutacao. | Should | Create/update revalidam `/admin/produtos`, `/produtos` e pagina de edicao quando aplicavel. |
| RF-PROD-ADM-10 | Exibir gerenciador de imagens. | Should | Formulario mostra imagens existentes, estado vazio e labels `Capa`/`Galeria`. |
| RF-PROD-ADM-11 | Validar upload de imagem. | Should | Arquivo ausente, tipo invalido ou maior que 5 MB retorna `rejected/invalid_file`. |
| RF-PROD-ADM-12 | Bloquear upload sem Blob token. | Must | Sem `BLOB_READ_WRITE_TOKEN`, retorna `blocked/missing_blob_token` com mensagem segura. |
| RF-PROD-ADM-13 | Persistir metadata de upload. | Should | Upload real cria blob publico e salva metadata no repository; capa unica e preservada. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Admin product actions bloqueiam antes de schema/repository. | `src/features/products/server/product-actions.ts` | 🟢 |
| Seguranca | Upload de imagem tambem exige admin-like. | `src/features/uploads/product-image-upload.ts` | 🟢 |
| Integridade | Create/update de produto/categorias e metadata de capa usam transacao. | `src/features/products/server/product-repository.ts` | 🟢 |
| Compatibilidade | Sem banco, admin comunica fallback e nao grava persistencia real. | `src/app/admin/produtos/*.tsx`, `product-repository.ts` | 🟢 |
| Privacidade | Mensagens de bloqueio nao expõem secrets. | `src/lib/runtime-mode.ts`, `product-image-upload.ts` | 🟢 |
| Usabilidade | Formulario organiza dados principais, comercial, categorias/SEO e imagens. | `src/features/products/components/product-form.tsx` | 🟢 |
| Segurança de arquivo | Upload restringe tipo e tamanho antes de enviar ao Blob. | `src/features/uploads/schemas.ts` | 🟢 |

> Inferido a partir das paginas admin de produtos, formulario, actions, repository, upload service e schemas.

## Criterios de Aceitacao

```gherkin
Cenario: admin lista produtos
  Dado usuario admin-like autorizado
  Quando acessa "/admin/produtos"
  Entao ve tabela administrativa com produto, status, estoque, preco e link de edicao

Cenario: visitante ou customer tenta salvar produto
  Dado policy admin-like diferente de allowed
  Quando createProductAction ou updateProductAction e chamada
  Entao retorna erro com policyMessage
  E nao chama repository de persistencia

Cenario: admin tenta publicar produto invalido
  Dado status "published"
  E estoque zero ou publishedAt futuro
  Quando productFormSchema valida o FormData
  Entao retorna erro em status

Cenario: upload sem Blob token
  Dado usuario admin-like autorizado
  E BLOB_READ_WRITE_TOKEN ausente
  Quando uploadProductImage e chamado
  Entao retorna blocked/missing_blob_token
  E nao envia arquivo real

Cenario: upload invalido
  Dado arquivo de tipo nao permitido ou maior que 5 MB
  Quando uploadProductImage valida o input
  Entao retorna rejected/invalid_file
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Bloqueio admin-like antes de mutacoes | Must | Protege catalogo e persistencia. |
| Validacao de produto publicado | Must | Impede vazamento de produto publico invalido. |
| Listagem/criacao/edicao admin | Must | Base operacional do catalogo. |
| Fallback sem banco claro | Must | Evita falsa persistencia em dev/test. |
| Upload com tipo/tamanho/token | Must | Evita upload inseguro ou real sem credencial. |
| Persistencia de imagens/metadata | Should | Necessaria para catalogo visual completo. |
| Upload UI habilitado no formulario | Could | Atual esta desabilitado ate integrações completas. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/admin/produtos/page.tsx` | `AdminProdutosPage`, `AdminRuntimeNotices` | 🟢 |
| `src/app/admin/produtos/novo/page.tsx` | `NovoProdutoPage` | 🟢 |
| `src/app/admin/produtos/[id]/editar/page.tsx` | `EditarProdutoPage` | 🟢 |
| `src/features/products/components/product-admin-table.tsx` | `ProductAdminTable` | 🟢 |
| `src/features/products/components/product-form.tsx` | `ProductForm` | 🟢 |
| `src/features/products/components/product-image-manager.tsx` | `ProductImageManager` | 🟢 |
| `src/features/products/server/product-actions.ts` | `createProductAction`, `updateProductAction` | 🟢 |
| `src/features/products/schemas.ts` | `productFormSchema`, `productFormDataToObject` | 🟢 |
| `src/features/products/server/product-service.ts` | `listAdminProducts`, `getAdminProductById`, `listProductCategories`, `getProductRuntimeMode` | 🟢 |
| `src/features/products/server/product-repository.ts` | `createProduct`, `updateProduct`, `saveProductImageMetadata` | 🟢 |
| `src/features/uploads/product-image-upload.ts` | `uploadProductImage` | 🟢 |
| `src/features/uploads/schemas.ts` | `productImageUploadSchema` | 🟢 |

## Lacunas e Riscos

- 🟡 Input de upload no formulario esta desabilitado; service real existe, mas UI completa ainda precisa habilitacao controlada.
- 🟡 `dev_fallback` pode parecer sucesso se a mensagem nao for exibida claramente.
- 🟡 Nao ha delete/reordenacao de imagens documentada nesta superficie.
- 🔴 Nao ha historico auditavel de alteracoes de produto/estoque.
- 🔴 Nao ha integracao ERP/Bling para sincronizacao de catalogo ou fiscal.
