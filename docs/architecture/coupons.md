# Arquitetura de Cupons

## Camadas

- `src/features/coupons/domain.ts`: normalização, mapeamento legado, status e cálculo.
- `src/features/coupons/schemas.ts`: validação de inputs de carrinho e admin.
- `src/features/coupons/server/coupon-repository.ts`: Drizzle ou fixture dev/test explícita.
- `src/features/coupons/server/coupon-service.ts`: validação server-side e cálculo para carrinho.
- `src/features/coupons/server/admin-coupon-actions.ts`: actions admin protegidas por policy.
- `src/features/cart/server/cart-service.ts`: aplica/remove cupom e recalcula o carrinho.

## Persistência

No legado Laravel, o cupom aplicado ficava em sessão (`cart_coupon_code`). No Next, a Fase 6
persiste a referência do cupom no carrinho (`carts.applied_coupon_id`) quando existe banco real.

Essa divergência é intencional: o carrinho autenticado da Fase 5 persiste por `userId`, então o
cupom aplicado acompanha o carrinho entre sessões/dispositivos. O acesso continua filtrado por
ownership server-side.

Sem `DATABASE_URL`, dev/test usam fixture explícita e não prometem persistência real. Em
preview/produção sem banco, mutações reais devem falhar de forma segura. Com `DATABASE_URL`, erro
real não vira fallback silencioso.

## Cálculo

O subtotal vem do carrinho. O service de cupom valida status, limite global, subtotal mínimo e tipo.
Depois calcula:

- `discountCents`;
- `partialTotalCents`;
- mensagens controladas.

`usedCount` é consultado para bloquear cupom esgotado, mas não é incrementado em apply/remove ou
merge do carrinho.

## Segurança

- Actions não aceitam `cartId`, `userId`, owner, role, subtotal, total, desconto ou `couponId` como
  fonte confiável.
- O cupom é resolvido por código normalizado no servidor.
- O carrinho é resolvido por sessão/cookie no servidor.
- Admin usa `requireAdminLike`.
- Customer e visitante não acessam admin de cupons.
- `free_shipping` não aplica benefício real antes da fase de frete.
