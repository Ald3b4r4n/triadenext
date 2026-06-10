# Investigation: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`
> Feature: `_reversa_forward/006-fase-8-checkout-pendente`

## 1. Contexto investigado

Fontes internas usadas nesta investigação:

- `_reversa_sdd/architecture.md`
- `_reversa_sdd/domain.md`
- `_reversa_sdd/data-dictionary.md`
- `_reversa_sdd/state-machines.md`
- `_reversa_sdd/permissions.md`
- `_reversa_sdd/dependencies.md`
- `docs/architecture/cart.md`
- `docs/architecture/shipping.md`
- `docs/architecture/payments.md`
- `docs/features/cart.md`
- `docs/features/coupons.md`
- `docs/features/shipping.md`
- `docs/features/auth-policies.md`
- `src/app/(storefront)/checkout/page.tsx`
- `src/app/(customer)/pedidos/page.tsx`
- `src/app/admin/pedidos/page.tsx`
- `src/features/cart/server/cart-service.ts`
- `src/features/cart/server/cart-repository.ts`
- `src/features/cart/server/cart-actions.ts`
- `src/features/auth/server/policies.ts`
- `src/db/schema.ts`

Nenhuma fonte externa da web foi usada nesta sessao. O desenho foi feito como delta direto sobre o repositorio atual e sobre os artefatos Reversa do legado.

O caminho correto dos artefatos Reversa do legado usado como referencia nesta sessao e `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`. A variante sem barra antes de `_reversa_sdd` nao existe nesta maquina.

## 2. Leituras principais

### Carrinho e validaacao server-side

O carrinho atual ja faz o que a Fase 8 precisa herdar: resolve actor no servidor, usa `guestCartToken` ou `session.userId`, revalida produto, quantidade, cupom e frete, recalcula totais em centavos e bloqueia payloads inseguros. Isso aparece em `src/features/cart/server/cart-service.ts`, `src/features/cart/server/cart-repository.ts` e `docs/architecture/cart.md`.

### Frete manual

O modulo de frete ja tem `shipping_quotes`, `shipping_rules`, validacao de CEP, selecao persistida e `free_shipping` zerando somente o frete manual elegivel. O checkout da Fase 8 deve apenas consumir esse estado, nunca recria-lo.

### Auth/policies

`requireAuthenticated`, `requireCustomer`, `requireOwner` e `requireAdminLike` ja existem. A Fase 8 nao precisa redefinir politica, apenas aplicá-la corretamente no checkout e nas telas de pedidos.

### Schema de pedidos

`src/db/schema.ts` ja contem `orders`, `order_items`, `payment_intents` e `payment_events`. Isso favorece uma abordagem incremental: ampliar o pedido para snapshot pendente em vez de introduzir um modelo paralelo.

### UI atual

`src/app/(storefront)/checkout/page.tsx`, `src/app/(customer)/pedidos/page.tsx` e `src/app/admin/pedidos/page.tsx` ainda sao placeholders. Esse e o ponto mais direto de integracao da Fase 8 sem mexer em rotas novas.

## 3. Alternativas avaliadas

### A. API route vs server actions

- Escolhida: server actions.
- Motivo: o projeto ja usa server actions em cart, cupons, shipping e auth; isso preserva o padrao do repo e reduz superficie de contrato.
- Descartadas: API route tradicional e mutacao client-side.

### B. Pedido novo paralelo vs extensao do schema atual

- Escolhida: extensao do schema atual de `orders`/`order_items`.
- Motivo: o schema ja existe e a Fase 8 so precisa alinhar snapshot, idempotencia e relacao com cart convertido.
- Descartadas: nova tabela isolada de pedido pendente; checkout sem persistencia.

### C. Carrinho apagado vs carrinho convertido

- Escolhida: carrinho convertido/bloqueado.
- Motivo: evita duplicidade, preserva auditoria e segue a paridade do legado.
- Descartadas: apagar carrinho; permitir reuso mutavel do mesmo carrinho.

### D. PaymentIntent real vs payment placeholder

- Escolhida: nenhuma integracao real.
- Motivo: a Fase 8 nao pode chamar Stripe nem capturar pagamento.
- Descartadas: PaymentIntent real; webhook ativo; cobranca automatica.

### E. Fallback silencioso vs falha segura

- Escolhida: dev/test com fixture explicito e preview/producao sem banco falhando de forma segura.
- Motivo: o projeto ja adota guardrails do mesmo tipo em cart, shipping e auth.
- Descartadas: mock silencioso em producao; erro duro em todos os ambientes.

## 4. Padrões aplicáveis

- Server-side as source of truth para ownership, precos e validacao final.
- Snapshot historico para pedido e itens, nao recomputo posterior.
- Idempotencia por cart convertido ou fingerprint de checkout.
- Policy first para cliente, customer e admin.
- Fallback explícito, nunca invisivel.

## 5. Questões que o plano precisa resolver

1. Quais campos exatos de snapshot devem entrar em `orders` e `order_items` para cobrir cliente, endereco, cupom, frete e total?
2. Como marcar o cart como convertido de forma atômica junto com a criacao do pedido?
3. Qual interface de leitura sera suficiente para customer/admin sem abrir acao financeira?
4. Como manter `payment_intents` e `payment_events` isolados enquanto o pedido pendente nasce?

## 6. Conclusao da investigacao

O caminho mais seguro e coerente e um checkout autenticado, server-side, em dois dominios: `checkout` como orquestrador e `orders` como persistencia/snapshot. O resto do repo ja oferece os blocos necessarios para validar carrinho, cupom, frete e autenticação. A Fase 8 e uma expansao controlada, nao uma reinvenção do fluxo.

## 7. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Investigacao inicial gerada por `/reversa-plan` | reversa |
