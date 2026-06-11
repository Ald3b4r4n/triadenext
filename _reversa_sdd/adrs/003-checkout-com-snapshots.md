# ADR 003 - Checkout com snapshots de pedido

## Status

Aceito retroativamente.

## Contexto

Produto, cupom, frete e endereço podem mudar depois da criação do pedido. O pedido precisa preservar o que o cliente aceitou.

## Decisão

Criar pedido pendente com snapshots de cliente, endereço, itens, preço, cupom e frete. O carrinho é convertido após criação do pedido.

## Alternativas consideradas

- Recalcular tudo no pagamento.
- Manter referência viva para produto/cupom/frete.
- Criar pedido anônimo.

## Consequências

- 🟢 Pedido tem trilha comercial estável.
- 🟢 Pagamento valida contra snapshot.
- 🟡 Alterações posteriores em catálogo não corrigem pedidos já criados.
