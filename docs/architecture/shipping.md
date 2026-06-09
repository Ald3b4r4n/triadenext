# Arquitetura de frete

O modulo `src/features/shipping` concentra dominio, schemas, repository, service, actions admin e
componentes de frete.

## Fluxo

1. Carrinho envia CEP para `quoteShippingAction`.
2. O service resolve o carrinho no servidor e calcula `cartHash`.
3. Regras manuais ativas sao filtradas por UF/faixa de CEP.
4. A cotacao e persistida em `shipping_quotes` ou em fallback dev/test.
5. O carrinho salva `selected_shipping_quote_id`, `shipping_postal_code` e `shipping_amount_cents`.
6. `CartView` recalcula `partialTotalWithShippingCents`.

## Providers externos

`future-providers.ts` declara contratos futuros para `correios`, `jadlog` e `melhor_envio`, todos
inativos. Nenhuma chamada HTTP externa e executada nesta fase.

## Guardrails

O modulo nao cria pedido, pagamento, Stripe, webhook, etiqueta, reserva ou baixa de estoque.
