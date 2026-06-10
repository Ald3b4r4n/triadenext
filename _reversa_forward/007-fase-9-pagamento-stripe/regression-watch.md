# Regression Watch: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`

| ID | Origem (arquivo, secao) | Regra esperada apos mudanca | Tipo de verificacao | Sinal de violacao |
|----|-------------------------|-----------------------------|--------------------|-------------------|
| W001 | `_reversa_sdd/domain.md#Pedido pendente` | Pedido so vira `pago` por webhook Stripe assinado e idempotente. | presenca | Action client/admin altera diretamente status para pago. |
| W002 | `_reversa_sdd/architecture.md#Guardrails arquiteturais atuais` | Valor e moeda do PaymentIntent vem do snapshot server-side. | redacao | Payload client define amount, currency ou status. |
| W003 | `_reversa_sdd/domain.md#Cupons` | `usedCount` e consumido uma vez no webhook confirmado. | presenca | Cupom e consumido ao criar PaymentIntent ou duas vezes em replay. |
| W004 | `_reversa_sdd/domain.md#Catalogo` | Estoque baixa uma vez e somente no settlement confirmado. | presenca | Estoque baixa no client-side, na criacao do intent ou em duplicidade. |
| W005 | `_reversa_sdd/permissions.md#Matriz de acesso` | Admin/manager permanecem sem marcar pago ou editar valores. | ausencia | UI/action administrativa oferece mutacao financeira. |
| W006 | `_reversa_sdd/dependencies.md#Riscos de dependencia` | Webhook valida assinatura e persiste `eventId` unico. | presenca | Evento sem assinatura ou sem deduplicacao produz efeitos. |
| W007 | `_reversa_sdd/domain.md#Fallback sem banco` | Mock fica restrito a dev/test; preview/producao falham seguro sem Stripe. | presenca | Mock simula sucesso financeiro em preview/producao. |
| W008 | `_reversa_sdd/state-machines.md#Pedido` | Divergencia ou estoque insuficiente nao conclui estado operacional parcial. | presenca | Pedido pago sem pagamento/estoque/cupom coerentes. |

## Historico de re-extracoes

Nenhuma re-extracao registrada apos a Fase 9.

## Arquivadas

Nenhuma.

## Observacoes

- Refunds e disputas completas permanecem fora desta fase.
- A migration `drizzle/0006_soft_mole_man.sql` foi gerada localmente e nao aplicada.
