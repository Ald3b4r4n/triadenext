# Regression Watch Plan

## Regras verdes que devem permanecer preservadas

- Produto publico exige `published`, `publishedAt <= now` e estoque positivo.
- Carrinho convertido e terminal para mutacoes de compra.
- Cupom vigente precisa estar ativo, valido e nao esgotado.
- Frete atual e manual por UF/faixa de CEP, com providers externos futuros inativos.
- Checkout exige customer autenticado.
- Pedido nasce de carrinho ativo com snapshots server-side.
- Pedido pendente expira em 60 minutos.
- Stripe webhook assinado/idempotente e fonte de verdade financeira.
- Settlement de pedido/pagamento/estoque/cupom e atomico.
- Notificacoes pos-pagamento usam outbox/provider seguro.
- Readiness de producao nao executa deploy, migration real ou banco real automaticamente.

## Watch semantico da Fase 13

Como a Fase 13 nao altera regra funcional, o watch principal deve vigiar ausencia de regressao:

- Laravel continua read-only.
- Nenhum `.env` ou secret entra em artefato versionado.
- Nenhum import real, migration real, banco real ou deploy ocorre durante a fase.
- Lacunas de Bling/NF-e/WhatsApp/SMS permanecem classificadas como fora de escopo/decisao humana.
- Lacunas de dados reais nao sao mascaradas como paridade completa.

## Saida esperada

`regression-watch.md` deve conter itens de presenca/ausencia para esses guardrails e historico de re-extracoes vazio.
