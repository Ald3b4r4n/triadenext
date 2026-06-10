# Onboarding: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`

## Como testar a feature pela primeira vez

1. Abrir o storefront no carrinho com itens validos.
2. Confirmar que o usuario esta autenticado.
3. Inserir CEP valido e selecionar frete manual elegivel.
4. Aplicar um cupom valido, se o teste exigir.
5. Preencher nome completo, e-mail da conta e telefone/WhatsApp.
6. Preencher endereco completo de entrega.
7. Revisar subtotal, desconto, frete e total.
8. Confirmar a criacao do pedido pendente.
9. Verificar que o pedido nasce `aguardando_pagamento`.
10. Verificar que o carrinho de origem fica convertido/bloqueado.
11. Abrir a area customer e confirmar que o pedido aparece na listagem minima.
12. Abrir a area admin e confirmar que o pedido aparece apenas em leitura basica.

## Casos que precisam falhar de forma segura

- checkout com carrinho vazio;
- checkout sem login;
- produto sem disponibilidade;
- quantidade acima do estoque;
- frete sem selecao valida;
- cupom invalido, expirado ou esgotado;
- endereco incompleto;
- payload tentando forcar subtotal, desconto, frete ou total;
- tentativa de criar pedido de carrinho de outro usuario;
- ambiente sem `DATABASE_URL` fora de fixture/dev/test.

## Observacoes de ambiente

- Em dev/test, fixture explicita pode simular pedido pendente.
- Preview/producao sem banco devem falhar de forma segura.
- Stripe, PaymentIntent e dados de cartao nao entram nesta fase.

## Pontos para o verificador humano

- O pedido foi criado com snapshot completo?
- O cart convertido ficou bloqueado?
- A listagem customer mostra apenas pedidos proprios?
- O admin apenas visualiza e nao executa acoes financeiras?
- O caminho do SDD legado usado no planejamento foi o correto com barra antes de `_reversa_sdd`?

## Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Onboarding inicial gerado por `/reversa-plan` | reversa |
