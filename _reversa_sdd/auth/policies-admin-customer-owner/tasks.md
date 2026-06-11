# Auth / Policies Admin, Customer e Owner, Tarefas de Implementacao

> Sequencia executavel para reimplementar ou validar a subunidade `auth/policies-admin-customer-owner` a partir das specs extraidas. Nao representa alteracao aplicada no codigo atual.

## Pre-requisitos

- [ ] `AppSession` e `AuthRole` definidos pela subunidade de sessao.
- [ ] `getCurrentSession` disponivel e testavel.
- [ ] `getRuntimeMode` informa `hasDatabase` e `isAuthReady`.
- [ ] Layouts customer/admin podem executar guard server-side.
- [ ] Actions de dominio retornam mensagens seguras sem jogar erro bruto para UI.
- [ ] Testes unitarios conseguem injetar sessoes e mockar runtime.

## Tarefas

- [ ] T-AUTH-POL-01, Definir tipo `PolicyDecision`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: tipo cobre `allowed`, `unauthenticated`, `forbidden` e `blocked` com reasons enumerados.
  - Confianca: 🟢

- [ ] T-AUTH-POL-02, Implementar `requireAuthenticatedSession`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: sessao autenticada vira `allowed`; sessao nao autenticada preserva `reason`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-03, Implementar `requireAuthenticated`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: resolve a promise de sessao e delega para `requireAuthenticatedSession`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-04, Implementar `requireCustomer`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: qualquer role autenticada retorna `allowed`; visitante retorna `unauthenticated`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-05, Implementar guardrail de banco em `requireAdminLike`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`, `src/lib/runtime-mode.ts`
  - Criterio de pronto: `hasDatabase=false` retorna `blocked/missing_database` antes de resolver/autorizacao por role.
  - Confianca: 🟢

- [ ] T-AUTH-POL-06, Implementar guardrail de auth em `requireAdminLike`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`, `src/lib/runtime-mode.ts`
  - Criterio de pronto: `isAuthReady=false` retorna `blocked/auth_not_ready` antes de permitir role administrativa.
  - Confianca: 🟢

- [ ] T-AUTH-POL-07, Implementar autorizacao de role admin-like
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: `admin` e `manager` retornam `allowed`; `customer` retorna `forbidden/insufficient_role`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-08, Implementar `requireOwner`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: sessao com `userId` igual ao `resourceUserId` retorna `allowed`; divergente retorna `forbidden/not_owner`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-09, Implementar `policyMessage`
  - Origem no sistema atual: `src/features/auth/server/policies.ts`
  - Criterio de pronto: cada status gera mensagem publica sem stack, headers, cookies, tokens ou valores reais de env.
  - Confianca: 🟢

- [ ] T-AUTH-POL-10, Proteger layout customer
  - Origem no sistema atual: `src/app/(customer)/layout.tsx`
  - Criterio de pronto: qualquer decisao diferente de `allowed` redireciona para `/login?returnTo=/minha-conta`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-11, Proteger layout admin
  - Origem no sistema atual: `src/app/admin/layout.tsx`
  - Criterio de pronto: `unauthenticated` redireciona para `/login?returnTo=/admin`; `blocked`/`forbidden` renderizam tela `Acesso bloqueado`; `allowed` renderiza children.
  - Confianca: 🟢

- [ ] T-AUTH-POL-12, Aplicar `requireAdminLike` em actions administrativas
  - Origem no sistema atual: `src/features/products/server/product-actions.ts`, `src/features/coupons/server/admin-coupon-actions.ts`, `src/features/shipping/server/admin-shipping-actions.ts`, `src/features/notifications/server/notification-actions.ts`, `src/features/uploads/product-image-upload.ts`
  - Criterio de pronto: cada action admin bloqueia antes de validar/persistir dados quando policy nao for `allowed`.
  - Confianca: 🟢

- [ ] T-AUTH-POL-13, Aplicar `requireCustomer` em actions customer
  - Origem no sistema atual: `src/features/orders/server/order-actions.ts`, `src/features/payments/server/payment-actions.ts`
  - Criterio de pronto: leitura/pagamento customer bloqueiam visitante antes de consultar dados sensiveis.
  - Confianca: 🟢

## Tarefas de Teste

- [ ] TT-AUTH-POL-01, Unit: `requireAuthenticatedSession` mapeia authenticated para `allowed`.
- [ ] TT-AUTH-POL-02, Unit: `requireAuthenticatedSession` preserva todos os reasons unauthenticated.
- [ ] TT-AUTH-POL-03, Unit: `requireCustomer` aceita `customer`, `admin` e `manager` autenticados.
- [ ] TT-AUTH-POL-04, Unit: `requireCustomer` rejeita visitante como `unauthenticated`.
- [ ] TT-AUTH-POL-05, Unit: `requireAdminLike` retorna `blocked/missing_database` quando `hasDatabase=false`.
- [ ] TT-AUTH-POL-06, Unit: `requireAdminLike` retorna `blocked/auth_not_ready` quando auth nao esta pronto.
- [ ] TT-AUTH-POL-07, Unit: `requireAdminLike` aceita `admin` e `manager` quando runtime esta apto.
- [ ] TT-AUTH-POL-08, Unit: `requireAdminLike` rejeita `customer` como `forbidden/insufficient_role`.
- [ ] TT-AUTH-POL-09, Unit: `requireOwner` aceita owner correto e rejeita owner divergente.
- [ ] TT-AUTH-POL-10, Unit: `policyMessage` nao inclui valores de env, cookies ou stack.
- [ ] TT-AUTH-POL-11, Unit: actions admin bloqueiam antes de chamar repository quando policy falha.
- [ ] TT-AUTH-POL-12, Unit: actions customer bloqueiam antes de consultar pedido/pagamento quando policy falha.
- [ ] TT-AUTH-POL-13, E2E: visitante em `/minha-conta` redireciona para login.
- [ ] TT-AUTH-POL-14, E2E: visitante em `/enderecos` redireciona para login.
- [ ] TT-AUTH-POL-15, E2E: admin sem banco/auth real mostra `Acesso bloqueado` e mensagem segura.

## Tarefas de Migracao de Dados

- [ ] TM-AUTH-POL-01, Mapear papeis administrativos legados para `admin` ou `manager`
  - Origem no sistema atual: `_reversa_sdd/permissions.md`, `src/db/schema.ts`
  - Criterio de pronto: equivalencia de papeis validada por humano antes de importar usuarios reais.
  - Confianca: 🔴

- [ ] TM-AUTH-POL-02, Definir se permissao granular sera introduzida antes ou depois da migracao
  - Origem no sistema atual: `_reversa_sdd/permissions.md`
  - Criterio de pronto: decisao registrada para evitar promover usuarios legados com acesso amplo indevido.
  - Confianca: 🔴

## Ordem Sugerida

1. Definir `PolicyDecision` e `requireAuthenticatedSession`.
2. Implementar `requireCustomer`.
3. Implementar `requireAdminLike` com guardrails de runtime antes da role.
4. Implementar `requireOwner`.
5. Implementar `policyMessage`.
6. Proteger layouts customer/admin.
7. Aplicar policies nas actions de dominio.
8. Cobrir todos os branches unitarios antes dos E2E.
9. Resolver mapeamento de papeis legados antes de importar usuarios reais.

## Lacunas Pendentes (🔴)

- Permissao granular por capacidade ainda nao existe alem de `admin`/`manager`.
- Mapeamento de papeis do Laravel legado para roles atuais exige decisao humana.
- `requireOwner` precisa ser chamado explicitamente por cada fluxo que tenha recurso com dono; a policy nao intercepta por si so.
