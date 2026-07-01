# Go-live Smoke Checklist

> Smoke planejado para dados controlados. Nao executa deploy nem import real.

## Storefront

- [ ] Home abre sem placeholder.
- [ ] Lista de produtos mostra itens publicaveis.
- [ ] Produto mostra preco, imagem/fallback, estoque e CTA.
- [ ] Navegacao principal permite voltar ao catalogo/carrinho/login.

## Compra

- [ ] Visitante adiciona produto ao carrinho.
- [ ] Cliente cadastra/loga.
- [ ] Cupom valido aplica desconto.
- [ ] Frete calcula e pode ser selecionado.
- [ ] Checkout cria pedido pendente com snapshots.
- [ ] Pagamento teste/mock confirma via caminho seguro.
- [ ] Pedido muda para pago sem confirmacao por browser/admin.
- [ ] Notificacao mock/outbox e registrada.

## Cliente e admin

- [ ] Cliente visualiza pedidos proprios.
- [ ] Admin/manager visualiza pedidos administrativos.
- [ ] Admin visualiza produtos, cupons, frete e status de pagamento.
- [ ] Admin nao acessa operacoes proibidas sem credencial/role.

## Criterio de falha

Falhar o smoke se houver erro financeiro, quebra de auth/admin, ausencia de catalogo vendavel, chamada real a provider, secret em log ou necessidade de banco real nao aprovada.
