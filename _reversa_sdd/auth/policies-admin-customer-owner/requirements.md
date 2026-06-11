# Auth / Policies Admin, Customer e Owner

> Spec executavel da subunidade `auth/policies-admin-customer-owner`. Foca no QUE as policies de autorizacao server-side devem garantir.

## Visao Geral

Esta subunidade define as policies que convertem uma sessao normalizada em decisao de acesso para areas customer, superficies administrativas e recursos pertencentes a um usuario. Ela e consumida por layouts protegidos, Server Actions de dominio e operacoes administrativas, sem autorizar webhooks ou sistema externo.

## Responsabilidades

- Converter `AppSession` autenticada em decisao `allowed`.
- Converter sessao ausente/invalida/expirada/indisponivel em decisao `unauthenticated`.
- Autorizar qualquer usuario autenticado para superficie customer.
- Autorizar apenas `admin` e `manager` para superficie administrativa.
- Bloquear admin-like quando banco ou auth real nao estiverem prontos.
- Autorizar recurso por dono via `resourceUserId`.
- Gerar mensagens seguras para UI/actions sem expor secrets ou detalhes internos.

## Regras de Negocio

- 🟢 `requireAuthenticatedSession` deve mapear sessao autenticada para `allowed`.
- 🟢 `requireAuthenticatedSession` deve preservar motivo de sessao nao autenticada.
- 🟢 `requireCustomer` exige somente sessao autenticada; papel pode ser `customer`, `admin` ou `manager`.
- 🟢 `requireAdminLike` exige `DATABASE_URL` disponivel antes de aceitar qualquer role.
- 🟢 `requireAdminLike` exige auth real pronto antes de aceitar qualquer role.
- 🟢 `requireAdminLike` aceita apenas `admin` e `manager`.
- 🟢 `requireAdminLike` rejeita `customer` com `forbidden/insufficient_role`.
- 🟢 `requireOwner` aceita somente sessao autenticada cujo `userId` seja igual ao `resourceUserId`.
- 🟢 Admin layout redireciona apenas falha `unauthenticated`; bloqueios de runtime/role renderizam tela segura.
- 🟢 Customer layout redireciona qualquer falha para login com `returnTo=/minha-conta`.
- 🟢 Mensagens de policy devem ser genicas e nao podem incluir stack, headers, cookies, tokens ou valores de env.
- 🔴 Nao existe permissao granular por capacidade alem dos papeis `admin` e `manager`.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-AUTH-POL-01 | Mapear sessao autenticada para `allowed`. | Must | Dada sessao `authenticated`, quando `requireAuthenticatedSession` roda, entao retorna `{ status: "allowed", userId, role }`. |
| RF-AUTH-POL-02 | Mapear sessao nao autenticada com motivo seguro. | Must | Dada sessao `unauthenticated`, quando policy roda, entao retorna `unauthenticated` com o mesmo `reason`. |
| RF-AUTH-POL-03 | Autorizar area customer para autenticados. | Must | Dada sessao autenticada, quando `requireCustomer` roda, entao retorna `allowed`. |
| RF-AUTH-POL-04 | Redirecionar visitante em area customer. | Must | Visitante em `/minha-conta` ou `/enderecos` deve ir para login sem renderizar conteudo protegido. |
| RF-AUTH-POL-05 | Bloquear admin sem banco. | Must | Sem `DATABASE_URL`, `requireAdminLike` retorna `blocked/missing_database` antes de avaliar role. |
| RF-AUTH-POL-06 | Bloquear admin sem auth real. | Must | Sem auth pronto, `requireAdminLike` retorna `blocked/auth_not_ready`. |
| RF-AUTH-POL-07 | Autorizar `admin` e `manager`. | Must | Dada sessao admin ou manager com runtime apto, `requireAdminLike` retorna `allowed`. |
| RF-AUTH-POL-08 | Rejeitar `customer` no admin. | Must | Dada sessao customer com runtime apto, `requireAdminLike` retorna `forbidden/insufficient_role`. |
| RF-AUTH-POL-09 | Proteger recursos por owner. | Must | Dado `resourceUserId` diferente da sessao, `requireOwner` retorna `forbidden/not_owner`. |
| RF-AUTH-POL-10 | Renderizar bloqueio admin seguro. | Must | Em runtime bloqueado ou role insuficiente, `/admin` mostra `Acesso bloqueado` e mensagem segura. |
| RF-AUTH-POL-11 | Gerar mensagens de policy seguras. | Should | Cada `PolicyDecision` possui mensagem publica sem secrets e sem excecao crua. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Admin-like deve checar ambiente antes de autorizar role. | `src/features/auth/server/policies.ts`, `src/lib/runtime-mode.ts` | 🟢 |
| Seguranca | Conteudo customer nao deve renderizar para visitante. | `src/app/(customer)/layout.tsx` | 🟢 |
| Seguranca | Conteudo admin nao deve renderizar quando policy nao for `allowed`. | `src/app/admin/layout.tsx` | 🟢 |
| Privacidade | Mensagens de policy nao devem expor detalhes internos. | `src/features/auth/server/policies.ts` | 🟢 |
| Testabilidade | Policies aceitam `session` injetada para teste deterministico. | `src/features/auth/server/policies.ts`, `src/tests/unit/auth-policies.test.ts` | 🟢 |
| Compatibilidade | Bloqueio sem banco permite E2E local seguro sem DB real. | `src/tests/e2e/auth-admin.spec.ts` | 🟢 |

