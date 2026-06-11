# Requirements - Frete Real e Rastreamento

## Objetivo

Evoluir do frete manual/fallback para adapters reais de cotação e rastreamento, mantendo fallback seguro.

## Escopo

- Adapter contract para provedores.
- Cotação por CEP, peso, dimensões e valor.
- Snapshot da opção escolhida no pedido.
- Rastreamento pós-envio.
- Admin para configurar provedores sem expor secrets.

## Regras

- Testes usam fake adapter.
- Falha de provedor não deve quebrar carrinho inteiro se houver fallback.
- Pedido fechado não recalcula frete.

## Fora do escopo

- Compra de etiqueta se não for decidida.
- Integração fiscal.
