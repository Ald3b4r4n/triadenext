# Interface: Leitura de pedidos

> Feature: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`

## Tipo de contrato

Arquivo de contrato interno para leitura de pedidos pela area customer e pela area admin minima.

## Customer

### Entrada

- usuario autenticado;
- filtro implícito por `userId`.

### Saida minima

- numero/id do pedido;
- status;
- total;
- data de criacao;
- data de expiracao;
- opcionalmente detalhe minimo do pedido.

### Regras

- somente pedidos proprios;
- nenhum pedido de outro usuario pode aparecer;
- nenhuma acao financeira ou de estoque e permitida;
- o cliente nao ve dados de cartao, Stripe ou PaymentIntent.

## Admin

### Entrada

- `admin` ou `manager` autenticado.

### Saida minima

- lista de pedidos pendentes;
- detalhe basico do pedido;
- snapshots principais para leitura e suporte.

### Regras

- nao marcar pedido como pago manualmente;
- nao editar valores financeiros;
- nao baixar ou reservar estoque;
- nao criar pagamento;
- nao abrir bypass de ownership ou de estado.

## Estados e erros

| Estado | Quando ocorre |
|--------|---------------|
| `allowed` | role e ownership corretos |
| `unauthenticated` | sessao ausente ou expirada |
| `forbidden` | usuario tenta ver pedido alheio ou role insuficiente |
| `blocked` | ambiente sem banco ou auth/policies nao ativos |

## Observabilidade

- mensagens controladas;
- nenhum secret ou payload sensivel exposto;
- leitura sem mutacao.
