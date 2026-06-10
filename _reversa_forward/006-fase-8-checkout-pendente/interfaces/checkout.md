# Interface: Checkout autenticado

> Feature: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`

## Tipo de contrato

Arquivo de contrato interno de UX/server action para a tela de checkout autenticado.

## Entrada

- usuario autenticado;
- carrinho ativo proprio;
- cupom opcional ja aplicado e validado no carrinho;
- frete selecionado valido;
- nome completo;
- e-mail da conta autenticada;
- telefone/WhatsApp;
- endereco completo: CEP, UF, cidade, bairro, logradouro, numero, complemento opcional e destinatario quando necessario.

## Saida esperada

- pedido criado com status `aguardando_pagamento`;
- expiracao em 60 minutos;
- snapshots de itens, cliente, endereco, cupom, frete e totais;
- carrinho convertido/bloqueado;
- confirmacao observavel para o usuario.

## Estados de resposta

| Estado | Quando ocorre |
|--------|---------------|
| `success` | checkout valido cria pedido pendente |
| `unauthenticated` | visitante tenta finalizar pedido |
| `validation_error` | carrinho, cupom, frete, endereco ou payload invalido |
| `forbidden` | carrinho nao pertence ao usuario autenticado |
| `fallback` | ambiente dev/test sem banco usa fixture explicita |
| `unavailable` | ambiente preview/producao sem banco ou auth/policies inativos |

## Regras de seguranca

- nao aceitar subtotal, desconto, frete ou total do cliente;
- nao aceitar `cartId`, `userId`, role ou estado do pedido como fonte confiavel;
- nao expor Stripe, PaymentIntent, cartao ou dados sensiveis;
- nao criar pedido anonimo;
- nao permitir mutacao financeira no admin.

## Idempotencia

- um mesmo carrinho convertido nao deve gerar novo pedido na repeticao;
- a tentativa repetida deve retornar o pedido existente ou um bloqueio controlado.

## Timeouts e expiracao

- a pagina pode expor a janela de 60 minutos do pedido pendente;
- nenhuma chamada a provider externo e realizada nesta interface.

## Erros observaveis

- carrinho vazio;
- produto indisponivel;
- quantidade acima do estoque;
- frete invalido ou expirado;
- cupom invalido ou esgotado;
- endereco incompleto;
- usuario nao autenticado.
