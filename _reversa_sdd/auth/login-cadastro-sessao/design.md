# Auth / Login, Cadastro e Sessao, Design Tecnico

> Spec executavel da subunidade `auth/login-cadastro-sessao`. Foca no COMO os fluxos publicos de autenticacao e sessao sao construidos.

## Interface

### Paginas

| Rota | Componente | Entrada | Saida | Observacao |
|------|------------|---------|-------|------------|
| `/login` | `LoginPage` | `searchParams.returnTo?` | Pagina com `AuthForm mode="login"` ou redirect `/` | Usuario autenticado nao ve formulario. |
| `/cadastro` | `CadastroPage` | Nenhuma entrada publica obrigatoria | Pagina com `AuthForm mode="signup"` ou redirect `/minha-conta` | Cadastro publico cria cliente. |

### Componentes

| Simbolo | Props | Saida | Observacao |
|---------|-------|-------|------------|
| `AuthForm` | `{ mode, action, returnTo? }` | Form HTML com `useActionState` | Alterna campos entre login e cadastro. |

### Schemas

| Simbolo | Entrada | Saida | Regra principal |
|---------|---------|-------|-----------------|
| `loginSchema` | `{ email, password, returnTo? }` | `LoginInput` | E-mail valido/lowercase; senha obrigatoria. |
| `signupSchema` | `{ name, email, password, role?, returnTo? }` | `SignupInput` | Nome 2-120, e-mail valido/lowercase, senha forte. |

### Server Actions e Sessao

| Simbolo | Assinatura | Retorno | Observacao |
|---------|-----------|---------|------------|
| `loginAction` | `(_previousState, formData)` | `AuthActionState` ou redirect | Valida payload, chama `signInEmail`, mescla carrinho guest e redireciona. |
| `signupAction` | `(_previousState, formData)` | `AuthActionState` ou redirect | Valida payload, chama `signUpEmail` sem enviar role e redireciona. |
| `logoutAction` | `()` | redirect | Chama `signOut`; sucesso ou falha terminam em `/login`. |
| `getCurrentSession` | `()` | `Promise<AppSession>` | Resolve sessao Better Auth com timeout e role normalizado. |
| `validateReturnTo` | `(value)` | `string` | Garante redirect interno seguro. |

## Fluxo Principal: Login

1. `LoginPage` chama `getCurrentSession`.
2. Se a sessao ja estiver autenticada, a pagina redireciona para `/`.
3. Caso contrario, renderiza `AuthForm` em modo `login`, repassando `returnTo` recebido por query string.
4. `AuthForm` envia `email`, `password` e `returnTo` para `loginAction`.
5. `loginAction` sanitiza `returnTo` antes de validar o schema.
6. `loginSchema` normaliza e-mail e exige senha informada.
7. Se o runtime nao estiver com auth pronto, retorna erro seguro.
8. A action captura token guest candidato a merge.
9. Better Auth executa `auth.api.signInEmail` usando headers/cookies da request.
10. A action resolve a sessao atual apos login.
11. Se houver sessao autenticada e token guest, chama `mergeGuestCartIntoUser` e depois `expireGuestCartToken`.
12. O usuario e redirecionado para `returnTo` validado ou `/`.

## Fluxo Principal: Cadastro

1. `CadastroPage` chama `getCurrentSession`.
2. Se a sessao ja estiver autenticada, redireciona para `/minha-conta`.
3. Caso contrario, renderiza `AuthForm` em modo `signup`, com `returnTo="/minha-conta"`.
4. `AuthForm` envia `name`, `email`, `password` e `returnTo` para `signupAction`.
5. `signupAction` sanitiza `returnTo` e valida `signupSchema`.
6. `signupSchema` normaliza e-mail, valida nome e exige senha com letras e numeros.
7. Campo `role` pode existir no input bruto, mas nao e enviado ao provider.
8. Better Auth executa `auth.api.signUpEmail` com `name`, `email` e `password`.
9. O papel efetivo vem da config Better Auth/schema, com default `customer`.
10. O usuario e redirecionado para `/minha-conta` ou `returnTo` seguro.

## Fluxo Principal: Sessao

