# Inventario tecnico Reversa - Triade Essenza Next

Data da re-extracao: 2026-06-10
Escopo: estado do projeto Next.js apos Fase 9 concluida e commitada localmente.

## Confirmacao de contexto

- Projeto atual: `D:\Projetos\triade-essenza-next`
- Nao e o legado Laravel: `D:\Projetos\triadeessenzaparfum.com.br`
- Branch: `main`
- Sincronia Git no inicio da re-extracao: `main...origin/main [ahead 1]`
- Ultimo commit funcional confirmado: `8d013511699a098e5fc7faededf558a6b7c2a53d feat: implement stripe payment intents`
- Working tree antes da re-extracao: limpo

## Fases implementadas

| Fase | Commit | Estado | Observacoes |
| --- | --- | --- | --- |
| Fase 1 | `3f2e35e` | Concluida | Fundacao App Router, UI base e rotas iniciais |
| Fase 2 | `6c33c88` | Concluida | Persistencia inicial de catalogo e clientes |
| Fase 3 | `5635ccb` | Concluida | Catalogo publico com filtros e seed local |
| Fase 4 | `7ddf703` | Concluida | Autenticacao, papeis e admin base |
| Fase 5 | `7215cf1` | Concluida | Carrinho e sessao de compra sem checkout real |
| Fase 6 | `399953c` | Concluida | Cupons e descontos no carrinho |
| Fase 7 | `5d103b7` | Concluida | Frete manual, cotacao por CEP e admin basico de frete |
| Fase 8 | `1ace51b` | Concluida | Checkout autenticado, pedido pendente, snapshots e carrinho convertido |
| Fase 9 | `8d01351` | Concluida | PaymentIntent Stripe, Payment Element, webhook assinado/idempotente e settlement |

## Artefatos principais observados

### Aplicacao

- `src/app`: rotas App Router, incluindo catalogo, carrinho, checkout, customer, admin e webhook Stripe.
- `src/features/products`: catalogo, produtos, filtros, fixtures e baixa de estoque no settlement.
- `src/features/auth`: sessao, papeis, policies e login/cadastro.
- `src/features/cart`: carrinho ativo, itens, cupom, frete selecionado e conversao.
- `src/features/coupons`: validacao de cupons, tipos de desconto e consumo de `usedCount` no settlement.
- `src/features/shipping`: regras manuais de frete, cotacoes, persistencia, admin e adapters futuros inativos.
- `src/features/checkout`: orquestracao server-side do checkout pendente.
- `src/features/orders`: dominio, snapshots, repository, leitura customer/admin e status `pago`.
- `src/features/payments`: PaymentIntent, adapter Stripe/mock, Payment Element, webhook e settlement.
- `src/db/schema.ts`: schema Drizzle com catalogo, auth, carrinho, cupons, frete, pedidos e pagamentos.
- `drizzle/0006_soft_mole_man.sql`: migration local gerada para indices de pagamento/webhook; nao aplicada em banco real.

### Reversa

- `.reversa/state.json`
- `.reversa/context/current-state.json`
- `_reversa_sdd/inventory.md`
- `_reversa_sdd/architecture.md`
- `_reversa_sdd/domain.md`
- `_reversa_sdd/dependencies.md`
- `_reversa_sdd/data-dictionary.md`
- `_reversa_sdd/state-machines.md`
- `_reversa_sdd/permissions.md`
- `_reversa_forward/007-fase-9-pagamento-stripe/*`

## Capacidades atuais

- Catalogo publico com produtos e filtros.
- Autenticacao com papeis `customer`, `manager` e `admin`.
- Carrinho para visitante e usuario autenticado.
- Merge de carrinho anonimo para usuario autenticado.
- Cupons percentuais, valor fixo e frete gratis.
- Frete manual por regras internas e cotacao por CEP.
- Selecao de frete persistida no carrinho.
- Total parcial com frete e `free_shipping` sobre frete manual elegivel.
- Checkout autenticado.
- Pedido pendente `aguardando_pagamento` com expiracao de 60 minutos.
- Snapshots de itens, cliente, endereco, cupom, frete e totais.
- Carrinho convertido/bloqueado apos criacao do pedido.
- Area customer minima de pedidos pendentes/pagos.
- Admin minimo de pedidos em leitura financeira.
- PaymentIntent server-side para pedido pendente proprio.
- Payment Element no client, sem formulario proprio de cartao.
- Webhook Stripe assinado e idempotente.
- Confirmacao financeira por `payment_intent.succeeded`.
- Baixa de estoque e consumo de cupom somente no webhook confirmado.
- Mock explicito em dev/test sem credenciais reais.

## Pagamentos - superficie tecnica

- Configuracao segura: `src/features/payments/server/payment-config.ts`
- Adapter Stripe/mock: `src/features/payments/server/stripe-adapter.ts`
- Repository de pagamentos/eventos: `src/features/payments/server/payment-repository.ts`
- Inicio de pagamento: `src/features/payments/server/payment-service.ts`
- Server actions: `src/features/payments/server/payment-actions.ts`
- Webhook: `src/app/api/webhooks/stripe/route.ts`
- Processamento de webhook: `src/features/payments/server/stripe-webhook-service.ts`
- Settlement atomico: `src/features/payments/server/payment-settlement-service.ts`
- UI Payment Element: `src/features/payments/components/payment-element-form.tsx`
- Pagina customer: `src/app/(customer)/pedidos/[id]/pagamento/page.tsx`

## Integracoes externas

| Integracao | Estado atual | Observacao |
| --- | --- | --- |
| Stripe | Ativo quando configurado | PaymentIntent direto, Payment Element e webhook assinado |
| Stripe mock | Ativo apenas dev/test sem chaves reais | Simula PaymentIntent/webhook de forma explicita |
| Correios | Adapter futuro inativo | Nenhuma API real chamada |
| Jadlog | Adapter futuro inativo | Nenhuma API real chamada |
| Melhor Envio | Adapter futuro inativo | Nenhuma API real chamada |
| Banco real | Nao acessado nesta re-extracao | Nenhuma migration aplicada |

## Validacoes informadas para Fase 9

- `pnpm lint`: passou
- `pnpm typecheck`: passou
- `pnpm test`: passou, 82 testes
- `pnpm build`: passou
- `pnpm test:e2e`: passou, 27 testes

## Fora do escopo atual

- Pedido anonimo.
- Stripe Checkout Session como fluxo principal.
- Coleta propria de cartao.
- Armazenamento de dados sensiveis de cartao.
- Pagamento marcado como pago por retorno client-side.
- Marcacao manual de pago pelo admin.
- Bling, NF-e e fiscal.
- E-mail transacional real obrigatorio.
- Aplicacao de migrations em banco real.
- Deploy.
- Push do commit funcional.

## Proxima etapa recomendada

Committar os artefatos Reversa pos-Fase 9 e depois fazer push dos commits locais quando validado.
