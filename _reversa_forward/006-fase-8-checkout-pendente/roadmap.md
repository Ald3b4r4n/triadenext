# Roadmap: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`
> Requirements: `_reversa_forward/006-fase-8-checkout-pendente/requirements.md`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 8 vai introduzir um fluxo de checkout autenticado, centrado no servidor, que reaproveita carrinho, cupons e frete manual ja existentes para criar um pedido `aguardando_pagamento` com snapshots historicos. O desenho evita pagamento real, Stripe, PaymentIntent e qualquer coleta de cartao. O carrinho atual vira a fonte de intencao de compra; quando o pedido nasce, o carrinho e convertido/bloqueado para impedir reenvio e mutacoes posteriores.

A implementacao deve entrar como delta sobre os blocos ja consolidados: `src/features/cart`, `src/features/coupons`, `src/features/shipping`, `src/features/auth` e o schema em `src/db/schema.ts`. O checkout propriamente dito deve ser tratado como um orchestration layer novo, enquanto o dominio de pedido fica isolado em um modulo novo de orders. As areas de cliente e admin continuam server-side, com leitura filtrada por ownership e role.

## 2. Principios aplicados

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| n/a | Nenhum `.reversa/principles.md` foi encontrado nesta sessao; nao ha conflito registrado. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confidencia |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Reaproveitar o schema atual de `orders` e `order_items` como base da Fase 8, em vez de criar uma tabela paralela de pedido pendente. | O schema ja possui o tronco do pedido e a regra de estado `aguardando_pagamento`; isso reduz divergencia de paridade e evita duplicar o modelo. | Nova tabela paralela; colocar o checkout dentro de `carts`; adiar pedido para a fase de pagamento. | 🟢 |
| D-02 | Criar um modulo novo de `orders` e um orchestration layer de `checkout`, ambos server-side. | Separa snapshot/persistencia do momento de compra da logica de leitura/validacao do carrinho e preserva limites claros de responsabilidade. | Implementar tudo dentro de `cart-service.ts`; usar API routes antes de server actions; colocar a logica em componentes cliente. | 🟢 |
| D-03 | Marcar o carrinho usado como `converted` e bloquear mutacoes, sem apagar o registro. | Mantem auditoria, suporta idempotencia e espelha a regra ja validada no legado. | Deletar o carrinho; clonar o carrinho para novo pedido; deixar o cart editavel depois do pedido. | 🟢 |
| D-04 | Persistir snapshots completos de cliente, endereco, cupom, frete, itens e totais no pedido. | O pedido historico precisa sobreviver a mudancas futuras de produto, endereco, cupom e frete. | Recalcular pedido a partir do catalogo; salvar apenas referencias; depender do carrinho vivo para historico. | 🟢 |
| D-05 | Manter `paymentIntents` e `paymentEvents` como superficie futura e nao ativada. | A Fase 8 nao pode chamar Stripe, nem criar PaymentIntent real, nem capturar pagamento. | Criar pagamento real ja nesta fase; fundir pagamento com pedido; remover a tabela de pagamento. | 🟢 |
| D-06 | Exigir usuario autenticado para criar pedido e redirecionar/instruir visitante a login/cadastro. | Requisito validado na clarificacao e coerente com a policy atual de cliente autenticado. | Checkout guest; token anonimo virando pedido; permitir pedido sem conta. | 🟢 |
| D-07 | Usar fallback explicito em dev/test e falhar de forma segura em preview/producao sem `DATABASE_URL`. | Preserva o padrao ja usado em cart/cupom/frete e evita falsa persistencia. | Fallback silencioso em producao; hard fail em todos os ambientes; mockar pedidos reais em runtime. | 🟢 |
| D-08 | Expor leitura minima de pedidos em customer/admin, com filtros por ownership e role, sem acao financeira. | Cumpre o escopo aprovado sem abrir bypass de pagamento, estoque ou edicao de valores. | Liberar CRUD de pedido; criar admin financeiro; omitir area customer nesta fase. | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seccao) | Risco se errada |
|----------|----------------------------------|-----------------|
| Nao ha premissa aberta residual; as duvidas foram resolvidas em `doubts.md` e o `requirements.md` ficou sem marcadores pendentes. | `## 26. Gaps e Duvidas` / `## 29. Esclarecimentos` | Baixo. Apenas o plano precisaria ser refeito se a decisao humana mudasse. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudanca | Resumo |
|------------|------------------------------|-----------------|--------|
| Checkout storefront | `_reversa_sdd/code-analysis.md#Checkout/pedidos` | componente-novo | Substituir a tela placeholder `src/app/(storefront)/checkout/page.tsx` por revisao autentica de pedido, sem cartao. |
| Modulo de pedidos | `_reversa_sdd/domain.md#Pedido` | componente-novo | Criar dominio, service, repository e actions para pedido pendente, snapshots e expiracao. |
| Carrinho | `_reversa_sdd/inventory.md#Fase 5` e `_reversa_sdd/state-machines.md#Carrinho` | regra-alterada | Carrinho convertido passa a ser terminal para compras, com bloqueio de mutacao e idempotencia. |
| Cupons | `_reversa_sdd/domain.md#Cupons` | regra-alterada | `usedCount` segue fora da criacao do pedido; cupom e revalidado no checkout. |
| Frete manual | `_reversa_sdd/domain.md#Frete manual` | contrato-alterado | Frete selecionado vira snapshot do pedido e entra na validacao final do checkout. |
| Auth/policies | `_reversa_sdd/permissions.md#Matriz de acesso` | contrato-alterado | Checkout passa a exigir `requireCustomer`/`requireAuthenticated`; guest nao cria pedido. |
| Area customer | `_reversa_sdd/permissions.md#Matriz de acesso` | componente-novo | `src/app/(customer)/pedidos/page.tsx` deixa de ser placeholder e exibe pedidos proprios pendentes. |
| Area admin | `_reversa_sdd/permissions.md#Matriz de acesso` | componente-novo | `src/app/admin/pedidos/page.tsx` deixa de ser placeholder e lista pedidos pendentes com leitura basica. |
| Schema | `_reversa_sdd/data-dictionary.md#orders` | contrato-alterado | `orders` e `order_items` precisam suportar cart reference, snapshots e campos de idempotencia/expiracao. |