> Inferido a partir de `policies.ts`, layouts protegidos, matriz de permissoes e testes de acesso.

## Criterios de Aceitacao

```gherkin
Cenario: sessao autenticada vira allowed
  Dado uma sessao authenticated com userId e role
  Quando requireAuthenticatedSession processa a sessao
  Entao retorna status allowed
  E preserva userId e role

Cenario: visitante acessa area customer
  Dado que nao ha sessao autenticada
  Quando o usuario acessa "/minha-conta"
  Entao e redirecionado para "/login"
  E o conteudo customer nao e renderizado

Cenario: admin sem DATABASE_URL
  Dado runtime sem banco
  Quando requireAdminLike e chamado
  Entao retorna blocked/missing_database
  E nao autoriza role admin ou manager

Cenario: customer tenta admin
  Dado runtime apto
  E sessao autenticada com role customer
  Quando requireAdminLike e chamado
  Entao retorna forbidden/insufficient_role

Cenario: recurso de outro usuario
  Dado sessao autenticada do usuario A
  E resourceUserId do usuario B
  Quando requireOwner valida acesso
  Entao retorna forbidden/not_owner
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Mapeamento de sessao para `PolicyDecision` | Must | Base de todos os guards. |
| `requireCustomer` | Must | Protege checkout, pedidos e area do cliente. |
| `requireAdminLike` com guardrails | Must | Protege produtos, cupons, frete, uploads, pedidos admin e notificacoes. |
| `requireOwner` | Must | Evita leitura/mutacao de recurso de outro usuario. |
| `policyMessage` segura | Should | Necessaria para UX e respostas de actions sem vazar detalhes. |
| Permissao granular por capacidade | Could | Lacuna futura alem de admin/manager. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/features/auth/server/policies.ts` | `requireAuthenticated`, `requireCustomer`, `requireAdminLike`, `requireOwner`, `policyMessage` | 🟢 |
| `src/features/auth/server/session.ts` | `AppSession`, `AuthRole` | 🟢 |
| `src/lib/runtime-mode.ts` | `getRuntimeMode` | 🟢 |
| `src/app/admin/layout.tsx` | `AdminLayout` | 🟢 |
| `src/app/(customer)/layout.tsx` | `CustomerLayout` | 🟢 |
| `src/features/products/server/product-actions.ts` | Uso de `requireAdminLike` | 🟢 |
| `src/features/coupons/server/admin-coupon-actions.ts` | Uso de `requireAdminLike` | 🟢 |
| `src/features/shipping/server/admin-shipping-actions.ts` | Uso de `requireAdminLike` | 🟢 |
| `src/features/orders/server/order-actions.ts` | Uso de `requireCustomer` e `requireAdminLike` | 🟢 |
| `src/features/payments/server/payment-actions.ts` | Uso de `requireCustomer` | 🟢 |
| `src/features/notifications/server/notification-actions.ts` | Uso de `requireAdminLike` | 🟢 |
| `src/features/uploads/product-image-upload.ts` | Uso de `requireAdminLike` | 🟢 |
| `src/tests/unit/auth-policies.test.ts` | Teste de mapeamento basico | 🟢 |
| `src/tests/e2e/auth-admin.spec.ts` | Bloqueio admin sem login/banco | 🟢 |
| `src/tests/e2e/auth-customer.spec.ts` | Bloqueio customer anonimo | 🟢 |

## Lacunas e Riscos

- 🔴 Nao existe matriz granular por permissao especifica; `admin` e `manager` sao amplos.
- 🔴 Area de cliente completa ainda nao possui actions de perfil/endereco reais suficientes para exercitar todas as policies futuras.
- 🟡 `requireOwner` existe, mas a cobertura pratica ainda depende de cada action chamar explicitamente a policy.
- 🟡 Testes atuais cobrem mapeamento basico; faltam unitarios diretos para todos os branches de `requireAdminLike` e `requireOwner`.
