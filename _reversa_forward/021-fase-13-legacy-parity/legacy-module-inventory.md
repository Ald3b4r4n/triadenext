# Legacy Module Inventory

> Fonte: `D:\Projetos\triadeessenzaparfum.com.br` em modo read-only.

## Rotas detectadas

| Arquivo | Cobertura principal | Impacto para paridade |
|---------|---------------------|-----------------------|
| `routes/web.php` | Home, privacidade, catalogo, produto, assets de imagem, carrinho, frete no carrinho, checkout e Stripe | Comparar storefront e fluxo de compra |
| `routes/admin.php` | Login admin, dashboard, analytics, Bling, metas, categorias, produtos, precos, estoque, pedidos, clientes, usuarios, cupons, relatorios, settings, OS, alertas e fiscal | Backoffice legado e amplo; separar bloqueador de pos-go-live |
| `routes/customer.php` | Minha conta, perfil, senha, enderecos, pedidos e documentos fiscais | Cliente legado mais amplo que o Next atual |
| `routes/auth.php` | Auth Laravel | Comparar com Better Auth/rotas Next |
| `routes/webhooks.php` | Stripe, Melhor Envio e Bling NF-e | Stripe substituido parcialmente; Melhor Envio e Bling fora do escopo atual |

## Actions por dominio

| Dominio legado | Evidencias | Leitura de paridade |
|----------------|------------|---------------------|
| Catalogo | `ListPublishedProductsAction`, `ShowPublishedProductAction` | Deve comparar com produtos publicos Next |
| Cart | 6 actions, incluindo add/update/remove, merge guest e frete | Similar ao carrinho Next, com merge e cotacao |
| Checkout | 2 actions, pedido pendente e snapshot de frete | Similar ao checkout pendente Next |
| Payments | Stripe checkout session e webhook | Next usa PaymentIntent/Payment Element; paridade financeira por comportamento |
| Orders | 10 actions admin/operacionais | Next cobre pedido pago/pendente, mas admin operacional e shipping real sao lacunas |
| Shipping | Outage/provider action e providers em services | Next tem frete manual; providers externos nao substituidos |
| Inventory | Ajuste/decremento/listagem | Next tem estoque basico/decremento pos-pagamento; auditoria granular falta |
| Customer | Pedidos/documentos fiscais | Next tem conta/pedidos/enderecos basicos; documentos fiscais incompletos |
| Notifications | Alertas internos/e-mails | Next tem outbox pos-pagamento; historico/canais externos fora |
| Analytics/Reports | Analytics e relatorios | Provavel pos-go-live |
| Fiscal/Bling | Fiscal docs e servicos Bling | Fora de escopo tecnico; decisao humana de go-live |

## Views relevantes

| Area | Exemplos lidos | Impacto |
|------|----------------|---------|
| Storefront | `storefront`, `components/ui` | Base visual e fluxo publico legado |
| Customer | `customer/dashboard`, `customer/profile`, `customer/orders`, `customer/documents` | Conta legado tem perfil/documentos |
| Admin | produtos, categorias, cupons, pedidos, estoque, clientes, relatorios, fiscal, Bling, OS, alertas | Backoffice legado e mais completo |
| E-mails | pedidos, fiscal, alertas, Stripe | Next cobre notificacoes pos-pagamento em mock/provider seguro |

## Migrations relevantes

- Catalogo/clientes/carrinho/cupom/frete/pedidos/pagamentos foram encontrados.
- Frete real aparece por `order_shipping_quotes`, `shipping_labels` e `shipping_webhook_events`.
- Bling/NF-e aparece por OAuth, sync fields e campos seguros em pedidos.
- Analytics e backoffice aparecem por migrations operacionais.

## Assets

| Origem | Contagem lida | Observacao |
|--------|---------------|------------|
| `public/products` | 18 arquivos | Candidatos a inventario produto-imagem |
| `Imagens` | 19 arquivos | Candidatos a migracao/normalizacao |

Nenhum conteudo de arquivo privado ou `.env` foi lido.
