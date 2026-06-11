# Auth

> Spec executavel da unit `auth`. Foca no QUE a autenticacao e autorizacao precisam garantir.

## Visao Geral

A unit `auth` concentra autenticacao por e-mail/senha, leitura de sessao, normalizacao de papeis e policies de acesso para areas customer, admin e operacoes protegidas. Ela serve como fronteira entre visitantes, clientes autenticados, usuarios administrativos e fluxos de sistema que nao dependem de sessao browser.

## Responsabilidades

- Autenticar cadastro, login e logout via Better Auth.
- Ler a sessao atual de forma segura, com timeout e falha controlada.
- Normalizar papeis aceitos para `customer`, `admin` e `manager`.
- Proteger rotas customer, rotas administrativas e recursos por dono.
- Validar `returnTo` para impedir redirecionamento externo ou rota de auth API.
- Preservar guardrails quando banco, secret de auth ou auth real nao estiverem disponiveis.

## Regras de Negocio

- 🟢 Usuario novo criado pelo fluxo publico deve assumir papel padrao `customer`.
- 🟢 Apenas `admin` e `manager` podem acessar superficies administrativas.
- 🟢 Cliente autenticado pode acessar checkout, pedidos proprios e pagamento de pedido proprio.
- 🟢 Visitante deve ser redirecionado para login quando tentar acessar area customer ou admin protegida.
- 🟢 `returnTo` so pode ser caminho interno iniciado por `/`, nao pode iniciar por `//` e nao pode apontar para `/api/auth`.
- 🟢 Sessao invalida, ausente ou com papel desconhecido deve falhar de forma segura.
- 🟢 Area administrativa exige `DATABASE_URL` e auth real pronto antes de permitir operacao protegida.
- 🟢 `requireOwner` deve bloquear acesso quando o recurso pertence a outro usuario.
- 🟡 Carrinho guest deve ser mesclado ao usuario autenticado apos login quando houver token guest valido.
- 🔴 Recuperacao de senha, perfil completo, enderecos reais e gestao granular de permissoes ainda nao estao especificados como fluxos completos.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-AUTH-01 | Permitir login por e-mail e senha validos. | Must | Dado formulario valido, quando o provider autentica, entao o usuario e redirecionado para `returnTo` seguro ou `/`. |
| RF-AUTH-02 | Permitir cadastro publico como customer. | Must | Dado dados validos, quando a conta e criada, entao o papel efetivo e `customer` e o usuario segue para destino seguro. |
| RF-AUTH-03 | Permitir logout de sessao ativa. | Must | Dada sessao ativa, quando logout e executado, entao a sessao e encerrada e o usuario retorna para rota publica. |
| RF-AUTH-04 | Resolver sessao atual no servidor. | Must | Dada requisicao com cookies, quando a sessao e consultada, entao retorna usuario autenticado normalizado ou motivo seguro de falha. |
| RF-AUTH-05 | Bloquear customer routes para visitante. | Must | Dado visitante, quando acessa area customer, entao recebe redirect para `/login?returnTo=...`. |
| RF-AUTH-06 | Bloquear admin routes para visitante/customer. | Must | Dado visitante ou customer, quando acessa `/admin`, entao o acesso e negado ou redirecionado sem executar mutacao. |
| RF-AUTH-07 | Autorizar admin-like. | Must | Dado usuario `admin` ou `manager` com runtime apto, quando acessa acao administrativa, entao a policy retorna `allowed`. |
| RF-AUTH-08 | Autorizar dono do recurso. | Must | Dado `resourceUserId` diferente do usuario autenticado, quando `requireOwner` e chamado, entao retorna `forbidden`. |
| RF-AUTH-09 | Validar `returnTo`. | Must | Dado destino externo, protocol-relative ou `/api/auth`, quando o formulario processa redirect, entao usa fallback seguro. |
| RF-AUTH-10 | Mesclar carrinho guest apos login. | Should | Dado login com guest token existente, quando autenticacao conclui, entao itens elegiveis sao associados ao usuario sem violar estoque. |
| RF-AUTH-11 | Expor mensagens seguras de policy. | Should | Dado bloqueio por auth, role ou runtime, quando UI renderiza a falha, entao mostra mensagem controlada sem stack ou secret. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Auth server-side deve bloquear visitante antes de executar a pagina/acao protegida. | `src/app/admin/layout.tsx`, `src/app/(customer)/layout.tsx`, `src/features/auth/server/policies.ts` | 🟢 |
| Seguranca | Roles devem ficar restritas ao enum `customer`, `admin`, `manager`. | `src/features/auth/server/auth.ts`, `src/features/auth/server/session.ts`, `src/db/schema.ts` | 🟢 |
| Seguranca | `returnTo` deve rejeitar open redirect e endpoint de auth API. | `src/features/auth/server/actions.ts`, `src/tests/unit/auth-session.test.ts` | 🟢 |
| Disponibilidade | Leitura de sessao deve falhar de forma controlada em timeout ou erro do provider. | `src/features/auth/server/session.ts` | 🟢 |
| Confiabilidade | Mutacoes administrativas dependem de runtime apto e auth real pronto. | `src/lib/runtime-mode.ts`, `src/features/auth/server/policies.ts` | 🟢 |
| Privacidade | Mensagens de erro nao devem expor stack, cookies, tokens ou secrets. | `src/features/auth/server/actions.ts`, `src/features/auth/server/policies.ts` | 🟢 |

