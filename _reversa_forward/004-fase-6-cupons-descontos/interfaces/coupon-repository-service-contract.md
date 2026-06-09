# Interface Contract: Coupon Repository/Service

> Data: `2026-06-08`
> Tipo: server-only module

## Objetivo

Definir repository e service de cupons, separando persistência Drizzle/fallback das regras de negócio.

## Repository esperado

| Método | Responsabilidade |
|--------|------------------|
| `findCouponByNormalizedCode` | Buscar cupom por código normalizado. |
| `findCouponById` | Buscar cupom aplicado ao carrinho. |
| `listCouponsForAdmin` | Listar cupons para admin/manager. |
| `createCoupon` | Criar cupom básico no admin, se implementado. |
| `updateCoupon` | Editar cupom básico no admin, se implementado. |
| `setCartCoupon` | Associar um cupom ao carrinho ativo. |
| `clearCartCoupon` | Remover cupom aplicado do carrinho. |
| `getCartAppliedCoupon` | Carregar cupom aplicado ao carrinho. |

## Service esperado

| Método | Regra |
|--------|-------|
| `validateCouponForCart` | Valida status, limite global, subtotal mínimo e tipo. |
| `applyCouponToCart` | Resolve carrinho, valida owner, aplica um cupom e recalcula total parcial. |
| `removeCouponFromCart` | Remove cupom do carrinho resolvido e recalcula. |
| `recalculateCartCoupon` | Revalida cupom aplicado ao listar/recalcular carrinho. |
| `listAdminCoupons` | Exige admin-like e respeita fallback. |
| `saveAdminCoupon` | Exige admin-like, valida input e não implementa campanhas avançadas. |

## Fallback

- Sem `DATABASE_URL` em dev/test: usar fixture explícita e retornar persistência `dev_fallback`.
- Sem `DATABASE_URL` em preview/produção: bloquear mutações reais.
- Com `DATABASE_URL`: erro real não vira fallback silencioso.

## Idempotência e concorrência

- Aplicar o mesmo cupom repetidamente não deve acumular desconto.
- Aplicar segundo cupom não deve acumular com o primeiro.
- Remover cupom já ausente deve retornar estado controlado.
- `usedCount` não muda em nenhum método de carrinho.
