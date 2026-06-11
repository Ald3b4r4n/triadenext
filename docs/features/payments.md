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

## Notificacoes pos-pagamento

Depois que o settlement confirma pedido, pagamento, estoque e cupom, o sistema cria entregas
idempotentes de notificacao para cliente e destinatarios internos. Essa etapa ocorre fora da
transacao financeira. Falha de e-mail fica registrada e nao altera pedido, estoque ou
`usedCount`. Retorno client-side nunca dispara notificacao de pedido pago.
