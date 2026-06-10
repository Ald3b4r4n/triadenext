# Orders — Fases 8 e 9

## Modelo

`orders` representa o pedido pendente criado a partir de um carrinho autenticado. A Fase 8 adiciona:

- `cartId` unico para idempotencia por carrinho convertido;
- totais em centavos (`subtotalCents`, `discountTotalCents`, `shippingTotalCents`, `grandTotalCents`);
- snapshots de cliente, endereco, cupom e frete;
- `expiresAt` com janela fixa de 60 minutos.

`order_items` preserva snapshot de SKU, nome, slug, imagem, preco unitario, quantidade e total da
linha em centavos.

## Leitura

Customer lista apenas pedidos do proprio `userId`, incluindo pendentes e pagos. Admin/manager possui
leitura minima do status financeiro, sem acoes financeiras, sem edicao de valores e sem baixa
manual de estoque.

## Pagamento

Na Fase 9, `payment_intents` e `payment_events` passam a registrar PaymentIntent e eventos Stripe.
Pedido somente muda para `pago` pelo webhook validado. Retorno client-side nunca conclui o estado.

## Migration

Migration local gerada: `drizzle/0005_glossy_talisman.sql`.

Ela nao foi aplicada contra banco real.

Migration local da Fase 9: `drizzle/0006_soft_mole_man.sql`, somente com indices de idempotencia.
Ela tambem nao foi aplicada contra banco real.
