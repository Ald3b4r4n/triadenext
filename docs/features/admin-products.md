# Admin de Produtos

## Escopo

- Listagem administrativa em `/admin/produtos`.
- Tela de criacao em `/admin/produtos/novo`.
- Tela de edicao em `/admin/produtos/[id]/editar`.
- Formulario com campos principais de produto, preco, estoque, status, categorias e SEO.
- Validacao com Zod e server actions.
- Repository preparado para Drizzle/Neon.
- Upload de imagens preparado e validado, sem binario no banco.

## Regras herdadas do legado

- Produto publico exige `published`, `publishedAt <= now` e `stockQuantity > 0`.
- Produto `draft` nao aparece publicamente.
- Produto futuro nao aparece publicamente.
- Produto sem estoque nao aparece como disponivel.
- `inactive` segue como inativo/arquivado provisório, pendente validacao humana.
- Slug deve ser normalizado.
- Precos sao armazenados em centavos.
- Imagem de capa usa `isCover`.

## Como o admin cria e edita produto

O formulario envia `FormData` para server actions em
`src/features/products/server/product-actions.ts`.

As actions:

1. convertem os dados de formulario;
2. validam com `productFormSchema`;
3. normalizam slug;
4. convertem precos reais para centavos;
5. bloqueiam `published` sem dados essenciais;
6. chamam o repository;
7. revalidam rotas administrativas e publicas.

Autenticacao real ainda nao existe. A protecao de admin fica documentada como pendencia; esta fase
nao cria falsa seguranca.

## Persistencia preparada e real

`product-repository.ts` contem caminho Drizzle para criar/atualizar `products` e
`product_categories`. Na Fase 3, o mesmo repository tambem lista produtos/categorias reais, busca
por `id`/`slug`, hidrata categorias/imagens e salva metadata em `product_images`.

Sem `DATABASE_URL`, usa fixtures e retorna `dev_fallback`, indicando que a mutacao foi validada mas
nao gravada em banco real. Com `DATABASE_URL`, excecoes Drizzle propagam; nao ha fallback silencioso
de erro real.

Nenhuma migration foi aplicada contra banco real.

## Upload preparado

`product-image-upload.ts` valida:

- `image/jpeg`;
- `image/png`;
- `image/webp`;
- limite de 5 MB.

Sem `BLOB_READ_WRITE_TOKEN`, o resultado e `blocked/missing_blob_token`. A metadata esta pronta para
persistencia em `product_images`, mas o binario nunca entra no banco.

## Avisos no admin

As paginas `/admin/produtos`, `/admin/produtos/novo` e `/admin/produtos/[id]/editar` exibem aviso
quando estao em modo sem banco. Quando ha banco real em desenvolvimento, exibem tambem aviso de que
auth/policies reais ainda pertencem a Fase 4.

## Limitacoes sem Neon

- Criacao e edicao nao persistem em banco real.
- Listas usam fixtures temporarias.
- Relacionamento de categorias e imagens usa fixtures.

## Limitacoes sem Blob token

- Upload real fica bloqueado.
- UI de imagem fica como gestor visual/desabilitado.
- Testes validam rejeicao e bloqueio sem executar upload real.

## Testes de paridade

- Validacao do formulario de produto.
- Conversao de preco para centavos.
- Slug normalizado.
- Produto futuro, sem estoque e inativo nao publico.
- Upload sem token bloqueado.
- Upload rejeita tipo invalido.
- Upload rejeita arquivo acima de 5 MB.
- Playwright valida listagem admin, novo produto e edicao com fixture.

## Pendencias para Fase 4

- Autenticacao/policy real para admin.
