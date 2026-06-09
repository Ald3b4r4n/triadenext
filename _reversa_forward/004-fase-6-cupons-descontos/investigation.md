# Investigation — Fase 6 Cupons e Descontos

> Data: `2026-06-08`
> Escopo: pesquisa técnica interna para plano, sem implementação.

## Fontes consultadas

| Fonte | Achado | Confiança |
|-------|--------|-----------|
| `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | Carrinho atual já tem service/actions, fallback e ownership server-side. | 🟢 |
| `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | `coupons` existe como tabela preparada, mas não funcional. | 🟢 |
| `_reversa_sdd/permissions.md#carrinho` | Admin/manager não têm bypass no carrinho. | 🟢 |
| `_reversa_sdd/state-machines.md#runtime-de-persistencia` | Sem banco em dev/test usa fallback; preview/prod falha segura. | 🟢 |
| `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/requirements.md` | Legado aceita percent/fixed, normaliza código e limita desconto ao subtotal. | 🟢 |
| `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/design.md` | Legado tem CRUD admin e lacuna sobre incremento de `used_count`. | 🟡 |

## Alternativas avaliadas

| Alternativa | Decisão | Motivo |
|-------------|---------|--------|
| Implementar cupom dentro de `src/features/cart` | Descartada | Mistura domínio de desconto com regras de item/estoque e dificulta admin. |
| Criar `src/features/coupons` | Escolhida | Mantém regras de cupom coesas e integra com carrinho por service. |
| Armazenar cupom no cookie `guestCartToken` | Descartada | Cookie deve seguir opaco e sem itens/preços/dados sensíveis. |
| Calcular desconto no cliente | Descartada | Permite payload forçar desconto e viola server-side trust. |
| Consumir `usedCount` ao aplicar | Descartada | Carrinho não é pedido confirmado; consumo fica para checkout/pedido futuro. |
| Tratar `free_shipping` como desconto monetário | Descartada | Frete real não existe nesta fase. |
| Bloquear admin de cupons | Descartada parcialmente | Requirements pedem fundação mínima de admin. |

## Arquivos prováveis a alterar na implementação futura

- `src/db/schema.ts`
- `drizzle/*` nova migration local, se schema exigir delta.
- `src/features/cart/types.ts`
- `src/features/cart/domain.ts`
- `src/features/cart/server/cart-repository.ts`
- `src/features/cart/server/cart-service.ts`
- `src/features/cart/server/cart-actions.ts`
- `src/features/cart/components/*`
- `src/app/(storefront)/carrinho/page.tsx`
- `src/lib/runtime-mode.ts`
- `src/app/admin/cupons/**`

## Arquivos prováveis a criar na implementação futura

- `src/features/coupons/types.ts`
- `src/features/coupons/domain.ts`
- `src/features/coupons/schemas.ts`
- `src/features/coupons/server/coupon-repository.ts`
- `src/features/coupons/server/coupon-service.ts`
- `src/features/coupons/server/admin-coupon-actions.ts`
- `src/features/coupons/components/*`
- `src/tests/unit/coupon-domain.test.ts`
- `src/tests/unit/coupon-service.test.ts`
- `src/tests/unit/cart-coupon-actions.test.ts`
- `src/tests/e2e/coupons.spec.ts`
- `docs/features/coupons.md`
- `docs/architecture/coupons.md`

## Conclusão

O caminho mais seguro é tratar cupons como novo domínio coeso, com integração limitada ao carrinho e admin mínimo. A implementação deve ser transacional quando houver banco real e explicitamente fixture/dev quando não houver `DATABASE_URL`.
