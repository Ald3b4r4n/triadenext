# Interface: Inicio de PaymentIntent

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`
> Tipo: HTTP/server action autenticada

## 1. Objetivo

Permitir que um cliente autenticado inicie pagamento de um pedido proprio em `aguardando_pagamento`, criando ou reutilizando um PaymentIntent elegivel no servidor.

## 2. Entrada conceitual

| Campo | Origem | Obrigatorio | Observacao |
|-------|--------|-------------|------------|
| `orderId` | client | sim | Identificador do pedido pendente proprio. |

Campos proibidos como fonte de verdade:

- subtotal;
- frete;
- desconto;
- total;
- moeda;
- `userId`;
- status do pedido;
- status do pagamento;
- provider.

## 3. Validacoes server-side

1. Resolver sessao autenticada.
2. Buscar pedido por `orderId` e `userId`.
3. Exigir `status = aguardando_pagamento`.
4. Bloquear pedido expirado, cancelado, pago ou de outro usuario.
5. Usar `grandTotalCents` e `currency` do pedido como fonte de verdade.
6. Criar ou reutilizar payment intent interno elegivel.
7. Chamar adapter Stripe real apenas se configuracao permitir.
8. Em dev/test, permitir adapter/mock explicito.
9. Em preview/producao sem Stripe configurado, falhar de forma segura.

## 4. Saida conceitual de sucesso

| Campo | Descricao |
|-------|-----------|
| `paymentIntentId` | Id interno do pagamento. |
| `providerReference` | Id do PaymentIntent Stripe quando aplicavel. |
| `clientSecret` | Secret necessario ao Payment Element; nao deve ser logado ou persistido fora do necessario. |
| `amountCents` | Valor snapshotado do pedido. |
| `currency` | Moeda do pedido. |
| `status` | Estado interno do pagamento. |

## 5. Erros esperados

| Codigo conceitual | Condicao |
|-------------------|----------|
| `UNAUTHENTICATED` | Sem sessao valida. |
| `ORDER_NOT_FOUND` | Pedido inexistente ou nao pertence ao usuario. |
| `ORDER_NOT_PAYABLE` | Pedido expirado, cancelado, pago ou em estado invalido. |
| `PAYMENT_CONFIG_MISSING` | Stripe ausente em ambiente que exige pagamento real. |
| `PAYMENT_PROVIDER_ERROR` | Stripe recusou a criacao ou atualizacao do PaymentIntent. |

## 6. Idempotencia

- O reenvio para o mesmo pedido deve reutilizar intent pendente elegivel quando seguro.
- A chamada Stripe deve usar idempotency key derivada de identificador interno estavel.
- Reenvio nao pode criar dois pagamentos ativos para o mesmo pedido.

## 7. Timeouts e retry

- Erro transiente do provider pode permitir retry controlado.
- Retry nao pode ignorar status atualizado do pedido.
- Pedido expirado entre tentativas deve ser bloqueado.

## 8. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Interface inicial gerada por `/reversa-plan` | reversa |
