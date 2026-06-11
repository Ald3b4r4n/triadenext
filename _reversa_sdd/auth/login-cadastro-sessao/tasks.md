# Auth / Login, Cadastro e Sessao, Tarefas de Implementacao

> Sequencia executavel para reimplementar ou validar a subunidade `auth/login-cadastro-sessao` a partir das specs extraidas. Nao representa alteracao aplicada no codigo atual.

## Pre-requisitos

- [ ] Provider Better Auth configurado conforme `../design.md`.
- [ ] Schemas Zod disponiveis para login e cadastro.
- [ ] Runtime mode informa quando auth real esta pronto.
- [ ] Formulario client component pode usar Server Actions via `useActionState`.
- [ ] Fluxo de carrinho guest ja dispoe de token e merge seguro.
- [ ] Testes podem mockar Better Auth sem chamadas externas reais.

## Tarefas

- [ ] T-AUTH-LCS-01, Criar pagina publica de login
  - Origem no sistema atual: `src/app/(auth)/login/page.tsx`
  - Criterio de pronto: visitante ve heading `Login`, campos `E-mail` e `Senha`, e usuario autenticado e redirecionado para `/`.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-02, Criar pagina publica de cadastro
  - Origem no sistema atual: `src/app/(auth)/cadastro/page.tsx`
  - Criterio de pronto: visitante ve heading `Criar conta`, campos `Nome`, `E-mail` e `Senha`, e usuario autenticado e redirecionado para `/minha-conta`.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-03, Criar formulario compartilhado de auth
  - Origem no sistema atual: `src/features/auth/components/auth-form.tsx`
  - Criterio de pronto: componente alterna modo `login`/`signup`, mostra campos corretos, propaga `returnTo`, exibe erros por campo e desabilita submit durante pending.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-04, Implementar schema de login
  - Origem no sistema atual: `src/features/auth/server/schemas.ts`
  - Criterio de pronto: e-mail e trim/lowercase/validado e senha vazia e rejeitada.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-05, Implementar schema de cadastro
  - Origem no sistema atual: `src/features/auth/server/schemas.ts`
  - Criterio de pronto: nome precisa ter 2 a 120 caracteres, e-mail e normalizado, senha exige 8+ caracteres, letras e numeros.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-06, Implementar sanitizacao de `returnTo`
  - Origem no sistema atual: `src/features/auth/server/session.ts`
  - Criterio de pronto: valores externos, `//...`, ausentes ou `/api/auth...` retornam `/`; paths internos seguros sao preservados.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-07, Implementar leitura segura de sessao
  - Origem no sistema atual: `src/features/auth/server/session.ts`
  - Criterio de pronto: auth indisponivel retorna `unavailable`, sessao ausente retorna `missing`, role invalido retorna `invalid`, timeout retorna `timeout`.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-08, Implementar action de login
  - Origem no sistema atual: `src/features/auth/server/actions.ts`
  - Criterio de pronto: payload invalido retorna estado `error`; auth indisponivel retorna mensagem segura; credenciais validas chamam `signInEmail`.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-09, Integrar merge de carrinho guest no login
  - Origem no sistema atual: `src/features/auth/server/actions.ts`, `src/features/cart/server/cart-session.ts`, `src/features/cart/server/cart-service.ts`
  - Criterio de pronto: token guest e capturado antes do sign-in, merge ocorre somente com sessao autenticada e token e expirado apos merge.
  - Confianca: 🟡

- [ ] T-AUTH-LCS-10, Implementar action de cadastro
  - Origem no sistema atual: `src/features/auth/server/actions.ts`, `src/features/auth/server/auth.ts`
  - Criterio de pronto: action chama `signUpEmail` com `name`, `email` e `password`, sem enviar role vindo do formulario.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-11, Garantir role customer no cadastro publico
  - Origem no sistema atual: `src/features/auth/server/auth.ts`
  - Criterio de pronto: role default no provider/schema e `customer` e o campo nao e inputavel pelo cadastro publico.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-12, Implementar action de logout
  - Origem no sistema atual: `src/features/auth/server/actions.ts`
  - Criterio de pronto: sucesso ou falha de `signOut` terminam em redirect para `/login`.
  - Confianca: 🟢

