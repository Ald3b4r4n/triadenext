# Pagamentos

## Cliente

Pedidos pendentes proprios exibem acao para iniciar pagamento. A tela usa Payment Element quando
Stripe esta configurado. Em dev/test, o adapter mock exibe aviso explicito e simula um webhook
assinado sem cobranca.

## Estados

- `pendente`: PaymentIntent criado e aguardando confirmacao.
- `pago`: webhook `payment_intent.succeeded` processado.
- `falhou` ou `cancelado`: evento correlato registrado sem marcar pedido como pago.
- Divergencias ficam registradas como falha controlada.

## Segurança

O navegador envia somente `orderId`. Valor, moeda, owner e status sao resolvidos no servidor.
Retorno do Payment Element nao marca pedido como pago.
