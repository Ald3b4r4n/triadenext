# Data Delta — Fase 7 Frete e Cotações

> Data: `2026-06-09`
> Base: `_reversa_sdd/data-dictionary.md`

## 1. Estado atual confirmado

O SDD pós-Fase 6 informa que `carts` já existe com owner por `user_id` ou `guest_token`, `applied_coupon_id`, status e timestamps. `shipping_rules` aparece como tabela modelada/preparada, mas frete funcional ainda não foi ativado. Pedidos, pagamentos, labels e snapshots de pedido permanecem fora de escopo.

## 2. Delta conceitual em `shipping_rules`

| Campo | Ação | Regra |
|-------|------|-------|
| `id` | manter/criar | PK. |
| `name` | manter/criar | Nome exibível da opção manual. |
| `provider` ou equivalente | criar/confirmar | Valor do MVP deve ser `manual`; externos ficam fora do runtime. |
| `rule_type` | criar/confirmar | `state`/UF, `postal_code_range` ou combinação equivalente. |
| `state` | criar/confirmar | UF aplicável quando regra for por estado. |
| `postal_code_start` | criar/confirmar | CEP inicial normalizado para faixa. |
| `postal_code_end` | criar/confirmar | CEP final normalizado para faixa. |
| `price_cents` | criar/confirmar | Valor fixo em centavos. |
| `estimated_days` ou `estimated_label` | criar/confirmar | Prazo estimado manual; não é promessa de transportadora real. |
| `priority` / `sort_order` | criar/confirmar | Ordenação quando múltiplas regras aplicarem. |
| `is_active` | criar/confirmar | Regra inativa não gera cotação. |
| `created_at`, `updated_at` | manter/criar | Auditoria técnica. |

## 3. Delta conceitual para cotação/seleção

| Estrutura | Ação | Regra |
|-----------|------|-------|
| `shipping_quotes` ou equivalente | criar/ativar se necessário | Guarda cotação vinculada ao carrinho, CEP, regra manual, valor original, expiração e seleção. |
| `carts.selected_shipping_quote_id` ou equivalente | criar/confirmar se necessário | Referência nullable para cotação selecionada válida. |
| `carts.shipping_postal_code` ou equivalente | criar/confirmar se necessário | CEP normalizado usado na cotação atual. |
| `carts.shipping_amount_cents` ou snapshot equivalente | criar/confirmar se necessário | Valor efetivo selecionado; com `free_shipping`, pode ser 0 mantendo valor original auditável. |
| `cart_hash` ou equivalente | criar/confirmar se necessário | Assinatura server-side para invalidar cotação quando itens mudam. |

## 4. Índices e constraints

- Índice por `cart_id` e expiração de cotação.
- Índice por `postal_code_start/postal_code_end` ou estratégia equivalente para faixa de CEP.
- Índice por `state` e `is_active` para regra manual por UF.
- FK de cotação para carrinho com cascade/delete adequado.
- FK opcional de cotação para regra manual.
- Nenhuma FK para pedido/pagamento nesta fase.

## 5. Migration local

- A implementação futura deve revisar o schema antes de gerar SQL.
- Se houver delta, gerar migration local com `pnpm db:generate`.
- Não aplicar migration contra banco real sem validação humana explícita.
- Não rodar `db:migrate` nesta etapa de planejamento.

## 6. Fallback sem banco

- Dev/test podem usar regras manuais fixture e cotações fixture marcadas como `dev_fallback`.
- Preview/produção sem banco devem bloquear mutações reais de frete.
- Com `DATABASE_URL`, erro real não deve virar fixture silenciosa.

## 7. Fora de escopo de dados

- `orders`, `order_items`, `order_shipping_quotes` e snapshots de pedido.
- `payment_intents`, `payment_events`, Stripe ou captura.
- `shipping_labels`, webhooks de transportadora, rastreio e etiquetas.
- Credenciais ou configuração operacional de Correios/Jadlog/Melhor Envio.
- Peso, cubagem e dimensões obrigatórias.
