# Investigation: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`

## Pergunta tecnica central

Como adicionar notificacoes transacionais apos pagamento confirmado sem alterar a fonte de verdade financeira da Fase 9, sem depender de credenciais reais em testes e sem criar duplicidade em webhook repetido?

## Contexto confirmado

| Fonte | Evidencia | Impacto |
|-------|-----------|---------|
| `_reversa_sdd/architecture.md#Payments` | `payment_intent.succeeded` e fonte final de pagamento confirmado. | Notificacao nasce apos settlement, nao antes. |
| `_reversa_sdd/state-machines.md#Webhook Stripe` | Evento duplicado e tratado antes do settlement. | Notificacao precisa de idempotencia propria alem da financeira. |
| `_reversa_sdd/data-dictionary.md#payment_events` | Eventos de webhook possuem `event_id` unico e relacao com pedido. | Outbox pode referenciar `payment_event_id`/`order_id`. |
| `_reversa_sdd/dependencies.md#Riscos de dependencia` | Replays nao podem duplicar efeitos; secrets fora do repositorio. | Provider deve ter config segura e mock explicito. |

## Alternativas avaliadas

### A1 - Envio direto no settlement sem outbox

- Vantagem: menor codigo inicial.
- Problema: sem auditoria robusta, sem status, idempotencia fraca e maior risco de acoplar falha de e-mail ao pagamento.
- Decisao: descartada.

### A2 - Outbox com processamento sincrono-controlado

- Vantagem: registra tentativa/sucesso/falha, permite idempotencia e dispensa worker real nesta fase.
- Problema: exige schema local novo.
- Decisao: escolhida.

### A3 - Fila/worker real

- Vantagem: melhor escalabilidade futura.
- Problema: amplia escopo, exige infra/operacao e testes de concorrencia mais profundos.
- Decisao: fora da Fase 10, preparar modelo para futuro.

### A4 - Provider real obrigatorio, como Resend ou SMTP

- Vantagem: entrega real imediata.
- Problema: exige credenciais e rede em ambientes que nao devem depender disso.
- Decisao: descartada como obrigatorio; permitido como adapter futuro/configuravel.

## Padroes aplicaveis

- **Outbox pattern:** registrar mensagem transacional em tabela local antes/durante envio para permitir auditoria e controle de estado.
- **Idempotent consumer:** usar chave deterministica para bloquear duplicidade por evento/destinatario.
- **Adapter pattern:** isolar provider real/mock por contrato estavel.
- **Fail-safe notification:** falha de comunicacao nao reverte evento de negocio ja confirmado.

## Pontos de integracao provaveis

- `src/features/payments/server/payment-settlement-service.ts`: apos transaction/sucesso do pedido pago.
- `src/features/payments/server/stripe-webhook-service.ts`: nao deve disparar notificacao diretamente antes do settlement.
- `src/features/orders/server/order-repository.ts`: leitura de pedido/snapshots para templates.
- `src/app/admin/pedidos/page.tsx`: possivel exibicao de status basico.

## Restricoes de seguranca

- Nao ler `.env` real para documentacao.
- Nao expor API keys de e-mail.
- Nao persistir payload Stripe bruto em notificacoes.
- Nao colocar dados de cartao, tokens ou links sensiveis nos templates.
- Nao hardcodar e-mails reais.

## Resultado da investigacao

O caminho mais seguro e incremental e criar um modulo `notifications` com outbox, adapter neutro, mock dev/test e templates com whitelist. O ponto de chamada deve ficar depois do settlement confirmado, e qualquer falha deve ser registrada sem rollback do pagamento.
