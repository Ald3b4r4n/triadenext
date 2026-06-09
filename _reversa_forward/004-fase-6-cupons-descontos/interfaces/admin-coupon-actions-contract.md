# Interface Contract: Admin Coupon Actions

> Data: `2026-06-08`
> Tipo: Next.js server actions/admin surface

## Objetivo

Definir o contrato da fundação mínima de admin de cupons.

## Superfícies esperadas

| Superfície | Acesso | Responsabilidade |
|------------|--------|------------------|
| `/admin/cupons` | `admin` ou `manager` | Listar cupons e estado operacional. |
| `/admin/cupons/novo` | `admin` ou `manager` | Criar cupom básico, se implementado. |
| `/admin/cupons/[id]/editar` | `admin` ou `manager` | Editar cupom básico, se implementado. |

## Campos permitidos no admin básico

- `code`
- `type`
- `value`
- `isActive`
- `startsAt`
- `endsAt`
- `usageLimit`
- `minimumSubtotalCents`

## Fora de escopo do admin

- Campanhas avançadas.
- Restrição por produto/categoria/marca/cliente.
- Limite por usuário.
- Relatórios.
- Consumo manual de `usedCount`.
- Checkout, pedido, pagamento, frete real.

## Segurança

- Toda action/admin page deve exigir `requireAdminLike`.
- Customer e visitante recebem bloqueio/redirect controlado.
- Sem banco/auth prontos, admin real falha de forma segura.
- Fallback dev/test não deve prometer persistência real.