1. `getCurrentSession` consulta `getRuntimeMode`.
2. Se auth nao estiver pronto, retorna `unauthenticated/unavailable`.
3. Se auth estiver pronto, chama `auth.api.getSession({ headers })`.
4. A chamada compete com timeout de 5 segundos.
5. Sem usuario, retorna `unauthenticated/missing`.
6. Com usuario, normaliza role via `normalizeRole`.
7. Role desconhecido retorna `unauthenticated/invalid`.
8. Role valido retorna `authenticated` com `userId`, `email` e `role`.

## Fluxos Alternativos

- **Payload invalido:** `safeParse` falha e `toAuthErrorState` retorna mensagem geral e erros por campo.
- **Auth real indisponivel:** actions retornam `Auth real indisponivel neste ambiente.` sem chamar provider.
- **Credenciais invalidas:** excecao de `signInEmail` vira `Credenciais invalidas ou auth indisponivel.`
- **Cadastro recusado:** excecao de `signUpEmail` vira `Nao foi possivel concluir o cadastro. Revise os dados e tente novamente.`
- **Logout com excecao:** catch redireciona para `/login`.
- **Redirect inseguro:** `validateReturnTo` troca destino por `/`.
- **Timeout de sessao:** `AuthTimeoutError` vira `unauthenticated/timeout`.

## Dependencias

- `src/features/auth/server/auth.ts`: instancia Better Auth.
- `src/features/auth/server/schemas.ts`: schemas Zod de login/cadastro.
- `src/features/auth/server/session.ts`: sessao, timeout, role e redirect seguro.
- `src/features/auth/server/actions.ts`: Server Actions de login/cadastro/logout.
- `src/features/auth/components/auth-form.tsx`: formulario client component.
- `src/features/cart/server/cart-session.ts`: token guest para merge.
- `src/features/cart/server/cart-service.ts`: merge do carrinho guest.
- `src/lib/runtime-mode.ts`: guardrail de auth disponivel.
- `next/headers`: headers/cookies da request server-side.
- `next/navigation`: redirects.

## Decisoes de Design Identificadas

| Decisao | Evidencia no codigo | Confianca |
|---------|---------------------|-----------|
| Login e cadastro usam Server Actions, nao API route propria. | `src/features/auth/server/actions.ts` | 🟢 |
| Formulario e unico e alterna modo por prop. | `src/features/auth/components/auth-form.tsx` | 🟢 |
| E-mail e normalizado no schema antes de chegar ao provider. | `src/features/auth/server/schemas.ts` | 🟢 |
| Cadastro recebe `role` no schema bruto mas nao repassa ao provider. | `src/features/auth/server/actions.ts`, `src/features/auth/server/auth.ts` | 🟢 |
| Sessao usa timeout explicito de 5 segundos. | `src/features/auth/server/session.ts` | 🟢 |
| Carrinho guest e mesclado apos login, nunca antes da autenticacao. | `src/features/auth/server/actions.ts` | 🟢 |
| Logout privilegia sair da experiencia protegida mesmo se provider falhar. | `src/features/auth/server/actions.ts` | 🟢 |

## Estado Interno

### UI

- `AuthActionState.status`: `idle` ou `error`.
- `AuthActionState.message`: mensagem geral renderizada no formulario.
- `AuthActionState.fields`: mapa de erros por campo.
- `pending`: estado retornado por `useActionState`, usado para desabilitar submit.

### Sessao

- `AppSession.authenticated`: `userId`, `email`, `role`.
- `AppSession.unauthenticated`: `missing`, `expired`, `invalid`, `timeout` ou `unavailable`.

### Carrinho

- Token guest e lido antes de `signInEmail`.
- Merge ocorre apenas se a sessao pos-login for autenticada.
- Token guest e expirado apos merge bem-sucedido.

## Observabilidade

- Nao ha logs estruturados dedicados neste fluxo.
- Estados de erro sao observaveis pela UI via `AuthActionState`.
- Redirects sao observaveis via E2E.
- Testes unitarios atuais cobrem payload invalido e logout.
- Testes E2E atuais cobrem renderizacao das paginas e redirect de checkout para login.

## Riscos e Lacunas

- 🔴 Recuperacao de senha, troca de senha e verificacao de e-mail nao estao modeladas.
- 🟡 Testes atuais nao cobrem explicitamente `returnTo` malicioso.
- 🟡 Testes atuais nao cobrem merge de carrinho guest em login real.
- 🟡 Falha no merge do carrinho dentro do bloco do login pode retornar erro generico de credenciais/auth, exigindo cuidado se esse fluxo for refinado.
