# Maquinas de estado Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: estados apos Fase 10.

## Carrinho

```text
active -> converted
converted -> terminal para mutacoes
```

Carrinho convertido nao recebe item, cupom ou frete novo.

## Pedido

```text
aguardando_pagamento
  -> pago              [somente webhook assinado + settlement valido]
```

Client return e admin nao executam a transicao.

## PaymentIntent e webhook

```text
criado -> processando -> pago
                     \-> falho/cancelado

evento recebido -> validado -> processado
                \-> ignorado/falho
```

`payment_events.event_id` unico impede segundo settlement.

## Settlement

```text
validar evento e snapshots
  -> atualizar pagamento
  -> atualizar pedido
  -> baixar estoque
  -> consumir cupom quando aplicavel
  -> marcar evento processado
  -> concluir transacao
  -> tentar notificacoes pos-pagamento
```

Qualquer falha antes da conclusao impede estado financeiro parcial. Falha depois da conclusao, na notificacao, nao reverte os efeitos confirmados.

## Entrega de notificacao

```text
pending -> sending -> sent
                   \-> mocked
                   \-> failed
pending -----------> skipped
```

- `mocked` e permitido somente em dev/test.
- `skipped` cobre ausencia explicita de destinatario admin.
- Duplicata idempotente retorna o registro existente, sem nova transicao efetiva.
- Preview/producao sem provider real terminam em falha segura, nunca em `mocked`.

## Admin de notificacoes

```text
admin/manager autenticado -> listar status mascarado
customer/visitante -------> bloqueado
```

Nao ha transicao de reenvio manual.

## Fluxos ainda inexistentes

- Pagamento confirmado pelo browser ou admin.
- Retry agendado/reenvio manual de notificacao.
- Historico customer de notificacoes.
- WhatsApp, SMS, Bling, NF-e ou fiscal.
- Refund/dispute completo.
- Frete externo real.
