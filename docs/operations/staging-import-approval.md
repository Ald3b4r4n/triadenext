# Checklist humano para aprovacao staging

Use este checklist depois de uma importacao staging/dev remoto. Ele nao autoriza producao ou go-live.

## Ambiente

- [ ] Ambiente confirmado como `staging`, `preview` ou `remote-dev`.
- [ ] Producao bloqueada antes de conectar.
- [ ] `STAGING_DATABASE_URL` nao foi impresso.
- [ ] Snapshot/backup confirmado.
- [ ] Rollback documentado.

## Dados

- [ ] Produtos reconciliados.
- [ ] Categorias reconciliadas.
- [ ] Imagens por referencia revisadas.
- [ ] Estoque reconciliado.
- [ ] Frete minimo validado.
- [ ] Cupons aplicaveis revisados.

## Smoke pos-importacao

- [ ] Home.
- [ ] Catalogo.
- [ ] Produto.
- [ ] Carrinho.
- [ ] Checkout em modo teste.
- [ ] Admin.
- [ ] Pedidos.
- [ ] Notificacoes/outbox.

## Decisao

- [ ] Aprovado para proxima fase.
- [ ] Aprovado com excecoes documentadas.
- [ ] No-go.
- [ ] Rollback.

Proxima fase so pode avancar com decisao humana registrada e relatorios sanitizados revisados.