- [ ] T-AUTH-LCS-13, Implementar conversao de erros Zod para estado de formulario
  - Origem no sistema atual: `src/features/auth/server/actions.ts`
  - Criterio de pronto: primeiro erro por campo e convertido para `fields` e mensagem geral orienta revisao.
  - Confianca: 🟢

## Tarefas de Teste

- [ ] TT-AUTH-LCS-01, Unit: `loginSchema` normaliza e-mail e rejeita senha vazia.
- [ ] TT-AUTH-LCS-02, Unit: `signupSchema` rejeita nome curto, e-mail invalido e senha sem letras/numeros.
- [ ] TT-AUTH-LCS-03, Unit: `validateReturnTo` aceita `/checkout` e rejeita URL externa, `//evil.test` e `/api/auth/sign-in`.
- [ ] TT-AUTH-LCS-04, Unit: `getCurrentSession` cobre auth indisponivel, sessao ausente, role invalido, timeout e sessao valida.
- [ ] TT-AUTH-LCS-05, Unit: `loginAction` rejeita payload invalido antes de chamar provider.
- [ ] TT-AUTH-LCS-06, Unit: `loginAction` retorna erro seguro quando auth real esta indisponivel.
- [ ] TT-AUTH-LCS-07, Unit: `loginAction` chama `signInEmail`, merge de carrinho e expira token quando ha sessao autenticada e token guest.
- [ ] TT-AUTH-LCS-08, Unit: `signupAction` nao repassa role ao provider mesmo se `role` vier no FormData.
- [ ] TT-AUTH-LCS-09, Unit: `logoutAction` redireciona para `/login` em sucesso e falha.
- [ ] TT-AUTH-LCS-10, Component: `AuthForm` renderiza campos corretos em modo login.
- [ ] TT-AUTH-LCS-11, Component: `AuthForm` renderiza campo nome e `autocomplete="new-password"` em modo signup.
- [ ] TT-AUTH-LCS-12, E2E: `/login` mostra heading, e-mail e senha para visitante.
- [ ] TT-AUTH-LCS-13, E2E: `/cadastro` mostra heading, nome, e-mail e senha para visitante.
- [ ] TT-AUTH-LCS-14, E2E: checkout anonimo envia visitante para `/login?returnTo=/checkout` e nao cria pedido anonimo.
- [ ] TT-AUTH-LCS-15, E2E: `returnTo` malicioso nao produz redirect externo.

## Tarefas de Migracao de Dados

- [ ] TM-AUTH-LCS-01, Definir estrategia de migracao de usuarios legados
  - Origem no sistema atual: `src/db/schema.ts`, `_reversa_sdd/auth/tasks.md`
  - Criterio de pronto: decisao humana documenta se senhas legadas serao migradas, resetadas ou invalidadas.
  - Confianca: 🔴

- [ ] TM-AUTH-LCS-02, Definir politica de sessoes existentes
  - Origem no sistema atual: `src/features/auth/server/auth.ts`
  - Criterio de pronto: sessoes do Laravel legado nao sao aceitas automaticamente no Next/Better Auth.
  - Confianca: 🟡

## Ordem Sugerida

1. Implementar schemas e `validateReturnTo` antes das actions.
2. Implementar `getCurrentSession` antes das paginas que redirecionam autenticados.
3. Implementar paginas e `AuthForm` com estados de erro/pending.
4. Implementar `loginAction`, depois merge de carrinho guest.
5. Implementar `signupAction`, garantindo ausencia de role no payload do provider.
6. Implementar `logoutAction`.
7. Cobrir unitarios de schema/session/actions antes dos E2E.
8. Validar E2E de login/cadastro e checkout anonimo.
9. Tratar migracao de usuarios/senhas apenas com decisao humana.

## Lacunas Pendentes (🔴)

- Recuperacao de senha, troca de senha e verificacao de e-mail ainda nao tem contrato funcional completo.
- Migracao de senha do Laravel legado depende de decisao humana e compatibilidade de hash.
- Cobertura atual deve ser ampliada para `returnTo` malicioso e merge de carrinho se esta subunidade for reconstruida do zero.
