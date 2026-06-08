# Actions: Fase 4 - Autenticacao e Policies

> Identificador: `002-fase-4-auth-policies`
> Data: `2026-06-08`
> Roadmap: `_reversa_forward/002-fase-4-auth-policies/roadmap.md`

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de acoes | 64 |
| Paralelizaveis (`[//]`) | 19 |
| Maior cadeia de dependencia | 23 |

## Fase 1, Preparacao e seguranca

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-001 | Mapear superficies protegidas atuais | Identificar rotas, pages e actions existentes que precisam de auth/policy antes de qualquer alteracao. | `src/app/admin/**`, `src/app/(customer)/**`, `src/features/products/server/product-actions.ts`, `src/features/uploads/product-image-upload.ts` | - | code | - | Lista de pontos de entrada fica refletida nas alteracoes seguintes, sem liberar superficie fora do contrato. | medio | 🟢 | `[X]` |
| F4-002 | Revisar contrato de env seguro | Definir vars de Better Auth e seed dev em `.env.example` sem valores reais e sem exigir segredo para build/test. | `.env.example`, `src/lib/env.ts` | - | config | - | Vars documentadas como placeholders; build/test continuam possiveis sem secrets reais. | alto | 🟢 | `[X]` |
| F4-003 | Criar flag de auth real ativa | Ajustar runtime para diferenciar auth/policies reais ativas de guardrail temporario, sem expor secrets. | `src/lib/runtime-mode.ts`, `src/lib/env.ts` | F4-002 | code | - | Preview/producao conseguem bloquear mutacao quando auth/policies reais nao estiverem prontas. | alto | 🟢 | `[X]` |
| F4-004 | Preservar fallback sem banco | Confirmar que `db = null` continua caminho valido para build/test e para mensagens seguras de indisponibilidade. | `src/db/client.ts`, `src/lib/runtime-mode.ts` | F4-002 | code | `[//]` | Ausencia de `DATABASE_URL` nao causa conexao obrigatoria nem erro de importacao. | alto | 🟢 | `[X]` |
| F4-005 | Definir mensagens seguras de auth | Padronizar mensagens de unauthenticated, forbidden, auth unavailable e blocked sem detalhes internos. | `src/features/auth/server/*`, `src/lib/runtime-mode.ts` | F4-003 | code | - | Mensagens nao revelam senha, token, cookie, email sensivel, hash ou `DATABASE_URL`. | medio | 🟢 | `[X]` |

## Fase 2, Dependencias e configuracao Better Auth

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-006 | Adicionar dependencia Better Auth | Instalar Better Auth e atualizar lockfile sem adicionar providers fora do escopo. | `package.json`, `pnpm-lock.yaml` | F4-002 | config | - | Dependencia existe; Google OAuth e magic link nao sao ativados nesta fase. | medio | 🟢 | `[X]` |
| F4-007 | Criar configuracao server-only do provider | Configurar Better Auth em modulo server-only com e-mail/senha e adapter Drizzle quando banco existir. | `src/features/auth/server/auth.ts` | F4-006, F4-004 | code | - | Provider inicializa sem quebrar build/test sem `DATABASE_URL` e nao roda no client. | alto | 🟡 | `[X]` |
| F4-008 | Criar route handler de auth | Expor endpoint HTTP do provider conforme integracao Better Auth adotada. | `src/app/api/auth/[...all]/route.ts` | F4-007 | code | - | Rota compila e delega ao provider sem duplicar logica de credenciais. | medio | 🟡 | `[X]` |
| F4-009 | Preparar futuro OAuth sem ativar | Reservar estrutura/documentacao minima para Google OAuth futuro sem exigir secrets nem UI funcional. | `src/features/auth/server/auth.ts`, `docs/architecture/auth.md` | F4-007 | docs | `[//]` | Nenhum fluxo OAuth aparece como ativo; docs registram que fica fora da Fase 4. | baixo | 🟢 | `[X]` |

