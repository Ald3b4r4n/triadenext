# Code Analysis - Triade Essenza Next

Atualizado em: 2026-06-11  
Agente: Archaeologist  
Nível: detalhado  
Escopo: módulos `auth`, `products`, `cart`, `coupons`, `shipping`, `checkout`, `orders`, `payments`, `notifications`, `uploads`, `db` e `lib`.

## Visão Geral

🟢 **CONFIRMADO** O sistema é uma aplicação Next.js App Router em TypeScript, organizada em rotas `src/app`, domínios em `src/features`, persistência Drizzle/Postgres em `src/db` e guardrails de ambiente em `src/lib/runtime-mode.ts`.

🟢 **CONFIRMADO** A arquitetura atual implementa storefront, auth, catálogo, carrinho, cupons, frete manual, checkout autenticado, pedidos pendentes, pagamento Stripe/Mock, settlement pós-webhook e notificações pós-pagamento.

🟡 **INFERIDO** A estratégia dominante é domínio vertical por feature, com Server Actions para mutações, repositories para persistência real/fallback e componentes React para UI.

## Módulos

### auth

Arquivos principais:

- `src/features/auth/server/auth.ts`
- `src/features/auth/server/session.ts`
- `src/features/auth/server/policies.ts`
- `src/features/auth/server/actions.ts`

Funções principais:

- `getCurrentSession()`: consulta Better Auth com timeout de 5s, normaliza papel e retorna sessão autenticada ou motivo seguro de falha.
- `requireAdminLike()`: exige banco, auth pronto e papel `admin` ou `manager`.
- `requireOwner(resourceUserId)`: bloqueia acesso quando o recurso pertence a outro usuário.
- `loginAction()`: valida formulário, autentica por e-mail/senha, mescla carrinho guest no usuário e redireciona.
- `signupAction()`: cria conta customer e redireciona.

Regras:

- 🟢 Papéis aceitos: `customer`, `admin`, `manager`.
- 🟢 Mutação/admin real depende de `DATABASE_URL` e `BETTER_AUTH_SECRET`.
- 🟢 `returnTo` precisa começar com `/`, não pode começar com `//` nem apontar para `/api/auth`.

### products

Arquivos principais:

- `src/features/products/domain.ts`
- `src/features/products/server/product-service.ts`
- `src/features/products/server/product-repository.ts`
- `src/features/products/schemas.ts`

Funções principais:

- `isProductPublic()`: exige `published`, `publishedAt <= now` e `stockQuantity > 0`.
- `productCanBeMarkedPublic()`: valida campos mínimos para publicação.
- `filterPublicProducts()`: filtra produtos públicos e ordena imagens.
- `createProductRepository()`: seleciona Drizzle ou fixtures dev.
- `decrementStock()`: decrementa estoque com guarda `stockQuantity >= quantity`.

Regras:

- 🟢 Produto público nunca inclui draft, inactive, futuro ou sem estoque.
- 🟢 Preços são normalizados para centavos.
- 🟢 Imagem de capa é a marcada como `isCover` ou a primeira por ordenação.

### cart

Arquivos principais:

- `src/features/cart/domain.ts`
- `src/features/cart/server/cart-service.ts`
- `src/features/cart/server/cart-repository.ts`
- `src/features/cart/server/cart-actions.ts`

Funções principais:

- `addItemToCart()`: resolve ator, valida produto comprável, estoque e adiciona item com snapshot de preço/nome.
- `updateCartItemQuantity()`: valida posse indireta pelo carrinho ativo e estoque atual.
- `recalculateCartView()`: remove itens indisponíveis, limita estoque, recalcula subtotal, cupom e frete.
- `mergeGuestCartIntoUser()`: move itens guest para usuário após login, respeitando estoque e preservando avisos.
- `quoteShippingForActiveCart()`: gera cotação manual/fallback por CEP e seleciona primeira opção.

Regras:

- 🟢 Subtotal = soma de `unitPriceSnapshotCents * quantity`.
- 🟢 Seleção de frete é limpa quando item muda.
- 🟢 Cupom inválido aplicado é removido durante recálculo.
- 🟢 Carrinho guest usa token; carrinho autenticado usa `userId`.

### coupons

Arquivos principais:

- `src/features/coupons/domain.ts`
- `src/features/coupons/server/coupon-service.ts`
- `src/features/coupons/server/coupon-repository.ts`
- `src/features/coupons/schemas.ts`

