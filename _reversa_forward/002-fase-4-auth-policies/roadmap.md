# Roadmap: Fase 4 - Autenticacao e Policies

> Identificador: `002-fase-4-auth-policies`
> Data: `2026-06-08`
> Requirements: `_reversa_forward/002-fase-4-auth-policies/requirements.md`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 4 introduz autenticacao real com Better Auth, sessao server-side e policies por role como delta sobre o estado pos-Fase 3. O guardrail temporario de ambiente descrito em `_reversa_sdd/permissions.md` deixa de ser o unico controle para mutations administrativas e passa a ser complementado por verificacao de sessao e policy antes de qualquer gravacao real. O plano preserva o fallback sem banco de `_reversa_sdd/domain.md#7-persistencia-e-fallback`, mantem build/test sem credenciais reais e nao ativa checkout, pagamento, frete, cupom ou pedidos reais.

## 2. Principios aplicados

`.reversa/principles.md` nao existe neste projeto, portanto nao ha principios formais adicionais a auditar nesta etapa. A feature respeita os guardrails ja documentados nos SDDs.

| Principio/guardrail | Como a feature se relaciona | Status |
|---|---|---|
| Fallback sem banco | Auth deve falhar de forma explicita sem `DATABASE_URL`, sem quebrar build/test. | respeita |
| Sem secrets em artefatos/logs | Plano nao exige nem registra credenciais reais. | respeita |
| Preview/producao seguros | Mutations reais exigem auth/policies completas e ambiente autorizado. | respeita |
| Legado Laravel somente leitura | Nenhuma mudanca planejada no projeto legado. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confidencia |
|---|---|---|---|---|
| D-01 | Usar Better Auth como provider inicial. | Decisao humana validada em `requirements.md#2.1`. | Auth custom, Auth.js, magic link nesta fase. | 🟢 |
| D-02 | Login inicial por e-mail/senha. | Escopo validado; Google OAuth fica preparado, mas fora da fase. | OAuth inicial, magic link. | 🟢 |
| D-03 | Integrar Better Auth ao Drizzle/Neon por adapter e schema mapeado. | O projeto ja usa `src/db/client.ts` e `src/db/schema.ts`; Better Auth documenta adapter Drizzle e mapeamento de tabelas. | Segundo ORM, banco separado. | 🟡 |
| D-04 | Centralizar leitura de sessao e policies em camada server-only. | Next App Router tem multiplos pontos de entrada; actions e route handlers precisam verificar autorizacao diretamente. | Proteger apenas por UI/layout. | 🟢 |
| D-05 | Manter `admin` e `manager` equivalentes no MVP. | Decisao humana validada. | Permissoes granulares por recurso nesta fase. | 🟢 |
| D-06 | Cadastro publico cria somente `customer`. | Evita criacao publica de usuarios administrativos. | Aceitar role do payload, cadastro admin publico. | 🟢 |
| D-07 | Seed admin dev separado do seed de catalogo e condicionado a ambiente/vars. | Requisito exige `DATABASE_URL`, `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD` e sem senha hardcoded. | Senha fixa, seed em producao/preview. | 🟢 |
| D-08 | Gerar migrations locais quando o schema for implementado, mas nao aplicar banco real sem validacao humana. | Preserva guardrail da Fase 3 e regra desta etapa. | `db:migrate` automatico, `push` direto em banco. | 🟢 |
| D-09 | Policies retornam estados `allowed`, `unauthenticated` e `forbidden`. | Requisito RP-05 facilita UI, redirects, server actions e testes. | Booleano simples sem diagnostico seguro. | 🟢 |
| D-10 | Falhas de auth/session/db e timeouts fecham acesso e nao persistem. | Requisitos RC-07 a RC-09 exigem falha segura. | Retry automatico de mutation sensivel. | 🟢 |

## 4. Premissas

Nao ha premissas derivadas de `[DÚVIDA]` ou `[DOUBT]` abertas. A auditoria em `_reversa_forward/002-fase-4-auth-policies/audit/requirements-audit.md` aprovou os requirements.

| Premissa | Origem | Risco se errada |
|---|---|---|
| N/a | N/a | N/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem no SDD | Tipo de mudanca | Resumo |
|---|---|---|---|
| Runtime e guardrails | `_reversa_sdd/architecture.md#3-runtime-e-guardrails` | regra-alterada | Introduzir indicador de auth/policies reais ativas por ambiente, sem expor secrets. |
| Banco e Drizzle | `_reversa_sdd/architecture.md#4-banco-e-drizzle` | regra-alterada | Adicionar/ajustar tabelas de auth e indexes exigidos pelo provider, via migration local futura. |
| Admin | `_reversa_sdd/architecture.md#8-admin` | regra-alterada | Substituir aviso de painel sem auth por protecao real de rota/action. |
| Customer/auth placeholders | `_reversa_sdd/architecture.md#10-apis-e-dominios-fora-de-escopo` | componente-alterado | Transformar login/cadastro/minha-conta/enderecos em superficies protegidas basicas. |
| Permissions | `_reversa_sdd/permissions.md#guardrail-de-mutacao-admin` | regra-alterada | Mutacao admin passa a exigir sessao admin/manager, nao apenas ambiente permitido. |
| Product actions | `_reversa_sdd/architecture.md#6-catalogo-e-repository` | contrato-alterado | Server actions administrativas validam policy antes de chamar repository. |
| Upload metadata | `_reversa_sdd/permissions.md#upload` | contrato-alterado | Persistencia de metadata real tambem passa por policy admin quando acionada no admin. |

