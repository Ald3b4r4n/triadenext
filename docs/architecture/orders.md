# Orders — Fase 8

## Modelo

`orders` representa o pedido pendente criado a partir de um carrinho autenticado. A Fase 8 adiciona:

- `cartId` unico para idempotencia por carrinho convertido;
- totais em centavos (`subtotalCents`, `discountTotalCents`, `shippingTotalCents`, `grandTotalCents`);
- snapshots de cliente, endereco, cupom e frete;
- `expiresAt` com janela fixa de 60 minutos.

`order_items` preserva snapshot de SKU, nome, slug, imagem, preco unitario, quantidade e total da
linha em centavos.

## Leitura

Customer lista apenas pedidos do proprio `userId`. Admin/manager possui leitura minima de pedidos
pendentes, sem acoes financeiras, sem edicao de valores e sem baixa de estoque.

## Pagamento

`payment_intents` e `payment_events` permanecem superficie futura. A Fase 8 nao cria PaymentIntent,
nao chama Stripe e nao coleta cartao.

## Migration

Migration local gerada: `drizzle/0005_glossy_talisman.sql`.

Ela nao foi aplicada contra banco real.
