# Requirements: Fase 3 - Neon, Drizzle, migrations locais, seed controlado e persistencia real

> Identificador: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`  
> Pasta da extracao reversa: `_reversa_sdd/`  
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DOUBT

## 1. Resumo executivo

A Fase 3 deve conectar o projeto Next.js real ao caminho Neon/Drizzle para produtos, categorias e imagens, substituindo fixtures por persistencia real quando `DATABASE_URL` existir. A entrega deve preservar fallback explicito e seguro quando o banco estiver ausente, sem fingir gravacao. A fase tambem deve preparar migrations locais revisadas, seed de desenvolvimento controlado, scripts operacionais de banco e documentacao de operacao. Nao fazem parte desta fase checkout, pagamento, frete, cupom, pedidos, deploy, dominio, commit ou push.

## 2. Contexto a partir do legado e do projeto atual

| Fonte | Trecho relevante | Confidencia |
|-------|------------------|-------------|
| `_reversa_sdd/inventory.md#Fase 1 - Catalogo, Produto e Imagens` | O projeto atual ja implementa catalogo, produto, imagens, regras publicas, fallback por fixtures e metadados preparados para `product_images`. | 🟢 |
| `_reversa_sdd/inventory.md#Fase 2 - Admin de Produtos` | O admin ja possui listagem, novo/edicao, formulario, actions, repository preparado, upload controlado e `dev_fallback` sem `DATABASE_URL`. | 🟢 |
| `_reversa_sdd/inventory.md#Guardrails da Fase 3` | A fase nao deve rodar migrations contra banco real sem validacao humana, expor credenciais, fazer upload real sem token Blob ou remover fallback seguro. | 🟢 |
| `docs/architecture/database.md#Fase 2 - Persistencia Preparada` | O repository contem contratos e caminho parcial Drizzle, mas leituras ainda usam fixtures e mutacoes sem banco retornam `dev_fallback`. | 🟢 |
| `docs/features/catalog-products-images.md#Regras herdadas do legado` | Produto publico exige `published`, `publishedAt <= now`, estoque positivo, slug, capa por `isCover` e metadados de imagem no banco. | 🟢 |
| `docs/features/admin-products.md#Pendencias para Fase 3` | A proxima fase deve entregar conexao real Neon/Drizzle, migrations locais, seed controlado e persistencia real. | 🟢 |
| `docs/operations/neon.md#Neon` | Neon Postgres e o banco alvo, mas migrations contra banco real exigem validacao humana. | 🟢 |
| `docs/operations/env.md#Environment` | `.env.example` nao contem segredos e `src/lib/env.ts` aceita valores ausentes para nao quebrar build local. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\database-plan.md#products` | O destino legado->novo define produtos com slug, sku, status, estoque, precos, publicacao e campos administrativos. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\uploads-plan.md#Imagens de Produto` | Imagens devem ir para Blob, enquanto o banco persiste apenas metadata, capa e ordenacao. | 🟢 |

## 3. Objetivo

Entregar os requisitos para que a futura implementacao da Fase 3:

1. habilite persistencia real em Neon/Drizzle para produtos, categorias, vinculos e imagens quando `DATABASE_URL` existir;
2. mantenha fallback seguro, transparente e sem falsa persistencia quando `DATABASE_URL` estiver ausente;
3. prepare migrations locais revisadas e seed controlado de desenvolvimento;
4. preserve as regras de dominio herdadas do legado e ja implementadas nas Fases 1 e 2;
5. documente operacao, variaveis de ambiente, comandos e limites de seguranca.

## 4. Personas e cenarios de uso

| Persona | Objetivo | Cenario-chave |
|---------|----------|---------------|
| Administrador da loja | Criar, editar e consultar produtos reais no admin | Com `DATABASE_URL` configurado, um produto salvo no admin aparece nas leituras administrativas e, quando publico, no storefront. |
| Operador tecnico | Preparar banco local/dev com schema e dados controlados | Executa scripts de geracao, migracao e seed sem expor segredos e sem atingir producao por engano. |
| Visitante da loja | Ver apenas produtos publicos disponiveis | A vitrine lista somente produtos publicados, ja liberados por data e com estoque positivo. |
| Desenvolvedor local | Rodar build, testes e e2e sem credenciais reais | Sem `DATABASE_URL` e sem `BLOB_READ_WRITE_TOKEN`, o sistema continua funcional em fallback explicito. |

