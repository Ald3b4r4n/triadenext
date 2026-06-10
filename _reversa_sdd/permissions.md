# Permissoes Reversa - Triade Essenza Next

Data: 2026-06-10
Escopo: permissoes apos Fase 8.

## Papeis

| Papel | Descricao |
| --- | --- |
| Visitante | Usuario anonimo com carrinho por identificador local |
| Customer | Usuario autenticado com carrinho e pedidos proprios |
| Manager | Operador administrativo com permissao operacional |
| Admin | Administrador com permissao ampla |

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
| Ver pedido de outro customer | Nao | Nao | Somente via admin minimo | Somente via admin minimo |
| Acessar admin | Nao | Nao | Sim | Sim |
| Listar regras de frete admin | Nao | Nao | Sim | Sim |
| Criar/editar regras de frete | Nao | Nao | Sim | Sim |
| Listar pedidos pendentes admin | Nao | Nao | Sim | Sim |
| Marcar pedido como pago | Nao | Nao | Nao | Nao |
| Editar valores financeiros do pedido | Nao | Nao | Nao | Nao |
| Baixar/reservar estoque por pedido pendente | Nao | Nao | Nao | Nao |
| Criar pagamento/PaymentIntent | Nao | Nao | Nao | Nao |

## Protecoes server-side

- Acoes de carrinho resolvem o ator no servidor.
- Dono do carrinho, totais, desconto e frete nao sao aceitos como fonte de verdade pelo payload cliente.
- Selecao de frete valida que a quote pertence ao carrinho ativo.
- Checkout chama sessao server-side e bloqueia visitante.
- Checkout valida ownership do carrinho antes de criar pedido.
- Checkout ignora valores financeiros, `cartId`, `userId`, role e status enviados pelo cliente.
- Leitura customer de pedidos filtra por `userId`.
- Leitura admin usa `requireAdminLike`.
- Acoes administrativas de frete usam `requireAdminLike`.

## Checkout e pedido

- Visitante pode montar carrinho, aplicar cupom e cotar frete.
- Visitante que tenta checkout recebe login/cadastro.
- Pedido sempre pertence a usuario autenticado.
- Carrinho de outro usuario e bloqueado.
- Pedido pendente nao inicia pagamento.
- Pedido pendente nao baixa estoque e nao consome cupom.

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

## Fora do escopo de permissao atual

- Permissoes de pagamento real.
- Permissoes de captura Stripe.
- Permissoes de webhook financeiro real.
- Permissoes de reserva/baixa definitiva de estoque.
- Permissoes para credenciais de providers externos.
