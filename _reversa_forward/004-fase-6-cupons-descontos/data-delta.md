# Data Delta — Fase 6 Cupons e Descontos

> Data: `2026-06-08`
> Base: `_reversa_sdd/data-dictionary.md`

## 1. Estado atual confirmado

O SDD pós-Fase 5 informa que o schema modela `coupons`, mas a Fase 5 não ativou cupom funcional. `carts` e `cart_items` já existem com owner por `user_id` ou `guest_token`, status e subtotais derivados dos itens.

## 2. Delta conceitual em `coupons`

| Campo | Ação | Regra |
|-------|------|-------|
| `id` | manter/criar | PK. |
| `code` | manter/criar | Código normalizado, único. |
| `type` | manter/criar/ajustar | Valores planejados: `percentage`, `fixed_amount`, `free_shipping`. |
| `value` ou `value_cents` | manter/ajustar | Percentual usa valor percentual; fixo usa centavos. |
| `starts_at` | manter/criar | Cupom futuro não aplica antes desta data. |
| `ends_at` | manter/criar | Cupom expirado não aplica após esta data. |
| `usage_limit` ou `max_uses` | manter/ajustar | Limite global. |
| `used_count` | manter/criar | Consultado, mas não incrementado em apply/remove no carrinho. |
| `minimum_subtotal_cents` | criar/confirmar | Subtotal mínimo da Fase 6. |
| `is_active` | manter/criar | Cupom inativo não aplica. |
| `created_at`, `updated_at` | manter/criar | Auditoria técnica. |

## 3. Delta conceitual em `carts`

| Campo | Ação | Regra |
|-------|------|-------|
| `applied_coupon_id` ou equivalente | criar/confirmar | FK nullable para cupom aplicado. Apenas um cupom por carrinho. |
| `updated_at` | manter | Atualizado ao aplicar/remover cupom. |

## 4. Índices e constraints

- Unique por código normalizado de cupom.
- Índice por status/ativo e janela de validade pode ser considerado.
- FK de carrinho para cupom aplicado deve permitir `SET NULL` ou comportamento equivalente quando cupom for removido.
- Não criar constraint que incremente uso no carrinho.

## 5. Migration local

- A implementação futura pode gerar uma migration local se `src/db/schema.ts` não contiver os campos necessários.
- Não aplicar migration em banco real sem validação humana explícita.
- Não conectar banco real nesta etapa.

## 6. Fallback sem banco

- Fixture dev/test deve representar cupons percent/fixed/free_shipping preparado.
- Fixture deve indicar `persistence = dev_fallback` ou mensagem equivalente.
- Preview/produção sem banco devem bloquear mutações reais de cupom.

## 7. Fora de escopo de dados

- Limite por usuário.
- Restrição por produto/categoria/marca/cliente/campanha.
- Histórico de uso por pedido.
- Consumo definitivo de `used_count`.
- Frete real.
- Pedido, pagamento, reserva e baixa de estoque.