## 5. Escopo

1. Revisar `drizzle.config.ts` para suportar geracao/migrations locais sem segredos expostos e sem obrigar conexao real para build/test.
2. Revisar `src/db/client.ts` para manter `db === null` quando `DATABASE_URL` estiver ausente e conectar apenas quando houver string valida.
3. Revisar `src/db/schema.ts` para garantir consistencia de produtos, categorias, `product_images`, `product_categories`, indices e constraints necessarias para a Fase 3.
4. Preparar migrations locais Drizzle versionadas/revisadas, sem aplica-las a banco real sem validacao humana.
5. Criar seed controlado de desenvolvimento e script `pnpm db:seed`.
6. Garantir scripts `db:generate`, `db:migrate`, `db:studio` e `db:seed`.
7. Implementar repository Drizzle real para leituras, criacao, edicao, categorias, vinculos e metadata de imagens.
8. Ajustar storefront para usar repository/service real quando banco estiver disponivel.
9. Ajustar admin para indicar claramente modo real versus modo sem banco/persistencia real.
10. Persistir metadata de imagens em `product_images` quando banco e Blob estiverem disponiveis.
11. Atualizar documentacao operacional de Neon, migrations, seed, variaveis e fallback.

## 6. Fora de escopo

1. Modificar o projeto Laravel legado.
2. Copiar `.env` real do legado.
3. Expor `DATABASE_URL`, tokens, secrets ou credenciais.
4. Rodar migrations contra banco real sem validacao humana explicita.
5. Conectar banco de producao.
6. Fazer deploy ou configurar dominio.
7. Implementar checkout, pagamento, frete, cupom ou pedidos.
8. Implementar autenticacao real, RBAC ou policies finais de admin.
9. Fazer upload real sem `BLOB_READ_WRITE_TOKEN`.
10. Fazer commit ou push nesta etapa de requirements.

## 7. Regras de negocio herdadas

1. **RN-01:** Produto publico exige `status = published`. 🟢  
   - Origem: `docs/features/catalog-products-images.md#Regras herdadas do legado`
   - Tipo: preservada
2. **RN-02:** Produto publico exige `publishedAt <= now`. 🟢  
   - Origem: `docs/features/catalog-products-images.md#Regras herdadas do legado`
   - Tipo: preservada
3. **RN-03:** Produto publico exige `stockQuantity > 0`. 🟢  
   - Origem: `docs/features/catalog-products-images.md#Regras herdadas do legado`
   - Tipo: preservada
4. **RN-04:** Produto `draft` nao e publico. 🟢  
   - Origem: `docs/features/admin-products.md#Regras herdadas do legado`
   - Tipo: preservada
5. **RN-05:** Produto futuro nao e publico. 🟢  
   - Origem: `docs/features/catalog-products-images.md#Testes de paridade`
   - Tipo: preservada
6. **RN-06:** Produto sem estoque nao e disponivel publicamente. 🟢  
   - Origem: `docs/features/catalog-products-images.md#Testes de paridade`
   - Tipo: preservada
7. **RN-07:** Produto `inactive` e equivalente funcional de inativo/arquivado nesta reconstrucao inicial; nao aparece publicamente, nao e compravel e permanece acessivel apenas em contexto administrativo. A nomenclatura final pode ser revisada futuramente. 🟢  
   - Origem: `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\handoff.md#Decisoes a Levar para Implementacao` e decisao humana em `/reversa-clarify` de 2026-06-08
   - Tipo: preservada e esclarecida
8. **RN-08:** Imagens de produto usam metadados em banco, nunca binario. 🟢  
   - Origem: `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\uploads-plan.md#Imagens de Produto`
   - Tipo: preservada
9. **RN-09:** Imagem de capa usa `isCover`; fallback tecnico pode escolher a primeira por `sortOrder` quando nenhuma capa explicita existir. 🟢  
   - Origem: `docs/features/catalog-products-images.md#Decisoes implementadas`
   - Tipo: preservada
