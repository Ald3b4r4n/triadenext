# Interface: Post-payment Event

> Feature: `008-fase-10-notificacoes-email`
> Tipo: contrato interno de evento

## Origem

O evento nasce somente apos o settlement de `payment_intent.succeeded` ja ter sido validado e concluido pela Fase 9.

Nao pode nascer de:

- retorno client-side do Stripe;
- criacao de PaymentIntent;
- evento Stripe com assinatura invalida;
- evento duplicado que nao executou settlement;
- falha/cancelamento de PaymentIntent.

## Evento conceitual

```ts
type OrderPaidNotificationEvent = {
  eventType: "order_paid";
  orderId: string;
  userId: string;
  paymentIntentId: string;
  paymentEventId?: string;
  occurredAt: Date;
};
```

## Efeitos esperados

Para cada evento valido:

1. Criar/obter registro de notificacao para cliente.
2. Criar/obter registro de notificacao para admin/gestores se houver destinatarios configurados.
3. Processar envio por adapter mock/real/unavailable.
4. Registrar sucesso, mock, skipped ou falha.

## Garantias

- Notificacao nao altera `orders.status`.
- Notificacao nao altera `payment_intents.status`.
- Notificacao nao altera estoque.
- Notificacao nao altera `usedCount`.
- Falha de notificacao nao reverte pagamento.
- Webhook duplicado nao duplica notificacao.

## Futuro fiscal

O evento pode ser usado no futuro como fonte para integracoes fiscais, mas a Fase 10 nao integra Bling, NF-e, documentos fiscais ou emissao fiscal.
