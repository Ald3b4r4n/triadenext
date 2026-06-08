# Actions: Fase 3 - Neon, Drizzle, migrations locais, seed controlado e persistencia real

> Identificador: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`  
> Roadmap: `_reversa_forward/001-fase-3-neon-drizzle/roadmap.md`

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de acoes | 53 |
| Paralelizaveis (`[//]`) | 18 |
| Maior cadeia de dependencia | 14 |

## Fase 1, Preparacao e seguranca

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-001 | Mapear modo de runtime | Criar/ajustar contrato para saber se ha banco, Blob token e ambiente seguro sem expor valores. | `src/lib/env.ts`, `src/lib/runtime-mode.ts` | - | code | - | Codigo expoe apenas flags/estados seguros, nunca secrets. | medio | 🟢 | `[X]` |
| F3-002 | Definir guardrail de mutacao admin | Criar regra reutilizavel que permita mutacao real apenas em desenvolvimento/local-dev ate auth/policies. | `src/lib/runtime-mode.ts`, `src/features/products/server/*` | F3-001 | code | - | Preview/producao sem auth retornam bloqueio para mutacoes reais. | alto | 🟢 | `[X]` |
| F3-003 | Padronizar mensagens de fallback | Centralizar textos para `dev_fallback`, banco ausente, bloqueio de ambiente e Blob ausente. | `src/features/products/server/*`, `src/features/uploads/*` | F3-001 | code | `[//]` | Mensagens nao prometem persistencia real e nao exibem secrets. | medio | 🟢 | `[X]` |
| F3-004 | Inspecionar pontos de UI admin que exibem status | Identificar onde o aviso de modo sem banco deve aparecer sem ainda alterar comportamento de persistencia. | `src/app/admin/produtos/page.tsx`, `src/app/admin/produtos/novo/page.tsx`, `src/app/admin/produtos/[id]/editar/page.tsx` | F3-001 | code | `[//]` | Pontos de insercao definidos e compatíveis com estado atual. | baixo | 🟢 | `[X]` |

## Fase 2, Banco e configuracao Drizzle

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-005 | Revisar configuracao Drizzle segura | Ajustar `drizzle.config.ts` para generate/migrate com comportamento claro sem expor secrets. | `drizzle.config.ts` | F3-001 | config | - | `db:generate` continua possivel localmente; migrate nao fica implicitamente direcionado a producao. | alto | 🟢 | `[X]` |
| F3-006 | Revisar client de banco opcional | Garantir que `src/db/client.ts` nao quebra build/test sem `DATABASE_URL` e nao loga credenciais. | `src/db/client.ts` | F3-001 | code | - | Sem `DATABASE_URL`, `db` permanece `null`; com URL, cria client Neon/Drizzle. | medio | 🟢 | `[X]` |
| F3-007 | Revisar indices e uniques de categorias/produtos | Ajustar schema para `categories.slug`, `products.slug`, `products.sku` e indices de catalogo. | `src/db/schema.ts` | F3-005 | code | - | Schema expressa unicidade/indices necessarios para catalogo. | medio | 🟢 | `[X]` |
| F3-008 | Revisar constraints de imagens e vinculos | Ajustar schema de `product_images` e `product_categories` para consistencia de capa, ordenacao e N:N. | `src/db/schema.ts` | F3-007 | code | - | Schema preserva unique N:N e indica estrategia para uma capa por produto. | medio | 🟡 | `[X]` |
| F3-009 | Documentar redundancia de preco | Decidir/documentar papel de `price` decimal versus `priceCents` sem mudar regra de centavos. | `src/db/schema.ts`, `docs/architecture/database.md` | F3-007 | docs | `[//]` | Plano de schema deixa claro que dominio usa centavos. | medio | 🟢 | `[X]` |

## Fase 3, Migrations locais

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-010 | Preparar geracao de migration local | Executar somente a preparacao/configuracao necessaria para que `db:generate` produza arquivos locais. | `drizzle.config.ts`, `drizzle/` | F3-005, F3-007, F3-008 | config | - | Arquivos de migration podem ser gerados localmente quando tecnicamente possivel; nada e aplicado. | medio | 🟢 | `[X]` |
| F3-011 | Revisar migration gerada | Conferir SQL gerado para catalogo, imagens, indices e constraints antes de qualquer uso. | `drizzle/` | F3-010 | validation | - | Migration nao contem operacao destrutiva inesperada nem alvo de producao. | alto | 🟢 | `[X]` |
| F3-012 | Registrar pendencia se generate exigir conexao | Se Drizzle exigir `DATABASE_URL`, documentar pendencia clara sem conectar banco real. | `docs/operations/database-migrations.md` | F3-010 | docs | `[//]` | Pendencia operacional registrada quando aplicavel. | baixo | 🟢 | `[X]` |
| F3-013 | Garantir scripts de banco existentes | Conferir/manter `db:generate`, `db:migrate`, `db:studio` e preparar espaco para `db:seed`. | `package.json` | F3-005 | config | `[//]` | Scripts exigidos existem; nenhum script roda producao automaticamente. | medio | 🟢 | `[X]` |

## Fase 4, Seed controlado

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-014 | Criar estrutura do seed | Criar script de seed de desenvolvimento sem dados reais e sem execucao automatica. | `src/db/seed.ts` ou `scripts/db/seed.ts` | F3-006, F3-007, F3-008 | code | - | Script existe e importa schema/client de forma segura. | medio | 🟢 | `[X]` |
| F3-015 | Implementar falha segura sem DATABASE_URL | Fazer seed encerrar com mensagem segura quando `DATABASE_URL` estiver ausente. | `src/db/seed.ts` ou `scripts/db/seed.ts` | F3-014 | code | - | Sem banco, seed nao tenta conectar e nao expoe secrets. | alto | 🟢 | `[X]` |
| F3-016 | Criar dados ficticios de categorias | Seed deve criar categorias ficticias ativas/inativas com slugs estaveis. | `src/db/seed.ts` ou `scripts/db/seed.ts` | F3-014 | code | - | Categorias sao claramente dev e reexecutaveis/idempotentes. | medio | 🟢 | `[X]` |
| F3-017 | Criar produtos ficticios de paridade | Seed deve cobrir publicado, draft, futuro, sem estoque e inactive. | `src/db/seed.ts` ou `scripts/db/seed.ts` | F3-016 | code | - | Dados cobrem todos os estados de paridade publica. | medio | 🟢 | `[X]` |
| F3-018 | Criar imagens placeholder no seed | Seed deve criar metadata de imagens placeholder sem copiar Laravel. | `src/db/seed.ts` ou `scripts/db/seed.ts` | F3-017 | code | - | Imagens usam URL/path ficticio claramente marcado como dev. | medio | 🟢 | `[X]` |
| F3-019 | Adicionar script db:seed | Adicionar `pnpm db:seed` ao `package.json`. | `package.json` | F3-014 | config | `[//]` | `package.json` contem `db:seed`; script nao roda automaticamente. | baixo | 🟢 | `[X]` |

## Fase 5, Repository e persistencia

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-020 | Criar mapeadores de categorias | Converter rows Drizzle de `categories` para tipo `Category`. | `src/features/products/server/product-repository.ts` | F3-006, F3-007 | code | - | Datas, flags e campos opcionais chegam no formato de dominio. | medio | 🟢 | `[X]` |
| F3-021 | Criar mapeadores de imagens | Converter rows Drizzle de `product_images` para tipo `ProductImage`. | `src/features/products/server/product-repository.ts` | F3-008, F3-020 | code | - | Galeria preserva `isCover`, `sortOrder` e metadata. | medio | 🟢 | `[X]` |
| F3-022 | Criar mapeadores de produtos | Converter rows Drizzle de `products` para tipo `Product`, incluindo categorias/imagens. | `src/features/products/server/product-repository.ts` | F3-020, F3-021 | code | - | Produto de dominio fica completo para admin/storefront. | alto | 🟢 | `[X]` |
| F3-023 | Implementar listagem admin real | Fazer `listProducts` usar Drizzle quando `db` existir. | `src/features/products/server/product-repository.ts` | F3-022 | code | - | Com banco, listagem vem de `products`; sem banco, fixtures. | alto | 🟢 | `[X]` |
| F3-024 | Implementar busca real por id | Fazer `findProductById` consultar Drizzle e retornar produto completo. | `src/features/products/server/product-repository.ts` | F3-022 | code | `[//]` | Admin edicao carrega produto real por id. | medio | 🟢 | `[X]` |
| F3-025 | Implementar busca real por slug | Fazer `findProductBySlug` consultar Drizzle por slug normalizado. | `src/features/products/server/product-repository.ts` | F3-022 | code | `[//]` | Storefront produto usa dado real por slug quando banco existe. | medio | 🟢 | `[X]` |
| F3-026 | Implementar listagem real de categorias | Fazer `listCategories` consultar Drizzle e ordenar de forma estavel. | `src/features/products/server/product-repository.ts` | F3-020 | code | `[//]` | Admin lista categorias reais quando banco existe. | medio | 🟢 | `[X]` |
| F3-027 | Tornar criacao de produto transacional | Ajustar `createProduct` para produto + categorias em transacao e erro real sem fallback silencioso. | `src/features/products/server/product-repository.ts` | F3-022, F3-023, F3-026 | code | - | Produto e vinculos persistem juntos ou falham juntos. | alto | 🟡 | `[X]` |
| F3-028 | Tornar edicao de produto transacional | Ajustar `updateProduct` para atualizar produto e substituir categorias em transacao. | `src/features/products/server/product-repository.ts` | F3-027 | code | - | Edicao nao deixa vinculos duplicados/orfaos. | alto | 🟡 | `[X]` |
| F3-029 | Implementar listagem de imagens por produto | Adicionar metodo para listar imagens reais ordenadas por produto. | `src/features/products/server/product-repository.ts` | F3-021, F3-022 | code | - | Produto admin/publico recebe galeria ordenada. | medio | 🟢 | `[X]` |
| F3-030 | Implementar persistencia de metadata de imagem | Adicionar metodo para salvar metadata em `product_images` apos upload real. | `src/features/products/server/product-repository.ts` | F3-029 | code | - | Metadata so persiste com banco e dados de upload validos. | alto | 🟢 | `[X]` |
| F3-031 | Preservar fallback fixture isolado | Garantir que fallback so roda sem `DATABASE_URL` e nunca mascara erro real. | `src/features/products/server/product-repository.ts` | F3-023, F3-024, F3-025, F3-026, F3-027, F3-028, F3-030 | code | - | Com `db !== null`, excecoes Drizzle nao viram fixtures. | alto | 🟢 | `[X]` |

## Fase 6, Integracao admin e storefront

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-032 | Propagar estados no service | Ajustar services para expor/propagar `persisted`, `dev_fallback` e `blocked` sem quebrar chamadas existentes. | `src/features/products/server/product-service.ts` | F3-031, F3-002 | code | - | Services refletem resultado real do repository. | medio | 🟢 | `[X]` |
| F3-033 | Ajustar actions admin para bloqueio/fallback | Fazer actions retornarem mensagens coerentes para persistido, fallback e ambiente bloqueado. | `src/features/products/server/product-actions.ts` | F3-032 | code | - | UI nao trata fallback/bloqueio como gravacao real indistinta. | alto | 🟢 | `[X]` |
| F3-034 | Exibir aviso de modo sem banco no admin | Mostrar aviso claro em listagem, novo e edicao quando sem `DATABASE_URL`. | `src/app/admin/produtos/page.tsx`, `src/app/admin/produtos/novo/page.tsx`, `src/app/admin/produtos/[id]/editar/page.tsx` | F3-004, F3-032 | code | - | Admin comunica ausencia de persistencia real. | medio | 🟢 | `[X]` |
| F3-035 | Exibir aviso de admin sem auth em modo real | Mostrar aviso de painel nao protegido quando banco real estiver em desenvolvimento. | `src/app/admin/produtos/page.tsx`, `src/app/admin/produtos/novo/page.tsx`, `src/app/admin/produtos/[id]/editar/page.tsx` | F3-002, F3-034 | code | - | Admin indica que auth/policies ainda sao pendencia de producao. | medio | 🟢 | `[X]` |
| F3-036 | Conferir storefront com dados reais/fallback | Garantir paginas `/produtos` e `/produto/[slug]` consomem service sem bypass. | `src/app/(storefront)/produtos/page.tsx`, `src/app/(storefront)/produto/[slug]/page.tsx` | F3-023, F3-025, F3-032 | code | `[//]` | Storefront funciona com banco e sem banco via service. | medio | 🟢 | `[X]` |

## Fase 7, Upload metadata

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-037 | Integrar upload com persistencia de metadata | Conectar resultado `uploaded` ao metodo de persistencia em `product_images`. | `src/features/uploads/product-image-upload.ts`, `src/features/products/server/product-repository.ts` | F3-030 | code | - | Metadata e salva somente apos upload real bem-sucedido. | alto | 🟢 | `[X]` |
| F3-038 | Preservar bloqueio sem Blob token | Garantir que fluxo sem `BLOB_READ_WRITE_TOKEN` nao tenta Blob nem metadata. | `src/features/uploads/product-image-upload.ts` | F3-037 | code | - | Resultado `blocked/missing_blob_token` permanece seguro. | alto | 🟢 | `[X]` |
| F3-039 | Preservar validacoes de tipo e tamanho | Garantir que tipos aceitos e limite de 5 MB continuam validados. | `src/features/uploads/schemas.ts`, `src/features/uploads/product-image-upload.ts` | F3-037 | test | `[//]` | JPEG/PNG/WebP ate limite passam; invalidos falham. | medio | 🟢 | `[X]` |

## Fase 8, Testes

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-040 | Testar fallback sem DATABASE_URL | Cobrir repository/service em modo sem banco e mutacoes `dev_fallback`. | `src/features/products/**/*.test.ts` | F3-031, F3-032 | test | `[//]` | Sem banco, fixtures e mensagens de fallback funcionam. | medio | 🟢 | `[X]` |
| F3-041 | Testar erro real nao vira fixture | Cobrir caminho com `DATABASE_URL`/db presente e falha Drizzle propagada. | `src/features/products/**/*.test.ts` | F3-031 | test | `[//]` | Falha real nao retorna fixture nem `dev_fallback`. | alto | 🟢 | `[X]` |
| F3-042 | Testar regras publicas de produto | Cobrir published/passado/estoque e negativos draft/futuro/sem estoque/inactive. | `src/features/products/**/*.test.ts` | F3-022, F3-032 | test | `[//]` | Paridade publica preservada. | alto | 🟢 | `[X]` |
| F3-043 | Testar seed e scripts | Cobrir `db:seed` sem `DATABASE_URL` e existencia dos scripts de banco. | `src/db/**/*.test.ts`, `package.json` | F3-015, F3-019 | test | `[//]` | Seed falha com mensagem segura sem banco; scripts existem. | medio | 🟢 | `[X]` |
| F3-044 | Testar admin e storefront sem banco | Cobrir paginas em modo fallback e mensagens de persistencia. | `tests/e2e/*`, `src/app/**/__tests__/*` | F3-034, F3-036 | test | - | Admin/storefront carregam sem banco e admin nao promete salvamento real. | medio | 🟢 | `[X]` |
| F3-045 | Testar guardrail e upload sem token | Cobrir bloqueio de mutacao fora de dev e upload sem Blob token. | `src/features/products/**/*.test.ts`, `src/features/uploads/**/*.test.ts` | F3-033, F3-038, F3-039 | test | - | Preview/producao bloqueiam mutacao; upload sem token bloqueia sem metadata. | alto | 🟢 | `[X]` |

## Fase 9, Documentacao

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-046 | Atualizar docs de banco, Neon e env | Documentar migrations, seed, local-dev, preview/producao, variaveis e guardrails sem secrets. | `docs/architecture/database.md`, `docs/operations/neon.md`, `docs/operations/env.md`, `docs/operations/database-migrations.md`, `docs/operations/seed.md` | F3-011, F3-019, F3-031 | docs | `[//]` | Docs explicam fluxo seguro sem expor credenciais. | medio | 🟢 | `[X]` |
| F3-047 | Atualizar docs de catalogo/admin/uploads | Documentar persistencia real, fallback, admin sem auth, imagens placeholder e migracao real posterior. | `docs/features/admin-products.md`, `docs/features/catalog-products-images.md`, `docs/features/product-persistence.md`, `docs/architecture/uploads.md` | F3-034, F3-037, F3-045 | docs | `[//]` | Docs refletem comportamento implementado e fora de escopo. | medio | 🟢 | `[X]` |

## Fase 10, Validacoes finais e commit local opcional

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F3-048 | Rodar lint | Validar padroes estaticos com `pnpm lint`. | n/a | F3-040, F3-041, F3-042, F3-043, F3-044, F3-045, F3-046, F3-047 | validation | - | Lint passa sem warnings bloqueantes. | medio | 🟢 | `[X]` |
| F3-049 | Rodar typecheck | Validar tipos com `pnpm typecheck`. | n/a | F3-048 | validation | - | Typecheck passa. | medio | 🟢 | `[X]` |
| F3-050 | Rodar testes unitarios | Validar suite com `pnpm test`. | n/a | F3-049 | validation | - | Testes passam sem banco real obrigatorio. | medio | 🟢 | `[X]` |
| F3-051 | Rodar build | Validar build com `pnpm build`. | n/a | F3-050 | validation | - | Build passa sem `DATABASE_URL` obrigatorio. | alto | 🟢 | `[X]` |
| F3-052 | Rodar e2e | Validar fluxo com `pnpm test:e2e`. | n/a | F3-051 | validation | - | E2E passa em modo seguro sem banco real obrigatorio. | medio | 🟢 | `[X]` |
| F3-053 | Commit local opcional | Criar commit local somente se usuario autorizar e todas as validacoes passarem. | n/a | F3-052 | validation | - | Nenhum commit e criado sem confirmacao humana explicita; nunca faz push. | baixo | 🟢 | `[X]` |

## Dependencias criticas

- F3-001 bloqueia guardrails, fallback e modo de runtime.
- F3-005 a F3-008 bloqueiam migrations e repository Drizzle real.
- F3-020 a F3-022 bloqueiam todas as leituras reais.
- F3-031 bloqueia integracao segura com admin/storefront e testes de erro real.
- F3-033 a F3-035 bloqueiam a promessa correta de persistencia no admin.
- F3-037 a F3-038 bloqueiam persistencia segura de metadata de imagem.
- F3-040 a F3-045 bloqueiam validacoes finais.

## Riscos principais

- Migration aplicada contra banco errado.
- Fallback mascarar erro real quando `DATABASE_URL` existe.
- Admin sem auth persistir fora de desenvolvimento.
- Seed duplicar dados ou parecer producao.
- Metadata de imagem persistida sem Blob real.
- Build/test passarem a exigir banco real por acidente.

## Notas de execucao

- Nao rodar migrations contra banco real sem validacao humana explicita.
- Nao conectar banco de producao.
- Nao copiar `.env` do Laravel.
- Nao usar imagens reais do legado.
- Nao fazer deploy, dominio ou push.
- `F3-053` e opcional e exige confirmacao humana explicita.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-08 | Versao inicial gerada por `/reversa-to-do` | reversa |