Funções principais:

- `normalizeCouponCode()`: trim + uppercase.
- `getCouponStatus()`: calcula `inactive`, `scheduled`, `expired`, `exhausted` ou `active`.
- `validateCouponForSubtotal()`: aplica vigência, uso máximo, subtotal mínimo e valor válido.
- `calculateCouponDiscountCents()`: calcula percentage/fixed/free shipping.

Regras:

- 🟢 Percentual precisa ficar entre 1 e 100.
- 🟢 Valor fixo é limitado ao subtotal via `clampDiscount`.
- 🟢 `free_shipping` não desconta subtotal; o carrinho zera frete elegível.

### shipping

Arquivos principais:

- `src/features/shipping/domain.ts`
- `src/features/shipping/server/shipping-service.ts`
- `src/features/shipping/server/shipping-repository.ts`
- `src/features/shipping/future-providers.ts`

Funções principais:

- `normalizePostalCode()`: mantém apenas dígitos e exige 8.
- `isRuleApplicable()`: regra manual por UF ou faixa de CEP.
- `buildManualShippingOptions()`: filtra regras ativas e ordena por prioridade, preço e nome.
- `createShippingQuote()`: cria cotação com validade de 30 minutos.
- `selectShippingQuoteOption()`: rejeita cotação ausente, expirada ou opção inválida.

Regras:

- 🟢 Provider real ainda está inativo (`correios`, `jadlog`, `melhor_envio`).
- 🟢 Cotação tem `cartHash`, `cartId`, CEP, opções e expiração.
- 🟢 Sem cobertura manual retorna erro amigável.

### checkout

Arquivos principais:

- `src/features/checkout/server/checkout-service.ts`
- `src/features/checkout/server/checkout-actions.ts`

Funções principais:

- `reviewPendingCheckout()`: exige autenticação e carrinho válido.
- `createPendingCheckoutOrder()`: valida formulário, carrinho, cupom, frete, snapshots e cria pedido pendente.
- `validateCartForCheckout()`: valida banco/ambiente, carrinho ativo, estoque, cupom, frete e expiração.

Regras:

- 🟢 Checkout exige usuário autenticado.
- 🟢 CEP do endereço precisa coincidir com CEP da cotação.
- 🟢 Pedido só nasce se houver frete selecionado e não expirado.
- 🟢 Carrinho convertido não pode iniciar novo checkout.

### orders

Arquivos principais:

- `src/features/orders/domain.ts`
- `src/features/orders/server/order-repository.ts`
- `src/features/orders/server/order-actions.ts`
- `src/features/orders/schemas.ts`

Funções principais:

- `buildPendingOrderDraft()`: monta snapshot de cliente, endereço, frete, cupom e itens.
- `createPendingOrder()`: persiste pedido e itens em transação, convertendo carrinho.
- `markOrderPaid()`: altera status para `pago`.
- `listCustomerPendingOrdersAction()`: lista apenas pedidos do usuário autenticado.
- `listAdminPendingOrdersAction()`: lista pedidos para admin/manager.

Regras:

- 🟢 Status inicial: `aguardando_pagamento`.
- 🟢 Expiração: 60 minutos.
- 🟢 `orders.cartId` é único para evitar duplicidade de pedido por carrinho.
- 🟢 Leitura customer filtra por `userId`; admin exige `requireAdminLike`.

### payments

Arquivos principais:

- `src/features/payments/domain.ts`
- `src/features/payments/server/payment-service.ts`
- `src/features/payments/server/payment-settlement-service.ts`
- `src/features/payments/server/stripe-webhook-service.ts`

Funções principais:

- `validatePayableOrder()`: exige pedido aguardando pagamento, não expirado e total positivo.
- `startOrderPayment()`: reutiliza PaymentIntent seguro ou cria novo, sem marcar pedido pago.
- `processStripeWebhook()`: valida assinatura/evento, registra idempotência e roteia eventos.
- `settleSucceededPayment()`: valida valor/moeda/metadata, baixa estoque, consome cupom e marca pedido/pagamento como pago.
- `sanitizePaymentFailureReason()`: mascara secrets Stripe/webhook.

Regras:

- 🟢 Confirmação financeira vem do webhook `payment_intent.succeeded`.
- 🟢 Client return/status não marca pedido como pago.
- 🟢 Evento Stripe duplicado é ignorado.
- 🟢 Settlement real roda em transação com pedido, pagamento, estoque, cupom e evento.