10. **RN-10:** Precos permanecem em centavos no banco de dominio da aplicacao. 🟢  
    - Origem: `docs/features/admin-products.md#Regras herdadas do legado`
    - Tipo: preservada
11. **RN-11:** Slugs permanecem normalizados. 🟢  
    - Origem: `docs/features/admin-products.md#Como o admin cria e edita produto`
    - Tipo: preservada

## 8. Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de aceite | Confidencia |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O sistema deve detectar a presenca de `DATABASE_URL` e usar repository Drizzle real apenas quando ela existir. | Must | Sem `DATABASE_URL`, leituras e mutacoes usam fallback explicito; com `DATABASE_URL`, o repository executa consultas Drizzle reais. | 🟢 |
| RF-02 | O repository Drizzle deve listar produtos administrativos a partir do banco. | Must | `/admin/produtos` reflete registros de `products`, categorias e imagens persistidos no banco. | 🟢 |
| RF-03 | O repository Drizzle deve buscar produto administrativo por `id`. | Must | `/admin/produtos/[id]/editar` carrega produto real ou retorna estado de nao encontrado. | 🟢 |
| RF-04 | O repository Drizzle deve buscar produto publico por `slug` normalizado. | Must | `/produto/[slug]` usa produto real e respeita regras de publicacao. | 🟢 |
| RF-05 | O repository/service deve listar produtos publicos reais aplicando `published`, `publishedAt <= now` e `stockQuantity > 0`. | Must | `/produtos` nao exibe draft, futuro, sem estoque ou inactive. | 🟢 |
| RF-06 | O repository Drizzle deve criar produto e retornar `status: persisted` somente apos gravacao real. | Must | Ao criar com banco configurado, o produto existe em `products` e o retorno nao usa `dev_fallback`. | 🟢 |
| RF-07 | O repository Drizzle deve editar produto e preservar revalidacoes de rotas administrativas e publicas. | Must | Edicao altera linha real em `products` e a UI reflete a alteracao depois da action. | 🟢 |
| RF-08 | O repository Drizzle deve listar categorias reais e respeitar `isActive` quando usado em contexto publico. | Must | O admin consegue selecionar categorias persistidas; categorias inativas nao sao promovidas publicamente sem regra explicita. | 🟡 |
| RF-09 | O repository Drizzle deve vincular e substituir categorias de produto em `product_categories`. | Must | Criacao/edicao grava relacao N:N sem duplicidades e remove vinculos antigos na edicao. | 🟢 |
| RF-10 | O sistema deve listar imagens de produto vindas de `product_images`. | Must | Produto admin e publico recebem galeria ordenada por `sortOrder`, com capa por `isCover`. | 🟢 |
| RF-11 | O sistema deve persistir metadata de imagem em `product_images` apos upload real bem-sucedido. | Must | `blobUrl`, `pathname`, `altText`, `sortOrder`, `isCover`, dimensoes, tamanho e `contentType` ficam gravados; binario nao fica no banco. | 🟢 |
| RF-12 | O admin deve indicar visualmente quando esta em modo sem banco/persistencia real. | Must | Sem `DATABASE_URL`, telas de admin exibem mensagem clara de fallback e actions nao comunicam sucesso de gravacao real. | 🟢 |
| RF-13 | O storefront deve continuar funcional sem banco real usando fallback seguro. | Must | Build/test/e2e passam sem `DATABASE_URL`; a experiencia nao sugere que dados foram persistidos. | 🟢 |
| RF-14 | O projeto deve incluir script `pnpm db:seed`. | Must | `package.json` possui `db:seed` e a documentacao explica prerequisitos e escopo do seed. | 🟢 |
| RF-15 | O seed deve criar dados controlados de desenvolvimento para categorias, produtos e imagens placeholder seguras. | Should | Rodar seed em ambiente permitido popula dados ficticios, com URLs placeholder ou caminhos ficticios claramente marcados como desenvolvimento, sem imagens reais do legado. | 🟢 |

