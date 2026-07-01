# Next Capability Inventory

> Fonte: `D:\Projetos\triade-essenza-next`.

## Superficies App Router

| Area | Rotas Next | Estado |
|------|------------|--------|
| Auth | `/login`, `/cadastro`, `api/auth/[...all]` | Implementado com Better Auth |
| Storefront | `/`, `/produtos`, `/produto/[slug]`, `/carrinho`, `/checkout` | Implementado e endurecido visualmente |
| Customer | `/minha-conta`, `/enderecos`, `/pedidos`, `/pedidos/[id]/pagamento` | Implementado basico; area completa ainda parcial no SDD |
| Admin | `/admin`, produtos, categorias, cupons, frete, pedidos, documentos fiscais | Implementado para operacao central; backoffice legado ainda mais amplo |
| APIs | health, upload, Stripe webhook | Implementadas com guards/fallbacks seguros |

## Features por dominio

| Dominio Next | Evidencia | Leitura de paridade |
|--------------|-----------|---------------------|
| `products` | 18 arquivos TS/TSX, fixtures dev e schemas | Catalogo, admin produtos, imagens e estoque basico |
| `cart` | 10 arquivos | Carrinho guest/customer, cupom e frete |
| `coupons` | 9 arquivos | Admin e validacao de cupons |
| `shipping` | 12 arquivos | Frete manual e providers futuros inativos |
| `checkout` | 2 arquivos | Pedido pendente e snapshots via dominio orders |
| `orders` | 7 arquivos | Pedido pendente/pago e leitura customer/admin |
| `payments` | 11 arquivos | Stripe PaymentIntent, webhook e settlement |
| `notifications` | 24 arquivos | Outbox pos-pagamento e provider mock/seguro |
| `uploads` | 2 arquivos | Upload de imagem com Blob bloqueado sem token |
| `auth` | 6 arquivos | Sessao, login, cadastro e policies |

## Schema alvo

Tabelas Drizzle detectadas em `src/db/schema.ts`: `users`, `sessions`, `accounts`, `verifications`, `customer_profiles`, `addresses`, `categories`, `products`, `product_images`, `product_categories`, `carts`, `cart_items`, `coupons`, `shipping_rules`, `shipping_quotes`, `orders`, `order_items`, `order_events`, `payment_intents`, `payment_events`, `notification_deliveries`, `fiscal_documents` e `admin_notifications`.

## Evidencia de testes

- E2E cobre auth, admin, carrinho, checkout, cupons, home, notificacoes mock, pedidos, pagamento mock, production readiness, frete, produtos e responsividade.
- Unit cobre auth, policies, cart, shipping, checkout, coupons, db scripts, env readiness, migration readiness, notifications, payments, products e smoke.

## Readiness operacional herdado da Fase 12

- Docs em `docs/operations`: env, Neon, Vercel, Stripe, Blob, migrations, seed e go-live.
- Scripts seguros `ops:*`: check-env, check-migrations, check-build e check-smoke.
- `.env.example` possui nomes de variaveis, sem valores reais.
