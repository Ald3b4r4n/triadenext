# Legacy Data Inventory Consolidado

| Entidade | Origem Laravel | Destino Next | Obrigatoriedade inicial | Reconciliacao |
|----------|----------------|--------------|-------------------------|---------------|
| Categorias | catalog migrations/admin | `categories`, `product_categories` | Must | contagem, slug, nome |
| Produtos | catalog actions/admin | `products` | Must | SKU, slug, preco, status, estoque |
| Imagens | `product_images`, assets | `product_images`, Blob futuro | Must | contagem por produto, capa, arquivo |
| Cupons | coupons admin | `coupons` | Must se ativo | codigo, tipo, valor, vigencia |
| Frete/config | shipping tables/providers | `shipping_rules` | Must | UF/CEP, preco, prazo |
| Clientes | users/profiles | `users`, `customer_profiles` | Decisao humana | contagem, email mascarado |
| Enderecos | addresses | `addresses` | Decisao humana | contagem por cliente, CEP/UF |
| Pedidos historicos | orders/items | `orders`, `order_items`, `order_events` | Decisao humana | numero, status, itens, totais |
| Pagamentos/status | payments/stripe | `payment_intents`, `payment_events` | Decisao humana | status, provider ref, valor |
| Notificacoes | emails/alerts | `notification_deliveries`, `admin_notifications` | Pos-go-live | documental |
| Fiscal/Bling | fiscal/Bling tables | `fiscal_documents` parcial | Fora de escopo/decisao | lacuna |

## Leitura de obrigatoriedade

- Must para go-live: catalogo vendavel, imagens/capa/fallback, cupons ativos e frete minimo.
- Decisao humana: clientes existentes, enderecos, pedidos historicos e pagamentos historicos.
- Pos-go-live: notificacoes antigas, analytics, relatorios e backoffice amplo.
- Fora de escopo: Bling, NF-e, rotinas fiscais, WhatsApp e SMS.
