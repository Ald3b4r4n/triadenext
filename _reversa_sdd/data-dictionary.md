# Data Dictionary - Triade Essenza Next

Atualizado em: 2026-07-02
Agente: Archaeologist  
Fonte principal: `src/db/schema.ts`, schemas Zod e tipos de domínio.

## Delta Fase 12

- 🟢 Nenhuma tabela, enum ou migration nova foi adicionada pela Fase 12.
- 🟢 Migrations permanecem de `0000_shallow_shinko_yamashiro.sql` a `0007_outstanding_midnight.sql`.
- 🟢 Readiness de migrations e banco e documental/estatico; nenhuma migration real foi executada nesta re-extracao.
- 🟢 `.env.example`, scripts `ops:*` e docs operacionais nao alteram o contrato de dados persistido.

## Delta Fase 13

- 🟢 Nenhuma tabela, enum ou migration nova foi adicionada pela Fase 13.
- 🟢 O delta de dados e conceitual/documental: mapeia origem Laravel, destino Next, obrigatoriedade, transformacao e reconciliacao.
- 🟢 Entidades Must para go-live: categorias, produtos, imagens, precos, estoque, cupons ativos e frete minimo.
- 🟡 Entidades de decisao humana: clientes, enderecos, pedidos historicos, pagamentos/status historicos e dados administrativos.
- 🔴 Importacao real, migration real e conexao com banco real nao foram executadas nem aprovadas.

## Delta Fase 14

- 🟢 Nenhuma tabela, enum ou migration nova foi adicionada pela Fase 14.
- 🟢 O delta de dados e operacional/intermediario: contratos CSV/JSON locais, tipos normalizados e relatorio de reconciliacao.
- 🟢 Entidades Must cobertas pelo dry-run: categorias, produtos, imagens por referencia, precos, estoque, cupons e frete minimo.
- 🟢 Dados reais continuam fora do Git; `data/dry-run/input/` versiona apenas `.gitkeep` e exemplos sinteticos.
- 🟢 Relatorios gerados ficam em `data/dry-run/output/`, ignorados pelo Git.
- 🔴 Importacao real, upload real, migration real e conexao com banco real nao foram executadas nem aprovadas.

## Mapa de Migracao Controlada Pos-Fase 13

| Entidade | Origem Laravel candidata | Destino Next | Obrigatoriedade | Reconciliacao |
| --- | --- | --- | --- | --- |
| Categorias | catalogo/admin/migrations | `categories`, `product_categories` | Must | contagem, slug, nome |
| Produtos | catalog actions/admin | `products` | Must | SKU, slug, preco, status, estoque |
| Imagens | `product_images`, `public/products`, `Imagens` | `product_images`, Blob futuro | Must | contagem por produto, capa, arquivo/fallback |
| Cupons ativos | coupons/admin | `coupons` | Must se ativo | codigo, tipo, valor, vigencia |
| Frete minimo | shipping rules/providers | `shipping_rules` | Must | UF/CEP, preco, prazo |
| Clientes | users/profiles | `users`, `customer_profiles` | Decisao humana | contagem, email mascarado |
| Enderecos | addresses | `addresses` | Decisao humana | contagem por cliente, CEP/UF |
| Pedidos historicos | orders/items | `orders`, `order_items`, `order_events` | Decisao humana | numero, status, itens, total |
| Pagamentos/status | payments/stripe | `payment_intents`, `payment_events` | Decisao humana | status, provider ref, valor |
| Fiscal/Bling | fiscal/Bling tables | `fiscal_documents` parcial | Fora de escopo/decisao | relatorio de lacuna |

## Contratos de Dry-run Pos-Fase 14

| Entidade dry-run | Arquivo CSV/JSON | Chave principal | Normalizacao | Bloqueios principais |
| --- | --- | --- | --- | --- |
| `categories` | `categories.csv` / `categories.json` | `slug` | slug normalizado, hierarquia por `parent_slug`, ativo e ordenacao | campo obrigatorio ausente, slug duplicado |
| `products` | `products.csv` / `products.json` | `sku` e `slug` | preco em centavos, status `draft/published/inactive`, estoque inteiro, categoria por slug | publicado sem preco/estoque/data/categoria, SKU/slug duplicado |
| `productImages` | `product-images.csv` / `product-images.json` | `product_sku` + `reference` | referencia textual, alt, ordem, capa e fallback aprovado | produto publicado sem capa/fallback, imagem apontando produto ausente |
| `coupons` | `coupons.csv` / `coupons.json` | `code` | uppercase, tipo `percentage/fixed_amount/free_shipping`, valor, vigencia, limite, subtotal minimo | cupom ativo invalido, valor divergente, codigo duplicado |
| `shippingRules` | `shipping-rules.csv` / `shipping-rules.json` | `rule_code` | UF uppercase ou faixa CEP de 8 digitos, preco em centavos, prazo e prioridade | ausencia de regra ativa com preco positivo, cobertura invalida |

## Relatorio de Reconciliacao Pos-Fase 14

| Secao | Conteudo | Uso |
| --- | --- | --- |
| `summary` | `go`, `conditional-go` ou `no-go`, bloqueadores e avisos | Decisao de avancar/pausar |
| `counts` | origem, normalizado e diferenca por entidade | Conferencia de volume |
| `keys` | chaves comerciais normalizadas | Duplicidade e rastreabilidade |
| `money` | preco, cupom e frete em centavos | Divergencia financeira |
| `assets` | imagens por produto, capa e fallback | Cobertura visual |
| `shipping` | cobertura por UF/CEP, preco e status | Frete minimo |
| `coupons` | codigo, tipo, ativo e status | Campanhas ativas |
| `divergences` | codigo, severidade, impacto go-live e acao recomendada | Plano de correcao |
| `privacy` | deteccao de secret e dado cru | Guardrail de seguranca |

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
