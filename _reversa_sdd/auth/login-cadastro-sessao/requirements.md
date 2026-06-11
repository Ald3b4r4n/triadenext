# Auth / Login, Cadastro e Sessao

> Spec executavel da subunidade `auth/login-cadastro-sessao`. Foca no QUE o fluxo publico de autenticacao e leitura de sessao deve garantir.

## Visao Geral

Esta subunidade cobre as telas publicas de login e cadastro, suas Server Actions, validacoes de formulario, encerramento de sessao e leitura segura da sessao atual. Ela e a entrada para checkout autenticado, area do cliente e superficies administrativas, mas nao define a matriz completa de autorizacao.

## Responsabilidades

- Renderizar formularios controlados de login e cadastro.
- Validar e normalizar e-mail, senha, nome e `returnTo`.
- Autenticar usuario existente por e-mail/senha.
- Criar conta publica com papel efetivo `customer`.
- Encerrar sessao autenticada.
- Resolver sessao atual sem vazar erro interno do provider.
- Redirecionar usuario autenticado para destino seguro.
- Mesclar carrinho guest no usuario autenticado apos login, quando aplicavel.

## Regras de Negocio

- 🟢 Login exige e-mail valido e senha informada.
- 🟢 Cadastro exige nome com 2 a 120 caracteres, e-mail valido e senha forte.
- 🟢 Senha de cadastro precisa ter pelo menos 8 caracteres, letras e numeros.
- 🟢 E-mail deve ser normalizado com `trim`, formato valido e lowercase.
- 🟢 Cadastro publico nao aceita escolha de papel; usuario novo deve ser `customer`.
- 🟢 Usuario ja autenticado em `/login` deve ser redirecionado para `/`.
- 🟢 Usuario ja autenticado em `/cadastro` deve ser redirecionado para `/minha-conta`.
- 🟢 `returnTo` deve ser path interno seguro; destino externo, protocol-relative ou `/api/auth` deve cair para `/`.
- 🟢 Auth indisponivel deve retornar erro amigavel, nao stack trace.
- 🟢 Logout deve terminar em `/login` mesmo se o provider falhar.
- 🟡 Carrinho guest existente deve ser mesclado apos login, se a sessao autenticada puder ser resolvida.
- 🔴 Recuperacao de senha, verificacao de e-mail e troca de senha nao estao implementadas como fluxo completo nesta subunidade.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-AUTH-LCS-01 | Renderizar pagina de login publica. | Must | Ao acessar `/login` sem sessao, a pagina mostra heading `Login`, campos `E-mail` e `Senha`. |
| RF-AUTH-LCS-02 | Renderizar pagina de cadastro publica. | Must | Ao acessar `/cadastro` sem sessao, a pagina mostra heading `Criar conta`, campos `Nome`, `E-mail` e `Senha`. |
| RF-AUTH-LCS-03 | Redirecionar usuario autenticado no login. | Must | Dada sessao autenticada, ao acessar `/login`, o usuario e redirecionado para `/`. |
| RF-AUTH-LCS-04 | Redirecionar usuario autenticado no cadastro. | Must | Dada sessao autenticada, ao acessar `/cadastro`, o usuario e redirecionado para `/minha-conta`. |
| RF-AUTH-LCS-05 | Validar payload de login. | Must | Formulario vazio ou e-mail invalido retorna estado `error` com campos destacados. |
| RF-AUTH-LCS-06 | Validar payload de cadastro. | Must | Nome curto/longo, e-mail invalido ou senha fraca retorna estado `error` com mensagem de campo. |
| RF-AUTH-LCS-07 | Executar login com Better Auth. | Must | Dadas credenciais validas e auth pronto, a action chama `signInEmail` e redireciona para `returnTo` validado. |
| RF-AUTH-LCS-08 | Executar cadastro com Better Auth. | Must | Dados validos chamam `signUpEmail` sem aceitar role vindo do formulario e redirecionam para `/minha-conta`. |
| RF-AUTH-LCS-09 | Bloquear auth real indisponivel. | Must | Sem auth pronto, login/cadastro retornam erro seguro `Auth real indisponivel neste ambiente.` |
| RF-AUTH-LCS-10 | Encerrar sessao. | Must | Ao chamar logout, o sistema chama `signOut` e redireciona para `/login`; em falha, tambem redireciona para `/login`. |
| RF-AUTH-LCS-11 | Resolver sessao atual. | Must | Consulta de sessao retorna usuario autenticado normalizado ou motivo seguro: `missing`, `invalid`, `timeout` ou `unavailable`. |
| RF-AUTH-LCS-12 | Mesclar carrinho guest apos login. | Should | Se houver token guest e sessao autenticada apos login, o sistema chama merge e expira o token guest. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | `returnTo` nao pode permitir open redirect. | `src/features/auth/server/session.ts` | 🟢 |
| Seguranca | Cadastro publico nao pode escolher role. | `src/features/auth/server/auth.ts`, `src/features/auth/server/schemas.ts` | 🟢 |
| Privacidade | Erros do provider nao devem ser propagados crus para UI. | `src/features/auth/server/actions.ts` | 🟢 |
| Disponibilidade | Sessao deve ter timeout de 5 segundos. | `src/features/auth/server/session.ts` | 🟢 |
| Usabilidade | Formularios devem expor erros de campo e estado pendente. | `src/features/auth/components/auth-form.tsx` | 🟢 |
| Compatibilidade | Fluxos devem funcionar em ambiente sem secrets reais como falha segura. | `src/lib/runtime-mode.ts`, `src/features/auth/server/actions.ts` | 🟢 |

