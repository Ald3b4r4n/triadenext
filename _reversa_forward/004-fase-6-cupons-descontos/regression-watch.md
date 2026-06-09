# Regression Watch - Fase 6 Cupons e Descontos

Feature: `004-fase-6-cupons-descontos`

## Watch Items

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `legacy-impact.md#Modificadas` | Carrinho pode persistir no máximo um cupom aplicado em `carts.applied_coupon_id`. | presença | Carrinho aceita múltiplos cupons ou perde ownership ao aplicar cupom. |
| W002 | `legacy-impact.md#Modificadas` | Desconto e total parcial são calculados em centavos no servidor. | presença | UI/action aceita subtotal, desconto ou total enviados pelo cliente. |
| W003 | `legacy-impact.md#Modificadas` | Admin `/admin/cupons` é protegido por `requireAdminLike`. | presença | Customer/visitante acessa listagem, criação ou edição de cupom. |
| W004 | `legacy-impact.md#Modificadas` | `minimumSubtotalCents` permanece opcional e server-side. | presença | Cupom abaixo do mínimo é aplicado ou mínimo vira campo obrigatório sem decisão humana. |
| W005 | `legacy-impact.md#Preservadas` | Aplicar/remover cupom não incrementa `usedCount`. | ausência | `usedCount` muda em apply/remove/merge do carrinho. |
| W006 | `legacy-impact.md#Preservadas` | `free_shipping` não aplica frete real nesta fase. | ausência | Frete é calculado, zerado ou prometido por cupom antes da fase de frete. |
| W007 | `legacy-impact.md#Preservadas` | Checkout, pagamento, Stripe, frete real, pedido, reserva e baixa de estoque continuam fora de escopo. | ausência | Apply/remove de cupom chama módulos de checkout, pagamento, pedido, frete real ou estoque final. |

## Histórico de re-extrações

| Data | Re-extração | Veredito | Observações |
|------|-------------|----------|-------------|
| 2026-06-08T22:45:00-03:00 | Pós-Fase 6 | 🟢 | SDD atualizado com `appliedCouponId`, calculo server-side de desconto/total parcial, admin protegido, `minimumSubtotalCents`, `usedCount` nao consumido e `free_shipping` sem frete real. |

## Arquivadas

Nenhuma.
