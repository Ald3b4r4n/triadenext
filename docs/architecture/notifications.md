# Notifications - Fase 10

## Fluxo

1. O webhook Stripe valido chama o settlement da Fase 9.
2. Pedido, pagamento, estoque, cupom e evento sao concluidos atomicamente.
3. Depois da transacao, `notifyOrderPaidAfterSettlement` carrega o pedido persistido.
4. O servico cria registros idempotentes para cliente e destinatarios internos.
5. O adapter selecionado processa a entrega e o repository persiste o resultado.

A chamada de notificacao nunca participa da transacao financeira. Erros sao capturados e
sanitizados, sem rollback de pedido, estoque ou `usedCount`.

## Componentes

- `config.ts` e `recipients.ts`: ambiente e destinatarios server-side.
- `types.ts`, `schemas.ts`, `status.ts`, `idempotency.ts`: contrato de dominio.
- `templates/**`: DTOs permitidos, escaping e renderizacao segura.
- `providers/**`: contrato neutro, mock dev/test e unavailable seguro.
- `drizzle-repository.ts` e `memory-repository.ts`: persistencia real ou fallback explicito.
- `service.ts`: criacao idempotente e processamento sincrono controlado.
- `post-payment-event.ts`: fronteira apos settlement.

## Outbox

`notification_deliveries.idempotency_key` e unico. A outbox armazena somente metadados
operacionais, destinatario, provider, status, timestamps e erro sanitizado. Nao armazena corpo
completo, payload Stripe bruto, dados de cartao, cookies, tokens ou secrets.

## Extensibilidade

O contrato aceita adapters reais futuros, mas nenhum provider real e requerido ou implementado
como obrigatorio nesta fase. Retry futuro pode usar `attempt_count` e `last_error`, sem scheduler
ou endpoint de reenvio atual.