> Inferido a partir das paginas publicas de auth, Server Actions, schemas e testes E2E/unitarios existentes.

## Criterios de Aceitacao

```gherkin
Cenario: visitante acessa login
  Dado que nao ha sessao autenticada
  Quando o usuario acessa "/login"
  Entao ve o titulo "Login"
  E ve os campos "E-mail" e "Senha"

Cenario: visitante acessa cadastro
  Dado que nao ha sessao autenticada
  Quando o usuario acessa "/cadastro"
  Entao ve o titulo "Criar conta"
  E ve os campos "Nome", "E-mail" e "Senha"

Cenario: payload de login invalido
  Dado formulario de login vazio
  Quando a Server Action processa o formulario
  Entao retorna estado de erro
  E nao chama o provider de autenticacao

Cenario: returnTo malicioso no login
  Dado returnTo externo ou iniciado por "//"
  Quando o login conclui
  Entao o redirect usa "/" como fallback seguro

Cenario: login com carrinho guest
  Dado token guest valido antes do login
  E credenciais validas
  Quando a sessao autenticada e resolvida apos sign-in
  Entao o carrinho guest e mesclado ao usuario
  E o token guest e expirado

Cenario: logout com provider falhando
  Dado usuario tentando sair
  Quando `signOut` falha
  Entao o usuario ainda e redirecionado para "/login"
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Login, cadastro e logout | Must | Entrada obrigatoria para checkout, pedidos e areas protegidas. |
| Validacao de formulario | Must | Evita payload invalido e mensagens inconsistentes. |
| Validacao de `returnTo` | Must | Evita open redirect e abuso de endpoint interno. |
| Leitura segura de sessao | Must | Base de todas as policies e redirects. |
| Merge de carrinho guest | Should | Preserva intencao de compra, mas nao deve enfraquecer auth. |
| Recuperacao de senha/verificacao de e-mail | Could | Funcionalidade futura nao coberta no estado atual. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/app/(auth)/login/page.tsx` | `LoginPage` | 🟢 |
| `src/app/(auth)/cadastro/page.tsx` | `CadastroPage` | 🟢 |
| `src/features/auth/components/auth-form.tsx` | `AuthForm` | 🟢 |
| `src/features/auth/server/actions.ts` | `loginAction`, `signupAction`, `logoutAction` | 🟢 |
| `src/features/auth/server/schemas.ts` | `loginSchema`, `signupSchema` | 🟢 |
| `src/features/auth/server/session.ts` | `getCurrentSession`, `validateReturnTo` | 🟢 |
| `src/features/auth/server/auth.ts` | `auth`, Better Auth config | 🟢 |
| `src/tests/unit/auth-actions.test.ts` | Testes de actions auth | 🟢 |
| `src/tests/e2e/auth-flow.spec.ts` | Renderizacao de login/cadastro | 🟢 |
| `src/tests/e2e/checkout-login.spec.ts` | Redirect de checkout para login | 🟢 |

## Lacunas e Riscos

- 🔴 Recuperacao de senha e troca de senha nao aparecem como fluxo implementado.
- 🔴 Verificacao de e-mail nao esta descrita como requisito operacional atual.
- 🟡 Cobertura de teste atual valida renderizacao e payload invalido, mas pode ser ampliada para `returnTo` malicioso e merge de carrinho.
- 🟡 O merge de carrinho depende da disponibilidade do token guest e da sessao pos-login.