> Inferido a partir do codigo atual e dos artefatos `domain.md`, `permissions.md` e `code-analysis.md`. Validar com equipe de produto antes de ampliar perfil, enderecos e permissao granular.

## Criterios de Aceitacao

```gherkin
Cenario: visitante tenta acessar area customer
  Dado que nao ha sessao autenticada
  Quando o usuario acessa uma rota dentro de "(customer)"
  Entao o sistema redireciona para "/login" com returnTo interno seguro

Cenario: customer tenta acessar admin
  Dado que existe sessao com papel "customer"
  Quando o usuario acessa "/admin"
  Entao o sistema bloqueia acesso administrativo
  E nenhuma mutacao administrativa e executada

Cenario: admin-like acessa superficie administrativa
  Dado que existe sessao com papel "admin" ou "manager"
  E o runtime possui banco e auth real prontos
  Quando o usuario acessa acao protegida por requireAdminLike
  Entao a policy retorna allowed

Cenario: returnTo malicioso e enviado no formulario
  Dado returnTo igual a "https://example.com", "//evil.test" ou "/api/auth/sign-in"
  Quando login ou cadastro processa o destino
  Entao o sistema ignora o destino malicioso
  E usa fallback interno seguro

Cenario: recurso pertence a outro usuario
  Dado sessao autenticada do usuario "A"
  E recurso com owner "B"
  Quando requireOwner valida acesso ao recurso
  Entao o acesso e negado como forbidden
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Login, cadastro, logout e leitura de sessao | Must | Base para checkout autenticado, pedidos e admin. |
| Policies `requireCustomer`, `requireAdminLike` e `requireOwner` | Must | Protegem mutacoes e leituras sensiveis. |
| Validacao de `returnTo` | Must | Evita open redirect e abuso de rotas internas de auth. |
| Guardrail sem banco/auth real | Must | Impede operacao administrativa falsa ou insegura. |
| Merge de carrinho guest no login | Should | Melhora experiencia de compra, mas nao substitui bloqueios principais. |
| Perfil, enderecos e recuperacao de senha completos | Could | Lacuna reconhecida para fases futuras, fora do escopo funcional atual. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/features/auth/server/auth.ts` | Better Auth config e role field | 🟢 |
| `src/features/auth/server/session.ts` | `getCurrentSession`, normalizacao de role, `validateReturnTo` | 🟢 |
| `src/features/auth/server/policies.ts` | `requireAdminLike`, `requireCustomer`, `requireOwner`, `policyMessage` | 🟢 |
| `src/features/auth/server/actions.ts` | `loginAction`, `signupAction`, `logoutAction` | 🟢 |
| `src/app/admin/layout.tsx` | Guard de layout admin | 🟢 |
| `src/app/(customer)/layout.tsx` | Guard de layout customer | 🟢 |
| `src/app/api/auth/[...all]/route.ts` | Endpoint Better Auth | 🟢 |
| `src/tests/unit/auth-actions.test.ts` | Testes de actions auth | 🟢 |
| `src/tests/unit/auth-policies.test.ts` | Testes de policies | 🟢 |
| `src/tests/unit/auth-session.test.ts` | Testes de sessao e returnTo | 🟢 |
| `src/tests/e2e/auth-admin.spec.ts` | Bloqueio admin sem login | 🟢 |
| `src/tests/e2e/auth-customer.spec.ts` | Bloqueio customer sem login | 🟢 |

## Lacunas e Riscos

- 🔴 Nao ha fluxo completo de recuperacao de senha documentado como feature migrada.
- 🔴 Perfil de cliente e enderecos existem como superficie/tabelas, mas ainda nao formam area completa de conta.
- 🔴 Permissoes administrativas ainda sao amplas (`admin`/`manager`), sem matriz granular por capacidade.
- 🟡 Login depende de provider e runtime; indisponibilidade precisa continuar sendo tratada como falha segura.
