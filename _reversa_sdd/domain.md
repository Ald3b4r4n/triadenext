# Dominio Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: dominio apos Fase 8.

## Subdominios atuais

- Catalogo de produtos.
- Autenticacao e permissoes.
- Carrinho e sessao de compra.
- Cupons e descontos.
- Frete manual e cotacoes.
- Checkout autenticado.
- Pedido pendente.

## Catalogo

Produto compravel exige:

- `status = published`;
- `publishedAt <= now`;
- `stockQuantity > 0`;
- quantidade solicitada menor ou igual ao estoque disponivel.

Produto `draft`, `inactive`, futuro ou sem estoque nao e compravel.

## Carrinho

O carrinho representa a intencao de compra e pode pertencer a visitante ou usuario autenticado.

Regras atuais:

- Produto e quantidade sao validados no servidor.
- Totais sao recalculados a partir dos itens e regras aplicadas.
- Cupom aplicado pode alterar desconto ou frete.
- Frete selecionado entra no total parcial.
- Mudancas nos itens invalidam a selecao de frete.
- Visitante pode montar carrinho, aplicar cupom e cotar frete.
- Criacao de pedido exige usuario autenticado.
- Carrinho usado em pedido pendente e marcado como `converted`.
- Carrinho convertido nao aceita novas mutacoes e nao deve ser usado para nova compra.
- Compra futura apos conversao resolve novo carrinho ativo.

## Cupons

Tipos de cupom relevantes:

- Percentual.
- Valor fixo.
- Frete gratis.

Regras atuais:

- Cupons sao validados por tipo, periodo, status, limite global e elegibilidade.
- Desconto de produto nao pode gerar total negativo.
- `free_shipping` nao gera `discountCents` sobre produtos.
- `free_shipping` zera somente o frete manual calculado e elegivel.
- Se nao houver frete manual cotado, `free_shipping` nao cria frete artificial.
- Checkout revalida cupom antes de criar pedido.
- Pedido guarda snapshot do cupom e do desconto efetivo.
- Criacao de pedido pendente nao incrementa `usedCount`.

## Frete manual

O frete atual e manual, calculado por regras internas do projeto.

### Conceitos

- `ShippingManualRule`: regra de frete configuravel.
- `ShippingQuote`: cotacao gerada para um carrinho e CEP.
- `ShippingOption`: opcao retornada por regra aplicavel.
- `ShippingProvider`: `manual`, `correios`, `jadlog`, `melhor_envio`.

### Regras de negocio

- O CEP e normalizado para 8 digitos numericos.
- CEP invalido bloqueia a cotacao.
- Regras ativas de provider `manual` podem ser aplicadas.
- Regra por UF compara a UF de destino normalizada.
- Regra por faixa de CEP compara CEP inicial e final.
- Regras aplicaveis sao ordenadas por prioridade maior, preco menor e nome.
- O valor de frete e sempre em centavos.
- Prazo estimado e manual, em dias.
- Cotacao tem validade local.
- Selecao de opcao exige que a quote pertenca ao carrinho ativo.
- Frete selecionado e persistido no carrinho.
- Alteracao de itens invalida o frete selecionado.
- Checkout exige frete selecionado valido e nao expirado.
- Pedido guarda snapshot de CEP, quote, opcao, provider, origem, label, prazo, valor original, valor efetivo e efeito de `free_shipping`.

### Providers futuros

Correios, Jadlog e Melhor Envio estao modelados apenas como adapters futuros inativos. A Fase 8 nao faz chamadas externas e nao exige credenciais de frete.

## Checkout pendente

Checkout e um fluxo autenticado e server-side.

Ordem de validacao observada:

1. Resolver sessao autenticada.
2. Resolver carrinho ativo do usuario.
3. Bloquear carrinho vazio.
4. Bloquear carrinho convertido ou bloqueado.
5. Validar produtos compraveis.
6. Validar estoque disponivel.
7. Revalidar cupom aplicado.
8. Validar frete selecionado, quote nao expirada e ownership da quote.
9. Validar endereco completo.
10. Validar coerencia entre CEP do endereco e CEP da cotacao.
11. Recalcular subtotal, desconto, frete e total no servidor.
12. Criar snapshots.
13. Persistir pedido pendente.
14. Marcar carrinho como convertido.

Payload cliente nao e fonte de verdade para subtotal, desconto, frete, total, `userId`, `cartId`, role ou status.

## Pedido pendente

Pedido criado na Fase 8:

- nasce com status `aguardando_pagamento`;
- pertence sempre a um `userId`;
- referencia o `cartId` convertido;
- expira em 60 minutos;
- possui numero operacional `TE-*`;
- possui token publico interno;
- guarda totais em centavos;
- guarda snapshot de cliente, endereco, cupom, frete e itens;
- nao representa pagamento autorizado, pago ou capturado.

Snapshots de item preservam:

- produto;
- SKU;
- nome;
- slug;
- imagem;
- preco unitario em centavos;
- quantidade;
- total da linha em centavos.

## Customer e admin

- Customer lista somente pedidos proprios.
- Admin/manager lista pedidos pendentes em leitura minima.
- Admin nao marca pedido como pago.
- Admin nao edita valores financeiros.
- Admin nao baixa nem reserva estoque.
- Admin nao cria pagamento.

## Fallback sem banco

- Sem `DATABASE_URL`, preview/producao falham de forma segura para checkout/pedido.
- Em dev/test pode existir fixture explicita sem promessa de persistencia real.
- Quando banco real existir, erro real nao deve virar fallback silencioso.

## Regras fora do escopo

- Pedido anonimo.
- Pagamento real.
- Stripe real.
- PaymentIntent real.
- Coleta de cartao.
- Captura de pagamento.
- Reserva definitiva de estoque.
- Baixa definitiva de estoque.
- Consumo de `usedCount` na criacao do pedido pendente.
- Cotacao real em API externa de frete.
- Aplicacao de migration em banco real nesta etapa.

## Proxima fase

O proximo passo esperado e committar os artefatos Reversa pos-Fase 8 e depois fazer push dos commits locais quando aprovado.
