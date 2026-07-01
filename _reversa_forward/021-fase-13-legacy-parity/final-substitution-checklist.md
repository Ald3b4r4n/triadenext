# Final Substitution Checklist

## Pre-go-live

- [ ] Resolver G-B01: catalogo real migrado/reconciliado.
- [ ] Resolver G-B02: imagens/capa/fallback validados.
- [ ] Resolver G-B03: dry-run/reconciliacao aprovados e executados.
- [ ] Decidir G-D01: URLs legadas/redirects/conteudo legal.
- [ ] Decidir G-D02: frete manual versus provider externo.
- [ ] Decidir G-D03/G-D04: historico de pedidos/clientes.
- [ ] Decidir G-D05: fiscal/Bling/NF-e no dia zero.
- [ ] Validar smoke completo com dados controlados.
- [ ] Aprovar rollback plan.

## Dia zero minimo se aceito

- Home, catalogo, produto, carrinho, cupom, frete, checkout, pagamento e pedido funcionando.
- Admin consegue operar produtos, cupons, frete e pedidos.
- Cliente consegue login/cadastro e pedidos proprios.
- Dados reais Must batem com reconciliacao.
- Legado continua disponivel para rollback/consulta.

## Pos-go-live sugerido

- Relatorios/analytics.
- Backoffice operacional amplo.
- Exportacoes.
- Fiscal/Bling/NF-e se nao forem obrigatorios no dia zero.
- Frete externo e rastreamento se frete manual for aceito inicialmente.

## No-go automatico

- Catalogo real sem reconciliacao.
- Divergencia financeira.
- Pedido/pagamento sem smoke.
- Auth/admin quebrado.
- Secret ou dado pessoal cru em artefato/log.
- Import/migration/deploy sem aprovacao.
