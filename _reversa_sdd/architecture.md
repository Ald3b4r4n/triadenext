# Arquitetura Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: arquitetura do projeto Next.js apos Fase 8.

## Visao geral

O sistema atual e uma aplicacao Next.js App Router para a operacao da Triade Essenza Parfum. O projeto substitui gradualmente o legado Laravel por uma stack moderna com dominio modular em `src/features`, persistencia Drizzle e fluxos server-side para regras sensiveis.

Apos a Fase 8, o carrinho pode iniciar checkout autenticado e criar pedido pendente `aguardando_pagamento`, sem pagamento real. O checkout passa a orquestrar carrinho, produtos, cupom, frete, cliente, endereco e snapshots de pedido no servidor. O carrinho usado no pedido vira `converted` e fica bloqueado para novas mutacoes.

## Camadas

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Rotas | `src/app/**` | Paginas publicas, customer, admin e server actions de rota |
| Dominio | `src/features/*/domain.ts` | Regras puras de negocio |
| Servicos server-side | `src/features/*/server/**` | Orquestracao com sessao, permissao, repositorios e efeitos locais |
| Repositorios | `src/features/*/server/*repository.ts` | Acesso a Drizzle ou fallback local controlado |
| Componentes | `src/features/*/components/**` | UI de catalogo, carrinho, cupons, frete, checkout, pedidos e admin |
| Persistencia | `src/db/schema.ts`, `drizzle/**` | Schema Drizzle e migrations locais |

## Modulos funcionais

### Catalogo

- Produtos, categorias, filtros e pagina publica.
- Produto compravel exige `published`, `publishedAt <= now` e estoque positivo.

### Autenticacao e permissoes

- Sessao por Better Auth.
- Papeis `customer`, `manager` e `admin`.
- Helpers `requireCustomer`, `requireAdminLike` e ownership server-side.

### Carrinho

- Carrinho ativo por visitante ou usuario autenticado.
- Itens com quantidade e precos em centavos.
- Cupom aplicado ao carrinho.
- Selecao de frete persistida.
- Alteracoes de itens invalidam a selecao de frete.
- `status = converted` apos criacao de pedido pendente.
- Carrinho convertido nao deve ser reutilizado para nova compra; compra futura resolve novo carrinho ativo.

### Cupons

- Tipos principais: percentual, valor fixo e `free_shipping`.
- Cupom `free_shipping` nao cria desconto monetario direto em itens.
- `free_shipping` zera somente frete manual calculado e elegivel.
- Checkout revalida cupom e copia snapshot sem consumir `usedCount`.

### Frete manual

- Modulo: `src/features/shipping`.
- Regras internas por UF e/ou faixa de CEP.
- Cotacao por CEP normalizado.
- Cotacao com validade local.
- Selecao de opcao persistida no carrinho.
- Checkout exige quote selecionada, nao expirada e pertencente ao carrinho.
- Snapshot de frete entra no pedido.
- Sem chamada real a Correios, Jadlog ou Melhor Envio.

### Checkout

- Modulo: `src/features/checkout`.
- `reviewPendingCheckout` exige sessao autenticada e carrinho valido.
- `createPendingCheckoutOrder` valida formulario, ownership, produtos, estoque, cupom, frete e endereco.
- Payload cliente nao define subtotal, desconto, frete, total, `userId`, `cartId`, role ou status.
- UI de checkout coleta nome, telefone e endereco completo; o e-mail vem da sessao.
- UI nao tem campos de cartao, Stripe ou PaymentIntent.

### Orders

- Modulo: `src/features/orders`.
- Pedido nasce `aguardando_pagamento`.
- Expiracao: `createdAt + 60 minutos`.
- Snapshots de cliente, endereco, cupom, frete, itens e totais.
- `cartId` unico funciona como idempotencia por carrinho convertido.
- Customer lista apenas pedidos proprios.
- Admin/manager lista pedidos pendentes em leitura minima, sem mutacao financeira.

## Persistencia

Migrations locais observadas:

- `drizzle/0000_shallow_shinko_yamashiro.sql`
- `drizzle/0001_curvy_blink.sql`
- `drizzle/0002_tiny_enchantress.sql`
- `drizzle/0003_elite_titanium_man.sql`
- `drizzle/0004_mute_ghost_rider.sql`
- `drizzle/0005_glossy_talisman.sql`

A migration `0005_glossy_talisman.sql` foi gerada localmente e versionada, mas nao foi aplicada em banco real durante esta re-extracao.

## Banco e entidades relevantes

- `products`, `categories`: catalogo.
- `users`, `sessions`, `accounts`, `verifications`: identidade e sessao.
- `carts`, `cart_items`: carrinho.
- `coupons`: cupons.
- `shipping_rules`, `shipping_quotes`: frete manual.
- `orders`, `order_items`: pedido pendente e snapshots.
- `payment_intents`, `payment_events`: superficie futura inerte para pagamento.

## Integracoes externas

| Area | Estado |
| --- | --- |
| Frete externo | Somente adapters futuros inativos |
| Pagamento/Stripe | Fora do escopo produtivo da Fase 8 |
| Banco real | Nao acessado nesta re-extracao |
| Deploy | Nao executado nesta re-extracao |

## Guardrails arquiteturais atuais

- Regras sensiveis de carrinho, cupom, frete, checkout e pedido ficam no servidor.
- Payloads de cliente nao sao fonte de verdade para totais, dono do carrinho, valor de frete ou status.
- Checkout exige usuario autenticado para criar pedido.
- Pedido anonimo nao existe na Fase 8.
- Carrinho convertido e terminal para novas mutacoes.
- `usedCount` de cupom nao e consumido na criacao do pedido pendente.
- Estoque e validado, mas nao baixado nem reservado definitivamente.
- Providers externos de frete permanecem declarativos e inativos.
- Stripe, PaymentIntent real, cartao e captura de pagamento continuam fora do fluxo produtivo.

## Proxima evolucao

Proximo passo operacional: committar os artefatos Reversa pos-Fase 8 e, apos validacao humana, fazer push dos commits locais.
