# Legacy Parity Matrix

| Dominio | Laravel | Next | Status | Classificacao | Proxima acao |
|---------|---------|------|--------|---------------|--------------|
| Home publica | `/`, `HomeController` | `/`, storefront home | `substituido` | nao bloqueador | Smoke final |
| Catalogo/lista | `/catalogo`, categorias | `/produtos` | `parcial` | decisao humana | Decidir redirects/SEO |
| Produto | `/perfumes/{slug}` | `/produto/[slug]` | `parcial` | decisao humana | Decidir redirects/SEO |
| Privacidade | `/privacidade` | nao detectado | `ausente` | decisao humana | Validar conteudo legal |
| Categorias | admin/migration | schema/admin categorias | `parcial` | bloqueador ate dados reais | Migrar/reconciliar |
| Produtos | catalog/admin/migration | schema/admin/storefront | `parcial` | bloqueador ate dados reais | Migrar/reconciliar |
| Imagens | `public/products`, `Imagens` | `product_images`, Blob/fallback | `parcial` | bloqueador se sem capa | Inventariar/migrar |
| Precos | product/pricing legado | centavos/decimal Next | `parcial` | bloqueador financeiro | Reconciliar centavos |
| Estoque | inventory actions/audit | `stockQuantity`, decremento pago | `parcial` | bloqueador para itens vendidos | Reconciliar estoque inicial |
| Carrinho | actions/rotas cart | feature cart | `substituido` | nao bloqueador | Smoke controlado |
| Cupons | CRUD/apply/remove | feature coupons/admin | `substituido` se dados migrados | bloqueador se cupom ativo faltar | Migrar cupons ativos |
| Frete manual | quote/select | shipping rules/quotes | `substituido` | nao bloqueador se manual aceito | Validar cobertura UF/CEP |
| Frete externo | Melhor Envio/providers | futuro inativo | `ausente` | decisao humana | Aceitar manual ou nova fase |
| Checkout | pending order | checkout autenticado | `substituido` | nao bloqueador | Smoke controlado |
| Pagamento | Stripe Checkout/webhook | PaymentIntent/webhook | `substituido` | nao bloqueador | Stripe test mode |
| Pedidos novos | admin/customer orders | orders customer/admin basico | `parcial` | decisao humana | Definir operacao minima |
| Pedidos historicos | orders/order_items | schema destino | `parcial` | decisao humana | Decidir migracao historica |
| Auth | Laravel auth | Better Auth | `substituido` | nao bloqueador | Smoke auth |
| Cliente/perfil | customer profile/password | conta basica | `parcial` | decisao humana | Definir requisitos dia zero |
| Enderecos | CRUD customer | enderecos Next | `parcial` | decisao humana | Migrar se clientes existentes entrarem |
| Admin produtos/cupons/frete/pedidos | amplo | central implementado | `parcial` | decisao humana | Checklist operador |
| Admin relatorios/analytics | amplo | ausente completo | `ausente` | pos-go-live | Backlog |
| Fiscal/Bling/NF-e | funcional/documentado | schema/roadmap/parcial | `ausente` | fora de escopo/decisao humana | Fase futura se obrigatorio |
| Notificacoes | emails/alertas | outbox pos-pagamento | `parcial` | nao bloqueador com provider aprovado | Validar provider/mock |
| Dados reais | banco legado | schema Next | `parcial` | bloqueador | Dry-run/reconciliacao aprovados |

## Leitura executiva

- O Next substitui o fluxo comercial central quando alimentado por dados corretos.
- O go-live real ainda nao deve ocorrer sem migracao/reconciliacao controlada de catalogo, imagens, precos, estoque e cupons ativos.
- Frete externo, fiscal/Bling/NF-e, relatorios e backoffice amplo sao decisoes humanas de dia zero versus pos-go-live.