## 9. Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia ou justificativa | Confidencia |
|------|-----------|----------------------------|-------------|
| Seguranca | Nenhum secret deve aparecer em codigo, docs, logs, fixtures, migrations ou resposta de erro. | Guardrails da Fase 3 e `docs/operations/env.md#Environment`. | 🟢 |
| Seguranca | Migrations contra banco real exigem validacao humana explicita antes da execucao. | `docs/operations/neon.md#Neon`. | 🟢 |
| Confiabilidade | Falhas de persistencia real nao devem ser mascaradas como fallback. | Criterio minimo informado pelo usuario e risco de falsa gravacao. | 🟢 |
| Desenvolvimento | `lint`, `typecheck`, `test`, `build` e `test:e2e` devem continuar sendo validacoes obrigatorias da futura implementacao. | Criterios de aceite da Fase 3. | 🟢 |
| Compatibilidade local | Build e testes nao podem exigir `DATABASE_URL` ou `BLOB_READ_WRITE_TOKEN`. | `src/lib/env.ts` aceita valores ausentes e upload ja bloqueia sem token. | 🟢 |
| Observabilidade | Estados de fallback, bloqueio de upload e falha de persistencia devem ser retornados com mensagens claras. | Padrao atual `dev_fallback` e `blocked/missing_blob_token`. | 🟢 |
| Manutenibilidade | O repository deve manter contrato unico para fixtures e Drizzle, evitando bifurcacao de UI. | Estrutura atual em `product-service.ts` e `product-repository.ts`. | 🟢 |
| Integridade | Criacao/edicao de produto, categorias e imagens deve ser transacional quando envolver multiplas tabelas. | Necessidade de evitar produto sem vinculos/imagens inconsistentes. | 🟡 |

## 10. Requisitos de seguranca

1. A implementacao nao deve ler, copiar, registrar ou exibir `.env` real do legado.
2. A implementacao nao deve expor `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` ou outros secrets em mensagens, fixtures, docs ou logs.
3. `drizzle.config.ts` e scripts de banco devem falhar de modo seguro quando uma operacao destrutiva ou remota nao estiver explicitamente autorizada.
4. Upload real deve permanecer bloqueado quando `BLOB_READ_WRITE_TOKEN` estiver ausente.
5. Admin sem autenticacao real deve comunicar a limitacao e nao criar falsa sensacao de seguranca.
6. Enquanto a Fase 4 de autenticacao/policies nao existir, mutacao real com `DATABASE_URL` so pode ser permitida em ambiente de desenvolvimento, explicitamente marcada como temporaria e protegida por guardrail de ambiente; preview e producao ficam bloqueados para mutacoes reais sem auth.
7. A fase nao deve conectar banco de producao, fazer deploy, configurar dominio, commit ou push.

## 11. Requisitos de banco

1. `categories` deve suportar `id`, `name`, `slug`, `description`, `parentId`, `type`, `isActive`, `isProtected`, `sortOrder` e timestamps.
2. `products` deve suportar campos publicos e administrativos ja existentes, com `priceCents`, `compareAtPriceCents`, `costPriceCents`, `stockQuantity`, `status`, `publishedAt`, SEO e timestamps.
3. `product_images` deve armazenar apenas metadata: `blobUrl`, `pathname`, `altText`, `sortOrder`, `isCover`, dimensoes, tamanho, `contentType` e `createdAt`.
4. `product_categories` deve manter relacao N:N unica por produto e categoria.
5. O schema deve revisar indices/constraints de `slug`, `sku`, categorias e capa de imagem conforme viabilidade Drizzle/Postgres.
6. Precos de dominio devem permanecer em centavos; qualquer coluna decimal legada deve ter finalidade explicitamente documentada ou ser revisada.

## 12. Requisitos de migrations

1. `pnpm db:generate` pode gerar migrations locais a partir de `src/db/schema.ts` sem aplicar em banco real, desde que isso seja tecnicamente possivel sem `DATABASE_URL`.
2. Migrations devem ser revisadas antes de qualquer aplicacao.
3. `pnpm db:migrate` nao deve ser executado contra banco real sem validacao humana explicita.
4. A documentacao deve explicar como distinguir ambiente local/dev, preview e producao.
5. A implementacao futura nao deve exigir migrations para `pnpm build`, `pnpm test` ou `pnpm test:e2e`.
6. Se Drizzle exigir conexao para alguma etapa e `DATABASE_URL` estiver ausente, a implementacao deve registrar pendencia clara em vez de mascarar o bloqueio.

## 13. Requisitos de seed