## Fase 3, Schema e migrations locais

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-010 | Mapear schema Better Auth contra schema atual | Comparar requisitos do provider com `users`, `customer_profiles` e `addresses` existentes antes de mudar schema. | `src/db/schema.ts`, `_reversa_forward/002-fase-4-auth-policies/data-delta.md` | F4-006 | code | - | Mapeamento evita duplicacao ambigua entre `user` e `users`. | alto | 🟡 | `[X]` |
| F4-011 | Ajustar tabela de usuarios para auth | Adaptar campos de usuario, email unico e role `customer/admin/manager` conforme provider e dominio. | `src/db/schema.ts` | F4-010 | code | - | Cadastro simultaneo tem constraint de email; role continua server-side e tipada. | alto | 🟡 | `[X]` |
| F4-012 | Adicionar tabelas de sessao e contas | Criar ou mapear tabelas de sessions/accounts/verifications exigidas pelo Better Auth. | `src/db/schema.ts` | F4-011 | code | - | Sessao pode expirar/invalidation; contas suportam e-mail/senha e preparo futuro de OAuth. | alto | 🟡 | `[X]` |
| F4-013 | Revisar relacoes customer profile | Garantir FKs/indices para ownership de `customer_profiles` e `addresses` sem implementar pedidos reais. | `src/db/schema.ts` | F4-012 | code | - | Estruturas customer apontam para usuario autenticado e bloqueiam acesso cruzado por base de dados quando aplicavel. | medio | 🟡 | `[X]` |
| F4-014 | Gerar migration local de auth | Gerar arquivo local Drizzle para delta de auth sem aplicar migration em banco real. | `drizzle/`, `drizzle.config.ts` | F4-011, F4-012, F4-013 | config | - | Migration local existe ou pendencia e registrada se generate exigir conexao; nada e aplicado. | alto | 🟢 | `[X]` |
| F4-015 | Revisar SQL de migration de auth | Conferir SQL gerado para evitar drop/rename destrutivo, duplicidade de usuarios ou alvo incorreto. | `drizzle/`, `docs/architecture/database.md` | F4-014 | validation | - | Revisao registra que migration e local e nao foi aplicada em banco real. | alto | 🟢 | `[X]` |

## Fase 4, Sessao server-side

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-016 | Criar contrato de sessao normalizada | Implementar tipo/funcao para expor `userId`, `email`, `role` e status autenticado. | `src/features/auth/server/session.ts` | F4-007, F4-012 | code | - | Sessao nao confia em role enviada pelo cliente e retorna estados do contrato. | alto | 🟢 | `[X]` |
| F4-017 | Tratar sessao ausente e expirada | Fazer leitura server-side retornar `unauthenticated` para missing, expired e invalid. | `src/features/auth/server/session.ts` | F4-016 | code | - | Rotas/actions conseguem distinguir falha segura sem renderizar dados protegidos. | alto | 🟢 | `[X]` |
| F4-018 | Tratar timeout e provider indisponivel | Converter timeout/falha de auth/db em bloqueio seguro, sem retry automatico sensivel. | `src/features/auth/server/session.ts` | F4-017, F4-004 | code | - | Timeout nunca vira acesso permitido; logs nao contem secrets. | alto | 🟢 | `[X]` |
| F4-019 | Validar returnTo seguro | Criar helper server-side para validar retorno pos-login sem redirect aberto. | `src/features/auth/server/session.ts`, `src/features/auth/server/actions.ts` | F4-016 | code | `[//]` | `returnTo` aceita apenas rotas internas permitidas ou fallback seguro. | medio | 🟢 | `[X]` |

## Fase 5, Roles e policies

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-020 | Criar modulo server-only de policies | Implementar base de decisions `allowed`, `unauthenticated` e `forbidden`. | `src/features/auth/server/policies.ts` | F4-016, F4-018 | code | - | Modulo roda apenas server-side e nao exporta bypass global. | alto | 🟢 | `[X]` |
| F4-021 | Implementar requireAdminLike | Permitir `admin` e `manager`; bloquear anonimo e `customer`. | `src/features/auth/server/policies.ts` | F4-020 | code | - | Admin e manager equivalentes no MVP; customer nunca passa em admin. | alto | 🟢 | `[X]` |
| F4-022 | Implementar requireAuthenticated/customer | Criar policy para area customer e usuarios autenticados conforme contrato. | `src/features/auth/server/policies.ts` | F4-020 | code | - | Visitante sem sessao recebe `unauthenticated`; usuario autenticado pode acessar area propria. | alto | 🟢 | `[X]` |
| F4-023 | Implementar requireOwner | Validar ownership por `session.userId` contra `resourceUserId` server-side. | `src/features/auth/server/policies.ts` | F4-022 | code | - | Acesso cruzado retorna `forbidden` e nao confia em `userId` do cliente. | alto | 🟢 | `[X]` |
| F4-024 | Bloquear mutation sem auth ativa em preview/producao | Integrar flag de runtime com policy para manter bloqueio se auth real nao estiver configurada. | `src/lib/runtime-mode.ts`, `src/features/auth/server/policies.ts` | F4-003, F4-021 | code | - | Preview/producao nao liberam mutation admin por guardrail incompleto. | alto | 🟢 | `[X]` |

