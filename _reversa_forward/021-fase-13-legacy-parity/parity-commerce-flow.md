# Parity: Carrinho, Cupons, Frete, Checkout e Pedidos

## Resumo

O Next cobre o fluxo comercial central: carrinho, cupom, frete manual, checkout autenticado, pedido pendente, pagamento Stripe PaymentIntent/webhook e notificacoes pos-pagamento. A principal divergencia operacional frente ao Laravel e frete externo/rastreamento, alem de operacoes admin avancadas de pedido.

## Matriz

| Item | Laravel legado | Next atual | Status | Classificacao | Evidencia |
|------|----------------|------------|--------|---------------|-----------|
| Carrinho | `/carrinho`, actions add/update/remove/merge | `/carrinho`, `src/features/cart` | `substituido` | nao bloqueador | Guest/customer cart e mutacoes existem |
| Cupom | admin coupons e aplicar/remover | `src/features/coupons`, admin cupons | `substituido` | nao bloqueador se cupons migrados | Regras de cupom existem |
| Frete manual | cart shipping quotes | `shipping_rules`, `shipping_quotes` | `substituido` | nao bloqueador se manual aceito | Regras internas UF/faixa CEP |
| Frete externo | Melhor Envio/Jadlog/Correios indicados | providers futuros inativos | `ausente` | decisao humana | Pode bloquear se negocio exigir rastreio/cotacao real no dia zero |
| Checkout | `/checkout`, pending order | `/checkout`, snapshots server-side | `substituido` | nao bloqueador | Checkout autenticado e pedido pendente |
| Pagamento | Stripe Checkout Session/webhook | PaymentIntent/Payment Element/webhook | `substituido` | nao bloqueador | Mudanca de implementacao, mesma fonte financeira por webhook |
| Pedidos | admin/customer orders amplo | customer/admin pedidos basicos | `parcial` | decisao humana | Operacao completa legado e maior |
| Notificacoes | e-mails/alertas | outbox pos-pagamento | `parcial` | nao bloqueador para compra | Provider real ainda depende env/aprovacao |

## Lacunas do fluxo

| Lacuna | Tipo | Decisao |
|--------|------|---------|
| Frete externo, etiqueta e rastreamento | decisao humana | Aceitar frete manual no dia zero ou bloquear go-live |
| Historico operacional amplo de pedidos | pos-go-live/decisao humana | Migrar somente pedidos necessarios ou backlog |
| E-mails transacionais reais | decisao humana | Pode iniciar com provider seguro aprovado ou mock apenas em staging |

## Conclusao

Fluxo de venda em si esta pronto para paridade comportamental controlada. O go-live real depende de dados reconciliados e decisao sobre frete externo.
