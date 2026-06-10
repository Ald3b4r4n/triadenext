# Roadmap: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`
> Requirements: `_reversa_forward/007-fase-9-pagamento-stripe/requirements.md`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 9 ativa o pagamento real como delta sobre os pedidos pendentes da Fase 8. O pedido continua nascendo por checkout autenticado em `aguardando_pagamento`; a nova camada de pagamento cria um PaymentIntent direto no servidor usando o snapshot financeiro do pedido, devolve somente o necessario para Stripe.js/Payment Element e espera o webhook `payment_intent.succeeded` para concluir o ciclo financeiro.

O retorno client-side sera tratado apenas como feedback visual. O estado operacional de pedido pago, pagamento interno pago, baixa de estoque e consumo de `usedCount` do cupom deve acontecer em uma operacao atomica iniciada pelo webhook assinado, idempotente e conferido contra pedido, valor e moeda. A area customer/admin evolui para leitura de status financeiro, sem acao manual para marcar pago. Stripe Checkout Session, formulario proprio de cartao, fiscal/Bling/NF-e e emails transacionais obrigatorios ficam fora desta fase.

## 2. Principios aplicados

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| n/a | Nenhum `.reversa/principles.md` foi encontrado nesta sessao; nao ha conflito registrado. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confidencia |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Criar PaymentIntent direto no servidor para pedido `aguardando_pagamento`. | Foi decisao humana da clarificacao e preserva o valor snapshotado server-side como fonte de verdade. | Stripe Checkout Session; valor vindo do cliente; pagamento manual no admin. | 🟢 |
| D-02 | Usar Stripe.js/Payment Element no cliente, sem formulario proprio de cartao. | Reduz exposicao de dados sensiveis e segue o fluxo Stripe indicado para PaymentIntent. | Formulario proprio de cartao; redirecionamento Checkout Session como principal. | 🟢 |
| D-03 | Tratar o retorno client-side como informativo, nunca como confirmacao financeira. | O cliente pode abandonar a pagina; fulfillment e efeitos finais devem ser processados por webhook. | Marcar pago no redirect; marcar pago apos `confirmPayment` no browser. | 🟢 |
| D-04 | Processar `payment_intent.succeeded` como fonte final do pedido pago. | Decisao humana e contrato alinhado aos eventos Stripe de PaymentIntent. | `checkout.session.completed`; combinacao obrigatoria com Checkout Session; confirmacao manual. | 🟢 |
| D-05 | Registrar todos os eventos relevantes em `payment_events` com idempotencia por `eventId`. | Webhooks podem ser reenviados ou chegar fora de ordem; registro evita duplo efeito. | Processamento sem persistencia de evento; idempotencia apenas em memoria. | 🟢 |
| D-06 | Executar atomicamente: pedido pago, payment intent interno pago, baixa de estoque e incremento de `usedCount`. | Evita estado parcial quando pagamento foi confirmado, mas estoque/cupom falharam. | Quatro updates separados; baixa em job posterior; baixa na criacao do PaymentIntent. | 🟢 |
| D-07 | Validar assinatura, pedido, valor e moeda antes de qualquer efeito operacional. | Protege contra payload invalido, divergente ou replay perigoso. | Confiar em metadata sem conferencia; processar evento sem assinatura. | 🟢 |
| D-08 | Usar adapter/mock explicito em dev/test e falhar seguro em preview/producao sem Stripe configurado. | Mantem testes sem secrets reais e evita falsa cobranca ou falso sucesso operacional. | Exigir chave real em todos os testes; fallback silencioso em producao. | 🟢 |
| D-09 | Manter customer/admin em leitura minima de status financeiro. | Cumpre escopo sem abrir bypass para marcar pago, editar valor ou baixar estoque manualmente. | Admin financeiro completo; botao manual de pago; CRUD de pagamento. | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` secao) | Risco se errada |
|----------|----------------------------------|-----------------|
| Nao ha premissa aberta residual; as duvidas foram resolvidas em `## 9. Esclarecimentos`. | `requirements.md#9-esclarecimentos` | Baixo. O plano precisaria ser refeito apenas se a decisao humana mudar. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudanca | Resumo |
|------------|------------------------------|-----------------|--------|
| Checkout/pagamento storefront | `_reversa_sdd/architecture.md#Checkout` | contrato-alterado | Checkout pendente passa a oferecer inicio de pagamento para pedido proprio elegivel. |
| Orders | `_reversa_sdd/architecture.md#Orders` | regra-alterada | Pedido `aguardando_pagamento` pode transicionar para `pago` apenas por webhook confirmado. |
| Pagamentos | `_reversa_sdd/data-dictionary.md#payment_intents-e-payment_events` | componente-ativado | `payment_intents` e `payment_events` deixam de ser superficie futura inerte e viram contrato real. |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` | contrato-alterado | Placeholder 202 vira endpoint real com assinatura, idempotencia e efeitos atomicos. |
| Estoque de produtos | `_reversa_sdd/domain.md#Catalogo` | regra-alterada | Estoque passa a ser decrementado somente no webhook confirmado. |
| Cupons | `_reversa_sdd/domain.md#Cupons` | regra-alterada | `usedCount` passa a ser incrementado somente no webhook confirmado. |
| Customer | `_reversa_sdd/domain.md#Customer e admin` | contrato-alterado | Cliente acompanha status de pedido e pagamento do proprio pedido. |
| Admin/manager | `_reversa_sdd/permissions.md#Matriz de acesso` | contrato-alterado | Admin/manager le status financeiro, sem mutacao manual de pagamento. |