## Fase 6, Protecao de rotas

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-025 | Proteger layout ou paginas admin | Exigir `requireAdminLike` antes de renderizar `/admin` e subrotas. | `src/app/admin/page.tsx`, `src/app/admin/**/page.tsx`, `src/middleware.ts` | F4-021, F4-024 | code | - | Anonimo/customer nao ve dados admin; admin/manager acessam. | alto | 🟢 | `[X]` |
| F4-026 | Remover aviso de auth como protecao principal | Substituir dependencia do aviso temporario por bloqueio real de rota/policy, mantendo mensagem quando auth indisponivel. | `src/app/admin/**/page.tsx`, `src/lib/runtime-mode.ts` | F4-025 | code | - | Aviso nao e usado como unico controle de seguranca. | alto | 🟢 | `[X]` |
| F4-027 | Proteger pagina minha conta | Exigir usuario autenticado antes de renderizar dados/placeholder de `/minha-conta`. | `src/app/(customer)/minha-conta/page.tsx` | F4-022 | code | `[//]` | Sem sessao, rota bloqueia/redireciona sem dados protegidos. | medio | 🟢 | `[X]` |
| F4-028 | Proteger pagina enderecos | Exigir auth e preparar ownership para `/enderecos` sem implementar funcionalidade real nova. | `src/app/(customer)/enderecos/page.tsx` | F4-022, F4-023 | code | `[//]` | Placeholder/estrutura fica protegida e nao aceita `userId` do cliente. | medio | 🟢 | `[X]` |
| F4-029 | Proteger pagina pedidos placeholder | Exigir auth em `/pedidos` e manter pedidos reais fora do escopo. | `src/app/(customer)/pedidos/page.tsx` | F4-022 | code | `[//]` | Pagina protegida informa limite da fase sem criar pedidos, checkout ou pagamento. | medio | 🟢 | `[X]` |
| F4-030 | Preservar storefront publico | Conferir que home, catalogo e produto publico continuam sem login e com regras de publicacao. | `src/app/(storefront)/**`, `src/features/products/server/product-service.ts` | F4-025, F4-027 | validation | `[//]` | Storefront publico nao passa a exigir sessao por engano. | medio | 🟢 | `[X]` |

## Fase 7, Protecao de server actions

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-031 | Proteger criacao de produto | Chamar `requireAdminLike` antes de qualquer persistencia real em create. | `src/features/products/server/product-actions.ts` | F4-021, F4-024 | code | - | Sem policy allowed, action retorna erro controlado e nao chama repository de escrita. | alto | 🟢 | `[X]` |
| F4-032 | Proteger edicao de produto | Chamar `requireAdminLike` antes de update real. | `src/features/products/server/product-actions.ts` | F4-031 | code | - | Customer/anonimo nao atualiza produto mesmo chamando action diretamente. | alto | 🟢 | `[X]` |
| F4-033 | Proteger mutations auxiliares de produto | Cobrir delete/status/futuras actions administrativas existentes no arquivo. | `src/features/products/server/product-actions.ts` | F4-032 | code | - | Toda mutation admin do arquivo possui policy server-side. | alto | 🟢 | `[X]` |
| F4-034 | Proteger metadata de upload | Exigir admin/manager para persistir metadata de imagem quando upload real ocorrer. | `src/features/uploads/product-image-upload.ts`, `src/app/api/upload/route.ts` | F4-021, F4-024 | code | - | Upload/metadata nao persiste em preview/producao ou sem policy valida. | alto | 🟢 | `[X]` |
| F4-035 | Padronizar retornos de actions protegidas | Ajustar retornos para `unauthenticated`, `forbidden`, `blocked`, validation e error conforme contrato. | `src/features/products/server/product-actions.ts`, `src/features/uploads/product-image-upload.ts` | F4-031, F4-032, F4-033, F4-034 | code | - | UI recebe estados seguros e testaveis sem detalhes internos. | medio | 🟢 | `[X]` |

