# Spec Impact Matrix

Atualizado em: 2026-06-11  
Agente: Architect

| Componente | Catálogo | Carrinho | Cupom | Frete | Checkout | Pedido | Pagamento | Notificação | Admin | Customer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/(storefront)` | Alto | Alto | Médio | Médio | Alto | Baixo | Baixo | Baixo | Baixo | Médio |
| `src/app/(customer)` | Baixo | Baixo | Baixo | Baixo | Médio | Alto | Alto | Baixo | Baixo | Alto |
| `src/app/admin` | Alto | Baixo | Alto | Alto | Baixo | Alto | Médio | Alto | Alto | Baixo |
| `src/app/api/webhooks/stripe` | Baixo | Baixo | Médio | Baixo | Baixo | Alto | Crítico | Alto | Baixo | Baixo |
| `features/auth` | Médio | Médio | Baixo | Baixo | Alto | Alto | Alto | Alto | Crítico | Crítico |
| `features/products` | Crítico | Alto | Baixo | Baixo | Alto | Alto | Alto | Baixo | Alto | Baixo |
| `features/cart` | Médio | Crítico | Alto | Alto | Crítico | Alto | Baixo | Baixo | Baixo | Médio |
| `features/coupons` | Baixo | Alto | Crítico | Médio | Alto | Alto | Alto | Baixo | Alto | Baixo |
| `features/shipping` | Baixo | Alto | Médio | Crítico | Alto | Alto | Baixo | Baixo | Alto | Baixo |
| `features/checkout` | Médio | Alto | Alto | Alto | Crítico | Crítico | Médio | Baixo | Baixo | Alto |
| `features/orders` | Baixo | Médio | Médio | Médio | Crítico | Crítico | Crítico | Alto | Alto | Alto |
| `features/payments` | Baixo | Baixo | Alto | Baixo | Médio | Crítico | Crítico | Alto | Médio | Alto |
| `features/notifications` | Baixo | Baixo | Baixo | Baixo | Baixo | Alto | Alto | Crítico | Alto | Médio |
| `features/uploads` | Alto | Baixo | Baixo | Baixo | Baixo | Baixo | Baixo | Baixo | Alto | Baixo |
| `src/db/schema.ts` | Crítico | Crítico | Crítico | Crítico | Crítico | Crítico | Crítico | Crítico | Alto | Alto |

## Impactos Críticos

- Alterar filtros públicos de produto afeta storefront, carrinho e checkout.
- Alterar cálculo de carrinho afeta cupom, frete, checkout e pedido.
- Alterar snapshots de pedido afeta pagamento, notificação, relatórios e migração de dados.
- Alterar webhook/settlement afeta pedido, estoque, cupom e notificações.
- Alterar `notification_deliveries.idempotency_key` afeta duplicidade de envio.
