# Permissoes Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: permissoes apos Fase 9.

## Papeis

| Papel | Descricao |
| --- | --- |
| Visitante | Usuario anonimo com carrinho por identificador local |
| Customer | Usuario autenticado com carrinho, pedidos proprios e pagamento proprio |
| Manager | Operador administrativo com permissao operacional de leitura/admin |
| Admin | Administrador com permissao ampla de leitura/admin |

## Matriz de acesso

| Recurso/acao | Visitante | Customer | Manager | Admin |
| --- | --- | --- | --- | --- |
| Ver catalogo | Sim | Sim | Sim | Sim |
| Gerenciar proprio carrinho | Sim | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Aplicar/remover cupom no proprio carrinho | Sim | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Cotar frete do proprio carrinho | Sim | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Selecionar quote de outro carrinho | Nao | Nao | Nao | Nao |
| Iniciar checkout/revisao | Login/cadastro exigido | Sim, proprio carrinho | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Criar pedido pendente | Nao | Sim, proprio carrinho | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Criar pedido anonimo | Nao | Nao | Nao | Nao |
| Ver pedidos proprios | Nao | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Iniciar PaymentIntent de pedido proprio pendente | Nao | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Pagar pedido de outro customer | Nao | Nao | Nao | Nao |
| Confirmar pagamento por retorno client-side | Nao | Nao | Nao | Nao |
| Confirmar pagamento por webhook assinado | Nao | Nao | Nao | Nao, sistema/server-only |
| Ver pedido de outro customer | Nao | Nao | Somente via admin minimo | Somente via admin minimo |
| Acessar admin | Nao | Nao | Sim | Sim |
| Listar regras de frete admin | Nao | Nao | Sim | Sim |
| Criar/editar regras de frete | Nao | Nao | Sim | Sim |
| Listar pedidos admin | Nao | Nao | Sim | Sim |
| Marcar pedido como pago | Nao | Nao | Nao | Nao |
| Editar valores financeiros do pedido | Nao | Nao | Nao | Nao |
| Baixar/reservar estoque manualmente | Nao | Nao | Nao | Nao |
| Consumir cupom manualmente | Nao | Nao | Nao | Nao |
| Criar Stripe Checkout Session | Nao | Nao | Nao | Nao |

## Protecoes server-side

- Acoes de carrinho resolvem o ator no servidor.
- Dono do carrinho, totais, desconto e frete nao sao aceitos como fonte de verdade pelo payload cliente.
- Selecao de frete valida que a quote pertence ao carrinho ativo.
- Checkout chama sessao server-side e bloqueia visitante.
- Checkout valida ownership do carrinho antes de criar pedido.
- Checkout ignora valores financeiros, `cartId`, `userId`, role e status enviados pelo cliente.
- Leitura customer de pedidos filtra por `userId`.
- Inicio de pagamento filtra pedido por `userId` e valida status/expiracao.
- PaymentIntent usa valor/moeda do pedido server-side.
- Webhook valida assinatura antes de registrar/alterar estado.
- Settlement e server-only.
- Leitura admin usa `requireAdminLike`.
- Acoes administrativas de frete usam `requireAdminLike`.

## Checkout, pedido e pagamento

- Visitante pode montar carrinho, aplicar cupom e cotar frete.
- Visitante que tenta checkout recebe login/cadastro.
- Pedido sempre pertence a usuario autenticado.
- Carrinho de outro usuario e bloqueado.
- Pedido pendente nao baixa estoque e nao consome cupom.
- Customer pode iniciar pagamento de pedido proprio pendente e nao expirado.
- Payment Element nao da autoridade para marcar pedido como pago.
- Webhook `payment_intent.succeeded` e a unica entrada que pode liquidar pagamento.
- Falha/cancelamento do PaymentIntent nao marca pedido como pago.
- Admin/manager visualizam status financeiro, mas nao fazem mutacao financeira.

## Frete

- Visitante e customer podem cotar frete para o proprio carrinho.
- CEP invalido e bloqueado por validacao.
- Quote de outro carrinho e bloqueada.
- Providers externos inativos nao exigem credenciais nem permissao adicional.

## Cupom `free_shipping`

- Pode ser aplicado no carrinho conforme regras de cupom.
- Afeta somente frete manual calculado e elegivel.
- Nao concede desconto monetario em produtos.
- Nao cria frete quando nao ha frete cotado.
- Nao consome `usedCount` na criacao de pedido pendente.
- Nao consome `usedCount` na criacao de PaymentIntent.
- Consome `usedCount` somente no webhook confirmado.

## Fora do escopo de permissao atual

- Permissoes de Stripe Checkout Session.
- Permissoes de captura manual.
- Permissoes de refund/disputa.
- Permissoes fiscais/Bling/NF-e.
- Permissoes para credenciais de providers externos.