## 6. Delta no modelo de dados

- Resumo das mudancas: ativar `payment_intents` e `payment_events` existentes, avaliar indices/constraints de idempotencia por provider/evento, e garantir updates atomicos em `orders`, `products` e `coupons` no webhook confirmado.
- Detalhe completo em: `_reversa_forward/007-fase-9-pagamento-stripe/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Inicio de PaymentIntent | HTTP/server action | `_reversa_forward/007-fase-9-pagamento-stripe/interfaces/payment-intent.md` |
| Stripe webhook | HTTP webhook | `_reversa_forward/007-fase-9-pagamento-stripe/interfaces/stripe-webhook.md` |

## 8. Plano de migracao

1. Auditar o schema atual de `payment_intents` e `payment_events` contra o contrato definido em `data-delta.md`.
2. Gerar migration local apenas se forem necessarios indices ou constraints para idempotencia, sem aplicar em banco real nesta etapa.
3. Manter o endpoint de webhook existente como ponto de evolucao, substituindo o placeholder por validacao de assinatura e processamento transacional quando o coding rodar.
4. Configurar adapter/mock para dev/test e falha segura para preview/producao sem chaves Stripe.
5. Atualizar customer/admin apenas para leitura do estado financeiro, sem criar comandos administrativos de pagamento.

## 9. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Webhook duplicado baixar estoque ou consumir cupom duas vezes | alto | medio | Persistir `eventId` unico/processado e tornar o bloco transacional idempotente. |
| Retorno client-side ser tratado como pagamento concluido | alto | medio | Separar UI de status do comando operacional e documentar webhook como unica fonte final. |
| Divergencia entre valor do PaymentIntent e snapshot do pedido | alto | medio | Validar amount/currency/order metadata no webhook antes de mutar pedido, estoque ou cupom. |
| Estoque insuficiente no momento do webhook | alto | medio | Registrar erro controlado, nao concluir pedido como pago operacional e preservar trilha para intervencao futura. |
| Chaves Stripe ausentes em preview/producao gerarem falso sucesso | alto | baixo | Falha segura explicita e mock permitido apenas em dev/test. |
| Exposicao de client secret ou webhook secret em logs | alto | baixo | Sanitizar logs e nunca persistir secrets completos. |
| Mudanca de schema tocar dados reais sem preparo operacional | alto | baixo | Gerar migration local e nao aplicar em banco real no fluxo Reversa. |

## 10. Criterio de pronto

- [ ] `actions.md` futuro cobre PaymentIntent server-side, Stripe.js/Payment Element, webhook, idempotencia, estoque, cupom, customer/admin e testes.
- [ ] Pedido so muda para `pago` por webhook assinado `payment_intent.succeeded`.
- [ ] Retorno client-side nao marca pedido como pago.
- [ ] Estoque e `usedCount` sao consumidos somente uma vez e no mesmo bloco atomico do webhook confirmado.
- [ ] Webhook divergente ou duplicado gera resultado controlado sem estado inconsistente.
- [ ] Dev/test usam adapter/mock explicito e preview/producao falham seguro sem Stripe configurado.
- [ ] Nenhum formulario proprio de cartao, Stripe Checkout Session principal, Bling/NF-e, fiscal ou email transacional obrigatorio entra na fase.
- [ ] Validacoes finais esperadas: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.

## 11. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Versao inicial gerada por `/reversa-plan` | reversa |
