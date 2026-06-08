# Interface Contract: Cart Session

> Data: `2026-06-08`  
> Tipo: HTTP cookie + server-only resolver

## 1. Objetivo

Definir como o carrinho atual e resolvido para visitante e usuario autenticado.

## 2. Cookie anonimo

| Campo | Regra |
|---|---|
| Nome | `guestCartToken` |
| Conteudo | Identificador opaco; sem itens, precos, subtotal, userId, role ou dados pessoais. |
| Acesso | Server-side preferencial; nao logar. |
| Persistencia | Associado a `carts.guestToken` quando banco existir. |
| Expiracao | Definida no coding; deve permitir abandono/expiracao. |

## 3. Resolvedor conceitual

```ts
type CartActor =
  | { kind: "guest"; guestToken: string }
  | { kind: "authenticated"; userId: string; role: "customer" | "admin" | "manager"; guestToken?: string }
  | { kind: "unavailable"; reason: "missing_database" | "invalid_session" | "unsafe_environment" };
```

Regras:

- Usuario autenticado usa `session.userId`.
- Visitante usa `guestCartToken`.
- Falha de sessao pode cair para visitante somente quando houver token anonimo valido e a operacao permitir.
- `guestCartToken` nao concede acesso a carrinho autenticado.
- Server actions nao aceitam `userId` ou owner do cliente.

## 4. Merge trigger

No login bem-sucedido, se houver `guestCartToken`, chamar o service de merge com:

```ts
type MergeRequest = {
  userId: string;
  guestToken: string;
};
```

O merge deve ser idempotente e marcar o carrinho anonimo como `converted`/mesclado.

## 5. Logs e erros

Logs podem registrar tipo de falha e ambiente, mas nao token, cookie, `DATABASE_URL`, sessao, SQL sensivel ou dados pessoais.
