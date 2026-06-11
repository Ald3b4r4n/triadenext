# Auth, Tarefas de Implementacao

> Sequencia executavel para reimplementar ou validar a unit `auth` a partir das specs extraidas. Nao representa alteracao aplicada no codigo atual.

## Pre-requisitos

- [ ] Dependencias da unit listadas em `design.md` estao disponiveis: Better Auth, Drizzle adapter, Next App Router, Zod e runtime mode.
- [ ] Schema/migrations do banco contemplam `users`, `sessions`, `accounts`, `verifications` e enum `user_role`.
- [ ] Variaveis `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` e `NEXT_PUBLIC_APP_URL` estao documentadas com placeholders seguros.
- [ ] Guardrails de ambiente estao definidos antes de habilitar mutacoes administrativas reais.
- [ ] Testes unitarios e E2E podem rodar sem banco de producao e sem secrets reais.

## Tarefas

- [ ] T-AUTH-01, Configurar Better Auth server-side com Drizzle adapter opcional
  - Origem no sistema atual: `src/features/auth/server/auth.ts`
  - Criterio de pronto: auth usa tabelas Drizzle quando `db` existe e permanece buildavel sem `DATABASE_URL`.
  - Confianca: 🟢

- [ ] T-AUTH-02, Modelar roles `customer`, `admin` e `manager`
  - Origem no sistema atual: `src/features/auth/server/auth.ts`, `src/db/schema.ts`
  - Criterio de pronto: novo usuario publico recebe `customer` por padrao e input publico nao consegue definir role.
  - Confianca: 🟢

- [ ] T-AUTH-03, Implementar leitura normalizada de sessao
  - Origem no sistema atual: `src/features/auth/server/session.ts`
  - Criterio de pronto: `getCurrentSession` retorna `authenticated` com `userId`, `email`, `role` ou `unauthenticated` com motivo controlado.
  - Confianca: 🟢

- [ ] T-AUTH-04, Implementar timeout de consulta de sessao
  - Origem no sistema atual: `src/features/auth/server/session.ts`
  - Criterio de pronto: provider travado por mais de 5 segundos resulta em `unauthenticated/timeout`.
  - Confianca: 🟢

- [ ] T-AUTH-05, Validar `returnTo` contra open redirect
  - Origem no sistema atual: `src/features/auth/server/session.ts`
  - Criterio de pronto: destinos externos, `//...` e `/api/auth...` caem para `/`.
  - Confianca: 🟢

- [ ] T-AUTH-06, Implementar Server Action de login
  - Origem no sistema atual: `src/features/auth/server/actions.ts`
  - Criterio de pronto: formulario invalido retorna erros de campo, auth indisponivel retorna erro seguro, credencial valida redireciona para destino seguro.
  - Confianca: 🟢

- [ ] T-AUTH-07, Mesclar carrinho guest apos login
  - Origem no sistema atual: `src/features/auth/server/actions.ts`, `src/features/cart/server/cart-service.ts`
  - Criterio de pronto: token guest existente e valido e associado ao usuario autenticado e expirado apos merge.
  - Confianca: 🟡

- [ ] T-AUTH-08, Implementar Server Action de cadastro
  - Origem no sistema atual: `src/features/auth/server/actions.ts`
  - Criterio de pronto: dados invalidos retornam erro de campo, cadastro valido cria usuario customer e redireciona para `/minha-conta` ou `returnTo` seguro.
  - Confianca: 🟢

- [ ] T-AUTH-09, Implementar logout server-side
  - Origem no sistema atual: `src/features/auth/server/actions.ts`
  - Criterio de pronto: signOut e executado quando possivel e o usuario sempre termina em `/login`.
  - Confianca: 🟢

- [ ] T-AUTH-10, Implementar `requireCustomer`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: qualquer sessao autenticada retorna `allowed`; visitante retorna `unauthenticated`.
  - Confianca: 🟢

