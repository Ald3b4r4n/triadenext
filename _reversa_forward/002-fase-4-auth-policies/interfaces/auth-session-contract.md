# Interface Contract: Auth/Session

> Data: `2026-06-08`
> Tipo: HTTP + server action + server-only module

## 1. Objetivo

Definir o contrato esperado para login, cadastro publico, logout e leitura de sessao. A implementacao concreta fica para `/reversa-coding`.

## 2. Rotas/entradas esperadas

| Entrada | Metodo/tipo | Uso |
|---|---|---|
| `/api/auth/[...all]` | HTTP route handler | Endpoint do provider, se Better Auth exigir esse formato. |
| `login` | server action ou client do provider | Autenticar por e-mail/senha. |
| `signup` | server action ou client do provider | Criar usuario publico `customer`. |
| `logout` | server action ou client do provider | Invalidar sessao server-side. |
| `getCurrentSession` | server-only function | Ler sessao normalizada. |

## 3. Sessao normalizada

```ts
type AuthRole = "customer" | "admin" | "manager";

type AppSession =
  | {
      status: "authenticated";
      userId: string;
      email: string;
      role: AuthRole;
    }
  | {
      status: "unauthenticated";
      reason: "missing" | "expired" | "invalid" | "timeout" | "unavailable";
    };
```

## 4. Login

### Request conceitual

```ts
type LoginInput = {
  email: string;
  password: string;
  returnTo?: string;
};
```

### Response conceitual

```ts
type LoginResult =
  | { status: "success"; redirectTo: string }
  | { status: "error"; reason: "invalid_credentials" | "validation_error" | "auth_unavailable" };
```

Regras:

- erro de credenciais deve ser generico;
- nao imprimir senha;
- `returnTo` precisa ser validado para evitar redirect aberto;
- timeout/falha do provider falha de modo seguro.

## 5. Cadastro publico

### Request conceitual

```ts
type SignupInput = {
  name?: string;
  email: string;
  password: string;
  role?: unknown;
};
```

### Response conceitual

```ts
type SignupResult =
  | { status: "success"; userRole: "customer"; redirectTo: string }
  | { status: "error"; reason: "validation_error" | "duplicate_email" | "weak_password" | "auth_unavailable" };
```

Regras:

- role do payload deve ser ignorada ou rejeitada;
- usuario publico nunca vira `admin` ou `manager`;
- cadastro simultaneo com mesmo e-mail nao duplica usuario;
- e-mail duplicado retorna erro controlado.

## 6. Logout

```ts
type LogoutResult =
  | { status: "success"; redirectTo: string }
  | { status: "error"; reason: "auth_unavailable" };
```

Regras:

- invalidar sessao server-side;
- limpar estado de cliente conforme provider;
- apos logout, rotas/actions protegidas retornam `unauthenticated`.

## 7. Timeouts e retentativas

- Login/cadastro nao devem repetir automaticamente operacoes sensiveis sem controle.
- Falha transitoria pode orientar nova tentativa manual.
- Timeout de auth/session deve virar falha segura.

## 8. Secrets

Nenhum request, response, log, erro ou doc deve conter senha, token, cookie de sessao, `DATABASE_URL` ou secrets do provider.