## 6. Delta no modelo de dados

- Resumo das mudancas: mapear o schema atual `users`, `customer_profiles` e `addresses` para Better Auth; adicionar tabelas/colunas necessarias para accounts/sessions/verifications se ainda ausentes; preservar roles `customer`, `admin`, `manager`; adicionar constraints contra duplicidade de e-mail e suporte a sessoes seguras.
- Detalhe completo em: `_reversa_forward/002-fase-4-auth-policies/data-delta.md`

## 7. Delta de contratos

| Contrato | Tipo | Arquivo de detalhe |
|---|---|---|
| Auth/session | HTTP + server action | `_reversa_forward/002-fase-4-auth-policies/interfaces/auth-session-contract.md` |
| Policies | server-only module contract | `_reversa_forward/002-fase-4-auth-policies/interfaces/policies-contract.md` |
| Protected routes/actions | App Router + server action | `_reversa_forward/002-fase-4-auth-policies/interfaces/protected-surfaces-contract.md` |

## 8. Plano de migracao

1. Levantar o schema Better Auth necessario contra `src/db/schema.ts`, sem conectar banco real.
2. Decidir mapeamento entre tabela existente `users` e modelo `user` do provider.
3. Planejar alteracoes Drizzle e migration local, usando `db:generate` somente na etapa de implementacao.
4. Nao executar `db:migrate` sem validacao humana explicita.
5. Criar camada de auth/session server-side e route handler do provider.
6. Criar policies server-only para admin-like e customer ownership.
7. Proteger rotas admin/customer e server actions administrativas.
8. Adicionar fluxo de cadastro/login/logout e seed admin dev controlado.
9. Atualizar testes unitarios/e2e e documentacao operacional.

## 9. Arquivos provavelmente alterados

| Caminho | Motivo |
|---|---|
| `package.json` / lockfile | Adicionar Better Auth e adapter Drizzle, se ainda ausentes. |
| `src/db/schema.ts` | Mapear/adicionar tabelas e campos de auth. |
| `src/db/client.ts` | Garantir compatibilidade do adapter com `db = null`. |
| `src/lib/env.ts` | Validar vars de auth e seed dev sem expor valores. |
| `src/lib/runtime-mode.ts` | Trocar guardrail temporario por flags de auth/policy real. |
| `src/app/(auth)/login/page.tsx` | Conectar formulario ao fluxo de login. |
| `src/app/(auth)/cadastro/page.tsx` | Conectar cadastro publico customer-only. |
| `src/app/(customer)/minha-conta/page.tsx` | Proteger area customer. |
| `src/app/(customer)/enderecos/page.tsx` | Proteger area customer. |
| `src/app/(customer)/pedidos/page.tsx` | Manter protegido/placeholder sem pedidos reais. |
| `src/app/admin/**` | Proteger rotas admin. |
| `src/features/products/server/product-actions.ts` | Validar policy antes de mutation real. |
| `src/features/uploads/product-image-upload.ts` | Preservar bloqueios e exigir policy para metadata quando aplicavel. |
| `src/tests/unit/**` | Cobrir policies, roles, guardrails, login/cadastro/logout. |
| `src/tests/e2e/**` | Cobrir admin/customer protegidos e auth flows. |
| `docs/architecture/auth.md` | Atualizar arquitetura de auth. |
| `docs/architecture/database.md` | Registrar delta de schema, se houver. |
| `docs/operations/env.md` | Documentar vars sem valores reais. |
| `docs/features/admin-products.md` | Atualizar impacto de policy em admin. |

## 10. Arquivos provavelmente criados

| Caminho | Motivo |
|---|---|
| `src/features/auth/server/auth.ts` | Configuracao server-side do provider. |
| `src/features/auth/server/session.ts` | Contrato de sessao normalizado para a aplicacao. |
| `src/features/auth/server/policies.ts` | Policies `requireAdminLike`, `requireCustomer`, `requireOwner`. |
| `src/features/auth/server/actions.ts` | Actions de login/cadastro/logout, se este padrao for adotado. |
| `src/app/api/auth/[...all]/route.ts` | Route handler do Better Auth, conforme integracao final. |
| `src/middleware.ts` ou checagens em layouts/pages | Protecao inicial de rotas, sem substituir checks server-side. |
| `scripts/db/seed-admin-dev.mjs` | Seed admin dev local/dev only. |
| `src/tests/unit/auth-policies.test.ts` | Unit tests de roles/policies. |
| `src/tests/unit/auth-guardrails.test.ts` | Unit tests de ambiente/fallback. |
| `src/tests/unit/auth-actions.test.ts` | Unit tests de login/cadastro/logout, se viavel sem secrets reais. |
| `src/tests/e2e/auth-admin.spec.ts` | E2E de admin protegido. |
| `src/tests/e2e/auth-customer.spec.ts` | E2E de area customer protegida. |
| `docs/features/auth-policies.md` | Documento da feature. |
| `docs/operations/auth-env.md` | Variaveis e operacao sem secrets. |

