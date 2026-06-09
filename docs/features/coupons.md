# Cupons e Descontos — Fase 6

## Escopo

- Aplicar e remover um cupom no carrinho ativo.
- Um cupom por carrinho.
- Cupons globais para o carrinho.
- Tipos operacionais: percentual e valor fixo.
- Tipo `free_shipping` apenas preparado/modelado, sem benefício real de frete.
- Subtotal mínimo via `minimumSubtotalCents`.
- Limite global consultado por `maxUses`/`usedCount`.
- Admin mínimo para listar, criar e editar cupons básicos.

## Regras

- Código é normalizado com trim e uppercase.
- O legado usava `percent` e `fixed`; no Next o mapeamento explícito é:
  - `percent` -> `percentage`;
  - `fixed` -> `fixed_amount`.
- Cupom inativo, futuro, expirado ou esgotado é recusado.
- Desconto percentual é calculado em centavos e arredondado de forma determinística.
- Desconto fixo usa centavos.
- Desconto nunca ultrapassa o subtotal.
- `partialTotalCents = subtotalCents - discountCents`.
- Aplicar/remover cupom no carrinho não incrementa `usedCount`.
- Consumo de uso fica para fase futura de pedido/checkout.

## Frete grátis preparado

`free_shipping` existe apenas como tipo reservado para a futura fase de frete. Nesta fase ele não
zera frete, não calcula frete real, não promete frete grátis no checkout e retorna mensagem
controlada quando aplicado.

## Admin mínimo

O admin de cupons é um recorte inicial. Ele permite listagem e formulário básico de criação/edição
quando policies reais permitem. Não é paridade administrativa completa do legado.

Ficam fora:

- campanhas avançadas;
- relatórios;
- limite por usuário;
- restrição por produto/categoria;
- consumo manual de `usedCount`;
- alternância/exclusão avançada de campanha.

## Fora de escopo

Checkout, pagamento, Stripe, frete real, pedido, reserva de estoque, baixa de estoque, cupons
acumulativos, limite por usuário e restrição por produto/categoria continuam fora da Fase 6.
