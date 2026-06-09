# Maquinas de estado Reversa - Triade Essenza Next

Data: 2026-06-09
Escopo: estados apos Fase 7.

## Carrinho

```mermaid
stateDiagram-v2
  [*] --> empty
  empty --> active: adicionar item
  active --> active: alterar quantidade
  active --> coupon_applied: aplicar cupom valido
  coupon_applied --> active: remover cupom
  active --> shipping_quoted: cotar frete por CEP
  coupon_applied --> shipping_quoted: cotar frete por CEP
  shipping_quoted --> shipping_selected: selecionar opcao
  shipping_selected --> shipping_invalidated: alterar itens
  shipping_selected --> shipping_removed: remover frete
  shipping_invalidated --> shipping_quoted: recotar CEP
  shipping_removed --> shipping_quoted: recotar CEP
```

Estados relevantes:

- `empty`: sem itens.
- `active`: com itens e sem checkout.
- `coupon_applied`: cupom valido aplicado.
- `shipping_quoted`: quote gerada para CEP.
- `shipping_selected`: opcao de frete persistida.
- `shipping_invalidated`: frete descartado apos mudanca de itens.
- `shipping_removed`: usuario removeu a selecao de frete.

## Cotacao de frete

```mermaid
stateDiagram-v2
  [*] --> requested
  requested --> invalid_postal_code: CEP invalido
  requested --> no_coverage: nenhuma regra aplicavel
  requested --> valid_quote: regras manuais encontradas
  valid_quote --> option_selected: selecionar opcao
  valid_quote --> expired: validade encerrada
  option_selected --> forbidden: quote nao pertence ao carrinho ativo
  option_selected --> persisted: quote pertence ao carrinho ativo
```

Regras:

- CEP deve ter 8 digitos numericos.
- Apenas regras manuais ativas sao usadas.
- Providers externos nao participam do fluxo atual.
- Selecao exige ownership da quote pelo carrinho ativo.

## Cupom `free_shipping`

```mermaid
stateDiagram-v2
  [*] --> applied
  applied --> waiting_shipping: sem frete cotado
  applied --> manual_freight_zeroed: frete manual elegivel cotado
  applied --> no_effect: frete inexistente ou nao elegivel
```

Regras:

- O cupom nao cria frete.
- O cupom nao altera desconto monetario de produtos.
- O cupom zera somente frete manual calculado e elegivel.

## Admin de frete

```mermaid
stateDiagram-v2
  [*] --> access_requested
  access_requested --> blocked: sem sessao admin-like
  access_requested --> allowed: admin ou manager
  allowed --> rule_created: criar regra valida
  allowed --> rule_updated: editar regra valida
  allowed --> validation_error: payload invalido
```

Permissao:

- `admin` e `manager` podem listar, criar e editar regras.
- Outros atores devem ser bloqueados.

## Fluxos ainda inexistentes

- Checkout.
- Pagamento.
- Stripe.
- Pedido.
- Reserva de estoque.
- Baixa de estoque.