1. Criar script `pnpm db:seed`.
2. O seed deve depender de `DATABASE_URL` e falhar com mensagem clara quando ausente.
3. O seed deve ser controlado para desenvolvimento, sem dados sensiveis ou credenciais reais.
4. O seed deve cobrir categorias, produtos publicados, produtos draft, produto futuro, produto sem estoque, produto inactive e imagens placeholder.
5. O seed deve preservar slugs normalizados e precos em centavos.
6. O seed deve documentar se e idempotente, se faz upsert ou se exige limpeza manual previa.
7. O seed nao deve usar imagens reais do legado nem copiar arquivos de imagem do Laravel.

## 14. Requisitos de fallback sem `DATABASE_URL`

1. Sem `DATABASE_URL`, `db` deve permanecer `null` e o repository deve usar fallback controlado.
2. Leituras podem usar fixtures/dev fallback, desde que a UI deixe claro quando relevante no admin.
3. Mutacoes sem banco devem retornar status equivalente a `dev_fallback`, sem afirmar que houve persistencia real.
4. Falhas com `DATABASE_URL` presente nao podem cair silenciosamente para fixtures.
5. Build, lint, typecheck, testes unitarios e e2e devem passar sem banco real.

## 15. Requisitos de upload sem `BLOB_READ_WRITE_TOKEN`

1. Sem `BLOB_READ_WRITE_TOKEN`, upload real deve retornar bloqueio controlado.
2. O sistema nao deve persistir metadata de imagem como se upload real tivesse ocorrido.
3. Com token ausente, testes devem validar `blocked/missing_blob_token`.
4. Com token presente e banco presente, upload bem-sucedido deve persistir metadata em `product_images`.
5. O binario da imagem nunca deve ser salvo no banco.

## 16. Criterios de Aceitacao

```gherkin
Cenario: Build local sem banco e sem Blob
  Dado que DATABASE_URL e BLOB_READ_WRITE_TOKEN estao ausentes
  Quando a suite de validacao roda lint, typecheck, test, build e e2e
  Entao nenhuma etapa exige conexao real com banco ou token Blob

Cenario: Admin sem banco nao finge persistencia
  Dado que DATABASE_URL esta ausente
  Quando um administrador tenta criar ou editar um produto
  Entao o sistema valida os dados e informa fallback sem gravacao real

Cenario: Leitura administrativa com banco real
  Dado que DATABASE_URL aponta para um banco permitido e migrado
  Quando o administrador acessa /admin/produtos
  Entao a lista vem das tabelas reais de produtos, categorias e imagens

Cenario: Produto publico preserva paridade
  Dado que existem produtos published, draft, future, out-of-stock e inactive no banco
  Quando o visitante acessa /produtos
  Entao apenas produtos published com publishedAt menor ou igual a agora e stockQuantity maior que zero aparecem

Cenario: Produto por slug normalizado
  Dado que um produto publicado possui slug normalizado no banco
  Quando o visitante acessa /produto/[slug]
  Entao o service busca o produto real por slug normalizado e aplica as regras publicas

Cenario: Persistencia real de produto
  Dado que DATABASE_URL existe e aponta para banco permitido
  Quando o administrador cria um produto valido
  Entao o produto, seus vinculos de categoria e seus campos em centavos sao persistidos no banco

Cenario: Falha real de banco nao vira fixture
  Dado que DATABASE_URL existe mas a operacao de banco falha
  Quando o repository tenta persistir um produto
  Entao a falha e reportada e nao e substituida por dev_fallback silencioso

Cenario: Upload sem token Blob
  Dado que BLOB_READ_WRITE_TOKEN esta ausente
  Quando o administrador tenta enviar uma imagem
  Entao o upload retorna blocked/missing_blob_token e nenhuma metadata e persistida como upload real

Cenario: Upload com token e banco
  Dado que BLOB_READ_WRITE_TOKEN e DATABASE_URL existem em ambiente permitido
  Quando o upload de imagem valido conclui
  Entao o arquivo vai para Blob e a metadata e persistida em product_images

Cenario: Seed controlado
  Dado que DATABASE_URL aponta para banco de desenvolvimento permitido
  Quando o operador executa pnpm db:seed
  Entao categorias, produtos e dados de paridade sao criados sem secrets e com resultado documentado
```

