# Data Dictionary - Triade Essenza Next

Atualizado em: 2026-06-11  
Agente: Archaeologist  
Fonte principal: `src/db/schema.ts`, schemas Zod e tipos de domínio.

## Enums

| Enum | Valores | Confiança |
| --- | --- | --- |
| `user_role` | `customer`, `admin`, `manager` | 🟢 |
| `product_status` | `draft`, `published`, `inactive` | 🟢 |
| `cart_status` | `active`, `converted`, `abandoned`, `expired` | 🟢 |
| `coupon_type` | `percentage`, `fixed_amount`, `free_shipping` | 🟢 |
| `order_status` | `aguardando_pagamento`, `pago`, `em_preparacao`, `enviado`, `entregue`, `cancelado`, `expirado`, `reembolsado` | 🟢 |
| `payment_status` | `pendente`, `pago`, `falhou`, `cancelado`, `reembolsado` | 🟢 |
| `fulfillment_status` | `unfulfilled`, `preparing`, `shipped`, `delivered`, `cancelled` | 🟢 |
| `shipping_provider` | `manual`, `melhor_envio`, `jadlog`, `correios` | 🟢 |
| `fiscal_document_type` | `invoice`, `receipt`, `other` | 🟢 |
| `notification_delivery_status` | `pending`, `sending`, `sent`, `mocked`, `failed`, `skipped` | 🟢 |
| `notification_delivery_type` | `customer_order_paid`, `admin_order_paid` | 🟢 |

## Tabelas

### users

Usuário Better Auth estendido com papel operacional.

Campos principais: `id`, `name`, `email`, `emailVerified`, `phone`, `passwordHash`, `role`, `mustChangePassword`, `lastLoginAt`, `createdAt`, `updatedAt`.

Índices: `users_email_unique`, `users_role_idx`.

### sessions / accounts / verifications

Tabelas de autenticação Better Auth para sessão, conta externa/senha e verificação.

Relacionamento: `sessions.userId` e `accounts.userId` referenciam `users.id`.

### customer_profiles

Perfil de cliente.

Campos: `userId`, `cpf`, `documentType`, `birthDate`, aceite de privacidade e opt-in marketing.

🟡 Tabela existe, mas UI/serviço completo ainda não foi implementado.

### addresses

Endereços do cliente.

Campos: `recipient`, `phone`, `postalCode`, `street`, `number`, `complement`, `district`, `city`, `state`, `country`, `isDefaultShipping`.

🟡 Tabela existe, mas área de endereços ainda é parcial/placeholder.

### categories

Categorias do catálogo.

Campos: `name`, `slug`, `description`, `parentId`, `type`, `isActive`, `isProtected`, `sortOrder`.

Índices: slug único e ordenação ativa.

### products

Produto comercial.

Campos principais: `categoryId`, `name`, `slug`, `sku`, descrições, `brand`, `inspirationName`, `gender`, `concentration`, `volumeMl`, `dimensions`, preços em decimal e centavos, `status`, `availabilityType`, `stockQuantity`, `lowStockThreshold`, `isFeatured`, `publishedAt`, SEO e campos Bling.

Índices: slug único, SKU único, índice público por status/publicação/estoque.

Regras públicas: publicado, vigente e com estoque.

### product_images

Imagens de produto no Blob/storage.

Campos: `productId`, `blobUrl`, `pathname`, `altText`, `sortOrder`, `isCover`, dimensões, `sizeBytes`, `contentType`.

Índices: ordenação por produto e uma capa única por produto.

### product_categories

Tabela N:N entre produto e categoria.

Índice único: produto + categoria.

### carts

Carrinho ativo, convertido ou abandonado.

Campos: `userId`, `guestToken`, `sessionId`, `appliedCouponId`, `shippingPostalCode`, `selectedShippingQuoteId`, `selectedShippingOption`, `shippingAmountCents`, `status`, `currency`, `expiresAt`, `convertedAt`.

Índices por usuário/status, guest/status e cupom/frete.

### cart_items

Itens do carrinho com snapshots mínimos.

Campos: `cartId`, `productId`, `productNameSnapshot`, `unitPriceSnapshot`, `unitPriceSnapshotCents`, `quantity`.

