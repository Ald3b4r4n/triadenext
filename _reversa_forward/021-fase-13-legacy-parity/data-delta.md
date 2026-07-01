# Data Delta: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`

## 1. Resumo

A Fase 13 nao deve criar schema novo por padrao. O delta de dados e conceitual: mapear origem Laravel, destino Next, transformacoes, risco, criterio de reconciliacao e classificacao de obrigatoriedade para go-live.

## 2. Estado Next confirmado

Fonte: `_reversa_sdd/data-dictionary.md#Tabelas`.

| Dominio | Tabelas Next relevantes | Estado |
|---------|-------------------------|--------|
| Auth/customer | `users`, `sessions`, `accounts`, `customer_profiles`, `addresses` | Schema existe; area customer parcial. |
| Catalogo | `categories`, `products`, `product_images`, `product_categories` | Catalogo publico/admin implementado. |
| Carrinho | `carts`, `cart_items` | Carrinho guest/customer implementado. |
| Cupons | `coupons` | Cupons implementados. |
| Frete | `shipping_rules`, `shipping_quotes` | Frete manual implementado; providers externos futuros. |
| Pedido | `orders`, `order_items`, `order_events` | Pedido pendente/pago implementado; operacao completa parcial. |
| Pagamento | `payment_intents`, `payment_events` | Stripe PaymentIntent/webhook/settlement implementado. |
| Notificacao | `notification_deliveries`, `admin_notifications` | Outbox pos-pagamento implementado; admin_notifications incompleto. |
| Fiscal | `fiscal_documents` | Schema existe; feature fiscal completa ausente. |

## 3. Indicios Laravel read-only

| Dominio | Evidencia Laravel lida | Impacto |
|---------|------------------------|---------|
| Catalogo | `database/migrations/*catalog*`, `app/Actions/Catalog`, `resources/views/storefront/catalog`, `public/products`, `Imagens` | Fonte de produtos, categorias e imagens. |
| Cliente | `customer_profiles`, `addresses`, `resources/views/customer`, controllers customer | Fonte potencial de clientes, enderecos e pedidos visiveis. |
| Carrinho/checkout | `app/Actions/Cart`, `app/Actions/Checkout`, views checkout/cart | Paridade de fluxo deve ser comparada. |
| Frete | `order_shipping_quotes`, `shipping_labels`, `shipping_webhook_events`, providers Correios/Jadlog/MelhorEnvio | Next manual pode nao substituir frete real. |
| Admin/backoffice | `app/Actions/Admin/*`, `resources/views/admin/*` | Lacunas admin podem ser grandes. |
| Fiscal/Bling | `app/Services/Bling/*`, migrations Bling/NF-e | Fora de escopo, mas precisa aparecer como lacuna. |
| Analytics/relatorios | `analytics_events`, reports actions/views | Provavel pos-go-live. |

## 4. Mapa de entidades para migracao controlada

| Entidade | Origem Laravel candidata | Destino Next | Obrigatoriedade inicial | Transformacao esperada | Reconciliacao |
|----------|--------------------------|--------------|-------------------------|------------------------|---------------|
| Categorias | `categories` / migrations catalogo | `categories`, `product_categories` | Must para catalogo | slug, nome, hierarquia, tipo, ativo | contagem, slugs unicos, amostra por nome |
| Produtos | `products` / CatalogSeeder / admin catalog | `products` | Must para venda | SKU, slug, preco em centavos, status, estoque, atributos | contagem, SKU/slug, preco/estoque, status publico |
| Imagens | `product_images`, `public/products`, `Imagens` | `product_images` + Blob futuro | Must para catalogo vendavel | caminho, alt, capa, ordenacao, tipo | contagem por produto, capa, arquivo existente |
| Clientes | `users`, `customer_profiles` | `users`, `customer_profiles` | Should/decisao humana | email, nome, telefone, CPF mascarado/controlado | contagem, email unico, amostras mascaradas |
| Enderecos | `addresses` | `addresses` | Should/decisao humana | CEP, UF, cidade, bairro, logradouro, numero | contagem por cliente, CEP valido |
| Cupons | `coupons` | `coupons` | Must se houver cupom ativo no go-live | codigo uppercase, tipo, valor, vigencia, limite | codigos, status, valor, vigencia |
| Frete/config | shipping rules/providers/settings | `shipping_rules` | Must para checkout | manual vs externo, UF/faixa CEP, preco/prazo | cobertura CEP/UF, preco/prazo |
| Pedidos historicos | `orders`, `order_items` | `orders`, `order_items`, `order_events` | Should/decisao humana | status, snapshots, totais, itens | contagem, total, status, itens por pedido |
| Pagamentos/status | payments/stripe events | `payment_intents`, `payment_events` | Should/decisao humana | provider reference, status, valor, moeda | contagem, status, provider reference |
| Notificacoes | mails/alerts/internal notifications | `notification_deliveries`, `admin_notifications` | Pos-go-live provavel | nao importar entregas antigas por padrao | n/a ou contagem documental |
| Fiscal/Bling | fiscal docs, Bling tables/services | `fiscal_documents` e campos Bling | Fora de escopo/decisao humana | apenas inventariar lacuna | relatorio de lacuna |

## 5. Campos novos, removidos e migrations

- Campos novos no Next: nenhum nesta fase.
- Campos removidos: nenhum nesta fase.
- Migrations Drizzle novas: nenhuma planejada no plano.
- Migrations reais: proibidas sem aprovacao humana explicita.
- Importacao real: proibida sem aprovacao humana explicita.

## 6. Estrategia de dry-run

1. Exportar metadados do legado somente por leitura aprovada ou fixtures controladas.
2. Normalizar para arquivos intermediarios sem secrets e sem dados pessoais crus quando possivel.
3. Validar formato com schemas locais antes de qualquer import.
4. Importar apenas em ambiente isolado ou fixture local, nunca em producao.
5. Gerar relatorio de divergencias por entidade.
6. Repetir ate divergencias criticas serem zero ou virarem decisao humana.

## 7. Reconciliacao

| Tipo | Aplicacao | Regra |
|------|-----------|-------|
| Contagem | categorias, produtos, imagens, cupons, frete, pedidos | Contagem alvo deve bater ou divergencia deve ser justificada. |
| Chave comercial | SKU, slug, codigo de cupom, numero de pedido | Chaves duplicadas ou ausentes sao bloqueadoras para dominio critico. |
| Valores financeiros | preco, subtotal, desconto, frete, total | Comparar em centavos; divergencia financeira sem justificativa e bloqueadora. |
| Status | produto, pedido, pagamento, cupom | Mapear status legado para enum Next e listar sem correspondencia. |
| Amostra mascarada | clientes, enderecos, pedidos | Nao expor CPF, telefone completo, email completo ou endereco completo em relatorios. |
| Assets | imagens | Verificar arquivo, capa, tipo e correspondencia produto-imagem. |

## 8. Rollback de dados

- Legado permanece intacto e e fonte de rollback operacional.
- Dry-run pode ser descartado e repetido.
- Import real futuro deve exigir backup antes, ambiente alvo identificado e criterio de abortar.
- Nenhum dado real deve ser apagado nesta fase.

## 9. Artefatos esperados na execucao

- `legacy-parity-matrix.md`
- `legacy-data-inventory.md`
- `controlled-migration-plan.md`
- `dry-run-reconciliation.md`
- `go-live-substitution-checklist.md`
- `rollback-plan.md`