## 6. Delta no modelo de dados

- Resumo das mudancas: o schema atual ja possui `orders`, `order_items`, `payment_intents` e `payment_events`, mas a Fase 8 precisa alinhar o pedido real ao carrinho convertido e ampliar snapshots para cliente, endereco, frete, cupom e itens.
- O detalhe completo fica em: `_reversa_forward/006-fase-8-checkout-pendente/data-delta.md`

### Arquivos provaveis

Provavelmente serao alterados:

- `src/db/schema.ts`
- `src/features/cart/server/cart-service.ts`
- `src/features/cart/server/cart-repository.ts`
- `src/features/cart/server/cart-actions.ts`
- `src/features/auth/server/policies.ts`
- `src/app/(storefront)/checkout/page.tsx`
- `src/app/(customer)/pedidos/page.tsx`
- `src/app/admin/pedidos/page.tsx`
- `docs/features/cart.md`
- `docs/features/coupons.md`
- `docs/features/shipping.md`
- `docs/architecture/database.md`
- `docs/architecture/payments.md`

Provavelmente serao criados:

- `src/features/checkout/**`
- `src/features/orders/**`
- `drizzle/0005_checkout_pending_order.sql`
- `docs/features/checkout.md`
- `docs/architecture/orders.md`
- `docs/features/orders.md` ou equivalente, se o time optar por doc dedicada de leitura de pedidos
- testes unitarios e e2e para checkout, pedidos, customer e admin minimo

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Checkout storefront e server actions | arquivo | `_reversa_forward/006-fase-8-checkout-pendente/interfaces/checkout.md` |
| Leitura de pedidos do cliente e do admin | arquivo | `_reversa_forward/006-fase-8-checkout-pendente/interfaces/orders.md` |

## 8. Plano de migracao

1. Gerar migration local additive para ajustar `orders` e `order_items` ao snapshot completo da Fase 8.
2. Nao aplicar a migration em banco real nesta fase.
3. Manter o fallback dev/test sem banco e a falha segura em preview/producao quando `DATABASE_URL` estiver ausente.

## 9. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Pedido duplicado por duplo clique ou reenvio | alto | medio | Usar `cartId`/fingerprint e marcar carrinho como convertido no mesmo fluxo da criacao. |
| Snapshot incompleto ou divergente do carrinho no momento final | alto | medio | Revalidar tudo no servidor e gravar apenas dados calculados no backend. |
| Fallback dev/test ser confundido com persistencia real | alto | medio | Manter mensagens explicitamente marcadas como fixture/dev e falhar seguro em preview/producao. |
| Area customer/admin expor pedido alheio | alto | baixo | Filtrar por `userId` e policy de `admin`/`manager` no servidor. |
| Stripe/PaymentIntent entrar por engano | alto | baixo | Deixar pagamento como superficie futura, com docs e interfaces marcadas como fora de escopo. |
| Migracao alterar comportamento de cart/coupon/shipping ja estabilizado | medio | medio | Rodar regressao focada e manter o delta estritamente aditivo. |

## 10. Critério de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `risk-plan.md`, `validation-plan.md` e `interfaces/*` gerados.
- [ ] Nenhum `actions.md` criado nesta etapa.
- [ ] Plano preserva login obrigatorio, pedido anonimo fora da fase, snapshots, carrinho convertido e expiracao de 60 minutos.
- [ ] Plano preserva `usedCount` fora da criacao do pedido e estoque sem baixa/reserva definitiva.
- [ ] Plano documenta fallback sem banco e a separacao clara entre checkout pendente e pagamento futuro.

## 11. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Versao inicial gerada por `/reversa-plan` | reversa |
