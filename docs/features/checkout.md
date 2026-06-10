# Checkout pendente — Fase 8

## Escopo

- Checkout exige usuario autenticado.
- Visitante com carrinho valido e direcionado para login/cadastro antes de criar pedido.
- Pedido nasce `aguardando_pagamento` e expira em 60 minutos.
- O servidor recalcula subtotal, desconto, frete e total.
- Cliente informa nome completo, telefone/WhatsApp e endereco completo.
- O e-mail usado no pedido vem da conta autenticada.
- Carrinho usado no pedido e marcado como `converted`.

## Fora de escopo

- Pedido anonimo.
- Stripe, PaymentIntent, captura de pagamento e coleta de cartao.
- Baixa ou reserva definitiva de estoque.
- Consumo de `usedCount` de cupom.
- Deploy, dominio e aplicacao de migration em banco real.

## Fallback

Sem `DATABASE_URL`, preview/producao falham de forma segura. Em desenvolvimento/testes, o checkout
pode criar fixture explicita de pedido pendente sem prometer persistencia real.

## Referencia Reversa

O SDD legado correto para consulta continua em `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`.
