# Arquitetura Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: arquitetura do projeto Next.js apos Fase 9.

## Visao geral

O sistema atual e uma aplicacao Next.js App Router para a operacao da Triade Essenza Parfum. O projeto substitui gradualmente o legado Laravel por uma stack moderna com dominio modular em `src/features`, persistencia Drizzle e fluxos server-side para regras sensiveis.

Apos a Fase 9, o pedido pendente `aguardando_pagamento` pode iniciar PaymentIntent no servidor e ser pago somente por webhook Stripe assinado/idempotente. O client usa Stripe.js/Payment Element, mas retorno visual do Stripe nao altera estado financeiro. A transicao para `pago` e feita no settlement server-side, que confirma pedido, pagamento interno, baixa de estoque e consumo de cupom em uma unidade atomica no banco real.

## Camadas

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Rotas | `src/app/**` | Paginas publicas, customer, admin e endpoint webhook |
| Dominio | `src/features/*/domain.ts` | Regras puras de negocio |
| Servicos server-side | `src/features/*/server/**` | Orquestracao com sessao, permissao, repositorios, Stripe e efeitos locais |
| Repositorios | `src/features/*/server/*repository.ts` | Acesso a Drizzle ou fallback/mock local controlado |
| Componentes | `src/features/*/components/**` | UI de catalogo, carrinho, cupons, frete, checkout, pedidos, pagamentos e admin |
| Persistencia | `src/db/schema.ts`, `drizzle/**` | Schema Drizzle, registros financeiros, eventos e migrations locais |

## Modulos funcionais

### Catalogo

- Produtos, categorias, filtros e pagina publica.
- Produto compravel exige `published`, `publishedAt <= now` e estoque positivo.
- Estoque e apenas validado no checkout/PaymentIntent.
- Estoque e baixado somente no settlement confirmado por webhook.

### Autenticacao e permissoes

- Sessao por Better Auth.
- Papeis `customer`, `manager` e `admin`.
- Helpers `requireCustomer`, `requireAdminLike` e ownership server-side.
- Iniciar pagamento exige customer autenticado e pedido proprio.

### Carrinho

- Carrinho ativo por visitante ou usuario autenticado.
- Itens com quantidade e precos em centavos.
- Cupom aplicado ao carrinho.
- Selecao de frete persistida.
- Alteracoes de itens invalidam a selecao de frete.
- `status = converted` apos criacao de pedido pendente.
- Carrinho convertido nao deve ser reutilizado para nova compra.

### Cupons

- Tipos principais: percentual, valor fixo e `free_shipping`.
- Cupom `free_shipping` nao cria desconto monetario direto em itens.
- Checkout revalida cupom e copia snapshot sem consumir `usedCount`.
- `usedCount` e incrementado somente no settlement de webhook confirmado.
- Webhook duplicado nao deve incrementar `usedCount` novamente.

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
- Checkout cria pedido pendente, nao cria PaymentIntent automaticamente.

### Orders

- Modulo: `src/features/orders`.
- Pedido nasce `aguardando_pagamento`.
- Expiracao: `createdAt + 60 minutos`.
- Snapshots de cliente, endereco, cupom, frete, itens e totais.
- `cartId` unico funciona como idempotencia por carrinho convertido.
- Customer lista apenas pedidos proprios.
- Admin/manager lista pedidos em leitura minima, sem mutacao financeira.
- Pedido pode virar `pago` somente pelo settlement do webhook.

### Payments

- Modulo: `src/features/payments`.
- `payment-service` valida pedido pagavel e cria/reutiliza PaymentIntent.
- Adapter Stripe real usa secret apenas no servidor, automatic payment methods, metadata segura e idempotency key.
- Adapter mock opera somente em dev/test sem chaves reais.
- Payment Element usa publishable key e client secret; nao ha formulario proprio de cartao.
- Webhook valida assinatura antes de registrar evento ou produzir efeitos.
- `payment_intent.succeeded` e a fonte final para pagamento confirmado.
- Falhas/cancelamentos correlatos atualizam pagamento interno sem marcar pedido como pago.
- Settlement confere pedido, valor, moeda e estoque antes de mutar estado operacional.

## Persistencia

Migrations locais observadas:

- `drizzle/0000_shallow_shinko_yamashiro.sql`
- `drizzle/0001_curvy_blink.sql`
- `drizzle/0002_tiny_enchantress.sql`
- `drizzle/0003_elite_titanium_man.sql`
- `drizzle/0004_mute_ghost_rider.sql`
- `drizzle/0005_glossy_talisman.sql`
- `drizzle/0006_soft_mole_man.sql`

A migration `0006_soft_mole_man.sql` foi gerada localmente e versionada, mas nao foi aplicada em banco real durante esta re-extracao.

## Banco e entidades relevantes

- `products`, `categories`: catalogo.
- `users`, `sessions`, `accounts`, `verifications`: identidade e sessao.
- `carts`, `cart_items`: carrinho.
- `coupons`: cupons.
- `shipping_rules`, `shipping_quotes`: frete manual.
- `orders`, `order_items`: pedido pendente/pago e snapshots.
- `payment_intents`: registro interno do PaymentIntent e status financeiro.
- `payment_events`: eventos de webhook e idempotencia por `event_id`.

## Integracoes externas

| Area | Estado |
| --- | --- |
| Stripe PaymentIntent | Ativo quando configurado com variaveis seguras |
| Stripe Payment Element | Ativo no client com publishable key/client secret |
| Stripe Checkout Session | Fora do fluxo principal |
| Frete externo | Somente adapters futuros inativos |
| Banco real | Nao acessado nesta re-extracao |
| Deploy | Nao executado nesta re-extracao |

## Guardrails arquiteturais atuais

- Regras sensiveis de carrinho, cupom, frete, checkout, pedido e pagamento ficam no servidor.
- Payloads de cliente nao sao fonte de verdade para totais, dono do carrinho, valor de frete, valor do PaymentIntent, moeda ou status.
- Checkout exige usuario autenticado para criar pedido.
- Pedido anonimo nao existe.
- Carrinho convertido e terminal para novas mutacoes.
- Criar pedido pendente nao consome `usedCount`.
- Criar PaymentIntent nao baixa estoque nem consome `usedCount`.
- Retorno client-side do Stripe nao marca pedido como pago.
- Webhook precisa de assinatura valida antes de efeitos.
- `eventId` de webhook sustenta idempotencia.
- `payment_intent.succeeded` confirmado liquida pedido, pagamento, estoque e cupom.
- Admin/manager nao marcam pedido como pago.
- Sem armazenamento de dados sensiveis de cartao.
- Providers externos de frete permanecem declarativos e inativos.

## Proxima evolucao

Proximo passo operacional: committar os artefatos Reversa pos-Fase 9 e, apos validacao humana, fazer push dos commits locais.