- [ ] T-AUTH-11, Implementar `requireAdminLike`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`, `src/lib/runtime-mode.ts`
  - Criterio de pronto: sem banco retorna `blocked/missing_database`, auth ausente retorna `blocked/auth_not_ready`, `customer` retorna `forbidden`, `admin/manager` retorna `allowed`.
  - Confianca: 🟢

- [ ] T-AUTH-12, Implementar `requireOwner`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: usuario autenticado dono recebe `allowed`; usuario diferente recebe `forbidden/not_owner`.
  - Confianca: 🟢

- [ ] T-AUTH-13, Proteger layout customer
  - Origem no sistema atual: `src/app/(customer)/layout.tsx`
  - Criterio de pronto: visitante em rota customer e redirecionado para `/login?returnTo=/minha-conta`.
  - Confianca: 🟢

- [ ] T-AUTH-14, Proteger layout admin
  - Origem no sistema atual: `src/app/admin/layout.tsx`
  - Criterio de pronto: visitante e redirecionado para login; role insuficiente ou runtime bloqueado renderiza tela segura sem children admin.
  - Confianca: 🟢

- [ ] T-AUTH-15, Expor mensagens seguras de policy
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: mensagens nao incluem stack, cookies, headers, tokens ou valores de env.
  - Confianca: 🟢

## Tarefas de Teste

- [ ] TT-AUTH-01, Testar `normalizeRole` aceitando apenas `customer`, `admin` e `manager`.
- [ ] TT-AUTH-02, Testar `validateReturnTo` com caminho interno valido, URL externa, `//evil.test` e `/api/auth/...`.
- [ ] TT-AUTH-03, Testar `getCurrentSession` para sessao ausente, role invalido, timeout e sessao valida.
- [ ] TT-AUTH-04, Testar `loginAction` com formulario invalido, auth indisponivel, credenciais invalidas e credenciais validas.
- [ ] TT-AUTH-05, Testar merge de carrinho guest no login sem criar pedido nem mutacao indevida.
- [ ] TT-AUTH-06, Testar `signupAction` garantindo role padrao customer.
- [ ] TT-AUTH-07, Testar `requireCustomer` para visitante e usuario autenticado.
- [ ] TT-AUTH-08, Testar `requireAdminLike` para banco ausente, auth ausente, customer, manager e admin.
- [ ] TT-AUTH-09, Testar `requireOwner` para owner correto e owner divergente.
- [ ] TT-AUTH-10, E2E: visitante em `/minha-conta` ou `/pedidos` redireciona para login.
- [ ] TT-AUTH-11, E2E: visitante em `/admin` redireciona para login e customer nao renderiza conteudo administrativo.
- [ ] TT-AUTH-12, E2E: fluxo publico de login/cadastro nao aceita `returnTo` malicioso.

## Tarefas de Migracao de Dados

- [ ] TM-AUTH-01, Mapear usuarios legados para `users`
  - Origem no sistema atual: `src/db/schema.ts`; origem historica a validar no Laravel legado.
  - Criterio de pronto: campos obrigatorios do novo schema possuem correspondencia ou valor default seguro.
  - Confianca: 🔴

- [ ] TM-AUTH-02, Definir traducao de papeis legados para `customer`, `admin` e `manager`
  - Origem no sistema atual: `src/db/schema.ts`, `_reversa_sdd/permissions.md`
  - Criterio de pronto: tabela de equivalencia validada por humano antes de migrar dados reais.
  - Confianca: 🔴

- [ ] TM-AUTH-03, Invalidar ou recriar sessoes legadas
  - Origem no sistema atual: `src/features/auth/server/auth.ts`
  - Criterio de pronto: nenhuma sessao Laravel antiga e aceita diretamente pelo Next/Better Auth sem processo explicito.
  - Confianca: 🟡

## Ordem Sugerida

1. Implementar schema/auth provider e env placeholders antes das actions.
2. Implementar leitura de sessao, roles e `returnTo` antes dos layouts protegidos.
3. Implementar policies antes de qualquer mutacao admin, checkout ou pedido.
4. Implementar actions de login/cadastro/logout depois das policies basicas.
5. Adicionar merge de carrinho guest apos o login basico estar coberto por testes.
6. Cobrir E2E de bloqueio customer/admin antes de liberar telas operacionais.
7. Tratar migracao de dados somente apos decisao humana sobre usuarios e roles legados.

## Lacunas Pendentes (🔴)

- Recuperacao de senha nao esta especificada como fluxo completo.
- Perfil de cliente e enderecos reais ainda precisam de feature propria.
- Matriz granular de permissoes administrativas ainda nao existe.
- Mapeamento de usuarios/papeis do Laravel legado exige validacao humana antes de migracao real.
