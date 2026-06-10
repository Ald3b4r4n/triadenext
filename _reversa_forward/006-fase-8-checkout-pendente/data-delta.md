# Data Delta: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`

## 1. Panorama

O schema atual de `src/db/schema.ts` ja possui o tronco de pedidos, pagamento e frete. A Fase 8 nao cria um modelo paralelo do zero; ela amplia o pedido existente para suportar snapshot completo, vinculo com carrinho convertido e leitura minima por cliente/admin.

## 2. Entidades impactadas

### `orders`

Delta conceitual proposto:

- manter `status = aguardando_pagamento` como estado inicial;
- ligar o pedido ao carrinho convertido com `cartId` ou `sourceCartId` unico;
- garantir snapshots completos de cliente, endereco, frete e cupom;
- manter `expiresAt` como janela de 60 minutos;
- manter `publicToken` para visualizacao segura do pedido, se o fluxo de leitura o exigir;
- nao ativar nenhuma dependencia real com Stripe.

Campos ja existentes que permanecem no tronco:

- `userId`
- `number`
- `status`
- `fulfillmentStatus`
- `subtotal`
- `shippingTotal`
- `discountTotal`
- `grandTotal`
- `currency`
- `customerSnapshot`
- `shippingAddressSnapshot`
- `shippingSnapshot`
- `publicToken`
- `expiresAt`
- `placedAt`
- `paidAt`
- `cancelledAt`
- `completedAt`

Delta tecnico:

- formalizar os snapshots como entrada de checkout;
- adicionar relacionamento com o cart convertido;
- impedir duplicidade por reenvio;
- manter campos de pagamento futuro inertes.

### `order_items`

Delta conceitual proposto:

- preservar snapshot por linha de item;
- gravar produto, nome, slug, imagem, quantidade e valores do momento da criacao;
- manter totais da linha em centavos;
- nao depender do catalogo atual para exibir historico.

Campos ja existentes:

- `orderId`
- `productId`
- `skuSnapshot`
- `nameSnapshot`
- `unitPrice`
- `quantity`
- `lineTotal`

Campos a reforcar ou adicionar se necessario para a Fase 8:

- `productSlugSnapshot`
- `productImageSnapshot`
- `unitPriceCents`
- `lineTotalCents`

### `carts`

Nao ha grande mudanca estrutural de cart para esta fase. O que muda e a semantica:

- `status = converted` passa a significar "pedido criado, cart bloqueado";
- `convertedAt` vira ponto de bloqueio de novas mutacoes;
- o cart usado nao pode ser reaproveitado para nova compra;
- `shippingPostalCode`, `selectedShippingQuoteId` e `shippingAmountCents` seguem como entrada do checkout.

### `payment_intents` e `payment_events`

Nao devem ser ativados. Permanecem como superficie futura para a fase de pagamento real.

## 3. Indices e constraints

Reforcos sugeridos:

- indice por `orders.user_id` para listagem customer;
- indice por `orders.status` e `orders.expires_at` para fila/expiracao;
- unique ou indice de idempotencia por `orders.cart_id` ou `sourceCartId`;
- indice por `order_items.order_id`;
- constraints para impedir order sem user quando a fase exigir autenticacao.

## 4. Migracao local esperada

Nome conceitual:

- `drizzle/0005_checkout_pending_order.sql`

Objetivo:

- ajustar `orders` para rastrear cart convertido e snapshots finais;
- ajustar `order_items` para snapshot completo da linha;
- manter as tabelas de pagamento inertes;
- nao aplicar em banco real nesta etapa.

## 5. Impacto sem schema novo

Se a implementacao optar por reaproveitar ao maximo os campos atuais, o delta ainda precisa:

- explicitar que pedido nasce com snapshots e expiracao;
- garantir que o repository de order salva e retorna os snapshots de leitura minima;
- impedir que checkout dependa de recomputo futuro;
- bloquear a duplicidade via cart convertido.

## 6. Risco de drift

O principal risco de dados e a ordem do servidor gravar um snapshot e depois outro processo alterar o carrinho ou o produto. A mitigacao e o checkout final trabalhar com um snapshot transacional de validacao + persistencia, sempre no servidor.

## 7. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Data delta inicial gerado por `/reversa-plan` | reversa |