## 17. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-07 | Must | Sem conexao real e CRUD real de produtos, a Fase 3 nao entrega persistencia. |
| RF-08 a RF-11 | Must | Categorias e imagens fazem parte do contrato de catalogo herdado. |
| RF-12 e RF-13 | Must | O fallback seguro e criterio minimo explicito. |
| RF-14 | Must | O script `db:seed` e requisito operacional da fase. |
| RF-15 | Should | Seed com imagens depende de decisao humana sobre placeholders. |
| Requisitos de seguranca | Must | Evitam vazamento de secrets e conexao indevida com producao. |
| Requisitos de migrations | Must | Migrations devem existir, mas execucao real depende de validacao. |
| Validacoes lint/typecheck/test/build/e2e | Must | Sao o piso de qualidade da futura implementacao. |

## 18. Esclarecimentos

### Sessao 2026-06-08

- **Q:** `inactive` deve continuar como equivalente funcional de arquivado/inativo?  
  **R:** Sim. Nesta reconstrucao inicial, `inactive` e equivalente funcional de inativo/arquivado: nao aparece publicamente, nao e compravel e permanece acessivel apenas em contexto administrativo. A nomenclatura final pode ser revisada futuramente.
- **Q:** Migrations locais podem ser geradas sem `DATABASE_URL`?  
  **R:** Sim, gerar arquivos de migration com Drizzle e permitido sem aplicar em banco real, desde que seja tecnicamente possivel. Executar `db:migrate` contra banco real continua proibido sem validacao humana explicita. Se Drizzle exigir conexao em alguma etapa e `DATABASE_URL` estiver ausente, registrar pendencia clara.
- **Q:** O seed deve criar imagens com URLs placeholder ou sem imagens?  
  **R:** O seed de desenvolvimento deve criar categorias e produtos ficticios com imagens placeholder seguras, usando URLs placeholder ou caminhos ficticios marcados como dados de desenvolvimento. Nao usar imagens reais do legado e nao copiar arquivos do Laravel.
- **Q:** O primeiro banco Neon sera local/dev, preview ou producao?  
  **R:** O primeiro banco Neon sera ambiente de desenvolvimento/local-dev. Ele nao deve ser tratado como producao. A documentacao deve registrar a separacao futura entre local/dev, preview e producao, sem aplicar nada em producao nesta fase.
- **Q:** Admin sem autenticacao real pode criar registros quando `DATABASE_URL` existir?  
  **R:** Enquanto a Fase 4 de auth/policies nao existir, o admin pode preparar actions, repository e telas. Mutacao real com `DATABASE_URL` so deve ser permitida em ambiente de desenvolvimento, marcada como temporaria e protegida por guardrail de ambiente. Em ambiente sem autenticacao real, a UI deve exibir aviso claro de que o admin ainda nao esta protegido. Isso e bloqueador para producao.

## 19. Gaps e duvidas

Nenhuma duvida remanescente apos a sessao de clarificacao de 2026-06-08.

## 20. Glossario minimo

| Termo | Definicao |
|-------|-----------|
| Neon | Banco Postgres serverless alvo do novo projeto. |
| Drizzle | ORM e ferramenta de migrations usada pelo projeto Next.js. |
| Migration | Arquivo versionado que altera schema do banco. |
| Seed | Script que popula dados controlados de desenvolvimento. |
| `DATABASE_URL` | Variavel de ambiente com string de conexao ao banco; nao deve ser exposta. |
| `BLOB_READ_WRITE_TOKEN` | Token de escrita/leitura do Vercel Blob; sem ele upload real deve ser bloqueado. |
| Fallback | Caminho seguro usado sem banco real, baseado em fixtures e mensagens explicitas. |
| `dev_fallback` | Status de mutacao validada, mas nao persistida por ausencia de banco. |
| Metadata de imagem | Dados textuais/estruturais da imagem salvos no banco, sem binario. |
| `isCover` | Flag que indica imagem de capa do produto. |

## 21. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-08 | Versao inicial gerada por `/reversa-requirements` | reversa |
| 2026-06-08 | Duvidas resolvidas por `/reversa-clarify` | reversa |
