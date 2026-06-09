# Dicionario de dados Reversa - Triade Essenza Next

Data: 2026-06-09
Escopo: modelo de dados apos Fase 7.

## Convencoes

- Valores monetarios sao armazenados em centavos.
- Datas usam timestamp.
- Regras server-side sao fonte de verdade para totais.
- Migrations sao locais/versionadas; nenhuma aplicacao em banco real ocorreu nesta re-extracao.

## Enums e dominios controlados

### Tipo de cupom

| Valor | Significado |
| --- | --- |
| `percentage` | Desconto percentual sobre itens elegiveis |
| `fixed_amount` | Desconto fixo em centavos |
| `free_shipping` | Zera frete manual calculado e elegivel |

### Provider de frete

| Valor | Estado |
| --- | --- |
| `manual` | Ativo na Fase 7 |
| `correios` | Adapter futuro inativo |
| `jadlog` | Adapter futuro inativo |
| `melhor_envio` | Adapter futuro inativo |

### Tipo de regra de frete

| Valor | Significado |
| --- | --- |
| `uf` | Regra aplicada por UF de destino |
| `postal_range` | Regra aplicada por faixa de CEP |

## `carts`

Campos relevantes apos Fase 7:

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador do carrinho |
| `customer_id` | string opcional | Usuario autenticado, quando houver |
| `guest_id` | string opcional | Visitante anonimo |
| `coupon_id` | string opcional | Cupom aplicado |
| `shipping_postal_code` | string opcional | CEP usado na cotacao |
| `selected_shipping_quote_id` | string opcional | Quote selecionada |
| `selected_shipping_option` | json opcional | Snapshot da opcao de frete selecionada |
| `shipping_amount_cents` | inteiro | Frete efetivo antes de cupom de frete gratis |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

Derivados em view de carrinho:

- subtotal dos itens.
- desconto de cupom.
- valor de frete.
- total parcial com frete.

## `shipping_rules`

Tabela de regras manuais de frete.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador |
| `name` | string | Nome operacional da regra |
| `provider` | string | `manual` na Fase 7 |
| `rule_type` | string | `uf` ou `postal_range` |
| `uf` | string opcional | UF alvo |
| `postal_code_start` | string opcional | Inicio da faixa de CEP |
| `postal_code_end` | string opcional | Fim da faixa de CEP |
| `price_cents` | inteiro | Valor do frete em centavos |
| `estimated_days` | inteiro | Prazo manual estimado |
| `priority` | inteiro | Prioridade de aplicacao |
| `is_active` | booleano | Regra ativa/inativa |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

## `shipping_quotes`

Tabela de cotacoes de frete por carrinho.

| Campo | Tipo conceitual | Observacao |
| --- | --- | --- |
| `id` | string | Identificador da quote |
| `cart_id` | string | Carrinho dono da cotacao |
| `postal_code` | string | CEP normalizado |
| `cart_hash` | string | Assinatura do estado do carrinho |
| `provider` | string | `manual` na Fase 7 |
| `source` | string | Origem da cotacao |
| `options` | json | Opcoes geradas |
| `selected_option_id` | string opcional | Opcao escolhida |
| `expires_at` | timestamp | Validade local da cotacao |
| `created_at` | timestamp | Criacao |
| `updated_at` | timestamp | Atualizacao |

## Relacoes relevantes

- `cart_items` pertence a `carts`.
- `carts.coupon_id` aponta para cupom aplicado.
- `shipping_quotes.cart_id` pertence a `carts`.
- `carts.selected_shipping_quote_id` referencia a quote selecionada.
- Alterar itens do carrinho invalida a selecao de frete.

## Migration local da Fase 7

- Arquivo: `drizzle/0004_mute_ghost_rider.sql`
- Conteudo conceitual: cria/ajusta estruturas de frete manual, quotes e campos de frete no carrinho.
- Estado: gerada e versionada localmente; nao aplicada em banco real nesta etapa.
