# Dominio Reversa - Triade Essenza Next

Data: 2026-06-09
Escopo: dominio apos Fase 7.

## Subdominios atuais

- Catalogo de produtos.
- Autenticacao e permissoes administrativas.
- Carrinho e sessao de compra.
- Cupons e descontos.
- Frete manual e cotacoes.

## Carrinho

O carrinho representa uma intencao de compra ainda sem checkout real. Ele pode pertencer a visitante ou usuario autenticado, contem itens e calcula totais server-side.

Regras atuais:

- Produto e quantidade sao validados no servidor.
- Totais sao recalculados a partir dos itens e regras aplicadas.
- Cupom aplicado pode alterar desconto ou frete.
- Frete selecionado entra no total parcial.
- Mudancas nos itens invalidam a selecao de frete.
- Checkout, pedido, pagamento, reserva e baixa de estoque permanecem fora do escopo.

## Cupons

Tipos de cupom relevantes:

- Percentual.
- Valor fixo.
- Frete gratis.

Regras atuais:

- Cupons sao validados por tipo, periodo, status e elegibilidade.
- Desconto de produto nao pode gerar total negativo.
- `free_shipping` nao gera `discountCents` sobre produtos.
- `free_shipping` zera somente o frete manual calculado e elegivel.
- Se nao houver frete manual cotado, `free_shipping` nao cria frete artificial.

## Frete manual

O frete da Fase 7 e manual, calculado por regras internas do projeto.

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
- Cotacao tem validade local padrao.
- Selecao de opcao exige que a quote pertenca ao carrinho ativo.
- Frete selecionado e persistido no carrinho.
- Alteracao de itens invalida o frete selecionado.

### Providers futuros

Correios, Jadlog e Melhor Envio estao modelados apenas como adapters futuros inativos. A Fase 7 nao faz chamadas externas e nao exige credenciais de frete.

## Admin de frete

- Acesso por `/admin/frete`.
- Criacao e edicao basica de regras manuais.
- Protegido por `admin` ou `manager`.
- Usuarios sem permissao adequada recebem bloqueio/forbidden.

## Regras fora do escopo

- Checkout real.
- Pagamento.
- Stripe.
- Pedido.
- Reserva de estoque.
- Baixa de estoque.
- Cotacao real em API externa de frete.
- Aplicacao de migration em banco real nesta etapa.

## Proxima fase

A proxima feature deve iniciar por `/reversa-requirements`, com requisitos novos antes de plano ou implementacao.
