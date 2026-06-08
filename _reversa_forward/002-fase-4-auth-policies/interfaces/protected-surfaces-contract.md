# Interface Contract: Protected Surfaces

> Data: `2026-06-08`
> Tipo: Next.js App Router + server actions

## 1. Superficies protegidas

| Superficie | Protecao esperada | Comportamento sem acesso |
|---|---|---|
| `/admin` | `admin` ou `manager` | redirect/bloqueio seguro |
| `/admin/**` | `admin` ou `manager` | redirect/bloqueio seguro |
| `product-actions` admin | `admin` ou `manager` | erro controlado antes de persistir |
| upload metadata admin | `admin` ou `manager` quando persistir metadata | erro/bloqueio controlado |
| `/minha-conta/**` | usuario autenticado | redirect/bloqueio seguro |
| `/enderecos/**` | usuario autenticado + ownership quando houver dados | redirect/bloqueio seguro |
| `/pedidos/**` | usuario autenticado, mas pedidos reais fora de escopo | placeholder protegido |

## 2. Superficies publicas preservadas

| Superficie | Regra |
|---|---|
| Storefront home/catalogo | Continua publico sem login. |
| Produto publico | Mantem `published`, `publishedAt <= now`, `stockQuantity > 0`. |
| Login | Acessivel a anonimos; usuario autenticado pode ser redirecionado. |
| Cadastro | Acessivel a anonimos; cria apenas `customer`. |

## 3. Server actions administrativas

Contrato de retorno conceitual:

```ts
type ProtectedMutationResult =
  | { status: "success"; message: string }
  | { status: "validation_error"; message: string }
  | { status: "unauthenticated"; message: string }
  | { status: "forbidden"; message: string }
  | { status: "blocked"; reason: "missing_database" | "environment_guardrail" | "auth_not_ready"; message: string }
  | { status: "error"; message: string };
```

Regras:

- `unauthenticated`, `forbidden` e `blocked` nao persistem.
- Sem `DATABASE_URL`, retorno deve continuar explicito e nao prometer persistencia.
- Preview/producao nao podem liberar mutation sem auth/policies reais.
- Erros nao expõem detalhes internos ou secrets.

## 4. Concorrencia e timeout

- Duas chamadas simultaneas de mutation protegida validam policy separadamente.
- Cadastro duplicado depende de constraint unica e erro controlado.
- Timeout em sessao/policy bloqueia rota/action.
- Retentativa automatica de mutation sensivel nao deve ocorrer sem controle/idempotencia.

## 5. Fora de escopo neste contrato

- Criacao real de pedidos.
- Checkout.
- Pagamento.
- Frete.
- Cupom.
- Documento fiscal.
