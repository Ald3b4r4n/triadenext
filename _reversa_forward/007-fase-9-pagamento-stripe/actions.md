# Actions: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`
> Roadmap: `_reversa_forward/007-fase-9-pagamento-stripe/roadmap.md`
> Status inicial: todas as tarefas começam como `[ ]`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 61 |
| Paralelizáveis (`[//]`) | 7 |
| Maior cadeia de dependência | 17 |
| Próxima etapa recomendada | `/reversa-audit` |

## Guardrails de execução

- Não implementar Stripe Checkout Session como fluxo principal.
- Não coletar cartão em formulário próprio.
- Não armazenar dados sensíveis de cartão.
- Não expor `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, cookies, tokens ou secrets.
- Não rodar migration em banco real.
- Não conectar banco real sem autorização humana explícita.
- Não integrar Bling/NF-e/fiscal nesta fase.
- Não exigir email transacional real nesta fase.
- Não criar tarefa de push, deploy ou migration em produção.

## Fase 1 - Preparação e segurança

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-001 | Confirmar checkpoint pré-coding | Verificar diretório Next, status Git, ausência de alterações funcionais inesperadas e não estar no legado Laravel. | terminal/git | - | validation | - | `git status` mostra apenas artefatos Reversa esperados antes de qualquer código. | alto | 🟢 | [X] |
| [//] F9-002 | Registrar guardrails operacionais | Criar nota de execução local para o coding preservar escopo, secrets e proibições de Stripe/fiscal/deploy. | `_reversa_forward/007-fase-9-pagamento-stripe/*` | F9-001 | docs | [//] | Guardrails da Fase 9 aparecem em artefato Reversa ou notas de execução. | médio | 🟢 | [X] |
| F9-003 | Mapear superfície técnica real | Confirmar arquivos existentes de checkout, orders, webhook, schema, customer e admin antes de editar. | `src/features/**`, `src/app/**`, `src/db/schema.ts` | F9-001 | validation | - | Lista de arquivos-alvo reais validada antes de implementação. | médio | 🟢 | [X] |

## Fase 2 - Configuração/env

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-004 | Declarar variáveis Stripe esperadas | Adicionar nomes esperados sem valores reais: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. | `.env.example` | F9-003 | config | - | Arquivo documenta nomes de variáveis sem secrets reais. | alto | 🟢 | [X] |
| F9-005 | Definir leitura segura de configuração | Criar helper server-side para detectar Stripe configurado, ambiente dev/test e falha segura em preview/prod. | `src/features/payments/server/payment-config.ts` | F9-004 | code | - | Helper nunca expõe secret ao client e diferencia mock de real. | alto | 🟢 | [X] |
| [//] F9-006 | Documentar política de env sem secrets | Registrar uso de mock em dev/test e falha segura em preview/prod sem valores reais. | `docs/operations/env.md` | F9-004 | docs | [//] | Docs explicam variáveis e proíbem chaves reais no repo. | médio | 🟢 | [X] |

## Fase 3 - Schema e migrations locais

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-007 | Auditar suporte atual de pagamentos | Comparar `payment_intents` e `payment_events` com `data-delta.md`, sem alterar schema ainda. | `src/db/schema.ts`, `drizzle/` | F9-003 | validation | - | Decisão documentada: sem migration ou migration local additive necessária. | alto | 🟢 | [X] |
| F9-008 | Ajustar schema de idempotência se necessário | Adicionar somente campos/índices/constraints faltantes para provider reference, event id e lookup por pedido/status. | `src/db/schema.ts` | F9-007 | code | - | Schema cobre idempotência persistente sem remover campos existentes. | alto | 🟢 | [X] |
| F9-009 | Gerar migration local se schema mudar | Gerar migration Drizzle local para o delta de F9-008, sem aplicar em banco real. | `drizzle/*.sql` | F9-008 | code | - | Migration versionada localmente e não executada em banco real. | alto | 🟢 | [X] |
| F9-010 | Revisar migration gerada | Conferir que a migration é additive, não toca dados reais e não contém secrets. | `drizzle/*.sql` | F9-009 | validation | - | Migration revisada sem operação destrutiva inesperada. | alto | 🟢 | [X] |

## Fase 4 - Domínio de pagamentos

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-011 | Criar tipos de pagamento | Definir tipos internos, statuses, erros e payloads seguros para PaymentIntent e webhook. | `src/features/payments/types.ts` | F9-005, F9-007 | code | - | Tipos representam `pendente`, `pago`, `falhou`, `cancelado`, divergência e requer ação sem cartão próprio. | médio | 🟢 | [X] |
| F9-012 | Criar schemas de entrada/saída | Validar `orderId`, retorno de início de pagamento e consulta de status sem aceitar valores financeiros do client. | `src/features/payments/schemas.ts` | F9-011 | code | - | Payload financeiro/status/provider vindos do client são rejeitados ou ignorados. | alto | 🟢 | [X] |
| F9-013 | Implementar regras de pedido pagável | Centralizar validação de owner, status `aguardando_pagamento`, expiração e moeda/valor snapshotado. | `src/features/payments/domain.ts` | F9-012 | code | - | Pedido expirado, cancelado, pago ou de outro usuário não é pagável. | alto | 🟢 | [X] |
| F9-014 | Modelar divergências de webhook | Definir resultado controlado para valor, moeda, pedido ou estoque divergente. | `src/features/payments/domain.ts` | F9-013 | code | - | Divergência tem erro de domínio sem concluir estado pago. | alto | 🟢 | [X] |

## Fase 5 - PaymentIntent

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-015 | Criar contrato do adapter Stripe | Definir interface para criar/reutilizar PaymentIntent com idempotency key, metadata segura e mock. | `src/features/payments/server/stripe-adapter.ts` | F9-011, F9-005 | code | - | Adapter não vaza secret e possui implementação mock explícita. | alto | 🟢 | [X] |
| F9-016 | Implementar criação real de PaymentIntent | Chamar Stripe server-side usando valor/moeda do pedido e metadata segura `orderId`/`userId`. | `src/features/payments/server/stripe-adapter.ts` | F9-015 | code | - | Não usa Checkout Session e não aceita valor vindo do client. | alto | 🟢 | [X] |
| F9-017 | Implementar registro interno do pagamento | Criar/reutilizar `payment_intents` interno para pedido elegível, status e provider reference. | `src/features/payments/server/payment-repository.ts` | F9-013, F9-016 | code | - | Reenvio não cria dois pagamentos ativos para o mesmo pedido. | alto | 🟢 | [X] |
| F9-018 | Orquestrar início de pagamento | Criar service que valida pedido, chama adapter e retorna client secret sanitizado. | `src/features/payments/server/payment-service.ts` | F9-017 | code | - | Cliente recebe somente dados necessários ao Payment Element. | alto | 🟢 | [X] |

## Fase 6 - Payment Element/UI

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-019 | Criar componente client de Payment Element | Montar Stripe.js/Payment Element sem formulário próprio de cartão e sem secret key no client. | `src/features/payments/components/payment-element-form.tsx` | F9-018 | code | - | UI usa publishable key/client secret e não coleta cartão manualmente. | alto | 🟢 | [X] |
| F9-020 | Criar tela de pagamento do pedido | Expor fluxo mínimo para pedido pendente próprio e estados pendente/processando/falha. | `src/app/(customer)/pedidos/[id]/pagamento/page.tsx` | F9-019 | code | - | Cliente acessa somente pagamento de pedido próprio elegível. | alto | 🟢 | [X] |
| F9-021 | Integrar CTA de pagamento no pedido | Adicionar entrada visual para pagar pedido pendente na área customer. | `src/app/(customer)/pedidos/**` | F9-020 | code | - | Pedido `aguardando_pagamento` exibe CTA; pago/expirado não exibe ação indevida. | médio | 🟢 | [X] |
| F9-022 | Sinalizar mock/dev na UI | Exibir estado controlado quando adapter mock estiver ativo em dev/test. | `src/features/payments/components/**` | F9-019 | code | - | Usuário/dev vê aviso de mock sem confundir com pagamento real. | médio | 🟢 | [X] |

## Fase 7 - Retorno client-side

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-023 | Tratar retorno visual do Stripe | Implementar estado de retorno sem marcar pedido como pago por query param ou client callback. | `src/features/payments/components/payment-element-form.tsx` | F9-019 | code | - | Retorno client-side apenas informa processamento/sucesso visual. | alto | 🟢 | [X] |
| F9-024 | Consultar status server-side após retorno | Criar leitura segura de status interno de pedido/pagamento para atualizar UI. | `src/features/payments/server/payment-actions.ts` | F9-018, F9-023 | code | - | UI mostra status real consultado no servidor. | alto | 🟢 | [X] |

## Fase 8 - Webhook Stripe

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-025 | Substituir placeholder do webhook | Transformar endpoint atual em receptor real com body bruto e validação básica de método. | `src/app/api/webhooks/stripe/route.ts` | F9-015 | code | - | Endpoint deixa de retornar placeholder para eventos válidos. | alto | 🟢 | [X] |
| F9-026 | Validar assinatura Stripe | Usar `STRIPE_WEBHOOK_SECRET` e rejeitar evento sem assinatura válida. | `src/app/api/webhooks/stripe/route.ts` | F9-025 | code | - | Evento inválido não altera estado e retorna erro controlado. | alto | 🟢 | [X] |
| F9-027 | Registrar eventos para idempotência | Persistir/consultar `payment_events.eventId` antes dos efeitos finais. | `src/features/payments/server/payment-event-repository.ts` | F9-026, F9-017 | code | - | Evento duplicado vira no-op controlado. | alto | 🟢 | [X] |
| F9-028 | Processar `payment_intent.succeeded` | Resolver provider reference, pedido, valor e moeda para encaminhar confirmação financeira. | `src/features/payments/server/stripe-webhook-service.ts` | F9-027 | code | - | Evento succeeded válido chega ao fluxo atômico. | alto | 🟢 | [X] |
| F9-029 | Processar falhas/cancelamentos correlatos | Atualizar pagamento interno como falhou/cancelado sem marcar pedido como pago. | `src/features/payments/server/stripe-webhook-service.ts` | F9-027 | code | - | Falhas do PaymentIntent não baixam estoque nem consomem cupom. | alto | 🟢 | [X] |

## Fase 9 - Confirmação financeira atômica

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-030 | Criar transação de confirmação paga | Implementar bloco atômico para payment intent pago, pedido pago, estoque e cupom. | `src/features/payments/server/payment-settlement-service.ts` | F9-028 | code | - | Sucesso parcial não deixa estado inconsistente. | alto | 🟢 | [X] |
| F9-031 | Validar valor/moeda/pedido no settlement | Conferir amount/currency/order antes de qualquer mutação operacional. | `src/features/payments/server/payment-settlement-service.ts` | F9-030 | code | - | Divergência registra erro e não marca pedido pago. | alto | 🟢 | [X] |
| F9-032 | Garantir idempotência de pedido já pago | Tornar webhook repetido seguro quando pedido/pagamento já foram concluídos. | `src/features/payments/server/payment-settlement-service.ts` | F9-030 | code | - | Reprocessamento não duplica estoque nem cupom. | alto | 🟢 | [X] |
| F9-033 | Registrar falha controlada de settlement | Persistir motivo sanitizado quando estoque, valor ou moeda impedem conclusão. | `src/features/payments/server/payment-event-repository.ts` | F9-031 | code | - | Falha fica auditável sem expor payload sensível. | alto | 🟢 | [X] |

## Fase 10 - Estoque

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-034 | Implementar baixa de estoque por order items | Decrementar estoque apenas no settlement confirmado, usando snapshots de itens do pedido. | `src/features/products/server/product-repository.ts` | F9-030 | code | - | Estoque não baixa na criação do PaymentIntent nem no retorno client-side. | alto | 🟢 | [X] |
| F9-035 | Bloquear estoque insuficiente no webhook | Conferir estoque antes da baixa e retornar erro controlado sem estado pago operacional. | `src/features/products/server/product-repository.ts` | F9-034 | code | - | Estoque insuficiente não conclui pedido pago inconsistente. | alto | 🟢 | [X] |

## Fase 11 - Cupom

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-036 | Implementar consumo de `usedCount` no settlement | Incrementar cupom somente quando pedido pago confirmado tiver cupom aplicado. | `src/features/coupons/server/coupon-repository.ts` | F9-030 | code | - | PaymentIntent e retorno client-side não consomem cupom. | alto | 🟢 | [X] |
| F9-037 | Tornar consumo de cupom idempotente | Impedir incremento duplicado por webhook repetido ou pedido já pago. | `src/features/coupons/server/coupon-repository.ts` | F9-036 | code | - | Webhook duplicado não incrementa `usedCount` duas vezes. | alto | 🟢 | [X] |

## Fase 12 - Repository/service

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-038 | Integrar payments com orders | Ajustar leitura/update de pedido para expor status financeiro e transição `pago`. | `src/features/orders/server/order-repository.ts` | F9-030 | code | - | Orders retornam status necessário sem permitir mutação manual. | alto | 🟢 | [X] |
| F9-039 | Integrar fallback sem banco | Garantir fallback explícito em dev/test e falha segura quando banco real/config real forem exigidos. | `src/features/payments/server/**` | F9-018, F9-027 | code | - | Fallback não mascara erro real quando `DATABASE_URL` existe. | alto | 🟢 | [X] |
| F9-040 | Sanitizar logs e erros de pagamentos | Centralizar mensagens sem client secret, webhook secret, tokens ou payload sensível. | `src/features/payments/server/**` | F9-018, F9-027 | code | - | Logs/erros não expõem secrets nem dados de cartão. | alto | 🟢 | [X] |

## Fase 13 - Server actions/API routes

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-041 | Criar action de iniciar pagamento | Expor server action autenticada para iniciar PaymentIntent de pedido próprio. | `src/features/payments/server/payment-actions.ts` | F9-018 | code | - | Action respeita ownership e retorna erros controlados. | alto | 🟢 | [X] |
| F9-042 | Criar action de consultar status | Expor leitura server-side de pedido/pagamento para UI customer. | `src/features/payments/server/payment-actions.ts` | F9-024, F9-038 | code | - | Status vem do servidor e não de query param client-side. | alto | 🟢 | [X] |
| F9-043 | Consolidar responses do webhook | Garantir HTTP 200/400/500 coerente para evento processado, inválido ou falha transiente. | `src/app/api/webhooks/stripe/route.ts` | F9-029, F9-033 | code | - | Stripe recebe resposta adequada sem vazar detalhes sensíveis. | médio | 🟢 | [X] |

## Fase 14 - Customer/admin

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-044 | Atualizar customer pedidos | Mostrar status de pagamento e CTA de pagamento apenas para pedido próprio pendente. | `src/app/(customer)/pedidos/**` | F9-021, F9-042 | code | - | Cliente não vê ação indevida em pedido pago/expirado/de outro usuário. | alto | 🟢 | [X] |
| F9-045 | Atualizar admin pedidos em leitura | Mostrar status financeiro para admin/manager sem ações de mutação financeira. | `src/app/admin/pedidos/**` | F9-038 | code | - | Admin não consegue marcar pago, editar valores, baixar estoque ou consumir cupom. | alto | 🟢 | [X] |
| F9-046 | Ajustar estados vazios e erros de UI | Exibir mensagens claras para Stripe ausente, pedido não pagável e mock/dev. | `src/features/payments/components/**`, `src/app/(customer)/pedidos/**` | F9-044 | code | - | Erros são compreensíveis e não revelam secrets. | médio | 🟢 | [X] |

## Fase 15 - Fallback/mock

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-047 | Implementar adapter mock de Stripe | Permitir dev/test sem chaves reais, com comportamento explicitamente marcado como mock. | `src/features/payments/server/stripe-adapter.ts` | F9-015 | code | - | Build/test/e2e rodam sem credenciais Stripe reais. | alto | 🟢 | [X] |
| F9-048 | Bloquear mock em preview/prod | Garantir que ambiente não-dev/test sem Stripe configurado falhe de forma segura. | `src/features/payments/server/payment-config.ts` | F9-047 | code | - | Produção/preview não fingem pagamento real. | alto | 🟢 | [X] |

## Fase 16 - Testes unitários

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| [//] F9-049 | Testar elegibilidade de pedido pagável | Cobrir sem login, pedido alheio, expirado, pago, cancelado e valor client-side ignorado. | `src/features/payments/**/__tests__/*` | F9-014 | test | [//] | Casos negativos bloqueiam início de pagamento. | alto | 🟢 | [X] |
| F9-050 | Testar criação/reuso de PaymentIntent | Cobrir valor/moeda do pedido, metadata segura, idempotency key e ausência de Checkout Session. | `src/features/payments/**/__tests__/*` | F9-018 | test | - | PaymentIntent usa snapshot e não duplica intent ativo. | alto | 🟢 | [X] |
| F9-051 | Testar webhook e idempotência | Cobrir assinatura obrigatória, succeeded, duplicado, falhas/cancelamentos e divergência de valor/moeda. | `src/features/payments/**/__tests__/*` | F9-029, F9-033 | test | - | Webhook só muta estado quando válido e idempotente. | alto | 🟢 | [X] |
| F9-052 | Testar estoque e cupom no settlement | Cobrir baixa/consumo somente no webhook confirmado e ausência de duplicidade. | `src/features/payments/**/__tests__/*` | F9-035, F9-037 | test | - | Estoque/usedCount não mudam em PaymentIntent ou retorno client-side. | alto | 🟢 | [X] |
| [//] F9-053 | Testar permissões customer/admin | Cobrir customer próprio, pedido alheio bloqueado e admin sem marcação manual de pago. | `src/features/orders/**/__tests__/*` | F9-045 | test | [//] | Policies preservam leitura e bloqueiam mutação financeira. | alto | 🟢 | [X] |

## Fase 17 - E2E

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-054 | E2E iniciar pagamento de pedido pendente | Validar customer abre pedido pendente, inicia Payment Element/mock e não usa cartão próprio. | `tests/e2e/**` | F9-046, F9-047 | test | - | Fluxo inicia pagamento sem credenciais reais. | alto | 🟢 | [X] |
| F9-055 | E2E webhook mock confirma pagamento | Simular confirmação e validar pedido pago, status customer e admin leitura. | `tests/e2e/**` | F9-054, F9-052 | test | - | Pedido pago aparece corretamente sem ação manual admin. | alto | 🟢 | [X] |
| F9-056 | E2E casos negativos financeiros | Cobrir pedido expirado, duplicado, retorno client-side sem webhook e pagamento alheio bloqueado. | `tests/e2e/**` | F9-055 | test | - | Casos negativos não concluem pagamento indevido. | alto | 🟢 | [X] |

## Fase 18 - Documentação

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| [//] F9-057 | Documentar arquitetura de pagamentos | Atualizar docs de pagamentos com PaymentIntent, webhook, idempotência e fora de escopo. | `docs/architecture/payments.md`, `docs/features/payments.md` | F9-018, F9-029 | docs | [//] | Docs afirmam que client-side não marca pago e não há Checkout Session principal. | médio | 🟢 | [X] |
| [//] F9-058 | Documentar pedidos/checkout/database | Atualizar docs de orders, checkout e database com status pago, estoque, cupom e migration local. | `docs/architecture/orders.md`, `docs/features/checkout.md`, `docs/architecture/database.md` | F9-038 | docs | [//] | Docs refletem estoque/cupom somente por webhook confirmado. | médio | 🟢 | [X] |
| [//] F9-059 | Documentar operação dev/mock | Atualizar operação/env com variáveis Stripe sem valores reais e teste via mock. | `docs/operations/env.md` | F9-048 | docs | [//] | Docs ensinam teste sem expor credenciais reais. | médio | 🟢 | [X] |

## Fase 19 - Validações finais

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Confidência | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|-------------|--------|
| F9-060 | Rodar validações locais completas | Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`. | terminal | F9-049, F9-050, F9-051, F9-052, F9-053, F9-054, F9-055, F9-056, F9-057, F9-058, F9-059 | validation | - | Todas as validações passam sem credenciais Stripe reais. | alto | 🟢 | [X] |
| F9-061 | Gerar relatório final de coding | Registrar arquivos alterados, validações, migrations locais não aplicadas, riscos e próximos passos. | `_reversa_forward/007-fase-9-pagamento-stripe/progress.jsonl`, `_reversa_forward/007-fase-9-pagamento-stripe/regression-watch.md` | F9-060 | docs | - | Relatório confirma ausência de deploy, push, migration real e secrets. | médio | 🟢 | [X] |

## Dependências críticas

- `F9-001` bloqueia qualquer implementação.
- `F9-007` decide se haverá alteração de schema/migration local.
- `F9-018` desbloqueia UI, actions e testes de início de pagamento.
- `F9-027` e `F9-030` são o eixo de idempotência e atomicidade.
- `F9-035` e `F9-037` impedem duplicidade de estoque/cupom.
- `F9-048` protege preview/prod contra mock indevido.
- `F9-060` é o portão final antes de qualquer commit futuro.

## Riscos principais

| Risco | Tarefas mitigadoras |
|-------|---------------------|
| Webhook duplicado causar efeitos duplicados | F9-027, F9-032, F9-051, F9-052 |
| Retorno client-side marcar pedido como pago | F9-023, F9-024, F9-056 |
| Valor/moeda divergente entre Stripe e pedido | F9-031, F9-051 |
| Estoque/cupom em estado parcial | F9-030, F9-034, F9-036, F9-052 |
| Secrets vazarem em logs/docs/UI | F9-004, F9-006, F9-040, F9-059 |
| Mock confundido com pagamento real | F9-047, F9-048, F9-054 |

## Notas de execução

- Este arquivo apenas decompõe a implementação futura. Nenhum código funcional deve ser alterado durante `/reversa-to-do`.
- As tarefas marcadas `[//]` foram consideradas paralelizáveis por terem arquivo alvo distinto e dependências já explicitadas.
- A etapa seguinte esperada é `/reversa-audit`, para cross-check entre requirements, roadmap e actions.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-10 | Versão inicial gerada por `/reversa-to-do` | reversa |
