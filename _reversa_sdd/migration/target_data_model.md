# Target Data Model

## Tabelas esperadas ou existentes

- users
- products
- product_images
- categories
- carts
- cart_items
- coupons
- coupon_redemptions
- shipping_methods
- shipping_quotes
- orders
- order_items
- payments
- notification_outbox
- fiscal_documents
- admin_notifications

## Tabelas a planejar

- customer_addresses
- order_status_history
- shipment_tracking_events
- inventory_movements
- audit_logs
- integration_accounts
- integration_attempts
- report_snapshots

## Regras de dados

- Money deve ser armazenado em centavos.
- Datas públicas precisam considerar vigência.
- Snapshots de pedido não devem depender de produto mutável.
- Dados fiscais e financeiros exigem trilha de auditoria.
- Integrações devem registrar tentativa, resposta normalizada e erro seguro.