### notifications

Arquivos principais:

- `src/features/notifications/service.ts`
- `src/features/notifications/post-payment-event.ts`
- `src/features/notifications/idempotency.ts`
- `src/features/notifications/providers/resolve-email-provider.ts`

Funções principais:

- `notifyOrderPaidAfterSettlement()`: só processa se pedido estiver `pago`.
- `processOrderPaid()`: cria entregas para cliente e admins.
- `buildNotificationIdempotencyKey()`: compõe chave por pedido, evento, tipo e destinatário normalizado.
- `createAndDeliver()`: cria entrega se nova, marca sending e registra sent/mocked/failed.

Regras:

- 🟢 Falha de notificação não reverte pagamento, estoque ou cupom.
- 🟢 Destinatário admin ausente cria entrega `skipped`.
- 🟢 Provider real ainda resolve para mock ou unavailable, não para envio real.

### uploads

Arquivos principais:

- `src/features/uploads/product-image-upload.ts`
- `src/features/uploads/schemas.ts`
- `src/app/api/upload/route.ts`

Funções principais:

- `uploadProductImage()`: exige admin/manager, valida arquivo, exige Blob token, envia para Vercel Blob e salva metadata.
- `productImageUploadSchema`: limita tipo e tamanho.

Regras:

- 🟢 Tipos aceitos: JPEG, PNG, WebP.
- 🟢 Limite: 5 MB.
- 🟢 Sem `BLOB_READ_WRITE_TOKEN`, upload real bloqueia.
- 🟡 Rota `src/app/api/upload/route.ts` ainda é placeholder seguro.

### db

Arquivos principais:

- `src/db/schema.ts`
- `src/db/client.ts`

Entidades principais:

- Auth: `users`, `sessions`, `accounts`, `verifications`.
- Customer: `customer_profiles`, `addresses`.
- Catalog: `categories`, `products`, `product_images`, `product_categories`.
- Commerce: `carts`, `cart_items`, `coupons`, `shipping_rules`, `shipping_quotes`, `orders`, `order_items`, `order_events`.
- Payment: `payment_intents`, `payment_events`.
- Notification: `notification_deliveries`, `admin_notifications`.
- Fiscal: `fiscal_documents`.

Regras:

- 🟢 Sem `DATABASE_URL`, `db = null` e repositories usam fallback/fixtures quando permitido.
- 🟢 Índices únicos protegem e-mail, slug, SKU, cartId do pedido, providerReference e idempotencyKey.

### lib

Arquivos principais:

- `src/lib/env.ts`
- `src/lib/runtime-mode.ts`
- `src/lib/money.ts`
- `src/lib/slug.ts`

Funções principais:

- `getRuntimeMode()`: classifica ambiente e capabilities sem expor secrets.
- `assertCanMutateRealData()`: bloqueia mutação real fora de dev/test com auth pronto.
- `formatMoney()`: formata centavos como moeda.
- `clampDiscount()`: limita desconto entre 0 e subtotal.
- `normalizeSlug()`: remove acentos e normaliza slug.

Regras:

- 🟢 Produção/preview sem configuração real entram em modo indisponível seguro.
- 🟢 Env parsing usa Zod com defaults vazios.

## Algoritmos Críticos

1. 🟢 Filtro público de produto: `status=published`, `publishedAt <= now`, `stockQuantity > 0`.
2. 🟢 Recálculo de carrinho: valida itens, estoque, cupom, frete e totais derivados.
3. 🟢 Checkout: transforma carrinho ativo em pedido pendente com snapshots imutáveis.
4. 🟢 Settlement: confirma webhook, valida divergência, baixa estoque, consome cupom e marca pedido/pagamento.
5. 🟢 Notificações: usa outbox/idempotência por pedido/evento/tipo/destinatário.

## Lacunas Técnicas

- 🔴 Área do cliente ainda não implementa perfil/endereços reais apesar de tabelas existirem.
- 🔴 Status operacionais pós-pagamento existem no enum, mas ainda não há transições administrativas completas.
- 🔴 `fiscal_documents` existe no schema, mas a feature fiscal/Bling ainda não foi implementada.
- 🔴 Provedores reais de frete estão declarados como futuros e inativos.
- 🟡 Upload tem service real, mas rota API ainda retorna placeholder seguro.
