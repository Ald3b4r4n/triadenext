# Interface Contract: Policies

> Data: `2026-06-08`
> Tipo: server-only module contract

## 1. Objetivo

Padronizar como rotas, server actions e repositories verificam permissao antes de acessar dados protegidos ou executar mutations reais.

## 2. Tipos conceituais

```ts
type PolicyDecision =
  | { status: "allowed"; userId: string; role: "customer" | "admin" | "manager" }
  | { status: "unauthenticated"; reason: "missing" | "expired" | "invalid" | "timeout" | "unavailable" }
  | { status: "forbidden"; reason: "insufficient_role" | "not_owner" };
```

## 3. Policies esperadas

| Policy | Entrada | Permite | Bloqueia |
|---|---|---|---|
| `requireAuthenticated` | sessao normalizada | qualquer usuario autenticado | anonimo/sessao invalida |
| `requireAdminLike` | sessao normalizada | `admin`, `manager` | anonimo, `customer` |
| `requireCustomer` | sessao normalizada | `customer`, ou usuario autenticado conforme pagina | anonimo |
| `requireOwner` | sessao + `resourceUserId` server-side | dono do recurso | anonimo/acesso cruzado |

## 4. Regras

- Policy sempre roda server-side.
- Policy nao confia em `role` ou `userId` enviados pelo cliente.
- Cada requisicao avalia a sessao de novo ou usa cache seguro estritamente por request.
- Timeout ou erro de auth vira `unauthenticated`/bloqueio.
- `admin` e `manager` sao equivalentes no MVP.
- Granularidade fina fica preparada por contrato, mas fora do MVP.

## 5. Uso por server action

Fluxo obrigatorio:

1. validar sessao;
2. avaliar policy;
3. validar payload;
4. executar mutation somente se `allowed`;
5. retornar erro controlado caso contrario.

## 6. Uso por rota

- `/admin/**`: exige `requireAdminLike`.
- `/minha-conta/**`, `/enderecos/**`, futuras rotas customer: exigem usuario autenticado e ownership quando houver recurso.
- Storefront publico de catalogo nao exige auth.

## 7. Logs

Logs podem registrar tipo de falha e area afetada, mas nunca senha, token, cookie, `DATABASE_URL`, hash ou payload sensivel.
