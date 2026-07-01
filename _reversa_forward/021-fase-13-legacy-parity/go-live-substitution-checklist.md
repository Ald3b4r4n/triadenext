# Go-live Substitution Checklist

## Pre-go-live obrigatorio

- [ ] Catalogo real migrado em dry-run aprovado.
- [ ] Produtos publicados reconciliados por SKU, slug, preco, status e estoque.
- [ ] Imagens/capa/fallback aprovados.
- [ ] Cupons ativos reconciliados ou desativados com decisao.
- [ ] Frete minimo coberto por UF/CEP usado em producao.
- [ ] Smoke de compra completo com dados controlados.
- [ ] Stripe em test mode validado; live mode so em fase aprovada.
- [ ] Admin minimo para produtos, cupons, frete e pedidos validado.
- [ ] Decisao documentada para frete externo, fiscal/Bling/NF-e, clientes existentes e pedidos historicos.
- [ ] Rollback plan aprovado.

## Janela de corte futura

- Congelar alteracoes no legado durante export/cutover.
- Gerar backup antes de qualquer import real.
- Executar import aprovado em alvo identificado.
- Rodar smoke final.
- Avancar apenas se criterios Must passarem.

## Criterio de abortar

- Divergencia financeira.
- Produto publicado sem preco/estoque/capa/fallback.
- Falha de auth/admin.
- Falha de checkout/pagamento teste.
- Secret ou dado pessoal cru em log/relatorio.
- Necessidade de provider real nao aprovado.
