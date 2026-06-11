# Notificacoes pos-pagamento

A Fase 10 registra e processa e-mails transacionais somente depois que o webhook Stripe valido
conclui o settlement do pedido.

## Entregas

- `customer_order_paid`: aviso de pedido pago ao e-mail snapshotado do cliente.
- `admin_order_paid`: aviso operacional para destinatarios configurados em
  `ORDER_NOTIFICATION_RECIPIENTS`.
- Ausencia de destinatario interno gera registro `skipped` e nao interrompe pagamento.

## Estados

Os estados persistidos sao `pending`, `sending`, `sent`, `mocked`, `failed` e `skipped`.
Duplicidade e um resultado de `createIfNew`, nao um estado persistido. A chave unica combina
pedido, evento, tipo de notificacao e destinatario normalizado.

## Ambiente

Dev/test usam adapter mock explicito e nao acessam rede. Preview/producao sem provider real
disponivel registram falha segura; nunca simulam sucesso. Provider real permanece uma extensao
opcional, sem dependencia obrigatoria de SDK ou credencial para build/test/E2E.

## Admin e customer

Admin/manager veem apenas tipo, destinatario mascarado, status e timestamps na lista de pedidos.
Essa leitura usa `requireAdminLike`. Nao existe reenvio manual. Customer continua vendo apenas
seus pedidos, sem historico ou central de notificacoes.

## Fora de escopo

Retry automatico, worker persistente, WhatsApp, SMS, Bling, NF-e, documentos fiscais e emissao
fiscal nao fazem parte desta fase.
