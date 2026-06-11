# ADR 005 - Notificações fora da transação financeira

## Status

Aceito retroativamente.

## Contexto

E-mail é efeito colateral externo e pode falhar independentemente do pagamento.

## Decisão

Executar notificações somente depois do settlement, com outbox idempotente. Falha de provider não reverte pedido, pagamento, estoque ou cupom.

## Alternativas consideradas

- Enviar e-mail dentro da transação.
- Bloquear pedido pago quando e-mail falha.
- Não registrar tentativa de notificação.

## Consequências

- 🟢 Fluxo financeiro fica isolado.
- 🟢 Entregas podem ser auditadas por status.
- 🔴 Retry/reenvio manual ainda não foi implementado.