## Fase 8, Cadastro, login e logout

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-036 | Criar schemas de auth | Validar email, senha minima e payload de cadastro/login sem aceitar role confiavel do cliente. | `src/features/auth/server/schemas.ts`, `src/features/auth/server/actions.ts` | F4-007 | code | - | Senha fraca e input invalido retornam erro seguro; role enviada e ignorada/rejeitada. | alto | 🟢 | `[X]` |
| F4-037 | Implementar signup customer-only | Criar action/fluxo de cadastro publico que sempre cria role `customer`. | `src/features/auth/server/actions.ts` | F4-011, F4-036 | code | - | Visitante nunca cria `admin`/`manager`; email duplicado retorna erro controlado. | alto | 🟢 | `[X]` |
| F4-038 | Implementar login email/senha | Criar action/fluxo de login com erro generico e `returnTo` validado. | `src/features/auth/server/actions.ts` | F4-019, F4-036 | code | - | Credenciais invalidas nao revelam se email existe e nao imprimem senha. | alto | 🟢 | `[X]` |
| F4-039 | Implementar logout server-side | Criar action/fluxo para invalidar sessao e redirecionar de forma segura. | `src/features/auth/server/actions.ts` | F4-016, F4-038 | code | - | Apos logout, rotas/actions protegidas retornam unauthenticated. | alto | 🟡 | `[X]` |
| F4-040 | Conectar pagina de cadastro | Ligar formulario existente de `/cadastro` ao fluxo customer-only sem criar admin publico. | `src/app/(auth)/cadastro/page.tsx` | F4-037 | code | - | Cadastro mostra erros controlados para duplicidade, senha fraca e role indevida. | medio | 🟢 | `[X]` |
| F4-041 | Conectar pagina de login | Ligar formulario existente de `/login` ao fluxo de login/logout e retorno seguro. | `src/app/(auth)/login/page.tsx` | F4-038, F4-039 | code | - | Login funciona por email/senha; usuario autenticado e direcionado de forma segura. | medio | 🟢 | `[X]` |

## Fase 9, Seed admin dev

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-042 | Criar script seed admin dev | Criar seed separado para admin/manager dev, sem senha hardcoded e sem execucao automatica. | `scripts/db/seed-admin-dev.mjs` | F4-011, F4-012 | code | - | Script exige fluxo explicito e nao mistura seed de catalogo. | alto | 🟢 | `[X]` |
| F4-043 | Exigir envs do seed admin dev | Validar `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD` com erro seguro quando ausentes. | `scripts/db/seed-admin-dev.mjs`, `.env.example` | F4-042, F4-002 | code | - | Ausencia de envs falha antes de conectar e nao imprime valores sensiveis. | alto | 🟢 | `[X]` |
| F4-044 | Bloquear seed fora de development/local-dev | Impedir execucao em preview/producao/teste inadequado e redigir logs. | `scripts/db/seed-admin-dev.mjs`, `src/lib/runtime-mode.ts` | F4-043 | code | - | Production/preview sao bloqueados; senha/hash/token nunca aparecem no console. | alto | 🟢 | `[X]` |
| F4-045 | Adicionar script package para seed dev | Expor comando local controlado para seed admin dev. | `package.json` | F4-044 | config | - | Script existe, nao roda automaticamente e deixa claro que e apenas dev/local. | medio | 🟢 | `[X]` |

