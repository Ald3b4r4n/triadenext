# Legacy Impact - Fase 10

> Data: `2026-06-11`
> Feature: `008-fase-10-notificacoes-email`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `src/features/notifications/**` | Notifications | componente-novo | MEDIUM | Adiciona outbox, adapters, templates e auditoria pos-pagamento. |
| `src/db/schema.ts`, `drizzle/0007_outstanding_midnight.sql` | Persistencia | delta-de-dados | HIGH | Cria outbox idempotente sem alterar tabelas financeiras. |
| `src/features/payments/server/payment-settlement-service.ts` | Payments | regra-nova | HIGH | Dispara notificacao somente apos settlement concluido. |
| `src/app/admin/pedidos/page.tsx`, `src/features/orders/components/order-list.tsx` | Admin/Orders | regra-nova | MEDIUM | Exibe status basico protegido e somente leitura. |
| `.env.example`, `src/lib/env.ts` | Operacoes/env | delta-de-contrato-externo | LOW | Declara placeholders sem valores reais. |
| `docs/**` | Documentacao | regra-nova | LOW | Registra fluxo, guardrails e fora de escopo. |

## Diff conceitual

### Notifications

Novo subdominio com chave idempotente, estados padronizados, mock explicito em dev/test,
provider indisponivel seguro e dois templates baseados em snapshots server-side.

### Payments

O settlement continua inalterado como fonte de verdade. A nova chamada ocorre depois da
transacao financeira e captura qualquer falha de notificacao.

### Orders/Admin

Admin/manager podem ler status resumido de entregas. Customer nao ganhou historico e nao existe
acao de reenvio.

## Preservadas

- Pedido vira `pago` somente por webhook Stripe valido e idempotente.
- Estoque e `usedCount` mudam somente no settlement da Fase 9.
- Webhook duplicado nao repete efeitos financeiros, operacionais ou de notificacao.
- Retorno client-side nao marca pago nem cria notificacao.
- Customer acessa somente pedidos proprios.
- Admin/manager nao fazem mutacao financeira.
- Build/test/E2E nao exigem credenciais reais.
- Dados de cartao e secrets nao sao armazenados.

## Modificadas

- Pedido pago agora gera registros idempotentes de notificacao depois do settlement.
- Admin/manager agora podem visualizar status basico das notificacoes no pedido.
