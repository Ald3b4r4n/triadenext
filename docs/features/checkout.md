# Checkout e pagamento — Fases 8 e 9

## Escopo

- Checkout exige usuario autenticado.
- Visitante com carrinho valido e direcionado para login/cadastro antes de criar pedido.
- Pedido nasce `aguardando_pagamento` e expira em 60 minutos.
- O servidor recalcula subtotal, desconto, frete e total.
- Cliente informa nome completo, telefone/WhatsApp e endereco completo.
- O e-mail usado no pedido vem da conta autenticada.
- Carrinho usado no pedido e marcado como `converted`.

## Pagamento

- O pedido pendente pode iniciar PaymentIntent direto na area customer.
- Payment Element coleta os dados diretamente no componente Stripe.
- O servidor nao aceita valor/moeda vindos do client.
- Webhook assinado confirma o pagamento e executa efeitos atomicos.

## Fora de escopo

- Pedido anonimo.
- Stripe Checkout Session como fluxo principal.
- Formulario proprio ou armazenamento de cartao.
- Baixa de estoque ou consumo de cupom fora do webhook confirmado.
- Bling/NF-e/fiscal e email transacional obrigatorio.
- Deploy, dominio e aplicacao de migration em banco real.

## Fallback

Sem `DATABASE_URL`, preview/producao falham de forma segura. Em desenvolvimento/testes, o checkout
pode criar fixture explicita de pedido pendente sem prometer persistencia real.

Sem Stripe em dev/test, o pagamento usa adapter mock explicito. Em preview/producao sem Stripe
configurado, o pagamento real falha de forma segura.

## Referencia Reversa

O SDD legado correto para consulta continua em `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`.
