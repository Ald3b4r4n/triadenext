# Regression Watch - Fase 10

> Feature: `008-fase-10-notificacoes-email`

| ID | Origem (arquivo, secao) | Regra esperada apos mudanca | Tipo de verificacao | Sinal de violacao |
|---|---|---|---|---|
| W001 | `_reversa_sdd/domain.md`, Settlement financeiro e operacional | Notificacao ocorre somente depois do settlement confirmado. | presenca | Chamada antes ou dentro da transacao financeira. |
| W002 | `_reversa_sdd/domain.md`, Cupons | Falha de notificacao nao altera nem reverte `usedCount`. | presenca | Cupom revertido ou consumido pela camada de notificacao. |
| W003 | `_reversa_sdd/domain.md`, Catalogo/Pagamento | Falha de notificacao nao altera nem reverte estoque. | presenca | Estoque mutado pela camada de notificacao. |
| W004 | `_reversa_sdd/domain.md`, Pagamento Stripe | Webhook duplicado nao cria segunda entrega efetiva. | presenca | Duas entregas com a mesma chave logica. |
| W005 | `_reversa_sdd/domain.md`, Fallback sem banco | Mock de e-mail opera somente em dev/test. | presenca | Status `mocked` em preview/producao. |
| W006 | `_reversa_sdd/domain.md`, Customer e admin | Status admin exige admin/manager e permanece somente leitura. | presenca | Customer/visitante acessa status ou surge reenvio manual. |
| W007 | `_reversa_sdd/domain.md`, Regras fora do escopo | WhatsApp, SMS, Bling, NF-e e fiscal continuam ausentes. | ausencia | Codigo ou credencial desses canais na feature. |

## Historico de re-extracoes

### Re-extracao 2026-07-01 - Pos-Fase 12

| ID | Veredito | Observacao |
|---|---|---|
| W001 | verde | Notificacao continua ocorrendo somente apos settlement confirmado. |
| W002 | verde | Falha de notificacao nao reverte nem altera `usedCount`. |
| W003 | verde | Falha de notificacao nao reverte nem altera estoque. |
| W004 | verde | Chave idempotente continua impedindo segunda entrega efetiva. |
| W005 | verde | Mock permanece restrito a dev/test; preview/producao sem provider falham seguro. |
| W006 | verde | Status admin permanece protegido, mascarado e somente leitura. |
| W007 | verde | WhatsApp, SMS, Bling, NF-e e fiscal permanecem ausentes da Fase 12. |

### Re-extracao 2026-06-11 - Pos-Fase 10

| ID | Veredito | Observacao |
|---|---|---|
| W001 | verde | SDD registra notificacao somente apos a conclusao do settlement. |
| W002 | verde | Falha de notificacao nao reverte nem altera `usedCount`. |
| W003 | verde | Falha de notificacao nao reverte nem altera estoque. |
| W004 | verde | Chave idempotente impede segunda entrega efetiva em replay. |
| W005 | verde | Mock permanece restrito a dev/test; preview/producao falham seguro. |
| W006 | verde | Status e mascarado, somente leitura e protegido por `requireAdminLike`. |
| W007 | verde | WhatsApp, SMS, Bling, NF-e e fiscal permanecem ausentes. |

## Arquivadas

Nenhuma.