## Fase 10, Testes unitarios

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-046 | Testar roles e policies admin | Cobrir admin/manager allowed, customer forbidden e anonimo unauthenticated. | `src/tests/unit/auth-policies.test.ts` | F4-020, F4-021 | test | `[//]` | Estados de policy batem com contrato e admin/manager sao equivalentes. | alto | 🟢 | `[X]` |
| F4-047 | Testar sessao ausente/expirada/timeout | Cobrir missing, expired, invalid, timeout e unavailable como falha segura. | `src/tests/unit/auth-session.test.ts` | F4-016, F4-017, F4-018 | test | `[//]` | Nenhum caso de falha permite acesso. | alto | 🟢 | `[X]` |
| F4-048 | Testar customer ownership | Cobrir owner permitido e acesso cruzado bloqueado. | `src/tests/unit/auth-policies.test.ts` | F4-022, F4-023 | test | `[//]` | Policy nao aceita `userId` vindo de payload de cliente. | alto | 🟢 | `[X]` |
| F4-049 | Testar cadastro publico | Cobrir customer-only, role admin no payload, email duplicado e senha fraca. | `src/tests/unit/auth-actions.test.ts` | F4-036, F4-037 | test | `[//]` | Cadastro nunca cria admin/manager publicamente e retorna erros controlados. | alto | 🟢 | `[X]` |
| F4-050 | Testar login e logout | Cobrir credenciais invalidas, sessao criada, logout e action protegida apos logout. | `src/tests/unit/auth-actions.test.ts` | F4-038, F4-039 | test | - | Login nao revela conta; logout invalida acesso posterior. | alto | 🟡 | `[X]` |
| F4-051 | Testar actions admin protegidas | Cobrir product actions e upload metadata sem sessao, customer, admin e manager. | `src/tests/unit/product-persistence.test.ts`, `src/tests/unit/product-image-upload.test.ts` | F4-031, F4-032, F4-033, F4-034, F4-035 | test | - | Mutations recusadas nao persistem e retornam estados seguros. | alto | 🟢 | `[X]` |
| F4-052 | Testar guardrails de ambiente auth | Cobrir build/test sem credenciais e preview/producao sem auth ativa bloqueando mutacoes. | `src/tests/unit/auth-guardrails.test.ts` | F4-003, F4-024, F4-035 | test | `[//]` | CI/local sem secrets nao quebra; preview/producao nao usam bypass. | alto | 🟢 | `[X]` |
| F4-053 | Testar seed admin dev | Cobrir ausencia de envs, bloqueio fora de dev, idempotencia/duplicidade e logs sem secrets. | `src/tests/unit/db-scripts.test.ts`, `scripts/db/seed-admin-dev.mjs` | F4-042, F4-043, F4-044, F4-045 | test | `[//]` | Seed falha seguro sem envs e nao imprime senha. | alto | 🟢 | `[X]` |

## Fase 11, Testes e2e

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-054 | E2E admin protegido | Cobrir anonimo e customer bloqueados em `/admin/**`; admin/manager permitidos quando fixture viavel. | `src/tests/e2e/auth-admin.spec.ts` | F4-025, F4-046, F4-051 | test | - | Admin nao renderiza dados para usuario sem policy. | alto | 🟢 | `[X]` |
| F4-055 | E2E area customer protegida | Cobrir `/minha-conta`, `/enderecos` e `/pedidos` sem login e com usuario autenticado quando fixture viavel. | `src/tests/e2e/auth-customer.spec.ts` | F4-027, F4-028, F4-029, F4-048 | test | - | Customer sem sessao bloqueia; paginas protegidas nao vazam dados. | medio | 🟢 | `[X]` |
| F4-056 | E2E cadastro login logout basico | Cobrir fluxo basico sem credenciais reais, usando fixture/mock/banco local isolado quando disponivel. | `src/tests/e2e/auth-flow.spec.ts` | F4-040, F4-041, F4-049, F4-050 | test | - | Fluxo prova cadastro/login/logout ou registra skip seguro sem banco real obrigatorio. | medio | 🟡 | `[X]` |
| F4-057 | E2E storefront publico preservado | Garantir que catalogo e produto publico continuam acessiveis sem login. | `src/tests/e2e/storefront-products.spec.ts`, `src/tests/e2e/home.spec.ts` | F4-030 | test | `[//]` | Home/catalogo/produto publico seguem acessiveis anonimamente. | medio | 🟢 | `[X]` |

