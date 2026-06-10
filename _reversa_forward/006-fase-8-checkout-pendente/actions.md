# Actions: Fase 8 — Checkout Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`
> Roadmap: `_reversa_forward/006-fase-8-checkout-pendente/roadmap.md`
> Base: `requirements.md`, `doubts.md`, `audit/requirements-audit.md`, `audit/cross-check.md`, `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `risk-plan.md`, `validation-plan.md`, `interfaces/*`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 71 |
| Ações paralelizáveis (`[//]`) | 6 |
| Maior cadeia de dependência | 66 |
| Próxima etapa | `/reversa-audit` |

## Guardrails

- Não implementar pagamento real, Stripe, PaymentIntent, captura de cartão, checkout guest, baixa/reserva definitiva de estoque ou consumo de `usedCount`.
- Não aplicar migration em banco real.
- Não conectar banco real sem fallback explícito e falha segura.
- Não copiar `.env` do legado.
- Não expor secrets, `DATABASE_URL`, cookies, tokens ou credenciais.
- Não modificar o Laravel legado.
- Não fazer deploy.
- Não fazer push.
- Não criar tarefa de commit local.

## 1. Preparação e Segurança

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F8-001 | Confirmar diretório do projeto Next, branch e status Git antes de tocar no checkout. | - | - | n/a | 🟢 | `[X]` |
| F8-002 | Registrar os guardrails da Fase 8 no progresso local antes de qualquer alteração funcional. | F8-001 | - | `_reversa_forward/006-fase-8-checkout-pendente/progress.jsonl` | 🟢 | `[X]` |
| F8-003 | Ler `requirements.md`, `doubts.md`, `audit/requirements-audit.md`, `audit/cross-check.md`, `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `risk-plan.md`, `validation-plan.md` e `interfaces/*`. | F8-002 | - | n/a | 🟢 | `[X]` |
| F8-004 | Mapear os arquivos reais de auth, cart, coupons, shipping, orders, checkout, schema, pages e testes que a fase vai reutilizar. | F8-003 | - | n/a | 🟢 | `[X]` |
| F8-005 | Confirmar que o legado continua apenas para leitura e que nenhum artefato da Fase 8 deve apontar para ele como alvo de escrita. | F8-004 | - | n/a | 🟢 | `[X]` |
| F8-006 | Validar os pontos de entrada atuais de auth, merge de carrinho e leitura de sessão que o checkout vai acoplar. | F8-005 | - | `src/features/auth/server/actions.ts` | 🟢 | `[X]` |

## 2. Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F8-007 | Criar teste unitário para checkout sem login ser bloqueado. | F8-006 | - | `src/tests/unit/checkout-actions.test.ts` | 🟢 | `[X]` |
| F8-008 | Criar teste unitário para carrinho vazio ser bloqueado. | F8-007 | - | `src/tests/unit/checkout-validation.test.ts` | 🟢 | `[X]` |
| F8-009 | Criar teste unitário para produto indisponivel ou estoque insuficiente ser bloqueado. | F8-008 | - | `src/tests/unit/checkout-stock.test.ts` | 🟢 | `[X]` |
| F8-010 | Criar teste unitário para cupom, frete e endereco invalido serem bloqueados. | F8-009 | - | `src/tests/unit/checkout-shipping-address.test.ts` | 🟢 | `[X]` |
| F8-011 | Criar teste unitário para payload nao sobrescrever valores financeiros, `cartId`, `userId` ou role. | F8-010 | - | `src/tests/unit/checkout-security.test.ts` | 🟢 | `[X]` |
| F8-012 | Criar teste unitário para pedido pendente nascer com snapshots calculados no servidor. | F8-011 | - | `src/tests/unit/checkout-snapshots.test.ts` | 🟢 | `[X]` |
| F8-013 | Criar teste unitário para carrinho convertido e reenvio repetido obedecerem idempotencia. | F8-012 | - | `src/tests/unit/checkout-idempotency.test.ts` | 🟢 | `[X]` |
| F8-014 | Criar teste unitário para expiracao fixa de 60 minutos e fallback explicito sem banco. | F8-013 | - | `src/tests/unit/checkout-fallback.test.ts` | 🟢 | `[X]` |
| F8-066 | Criar teste unitário explícito para criação de pedido pendente não incrementar `usedCount` e cupom esgotado bloquear pedido. | F8-014 | - | `src/tests/unit/checkout-coupon-effects.test.ts` | 🟢 | `[X]` |
| F8-067 | Criar teste unitário explícito para criação de pedido pendente não baixar nem reservar estoque e bloquear indisponibilidade/quantidade acima do estoque. | F8-066 | - | `src/tests/unit/checkout-stock-effects.test.ts` | 🟢 | `[X]` |
| F8-015 | Criar teste unitário para leitura customer/admin respeitar ownership e role. | F8-067 | - | `src/tests/unit/order-read-access.test.ts` | 🟢 | `[X]` |

## 3. Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F8-016 | Revisar `src/db/schema.ts` para confirmar o tronco atual de `orders`, `order_items` e `carts`. | F8-015 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F8-017 | Ajustar `orders` para vínculo com carrinho convertido, idempotencia, snapshots e expiracao. | F8-016 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F8-018 | Ajustar `order_items` para snapshot completo de linha e valores em centavos. | F8-017 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F8-019 | Ajustar índices e constraints para listagem customer, status/expiração e prevenção de duplicidade. | F8-018 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F8-020 | Gerar migration local additive em `drizzle/` sem aplicar em banco real. | F8-019 | - | `drizzle/` | 🟢 | `[X]` |
| F8-021 | Revisar o SQL gerado para garantir que não entra fluxo de pagamento, Stripe ou baixa/reserva de estoque. | F8-020 | - | `drizzle/*.sql` | 🟢 | `[X]` |
| F8-022 | Criar tipos e modelos de leitura de pedido pendente em `src/features/orders`. | F8-021 | - | `src/features/orders/types.ts` | 🟢 | `[X]` |
| F8-023 | Criar schemas Zod para pedido, item, snapshot de cliente e snapshot de endereco. | F8-022 | - | `src/features/orders/schemas.ts` | 🟢 | `[X]` |
| F8-024 | Criar helpers de domínio para status inicial, expiração de 60 minutos e totais do pedido. | F8-023 | - | `src/features/orders/domain.ts` | 🟢 | `[X]` |
| F8-025 | Criar helpers de domínio para compor snapshots de itens, cupom, frete e cliente a partir do servidor. | F8-024 | - | `src/features/orders/domain.ts` | 🟢 | `[X]` |
| F8-026 | Criar repository de pedidos com persistência real e fallback explicito. | F8-025 | - | `src/features/orders/server/order-repository.ts` | 🟢 | `[X]` |
| F8-027 | Implementar leitura/listagem customer com filtro por `userId`. | F8-026 | - | `src/features/orders/server/order-repository.ts` | 🟢 | `[X]` |
| F8-028 | Implementar leitura/listagem admin com filtro por role e sem mutacao financeira. | F8-027 | - | `src/features/orders/server/order-repository.ts` | 🟢 | `[X]` |
| F8-029 | Criar service de checkout como orquestrador server-side. | F8-028 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-030 | Resolver usuário autenticado e carrinho ativo proprio dentro do checkout service. | F8-029 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-031 | Validar carrinho vazio, ownership, produtos compráveis e estoque disponível. | F8-030 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-032 | Validar cupom, frete selecionado, endereço completo e totais recalculados no servidor. | F8-031 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-033 | Ignorar payload financeiro do cliente e construir o pedido a partir dos dados validados. | F8-032 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-034 | Persistir o pedido e os itens com snapshots calculados no servidor. | F8-033 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-035 | Marcar carrinho como convertido/bloqueado sem apagar o registro, impedir mutações no carrinho convertido e tratar reenvio com idempotencia. | F8-034 | - | `src/features/cart/server/cart-repository.ts` | 🟢 | `[X]` |
| F8-068 | Garantir que compra futura crie ou resolva novo carrinho ativo sem reutilizar o carrinho convertido. | F8-035 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F8-069 | Planejar criação do pedido pendente e conversão do carrinho como fluxo atômico/transacional, com rollback lógico se pedido ou conversão falhar. | F8-034, F8-035 | - | `src/features/checkout/server/checkout-service.ts` | 🟢 | `[X]` |
| F8-036 | Criar server actions para revisar checkout e criar pedido pendente. | F8-068, F8-069 | - | `src/features/checkout/server/checkout-actions.ts` | 🟢 | `[X]` |
| F8-037 | Criar server actions para listar e detalhar pedidos do customer e do admin com policy checks. | F8-036 | - | `src/features/orders/server/order-actions.ts` | 🟢 | `[X]` |

## 4. Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F8-038 | Ligar a rota storefront de checkout à revisão autenticada do pedido. | F8-037 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | `[X]` |
| F8-039 | Criar formulário de endereço e dados mínimos do cliente na checkout page. | F8-038 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | `[X]` |
| F8-040 | Criar resumo de itens, cupom, frete, totais e expiração na checkout page. | F8-039 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | `[X]` |
| F8-041 | Criar confirmação observável de pedido pendente após a criação. | F8-040 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | `[X]` |
| F8-042 | Bloquear visitante com orientação clara para login ou cadastro. | F8-041 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | `[X]` |
| F8-043 | Garantir que a UI de checkout não exponha cartão, Stripe, PaymentIntent ou campos de pagamento real. | F8-042 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | `[X]` |
| F8-044 | Integrar checkout com o fluxo atual de merge e carrinho convertido após login. | F8-043 | - | `src/features/auth/server/actions.ts` | 🟢 | `[X]` |
| F8-070 | Adicionar CTA de checkout no carrinho, permitindo avanço apenas para carrinho válido, instruindo visitante a login/cadastro e mantendo o fluxo sem pedido anônimo, pagamento ou Stripe. | F8-044 | - | `src/app/(storefront)/carrinho/page.tsx` | 🟢 | `[X]` |
| F8-045 | Implementar `src/app/(customer)/pedidos/page.tsx` com lista e detalhe mínimo. | F8-070 | - | `src/app/(customer)/pedidos/page.tsx` | 🟢 | `[X]` |
| F8-046 | Implementar `src/app/admin/pedidos/page.tsx` com lista e detalhe basico protegido. | F8-045 | - | `src/app/admin/pedidos/page.tsx` | 🟢 | `[X]` |
| F8-047 | Adicionar componentes, loading, empty e error states compartilhados para checkout e pedidos. | F8-046 | - | `src/features/orders/components/*` | 🟢 | `[X]` |
| F8-048 | Padronizar mensagens para `validation_error`, `forbidden`, `fallback` e `unavailable`. | F8-047 | - | `src/lib/runtime-mode.ts` | 🟢 | `[X]` |
| F8-049 | Criar E2E para visitante ser redirecionado ou instruído a login no checkout. | F8-048 | `[//]` | `src/tests/e2e/checkout-login.spec.ts` | 🟢 | `[X]` |
| F8-050 | Criar E2E para usuário autenticado revisar checkout e criar pedido pendente. | F8-048 | `[//]` | `src/tests/e2e/checkout-create.spec.ts` | 🟢 | `[X]` |
| F8-051 | Criar E2E para pedido aparecer na área customer e admin listar pendentes. | F8-048 | `[//]` | `src/tests/e2e/order-readers.spec.ts` | 🟢 | `[X]` |
| F8-052 | Criar E2E para o fluxo rodar sem Stripe, cartão, PaymentIntent ou credenciais. | F8-048 | `[//]` | `src/tests/e2e/checkout-no-payment.spec.ts` | 🟢 | `[X]` |
| F8-071 | Criar E2E para carrinho convertido bloquear nova mutação, nova compra usar novo carrinho ativo e reenvio não duplicar pedido quando testável. | F8-050 | - | `src/tests/e2e/checkout-converted-cart.spec.ts` | 🟢 | `[X]` |

## 5. Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F8-053 | Criar `docs/features/checkout.md`. | F8-052, F8-071 | `[//]` | `docs/features/checkout.md` | 🟢 | `[X]` |
| F8-054 | Criar `docs/architecture/orders.md`. | F8-052, F8-071 | `[//]` | `docs/architecture/orders.md` | 🟢 | `[X]` |
| F8-055 | Atualizar `docs/features/cart.md` com checkout pendente e carrinho convertido. | F8-053, F8-054 | - | `docs/features/cart.md` | 🟢 | `[X]` |
| F8-056 | Atualizar `docs/features/coupons.md` com a regra de `usedCount` fora da criação do pedido. | F8-055 | - | `docs/features/coupons.md` | 🟢 | `[X]` |
| F8-057 | Atualizar `docs/features/shipping.md` com a leitura de frete no checkout pendente. | F8-056 | - | `docs/features/shipping.md` | 🟢 | `[X]` |
| F8-058 | Atualizar `docs/architecture/database.md` com snapshots, expiração e vinculo ao carrinho convertido. | F8-057 | - | `docs/architecture/database.md` | 🟢 | `[X]` |
| F8-059 | Atualizar `docs/architecture/payments.md` para deixar claro que pagamento real fica fora da Fase 8. | F8-058 | - | `docs/architecture/payments.md` | 🟢 | `[X]` |
| F8-060 | Rodar `pnpm lint`. | F8-059 | - | n/a | 🟢 | `[X]` |
| F8-061 | Rodar `pnpm typecheck`. | F8-060 | - | n/a | 🟢 | `[X]` |
| F8-062 | Rodar `pnpm test`. | F8-061 | - | n/a | 🟢 | `[X]` |
| F8-063 | Rodar `pnpm build`. | F8-062 | - | n/a | 🟢 | `[X]` |
| F8-064 | Rodar `pnpm test:e2e`. | F8-063 | - | n/a | 🟢 | `[X]` |
| F8-065 | Revisar o diff final contra os guardrails da Fase 8 e confirmar ausência de commit ou push. | F8-064 | - | n/a | 🟢 | `[X]` |

## Critérios de aceite e riscos por ação

| ID | Critério de aceite verificável | Risco |
|----|--------------------------------|-------|
| F8-001 | Diretório, branch e status Git registrados antes de mudanças funcionais. | alto |
| F8-002 | `progress.jsonl` registra guardrails de sem legado, sem banco real, sem Stripe, sem estoque definitivo, sem deploy e sem push. | alto |
| F8-003 | Todos os artefatos listados no cabeçalho foram lidos e não há dúvida aberta antes da execução. | médio |
| F8-004 | Arquivos-alvo reais de auth/cart/coupons/shipping/orders/checkout/schema/pages/testes foram inventariados. | médio |
| F8-005 | Nenhum alvo de escrita aponta para o Laravel legado ou para o SDD legado. | alto |
| F8-006 | Pontos atuais de sessão, login e merge de carrinho foram identificados sem alterar comportamento. | médio |
| F8-007 | Teste falha se visitante conseguir criar pedido pendente sem autenticação. | alto |
| F8-008 | Teste falha se carrinho vazio gerar pedido ou snapshot. | alto |
| F8-009 | Teste falha se produto indisponível ou estoque insuficiente permitir pedido. | alto |
| F8-010 | Teste falha se cupom, frete ou endereço inválido permitir pedido. | alto |
| F8-011 | Teste falha se payload cliente definir subtotal, desconto, frete, total, `cartId`, `userId` ou role. | alto |
| F8-012 | Teste comprova snapshots de itens, cliente, endereço, cupom, frete e totais calculados no servidor. | alto |
| F8-013 | Teste comprova carrinho convertido e retentativa sem pedido duplicado. | alto |
| F8-014 | Teste comprova `expiresAt = createdAt + 60 minutos` e fallback explicitamente marcado. | médio |
| F8-066 | Teste comprova que `usedCount` não muda na criação pendente e cupom esgotado bloqueia pedido. | alto |
| F8-067 | Teste comprova que estoque não baixa/reserva e indisponibilidade/quantidade acima do estoque bloqueia pedido. | alto |
| F8-015 | Teste comprova customer sem acesso a pedido alheio e admin/manager com leitura permitida. | alto |
| F8-016 | Estado atual de `orders`, `order_items` e `carts` documentado antes do delta. | alto |
| F8-017 | Schema representa vínculo do pedido com carrinho convertido, idempotência, snapshots e expiração. | alto |
| F8-018 | `order_items` preserva snapshot de linha e valores em centavos sem depender do catálogo atual. | alto |
| F8-019 | Índices/constraints cobrem customer, status/expiração e duplicidade por carrinho. | alto |
| F8-020 | Migration local é gerada somente em `drizzle/` e não aplicada em banco real. | alto |
| F8-021 | SQL revisado não contém Stripe, PaymentIntent real, pagamento, baixa ou reserva de estoque. | alto |
| F8-022 | Tipos de pedido pendente expressam status, snapshots, totais, expiração e leitura mínima. | médio |
| F8-023 | Schemas rejeitam snapshots incompletos de pedido, item, cliente e endereço. | médio |
| F8-024 | Domínio calcula status inicial, expiração de 60 minutos e totais em centavos. | alto |
| F8-025 | Domínio compõe snapshots de itens, cupom, frete e cliente a partir de dados server-side. | alto |
| F8-026 | Repository distingue persistência real, fallback dev/test explícito e unavailable seguro. | alto |
| F8-027 | Leitura customer filtra obrigatoriamente por `userId`. | alto |
| F8-028 | Leitura admin exige role e não expõe mutação financeira. | alto |
| F8-029 | Checkout service centraliza orquestração server-side sem lógica crítica no cliente. | alto |
| F8-030 | Checkout resolve usuário autenticado e carrinho próprio no servidor. | alto |
| F8-031 | Checkout bloqueia carrinho vazio, ownership inválido, produto não comprável e estoque insuficiente. | alto |
| F8-032 | Checkout bloqueia cupom/frete/endereço inválidos e recalcula totais no servidor. | alto |
| F8-033 | Pedido ignora valores financeiros e ownership vindos do cliente. | alto |
| F8-034 | Pedido e itens persistem apenas com snapshots calculados no servidor. | alto |
| F8-035 | Carrinho convertido não aceita mutação, não é apagado e retentativa não duplica pedido. | alto |
| F8-068 | Nova compra futura resolve carrinho ativo diferente do carrinho convertido. | alto |
| F8-069 | Pedido e conversão do carrinho não deixam estado intermediário inconsistente; erro real com `DATABASE_URL` não vira fallback silencioso. | alto |
| F8-036 | Actions retornam estados controlados e não aceitam owner, total, provider ou status do cliente. | alto |
| F8-037 | Actions de pedidos aplicam ownership/customer e admin/manager sem mutação financeira. | alto |
| F8-038 | Checkout storefront carrega revisão autenticada ou estado controlado. | médio |
| F8-039 | Formulário exige nome, email da conta, telefone e endereço completo, com complemento opcional. | médio |
| F8-040 | Resumo exibe itens, cupom, frete, totais e expiração vindos do servidor. | médio |
| F8-041 | Confirmação exibe id/número, status `aguardando_pagamento`, total, data e expiração. | médio |
| F8-042 | Visitante recebe login/cadastro e nenhum pedido anônimo é criado. | alto |
| F8-043 | UI não tem campo de cartão, promessa de cobrança, Stripe ou PaymentIntent. | alto |
| F8-044 | Após login, fluxo usa merge existente e carrinho autenticado antes do checkout. | alto |
| F8-070 | Carrinho exibe CTA seguro: carrinho inválido não avança; visitante vai a login/cadastro; autenticado vai à revisão sem pagamento. | alto |
| F8-045 | Customer vê lista/detalhe mínimo somente de pedidos próprios. | alto |
| F8-046 | Admin/manager vê pedidos pendentes sem marcar pago, editar valores, criar pagamento ou baixar estoque. | alto |
| F8-047 | Componentes exibem loading, empty e error states sem layout quebrado ou dados sensíveis. | médio |
| F8-048 | Mensagens de erro são controladas e não expõem secrets, tokens ou payload sensível. | alto |
| F8-049 | E2E comprova visitante instruído/redirecionado para login no checkout. | alto |
| F8-050 | E2E comprova usuário autenticado revisando checkout e criando pedido pendente. | alto |
| F8-051 | E2E comprova pedido na área customer e listagem admin pendente. | alto |
| F8-052 | E2E comprova ausência de Stripe, cartão, PaymentIntent e credenciais. | alto |
| F8-071 | E2E comprova carrinho convertido bloqueado, novo carrinho para compra futura e ausência de duplicidade quando testável. | alto |
| F8-053 | Doc de checkout registra login obrigatório, pedido pendente, fallback e fora de escopo de pagamento. | baixo |
| F8-054 | Doc de orders registra snapshots, expiração, ownership, admin/customer e ausência de pagamento real. | baixo |
| F8-055 | Doc de cart registra carrinho convertido, bloqueio de mutação e novo carrinho ativo futuro. | baixo |
| F8-056 | Doc de coupons registra snapshot e `usedCount` não consumido nesta fase. | baixo |
| F8-057 | Doc de shipping registra snapshot de frete e providers externos inativos. | baixo |
| F8-058 | Doc de database registra delta de schema, snapshots, expiração e vínculo com carrinho convertido. | médio |
| F8-059 | Doc de payments registra Stripe/pagamento real como fase futura e fora do escopo. | baixo |
| F8-060 | `pnpm lint` passa sem warnings bloqueantes. | médio |
| F8-061 | `pnpm typecheck` passa sem erros de tipo. | médio |
| F8-062 | `pnpm test` passa cobrindo testes da Fase 8 e regressões existentes. | alto |
| F8-063 | `pnpm build` passa sem exigir banco real, Stripe ou credenciais. | alto |
| F8-064 | `pnpm test:e2e` passa cobrindo os fluxos principais sem Stripe/credenciais. | alto |
| F8-065 | Diff final não contém legado, secrets, migration real aplicada, deploy, push, pagamento real ou estoque definitivo. | alto |

## Notas de execução

- As ações são atômicas e pensadas para execução pelo `/reversa-coding`.
- Tarefas [//] ficam restritas a arquivos diferentes e sem dependência entre si.
- Não há tarefa de commit, push, deploy, migration real, Stripe ou pagamento real.
- IDs F8-066 a F8-071 foram adicionados após auditoria; IDs existentes não foram renumerados.
- O finding LOW foi tratado no cabeçalho `Base` e na ação F8-003, incluindo `audit/cross-check.md`, `investigation.md`, `onboarding.md` e `risk-plan.md`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-09 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-06-09 | Revisão pós `/reversa-audit`: adicionadas F8-066 a F8-071, critérios de aceite e riscos por ação | reversa |

