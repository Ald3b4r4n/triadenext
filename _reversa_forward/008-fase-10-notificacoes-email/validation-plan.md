# Validation Plan: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`

## Validacao estatica

- `pnpm lint`
- `pnpm typecheck`
- `git diff --check`
- Varredura textual por secrets/padroes sensiveis antes do commit futuro.

## Testes unitarios planejados

| Area | Cenario |
|------|---------|
| Domain | Gera idempotency key por `orderId + eventType + notificationType + recipient`. |
| Domain | Sanitiza erros de provider. |
| Templates | Cliente pedido pago contem apenas campos permitidos. |
| Templates | Admin novo pedido pago contem apenas resumo permitido. |
| Templates | Nao contem dados de cartao, tokens, payload Stripe bruto ou secrets. |
| Adapter | Mock dev/test retorna `mocked` sem rede externa. |
| Config | Preview/producao sem credenciais retorna unavailable/falha segura. |
| Repository | Unique/idempotencia impede duplicidade. |
| Service | Falha de envio registra `failed` sem throw que reverta pagamento. |

## Testes de integracao planejados

- Settlement confirmado cria registro de notificacao para cliente.
- Settlement confirmado cria registro para admin/gestores quando configurado.
- Sem destinatario admin configurado registra estado controlado.
- Webhook duplicado nao cria segundo registro/envio efetivo.
- Falha do adapter nao altera `orders.status`.
- Falha do adapter nao altera estoque.
- Falha do adapter nao altera `usedCount`.
- Retorno client-side nao cria notificacao de pedido pago.

## E2E planejado

- Fluxo mock de pagamento confirmado gera outbox/mock.
- Cliente teria e-mail de pedido pago via mock.
- Admin/gestor teria e-mail interno via mock ou estado controlado de destinatario ausente.
- Webhook duplicado nao duplica notificacao.
- Ausencia de credenciais reais nao quebra build/test/e2e.
- UI/admin, se exibida, nao oferece reenvio.

## Validacao documental

- `docs/features/notifications.md` cobre objetivo, escopo e fora de escopo.
- `docs/architecture/notifications.md` cobre outbox, adapter, mock e idempotencia.
- `docs/operations/env.md` lista variaveis sem valores reais.
- Docs de payments/database registram integracao pos-settlement sem alterar Fase 9.

## Criterios de aceite

- Todos os testes automatizados passam.
- Nenhum envio real ocorre sem provider configurado.
- Nenhum secret aparece em docs/logs/templates.
- Nenhuma migration e aplicada em banco real.
- Nenhum codigo de WhatsApp/SMS/Bling/NF-e e introduzido.
