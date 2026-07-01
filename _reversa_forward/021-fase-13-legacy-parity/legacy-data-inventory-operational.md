# Legacy Data Inventory: Operacional

## Entidades Should/decisao humana

| Entidade | Origem Laravel candidata | Destino Next | Obrigatoriedade | Risco |
|----------|--------------------------|--------------|-----------------|-------|
| Clientes | users/customer_profiles | `users`, `customer_profiles` | Decisao humana | Alto por privacidade |
| Enderecos | addresses/customer views | `addresses` | Decisao humana | Alto por privacidade |
| Pedidos historicos | orders/order_items | `orders`, `order_items`, `order_events` | Decisao humana | Alto financeiro |
| Pagamentos/status | payments/stripe events | `payment_intents`, `payment_events` | Decisao humana | Alto financeiro |
| Notificacoes antigas | emails/alerts | `notification_deliveries`, `admin_notifications` | Pos-go-live provavel | Medio |
| Admin data | users/admin/settings/goals | parcial no Next | Pos-go-live/decisao | Medio |
| Fiscal/Bling | fiscal docs/Bling fields | `fiscal_documents` parcial | Fora de escopo/decisao | Alto se obrigatorio |

## Privacidade

- Nao versionar email completo, telefone, CPF, endereco ou identificador sensivel.
- Amostras devem ser mascaradas ou substituidas por fixtures.
- Import real de cliente/pedido depende de aprovacao humana explicita.

## Validacao minima se migrar

- Clientes: contagem, email unico mascarado, status e perfil minimo.
- Enderecos: contagem por cliente, CEP/UF/cidade validos.
- Pedidos: numero, status, itens, snapshots, total em centavos.
- Pagamentos: status, provider reference e valor.

## Decisao

Clientes, enderecos e pedidos historicos nao precisam bloquear se negocio aceitar consulta temporaria no legado. Eles bloqueiam se o dia zero exigir historico completo dentro do Next.
