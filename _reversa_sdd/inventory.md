# Inventario tecnico Reversa - Triade Essenza Next

Data da re-extracao: 2026-06-10
Escopo: estado do projeto Next.js apos Fase 8 concluida e commitada localmente.

## Confirmacao de contexto

- Projeto atual: `D:\Projetos\triade-essenza-next`
- Nao e o legado Laravel: `D:\Projetos\triadeessenzaparfum.com.br`
- Branch: `main`
- Sincronia Git no inicio da re-extracao: `main...origin/main [ahead 1]`
- Ultimo commit funcional confirmado: `1ace51b3ea7c2e2cb702e23e1a724793069cc972 feat: implement pending checkout orders`
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

## Artefatos principais observados

### Aplicacao

- `src/app`: rotas App Router, incluindo catalogo, carrinho, checkout, customer e admin.
- `src/features/products`: catalogo, produtos, filtros e componentes publicos.
- `src/features/auth`: sessao, papeis, policies e login/cadastro.
- `src/features/cart`: carrinho ativo, itens, cupom, frete selecionado e conversao.
- `src/features/coupons`: validacao de cupons, tipos de desconto e `free_shipping`.
- `src/features/shipping`: regras manuais de frete, cotacoes, persistencia, admin e adapters futuros inativos.
- `src/features/checkout`: orquestracao server-side do checkout pendente.
- `src/features/orders`: dominio, snapshots, repository, leitura customer/admin e componentes de pedidos.
- `src/db/schema.ts`: schema Drizzle com catalogo, auth, carrinho, cupons, frete, pedidos e pagamentos futuros inertes.
- `drizzle/0005_glossy_talisman.sql`: migration local gerada para pedido pendente; nao aplicada em banco real.

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
- `_reversa_forward/006-fase-8-checkout-pendente/*`

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
- Pedido pendente `aguardando_pagamento`.
- Expiracao de pedido pendente em 60 minutos.
- Snapshots de itens, cliente, endereco, cupom, frete e totais.
- Carrinho convertido/bloqueado apos criacao do pedido.
- Novo carrinho ativo futuro apos conversao.
- Area customer minima de pedidos pendentes.
- Admin minimo de pedidos pendentes, somente leitura.

## Checkout e pedidos - superficie tecnica

- Dominio de pedido: `src/features/orders/domain.ts`
- Tipos e schemas de pedido: `src/features/orders/types.ts`, `src/features/orders/schemas.ts`
- Repository de pedidos: `src/features/orders/server/order-repository.ts`
- Actions de pedidos: `src/features/orders/server/order-actions.ts`
- Service de checkout: `src/features/checkout/server/checkout-service.ts`
- Actions de checkout: `src/features/checkout/server/checkout-actions.ts`
- UI checkout: `src/app/(storefront)/checkout/page.tsx`
- CTA no carrinho: `src/features/cart/components/cart-view.tsx`
- Customer pedidos: `src/app/(customer)/pedidos/page.tsx`
- Admin pedidos: `src/app/admin/pedidos/page.tsx`

## Integracoes externas

| Integracao | Estado atual | Observacao |
| --- | --- | --- |
| Correios | Adapter futuro inativo | Nenhuma API real chamada |
| Jadlog | Adapter futuro inativo | Nenhuma API real chamada |
| Melhor Envio | Adapter futuro inativo | Nenhuma API real chamada |
| Stripe | Fora do escopo produtivo da Fase 8 | Nenhum PaymentIntent real, cartao ou captura |
| Banco real | Nao acessado nesta re-extracao | Nenhuma migration aplicada |

## Validacoes informadas para Fase 8

- `pnpm lint`: passou
- `pnpm typecheck`: passou
- `pnpm test`: passou, 27 arquivos / 79 testes
- `pnpm build`: passou
- `pnpm test:e2e`: passou, 26 testes

## Fora do escopo atual

- Pedido anonimo.
- Pagamento real.
- Stripe real.
- PaymentIntent real.
- Coleta de cartao.
- Captura de pagamento.
- Reserva definitiva de estoque.
- Baixa definitiva de estoque.
- Consumo de `usedCount` na criacao do pedido pendente.
- Chamadas reais a APIs de frete.
- Aplicacao de migrations em banco real.
- Deploy.
- Push do commit funcional.

## Proxima etapa recomendada

Committar os artefatos Reversa pos-Fase 8 e depois fazer push dos commits locais quando validado.
