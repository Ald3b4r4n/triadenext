# Target Domain Model

## Entidades principais

- Product
- ProductImage
- Category
- Customer
- Address
- Cart
- CartItem
- Coupon
- ShippingQuote
- Checkout
- Order
- OrderItem
- Payment
- Notification
- FiscalDocument
- InventoryMovement
- AdminUser
- AuditLog

## Agregados sugeridos

- CatalogAggregate: Product, ProductImage, Category.
- CartAggregate: Cart, CartItem, CouponApplication, ShippingSelection.
- OrderAggregate: Order, OrderItem, PaymentSnapshot, ShippingSnapshot, StatusHistory.
- CustomerAggregate: Customer, Address, AccountPreferences.
- FiscalAggregate: FiscalDocument, ExternalIntegrationAttempt.
- InventoryAggregate: StockBalance, InventoryMovement.

## Eventos de domínio

- ProductPublished
- CartCheckedOut
- OrderCreated
- PaymentConfirmed
- PaymentFailed
- OrderStatusChanged
- ShippingLabelCreated
- TrackingUpdated
- FiscalDocumentIssued
- NotificationRequested
- InventoryAdjusted

## Invariantes

- Pedido fechado preserva snapshot financeiro.
- Produto público precisa estar publicado, vigente, ativo e disponível.
- Cliente não acessa pedido de outro cliente.
- Webhook confirmado não pode duplicar pagamento.
- Baixa de estoque deve ser rastreável.