Único: `cartId + productId`.

### coupons

Cupom de desconto.

Campos: `code`, `type`, `value`, `startsAt`, `endsAt`, `maxUses`, `usedCount`, `minimumSubtotalCents`, `isActive`.

Regras: status calculado por vigência, ativo e limite de uso.

### shipping_rules

Regras manuais de frete.

Campos: `name`, `provider`, `ruleType`, `uf`, faixa de CEP, preço em decimal e centavos, prazo, prioridade, ativo.

Regras: somente `provider=manual` ativo entra na cotação atual.

### shipping_quotes

Cotações de frete por carrinho.

Campos: `cartId`, `postalCode`, `cartHash`, `provider`, `source`, `options`, `selectedOptionId`, `expiresAt`.

Regra: validade padrão de 30 minutos.

### orders

Pedido com snapshots financeiros, cliente, endereço, frete e cupom.

Campos: `userId`, `cartId`, `number`, `status`, `fulfillmentStatus`, subtotais/total em decimal e centavos, `currency`, snapshots JSON, `publicToken`, expiração, datas operacionais e campos Bling/fiscal.

Índice único: `cartId`.

### order_items

Itens do pedido com snapshot imutável.

Campos: `orderId`, `productId`, `skuSnapshot`, `nameSnapshot`, `slugSnapshot`, `imageSnapshot`, preço unitário, quantidade e total de linha.

### order_events

Histórico operacional de pedido.

Campos: `orderId`, `actorUserId`, `eventType`, `fromStatus`, `toStatus`, `payload`, `createdAt`.

🟡 Tabela existe, mas transições operacionais completas ainda não estão implementadas.

### payment_intents

Registro interno de intenção de pagamento.

Campos: `orderId`, `provider`, `providerReference`, `checkoutSessionId`, `status`, `amount`, `currency`, `failureReason`, `paidAt`, `refundedAt`.

Índices: providerReference único e order/status.

### payment_events

Eventos de webhook de pagamento.

Campos: `paymentIntentId`, `orderId`, `eventId`, `eventType`, `signatureValid`, `payload`, `processingStatus`, `processedAt`, `failureReason`.

Índice único: `eventId`.

### notification_deliveries

Outbox de notificações.

Campos: `type`, `channel`, `recipient`, `recipientRole`, `orderId`, `userId`, `paymentEventId`, `eventType`, `provider`, `providerMessageId`, `idempotencyKey`, `status`, `attemptCount`, `lastError`, `metadata`, `sentAt`, `failedAt`.

Índice único: `idempotencyKey`.

### fiscal_documents

Documentos fiscais anexados a pedido.

Campos: `orderId`, `customerId`, `uploadedByUserId`, `blobUrl`, `pathname`, `filename`, `contentType`, `sizeBytes`, `type`, `documentNumber`, `issuedAt`.

🔴 Schema existe; feature fiscal completa ausente.

### admin_notifications

Notificações internas administrativas.

Campos: `userId`, `eventType`, `channel`, `title`, `message`, `relatedModelType`, `relatedModelId`, `isRead`, `sentAt`, `failedAt`, `failureReason`.

🔴 Schema existe; uso funcional completo ainda ausente.

## DTOs e Snapshots

- `OrderCustomerSnapshot`: nome, e-mail, telefone.
- `OrderAddressSnapshot`: destinatário, CEP, UF, cidade, bairro, logradouro, número, complemento, país.
- `OrderShippingSnapshot`: CEP, quoteId, optionId, provider, source, label, prazo, valor original, valor efetivo e flag de frete grátis.
- `OrderCouponSnapshot`: id, código, tipo, valor, desconto aplicado e `usedCountAtCheckout`.
- `PaymentIntentRecord`: pedido, provider, reference, status, valor, moeda e client secret.
- `NotificationDeliveryDraft`: tipo, canal, destinatário, pedido, evento, provider e idempotency key.

## Regras de Dinheiro

- 🟢 Campos críticos usam centavos (`*_cents`) como fonte de cálculo.
- 🟢 Campos `numeric` existem para persistência decimal/compatibilidade.
- 🟢 Desconto nunca ultrapassa subtotal.