## 11. Estrategia por area

### Auth/session

- Usar Better Auth como provider e expor uma camada local que normalize `userId`, `role`, `email` e status autenticado.
- A camada server-side deve tratar sessao ausente, expirada, invalida ou timeout como `unauthenticated`.
- Login retorna erro generico controlado; logout invalida sessao server-side e limpa estado de cliente conforme provider.

### Schema/migrations

- Implementar schema em Drizzle na etapa de coding e gerar migration local.
- Validar manualmente o SQL gerado antes de qualquer aplicacao.
- Nao usar `db:migrate` em banco real sem aprovacao humana.

### Seed admin dev

- Criar seed separado, bloqueado fora de `development`/`test`.
- Exigir `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`.
- Nunca imprimir senha, hash, token ou URL de banco.

### Rotas protegidas

- `/admin` e `/admin/**` exigem `admin` ou `manager`.
- `/minha-conta/**`, `/enderecos/**` e futuras rotas customer exigem usuario autenticado.
- Storefront publico de catalogo permanece acessivel sem login.

### Server actions

- Toda action que muta produto/imagem/admin chama policy antes do repository.
- UI ou middleware nao bastam; action deve validar autorizacao no proprio caminho server-side.
- Erros retornam estados seguros e testaveis.

### Customer ownership

- Consultas/mutations customer futuras filtram por `session.user.id` no servidor.
- Cliente nunca envia `userId` confiavel para autorizacao.
- Acesso cruzado retorna `forbidden` ou equivalente seguro.

### Ambientes

- Local/dev sem banco: build/test funcionam; auth real pode ficar indisponivel com mensagem segura.
- Local/dev com banco: auth real e seed admin dev podem operar.
- Test: usar fixtures/mocks controlados sem credenciais reais.
- Preview/producao: bloquear mutacao admin se auth/policies reais nao estiverem configuradas e validadas.

## 12. Impactos em superficies

| Superficie | Impacto |
|---|---|
| Admin | Rota e mutations passam a depender de sessao admin/manager. |
| Storefront | Catalogo publico permanece sem login e regras de produto publico ficam preservadas. |
| Customer | Paginas placeholder passam a ser protegidas; pedidos reais continuam fora de escopo. |
| Upload | Upload/metadata preserva guardrails e passa por policy quando for mutation admin. |
| Documentacao | Auth, env, database e admin-products precisam registrar novo fluxo operacional. |

## 13. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|---|---|---|---|
| Schema Better Auth conflitar com `users` existente | alto | medio | Mapear tabela/campos antes da migration e revisar SQL gerado. |
| Actions protegidas dependerem apenas de middleware/layout | alto | medio | Criar policy server-only e testes unitarios por action. |
| Build/test passarem a exigir `DATABASE_URL` | alto | medio | Preservar `db = null`, mocks e testes sem credenciais reais. |
| Seed admin dev vazar senha/log | alto | baixo | Redacao segura, logs sem valores e testes de guardrail. |
| Preview/producao ficarem com mutation liberada parcialmente | alto | medio | Guardrail de ambiente + policy obrigatoria + e2e/unit. |
| Cadastro simultaneo duplicar e-mail | medio | medio | Constraint unica e tratamento de erro controlado. |
| Timeout liberar acesso por fallback permissivo | alto | baixo | Falha segura como `unauthenticated`/`forbidden`. |

## 14. Criterio de pronto

- [ ] Better Auth integrado sem exigir credenciais reais para build/test.
- [ ] Schema/migration local gerados e revisados, sem aplicacao em banco real sem validacao humana.
- [ ] Login, cadastro publico customer-only e logout implementados.
- [ ] Rotas admin e customer protegidas.
- [ ] Product/admin server actions protegidas por policy.
- [ ] Customer ownership validado server-side.
- [ ] Seed admin dev local/dev only e sem senha hardcoded.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` aprovados.
- [ ] Documentacao de auth/env/database/admin atualizada.
- [ ] Checkout, pagamento, frete, cupom e pedidos reais continuam fora de escopo.

## 15. Ordem recomendada de implementacao

1. Adicionar dependencias e camada server-only de auth.
2. Mapear schema Better Auth contra `src/db/schema.ts`.
3. Gerar migration local, sem aplicar.
4. Criar contrato de sessao e policies.
5. Proteger server actions administrativas.
6. Proteger rotas admin.
7. Implementar login/cadastro/logout.
8. Proteger area customer e placeholders.
9. Criar seed admin dev controlado.
10. Adicionar testes unitarios.
11. Adicionar e2e de admin/customer/auth.
12. Atualizar documentacao.

## 16. Historico de alteracoes

| Data | Alteracao | Autor |
|---|---|---|
| 2026-06-08 | Versao inicial gerada por `/reversa-plan` | reversa |
