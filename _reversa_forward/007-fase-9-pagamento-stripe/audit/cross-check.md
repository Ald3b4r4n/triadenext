# Cross-check Audit: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`
> Artefatos analisados:
> - `_reversa_forward/007-fase-9-pagamento-stripe/requirements.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/roadmap.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/actions.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/investigation.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/data-delta.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/onboarding.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/interfaces/payment-intent.md`
> - `_reversa_forward/007-fase-9-pagamento-stripe/interfaces/stripe-webhook.md`

## Veredito

Aprovado com ressalvas baixas/medias. Nao foram encontrados findings CRITICAL ou HIGH. A implementacao pode seguir para `/reversa-coding`, com atencao especial para as dependencias de ordem descritas abaixo.

## Resumo

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 3 |
| LOW | 1 |

## Findings

| ID | Severidade | Eixo | Descricao | Onde esta |
|----|------------|------|-----------|-----------|
| A001 | MEDIUM | Ordem e dependencias | A UI de pagamento (`F9-019`, `F9-020`, `F9-021`) depende do service `F9-018`, mas nao depende da action de iniciar pagamento `F9-041`. O criterio operacional do pedido esperava UI depois da action de iniciar pagamento. | `actions.md#Fase 6`, `actions.md#Fase 13` |
| A002 | MEDIUM | Ordem e dependencias | A consulta de status `F9-024` cria/usa `src/features/payments/server/payment-actions.ts` antes das actions oficiais `F9-041` e `F9-042`. Nao ha ciclo, mas ha ordem pouco clara no mesmo arquivo critico. | `actions.md#Fase 7`, `actions.md#Fase 13` |
| A003 | MEDIUM | Testabilidade | Testes de PaymentIntent `F9-050` dependem de `F9-018`, mas nao dependem do adapter mock `F9-047`, embora o requisito e o onboarding exijam build/test sem chaves Stripe reais. | `actions.md#Fase 15`, `actions.md#Fase 16`, `onboarding.md#5-comandos-de-validacao-esperados` |
| A004 | LOW | Terminologia | O `actions.md` usa "preview/prod" e outros artefatos usam "preview/producao". O sentido e equivalente, mas a padronizacao reduz ambiguidade operacional. | `actions.md#Fase 15`, `requirements.md#5-requisitos-funcionais` |

## Impacto e correcao sugerida

Nao ha findings CRITICAL ou HIGH.

Para A001, a recomendacao e o humano ajustar manualmente o `actions.md` antes do `/reversa-coding`, ou orientar o coding a executar `F9-041` antes de finalizar a UI que depende de inicio de pagamento. A correcao natural seria adicionar `F9-041` como dependencia de `F9-020` ou mover `F9-041` antes da Fase 6.

Para A002, a recomendacao e consolidar a ordem de `payment-actions.ts`: criar primeiro a action de iniciar pagamento (`F9-041`) e depois a action/consulta de status (`F9-042`/`F9-024`), ou explicitar que `F9-024` e apenas contrato interno temporario. Isso evita conflitos durante coding no mesmo arquivo.

Para A003, a recomendacao e adicionar `F9-047` como dependencia de `F9-050`, ou garantir que os testes unitarios usem stub local sem depender do adapter mock final. Como a regra da fase exige testes sem credenciais reais, a dependencia explicita e mais segura.

## Itens verificados que passaram

### Cobertura

- Todos os requisitos funcionais RF-01 a RF-20 possuem cobertura em decisoes do roadmap e tarefas do `actions.md`.
- PaymentIntent direto, Payment Element, webhook `payment_intent.succeeded`, idempotencia, assinatura, retorno client-side informativo, mock/dev, falha segura e customer/admin foram cobertos.
- Os cenarios Gherkin do `requirements.md` possuem tarefas correspondentes em F9-013 a F9-056.
- Os contratos `interfaces/payment-intent.md` e `interfaces/stripe-webhook.md` aparecem no roadmap e foram decompostos em actions.
- `data-delta.md` foi refletido em F9-007 a F9-010, F9-017, F9-027 e F9-030 a F9-037.

### Consistencia

- O termo principal e consistente: PaymentIntent direto, Stripe.js/Payment Element e webhook `payment_intent.succeeded`.
- Stripe Checkout Session aparece apenas como alternativa descartada ou fora de escopo.
- Retorno client-side nunca e tratado como fonte final de pagamento.
- Admin/manager permanecem em leitura, sem marcar pago, editar valores, baixar estoque ou consumir cupom.
- Pedido pagavel permanece restrito a `aguardando_pagamento`, dono autenticado e nao expirado.

### Coerencia com o SDD

- O plano nao contradiz as regras da Fase 8 em `_reversa_sdd/domain.md`: checkout autenticado, pedido pendente, snapshot financeiro server-side e carrinho convertido.
- A transicao `aguardando_pagamento -> pago` segue a maquina de estado documentada como futura em `_reversa_sdd/state-machines.md#Pedido`.
- A ativacao de `payment_intents` e `payment_events` respeita `_reversa_sdd/data-dictionary.md#payment_intents-e-payment_events`.
- A matriz de permissoes permanece coerente com `_reversa_sdd/permissions.md#Matriz de acesso`.

### Seguranca e escopo

- Nenhuma tarefa manda expor secrets, copiar `.env` do legado, usar chaves Stripe reais no repo ou armazenar dados sensiveis de cartao.
- Nenhuma tarefa manda coletar cartao em formulario proprio.
- Nenhuma tarefa permite payload client controlar valor, moeda, owner, status ou provider.
- Nenhuma tarefa manda rodar migration em producao, conectar banco real, fazer deploy ou push.
- Bling, NF-e, fiscal, documentos fiscais e email transacional obrigatorio permanecem fora de escopo.

### Sanidade do actions

- Foram encontrados 61 IDs `F9-001` a `F9-061`.
- Todas as dependencias citadas apontam para IDs existentes.
- Nao foi identificado ciclo de dependencia.
- As 7 tarefas marcadas `[//]` nao compartilham o mesmo arquivo alvo direto entre si.
- Todas as tarefas possuem criterio de aceite verificavel.

### Testabilidade

- Ha cobertura planejada para sem login, pedido alheio, pedido expirado, pedido pago/cancelado, valor/moeda do pedido, payload sem forcar valor, assinatura obrigatoria, webhook succeeded, duplicidade, valor divergente, estoque/cupom, retorno client-side, admin e fallback sem Stripe.
- Ha E2E planejado para iniciar pagamento, mock/dev sem chaves reais, retorno client-side sem marcar pago, webhook confirmado, pedido pago em customer/admin, duplicidade, expiracao, ausencia de formulario proprio de cartao e ausencia de credenciais reais.
- As validacoes finais incluem `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`.

## Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Auditoria cruzada inicial gerada por `/reversa-audit` | reversa |
