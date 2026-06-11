# Roadmap: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`
> Requirements: `_reversa_forward/008-fase-10-notificacoes-email/requirements.md`
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 10 adiciona um subdominio `notifications` como delta sobre Payments/Orders. A confirmacao financeira continua sendo exclusiva do settlement da Fase 9; apos o pedido ja estar `pago` e os efeitos de estoque/cupom ja terem ocorrido, o fluxo cria registros de outbox para notificacoes transacionais. O envio passa por adapter neutro de e-mail, com mock explicito em dev/test e falha segura em preview/producao sem credenciais.

O plano evita worker/fila real obrigatoria. O processamento pode ser sincrono-controlado nesta fase: cria registro, tenta envio pelo adapter, persiste sucesso/falha/erro seguro e nunca desfaz pagamento. A idempotencia de notificacoes fica separada da idempotencia financeira, usando chave por `orderId + eventType + notificationType + recipient`. Admin pode ganhar apenas status basico de notificacao, sem reenvio manual nem central completa.

## 2. Principios aplicados

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Server-side como fonte de verdade | Evento de notificacao nasce apenas apos webhook Stripe validado e settlement server-side. | respeita |
| Sem secrets no repositorio | Provider real e configuravel por variaveis/adapter; exemplos usam placeholders. | respeita |
| Fallback explicito | Mock dev/test e estados controlados sem credenciais substituem fallback silencioso. | respeita |
| Escopo incremental | WhatsApp/SMS, fiscal, reenvio admin, central completa e retry automatico ficam fora. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confianca |
|----|---------|---------------|--------------------------|-----------|
| D-01 | Criar modulo `src/features/notifications` | Isola outbox, templates, adapters e auditoria do dominio de pagamento. | Misturar notificacoes em `payments`; adicionar apenas helpers soltos. | 🟢 |
| D-02 | Usar outbox/registro `notification_deliveries` | Permite auditoria, idempotencia e falha segura sem fila real obrigatoria. | Envio direto sem registro; fila externa obrigatoria. | 🟢 |
| D-03 | Integrar apos settlement de `payment_intent.succeeded` | Preserva Fase 9: retorno client-side nao paga nem notifica. | Disparar por callback client; disparar na criacao do PaymentIntent. | 🟢 |
| D-04 | Idempotencia por `orderId + eventType + notificationType + recipient` | Bloqueia duplicidade em webhook duplicado e reprocessamento. | Usar apenas `eventId`; usar apenas `orderId`. | 🟢 |
| D-05 | Adapter neutro de e-mail com mock dev/test | Build/test/e2e nao dependem de credenciais reais nem rede externa. | Resend/SMTP obrigatorio; mock implicito em producao. | 🟢 |
| D-06 | Preview/producao sem credenciais registram falha segura para envio real | Nao finge entrega real e nao quebra pagamento confirmado. | Enviar silenciosamente por mock em producao; lancar erro que reverta settlement. | 🟢 |
| D-07 | Dois templates MVP | Cobre cliente pedido pago e aviso interno/admin sem ampliar canal. | Mais templates; WhatsApp/SMS; fiscal. | 🟢 |
| D-08 | Admin ve no maximo status basico | Ajuda operacao sem abrir reenvio/retry/central completa. | Central completa; reenvio manual. | 🟢 |

## 4. Premissas

Nao ha premissas herdadas de duvidas abertas. `requirements.md` e `doubts.md` estao sem lacunas remanescentes.

## 5. Delta arquitetural

| Componente | Arquivo de origem no SDD | Tipo de mudanca | Resumo |
|------------|--------------------------|-----------------|--------|
| Payments | `_reversa_sdd/architecture.md#Payments` | contrato-alterado | Ao final do settlement confirmado, chama/cria evento de notificacao pos-pagamento sem alterar pagamento. |
| Orders | `_reversa_sdd/architecture.md#Orders` | regra-alterada | Pedido `pago` passa a ter registros de notificacao associados para leitura/admin minima. |
| Persistencia | `_reversa_sdd/data-dictionary.md#payment_events` | delta-de-dados | Nova estrutura de outbox com idempotency key e status de envio. |
| Admin | `_reversa_sdd/permissions.md#Checkout, pedido e pagamento` | regra-alterada | Admin/manager podem ver status basico de notificacao, sem reenvio ou mutacao financeira. |
| Notifications | n/a | componente-novo | Novo subdominio para outbox, templates, provider adapter, mock e auditoria. |
| Operacoes/env | `_reversa_sdd/dependencies.md#Riscos de dependencia` | contrato-novo | Variaveis de e-mail documentadas como placeholders, sem secrets reais. |

## 6. Arquivos provavelmente criados

| Caminho | Finalidade |
|---------|------------|
| `src/features/notifications/types.ts` | Tipos de notificacao, status, templates e adapter. |
| `src/features/notifications/domain.ts` | Idempotency key, sanitizacao de erro, regras de destinatario e status. |
| `src/features/notifications/templates/order-paid-customer.ts` | Template cliente pedido pago. |
| `src/features/notifications/templates/order-paid-admin.ts` | Template admin/gestores novo pedido pago. |
| `src/features/notifications/server/notification-config.ts` | Leitura segura de config e destinatarios. |
| `src/features/notifications/server/email-adapter.ts` | Contrato adapter, mock e stubs para real configuravel. |
| `src/features/notifications/server/notification-repository.ts` | Outbox Drizzle/fallback e idempotencia. |
| `src/features/notifications/server/notification-service.ts` | Orquestracao de criacao/envio/registro. |
| `src/features/notifications/components/notification-status.tsx` | Status basico para admin, se mantido no coding. |
| `src/tests/unit/notification-service.test.ts` | Cobertura de outbox, mock, falha e idempotencia. |
| `src/tests/e2e/notifications-mock.spec.ts` | Fluxo mock sem credenciais reais. |
| `docs/features/notifications.md` | Documento de feature. |
| `docs/architecture/notifications.md` | Arquitetura de outbox/adapters. |