## Fase 12, Documentacao

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-058 | Criar docs da feature auth policies | Documentar escopo, roles, rotas protegidas, policies e limites da Fase 4. | `docs/features/auth-policies.md` | F4-025, F4-035, F4-041 | docs | `[//]` | Docs deixam claro que checkout, pagamento, frete, cupom e pedidos reais seguem fora. | baixo | 🟢 | `[X]` |
| F4-059 | Atualizar arquitetura de auth | Registrar Better Auth, sessao server-side, cookies seguros e policies por request. | `docs/architecture/auth.md` | F4-007, F4-016, F4-020 | docs | `[//]` | Arquitetura nao expoe secrets e aponta Google OAuth como futuro. | medio | 🟢 | `[X]` |
| F4-060 | Atualizar operacao de env auth | Documentar vars de auth e seed dev com placeholders e regras sem copiar `.env` do legado. | `docs/operations/auth-env.md`, `docs/operations/env.md` | F4-002, F4-043, F4-044 | docs | `[//]` | Operador entende vars necessarias sem valores reais ou credenciais. | medio | 🟢 | `[X]` |
| F4-061 | Atualizar docs de admin e database | Registrar impacto de policies em admin products e delta de schema/migration local. | `docs/features/admin-products.md`, `docs/architecture/database.md`, `docs/operations/database-migrations.md` | F4-015, F4-035, F4-051 | docs | `[//]` | Docs explicam que migration real nao foi aplicada e admin exige policy real. | medio | 🟢 | `[X]` |

## Fase 13, Validacoes finais e commit local opcional

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F4-062 | Rodar validacoes estaticas e unitarias | Executar `pnpm lint`, `pnpm typecheck` e `pnpm test`. | n/a | F4-046, F4-047, F4-048, F4-049, F4-050, F4-051, F4-052, F4-053, F4-058, F4-059, F4-060, F4-061 | validation | - | Lint, typecheck e testes unitarios passam sem credenciais reais. | alto | 🟢 | `[X]` |
| F4-063 | Rodar build e e2e | Executar `pnpm build` e `pnpm test:e2e` apos testes unitarios aprovados. | n/a | F4-054, F4-055, F4-056, F4-057, F4-062 | validation | - | Build e e2e passam sem banco real obrigatorio, ou skips seguros ficam documentados. | alto | 🟢 | `[X]` |
| F4-064 | Commit local opcional | Criar commit local somente com autorizacao humana e apenas se todas as validacoes passarem. | n/a | F4-063 | validation | - | Nenhum commit e criado automaticamente; nunca faz push nesta etapa. | baixo | 🟢 | `[X]` |

## Dependencias criticas

- F4-002 e F4-003 bloqueiam env, runtime e seguranca de preview/producao.
- F4-006 a F4-008 bloqueiam qualquer uso real do Better Auth.
- F4-010 a F4-015 bloqueiam adapter, sessao persistente e seed admin dev.
- F4-016 a F4-024 bloqueiam todas as protecoes de rota e action.
- F4-025 a F4-035 bloqueiam a substituicao do guardrail temporario por auth/policy real.
- F4-036 a F4-041 bloqueiam os fluxos publicos de cadastro/login/logout.
- F4-042 a F4-045 bloqueiam a criacao segura de admin/manager dev.
- F4-046 a F4-057 bloqueiam validacoes finais.

## Riscos principais

- Schema Better Auth conflitar com `users` existente ou criar tabelas duplicadas sem mapeamento claro.
- Mutations administrativas ficarem protegidas apenas por rota, layout ou UI.
- Build/test passarem a exigir `DATABASE_URL`, secret de auth ou banco real.
- Seed admin dev vazar senha, hash, token ou rodar fora de development/local-dev.
- Timeout de auth/session/db liberar acesso por fallback permissivo.
- Cadastro simultaneo duplicar e-mail sem unique/erro controlado.
- Customer acessar recurso de outro customer por aceitar `userId` do cliente.
- Escopo escapar para pedidos, checkout, pagamento, frete, cupom ou documentos fiscais reais.

## Notas de execucao

- Nao implementar checkout, pagamento, frete, cupom, documentos fiscais ou pedidos reais.
- Nao criar admin ou manager por cadastro publico.
- Nao adicionar bypass global de autenticacao.
- Nao aplicar migration em banco real sem validacao humana explicita.
- Nao conectar banco de producao nem copiar `.env` do legado Laravel.
- Nao expor secrets em docs, logs, testes, mensagens ou snapshots.
- Nao fazer push nem deploy.
- `F4-064` e opcional e exige confirmacao humana explicita.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-08 | Versao inicial gerada por `/reversa-to-do` | reversa |
