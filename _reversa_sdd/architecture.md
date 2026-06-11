# Architecture - Triade Essenza Next

Atualizado em: 2026-06-11  
Agente: Architect  
Nível: detalhado

## Visão Geral

🟢 **CONFIRMADO** A aplicação é um e-commerce Next.js App Router em TypeScript, com domínios organizados em `src/features`, persistência Drizzle/Postgres opcional, autenticação Better Auth, pagamentos Stripe, storage Vercel Blob e testes Vitest/Playwright.

🟢 **CONFIRMADO** O fluxo comercial atual cobre catálogo público, carrinho, cupom, frete manual, checkout autenticado, pedido pendente, PaymentIntent, webhook, settlement e notificações pós-pagamento.

🟡 **INFERIDO** A arquitetura alvo segue fatias verticais por domínio, com Server Components/pages para leitura, Server Actions para mutação, Route Handlers para APIs/webhooks e repositories isolando Drizzle/fallback.

## Containers

| Container | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Web App | Next.js App Router | Storefront, customer, admin, server actions e route handlers |
| Domain Modules | TypeScript em `src/features` | Regras, services, repositories, schemas e adapters |
| Database | Postgres/Neon via Drizzle | Dados relacionais, snapshots, pagamentos e outbox |
| Blob Storage | Vercel Blob | Imagens de produto e documentos futuros |
| Stripe | Stripe API/Webhooks | PaymentIntent, Payment Element e eventos financeiros |
| Email Provider | Mock/unavailable hoje; Resend/SMTP futuro | Entrega transacional |

## Componentes Internos

- `src/app`: roteamento e superfícies públicas/customer/admin/API.
- `src/features/auth`: Better Auth, sessão e RBAC.
- `src/features/products`: catálogo, admin, imagens, estoque básico.
- `src/features/cart`: carrinho guest/customer, cupom e frete selecionado.
- `src/features/coupons`: validação e administração de descontos.
- `src/features/shipping`: frete manual e contratos futuros de provider.
- `src/features/checkout`: validação final e criação do pedido.
- `src/features/orders`: snapshots, leitura e marcação paga.
- `src/features/payments`: PaymentIntent, webhook e settlement.
- `src/features/notifications`: outbox e e-mail pós-pagamento.
- `src/features/uploads`: upload de imagem para Blob.
- `src/db`: schema Drizzle e cliente condicional.
- `src/lib`: env, runtime guardrails, dinheiro e slug.

## Fluxo Comercial Principal

1. Storefront lista somente produtos públicos.
2. Cliente/visitante adiciona item ao carrinho.
3. Carrinho recalcula estoque, cupom e frete.
4. Customer autenticado cria pedido pendente com snapshots.
5. Customer inicia PaymentIntent do próprio pedido.
6. Stripe/Mock retorna evento webhook.
7. Settlement valida valor/moeda/metadata, baixa estoque, consome cupom e marca pedido como pago.
8. Notificação pós-pagamento roda fora da transação financeira.

## Integrações Externas

| Integração | Direção | Estado | Guardrail |
| --- | --- | --- | --- |
| Stripe API | Outbound | Real quando configurado; mock dev/test | Sem segredo, falha segura |
| Stripe Webhook | Inbound | Implementado | Assinatura/eventId/idempotência |
| Vercel Blob | Outbound | Service implementado; rota API ainda placeholder | Exige token e admin-like |
| E-mail | Outbound | Mock/unavailable | Sem envio real obrigatório |
| Correios/Jadlog/Melhor Envio | Outbound futuro | Inativo | Sem chamada HTTP atual |
| Bling/NF-e | Outbound futuro | Ausente funcionalmente | Planejado em Reversa Forward |

## Dados

Os agregados críticos são:

- `Catalog`: `products`, `product_images`, `categories`, `product_categories`.
- `Cart`: `carts`, `cart_items`, `coupons`, `shipping_quotes`.
- `Order`: `orders`, `order_items`, `order_events`.
- `Payment`: `payment_intents`, `payment_events`.
- `Notification`: `notification_deliveries`.
- `Customer/Auth`: `users`, `sessions`, `accounts`, `customer_profiles`, `addresses`.

## Dívidas Técnicas

- 🔴 Área do cliente completa ainda não está implementada.
- 🔴 Status operacionais de pedido e fulfillment existem no schema, mas não têm fluxo completo.
- 🔴 Fiscal/Bling/NF-e ainda é schema/roadmap, não feature funcional.
- 🔴 Frete real e rastreamento ainda não existem.
- 🔴 Estoque não tem movimentos auditáveis.
- 🟡 Alguns placeholders administrativos/customer permanecem.
- 🟡 Dependências em `latest` exigem lockfile como fonte efetiva.

## Guardrails

- 🟢 Sem `DATABASE_URL`, fallback explícito e seguro.
- 🟢 Mutação real exige auth pronto e ambiente permitido.
- 🟢 Pagamento só é confirmado por webhook assinado/idempotente.
- 🟢 Notificação falha sem reverter settlement.
- 🟢 Secrets são tratados por env e não devem aparecer em docs/logs.
