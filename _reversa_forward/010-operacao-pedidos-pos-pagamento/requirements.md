# Requirements - Operação de Pedidos Pós-Pagamento

## Objetivo

Expandir pedidos além de `pending` e `paid`, cobrindo operação administrativa, histórico e comunicação ao cliente.

## Escopo

- Máquina de estados operacional.
- Histórico de status com ator e data.
- Admin para visualizar e alterar status permitidos.
- Cancelamento, falha, envio e entrega conforme decisão humana.
- Eventos de notificação por status.

## Regras

- Webhook de pagamento continua sendo idempotente.
- Alteração manual precisa de permissão administrativa.
- Pedido fechado preserva snapshot financeiro.

## Fora do escopo

- Reembolso real em gateway.
- Emissão fiscal.