## 7. Arquivos provavelmente alterados

| Caminho | Impacto previsto |
|---------|------------------|
| `.env.example` | Adicionar placeholders como `ORDER_NOTIFICATION_RECIPIENTS=` e variaveis opcionais de provider sem valores reais. |
| `src/db/schema.ts` | Adicionar tabela/indices de outbox; migration local gerada, nao aplicada. |
| `src/features/payments/server/payment-settlement-service.ts` | Ponto de integracao apos settlement confirmado. |
| `src/features/orders/server/order-repository.ts` | Expor status basico de notificacao para admin, se necessario. |
| `src/features/orders/components/order-list.tsx` | Mostrar status basico de notificacao para admin, se escopo permitir. |
| `src/app/admin/pedidos/page.tsx` | Incluir resumo de notificacao, sem acao de reenvio. |
| `docs/features/payments.md` | Documentar disparo pos-pagamento sem alterar pagamento. |
| `docs/architecture/payments.md` | Documentar integracao com notifications. |
| `docs/architecture/database.md` | Documentar nova outbox e migration local. |
| `docs/operations/env.md` | Documentar variaveis sem valores reais. |

## 8. Delta no modelo de dados

Resumo: adicionar uma outbox `notification_deliveries` ou equivalente, com chave unica de idempotencia, relacao com pedido/evento de pagamento, status e erro sanitizado. Detalhe completo em `_reversa_forward/008-fase-10-notificacoes-email/data-delta.md`.

## 9. Delta de contratos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Notification outbox | interno/persistencia | `_reversa_forward/008-fase-10-notificacoes-email/interfaces/notification-outbox.md` |
| Email provider adapter | interno/provider | `_reversa_forward/008-fase-10-notificacoes-email/interfaces/email-provider.md` |
| Transactional templates | interno/template | `_reversa_forward/008-fase-10-notificacoes-email/interfaces/templates.md` |
| Post-payment event | interno/evento | `_reversa_forward/008-fase-10-notificacoes-email/interfaces/post-payment-event.md` |

## 10. Plano de migracao

1. Gerar migration local para outbox quando a etapa de coding alterar schema.
2. Nao aplicar migration em banco real durante coding sem validacao humana explicita.
3. Manter fallback/mock para dev/test sem `DATABASE_URL` ou sem provider.
4. Atualizar docs e SDD depois da implementacao via nova re-extracao.

## 11. Estrategia de implementacao recomendada

1. Preparar tipos, dominio e contratos de notificacao.
2. Modelar outbox e repository/fallback.
3. Criar adapter de e-mail neutro com mock dev/test.
4. Criar templates seguros.
5. Integrar servico de notificacao ao final do settlement confirmado.
6. Expor status admin basico, se couber sem ampliar escopo.
7. Atualizar docs e `.env.example`.
8. Cobrir unit/integration/e2e.
9. Rodar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.

## 12. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Falha de e-mail reverter pagamento | alto | medio | Capturar erro, registrar falha e nunca propagar rollback para settlement. |
| Webhook duplicado reenviar e-mail | alto | medio | Unique/idempotency key por pedido/evento/tipo/destinatario. |
| Mock parecer envio real em producao | alto | baixo | Bloquear mock fora de dev/test e registrar unavailable/falha segura. |
| Vazamento de dados sensiveis em template/log | alto | medio | Templates server-side com whitelist de campos snapshotados e sanitizacao de erros. |
| Escopo crescer para fiscal/canais | medio | medio | Manter Bling/NF-e/WhatsApp/SMS/retry completo fora e documentado. |

## 13. Criterios de rollback

- Remover ponto de chamada do servico de notificacao mantendo settlement intacto.
- Manter tabela de outbox inerte, sem worker real obrigatorio.
- Desabilitar provider real por config, retornando falha segura controlada.
- Preservar registros existentes para auditoria, sem apagar historico por rollback tecnico.

## 14. Criterio de pronto

- [ ] `actions.md` gerado por `/reversa-to-do` e todas as acoes fechadas no coding futuro.
- [ ] Outbox/idempotencia implementadas sem duplicidade em webhook repetido.
- [ ] Mock dev/test funciona sem credenciais reais.
- [ ] Preview/producao sem credenciais nao fingem envio real.
- [ ] Falha de notificacao nao altera pagamento, estoque ou `usedCount`.
- [ ] Templates nao incluem dados proibidos.
- [ ] Admin nao possui reenvio manual.
- [ ] WhatsApp/SMS/Bling/NF-e/fiscal continuam fora.
- [ ] Validacoes completas passam.
- [ ] `legacy-impact.md` e `regression-watch.md` gerados no coding futuro.

## 15. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Versao inicial gerada por `/reversa-plan` | reversa |
