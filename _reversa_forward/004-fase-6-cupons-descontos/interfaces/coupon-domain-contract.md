# Interface Contract: Coupon Domain/Calculation

> Data: `2026-06-08`
> Tipo: server-only/domain module

## Objetivo

Definir o contrato conceitual para validação e cálculo de cupom sem depender de UI ou payload client-side.

## Tipos conceituais

```ts
type CouponType = "percentage" | "fixed_amount" | "free_shipping";

type CouponStatus =
  | "active"
  | "inactive"
  | "scheduled"
  | "expired"
  | "exhausted";

type Coupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
  minimumSubtotalCents: number | null;
};

type CouponCalculation = {
  discountCents: number;
  partialTotalCents: number;
  messages: string[];
};
```

## Regras

- `normalizeCouponCode(input)` deve aplicar trim e normalização consistente.
- `getCouponStatus(coupon, now)` deve retornar status calculado.
- `calculateCouponDiscount(coupon, subtotalCents)` deve:
  - aceitar `percentage` e `fixed_amount`;
  - limitar desconto ao subtotal;
  - manter centavos;
  - retornar 0 para `free_shipping` nesta fase com mensagem controlada.
- O domínio não incrementa `usedCount`.
- O domínio não calcula frete real.
- O domínio não cria pedido.

## Erros conceituais

- `coupon_not_found`
- `coupon_inactive`
- `coupon_scheduled`
- `coupon_expired`
- `coupon_exhausted`
- `coupon_minimum_subtotal_not_met`
- `coupon_type_unavailable`
- `coupon_invalid_value`
