# State Machines - Triade Essenza Next

Atualizado em: 2026-07-01
Agente: Detective

## Produto

```mermaid
stateDiagram-v2
  [*] --> draft
  draft --> published: admin publica com campos minimos
  published --> inactive: admin desativa
  inactive --> published: admin reativa e republica
  published --> draft: admin retira de publicacao
```

Regras:

- 🟢 `published` só é público se `publishedAt <= now` e estoque positivo.
- 🟢 `draft`, `inactive`, futuro e sem estoque não aparecem no catálogo público.

## Carrinho

```mermaid
stateDiagram-v2
  [*] --> active
  active --> converted: checkout cria pedido
  active --> abandoned: futuro/inferido
  active --> expired: futuro/inferido
  converted --> [*]
```

Regras:

- 🟢 `active` permite item, cupom e frete.
- 🟢 `converted` é terminal para mutações de compra.
- 🟡 `abandoned` e `expired` existem no enum, mas sem rotina operacional completa.

## Cupom

```mermaid
stateDiagram-v2
  [*] --> inactive
  inactive --> scheduled: isActive true e startsAt futuro
  scheduled --> active: startsAt <= now
  active --> expired: endsAt passado
  active --> exhausted: usedCount >= maxUses
  active --> inactive: admin desativa
```

Regras:

- 🟢 Status é calculado, não necessariamente persistido.
- 🟢 `usedCount` incrementa no settlement, não no carrinho.

## Cotação de Frete

```mermaid
stateDiagram-v2
  [*] --> created
  created --> selected: usuario escolhe opcao
  created --> expired: expiresAt <= now
  selected --> expired: expiresAt <= now
```

Regras:

- 🟢 Cotação vale por 30 minutos.
- 🟢 Cotação precisa pertencer ao carrinho atual.

## Pedido

```mermaid
stateDiagram-v2
  [*] --> aguardando_pagamento
  aguardando_pagamento --> pago: webhook payment_intent.succeeded + settlement valido
  aguardando_pagamento --> expirado: futuro/rotina pendente
  aguardando_pagamento --> cancelado: futuro/operacao pendente
  pago --> em_preparacao: futuro/admin
  em_preparacao --> enviado: futuro/admin
  enviado --> entregue: futuro/admin/tracking
  pago --> reembolsado: futuro/refund
  pago --> cancelado: futuro/regra humana
```

Regras:

- 🟢 Implementado hoje: `aguardando_pagamento -> pago`.
- 🟢 Browser e admin não marcam pedido pago.
- 🔴 Transições operacionais restantes ainda não foram implementadas.

## Pagamento Interno

```mermaid
stateDiagram-v2
  [*] --> pendente
  pendente --> pago: webhook succeeded
  pendente --> falhou: webhook payment_failed
  pendente --> cancelado: webhook canceled
  pago --> reembolsado: futuro/refund
```

Regras:

- 🟢 PaymentIntent pendente pode ser reutilizado se valor/moeda/pedido ainda batem.
- 🟢 Falha/cancelamento não muda pedido para pago.

## Evento de Pagamento

```mermaid
stateDiagram-v2
  [*] --> received
  received --> processed: evento tratado
  received --> failed: erro controlado
  received --> ignored: fora de escopo
  received --> duplicate: eventId ja processado
```

Regras:

- 🟢 `eventId` único impede repetição do settlement.
- 🟢 Payload armazenado é sanitizado/normalizado, não segredo bruto.

## Entrega de Notificação

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> sending
  sending --> sent
  sending --> mocked
  sending --> failed
  pending --> skipped
```

Regras:

- 🟢 `mocked` só em dev/test.
- 🟢 `skipped` cobre ausência de destinatário admin.
- 🟢 Duplicata idempotente retorna registro existente.
- 🟢 Falha de notificação não altera pedido, pagamento, estoque ou cupom.

## Fulfillment

```mermaid
stateDiagram-v2
  [*] --> unfulfilled
  unfulfilled --> preparing: futuro
  preparing --> shipped: futuro
  shipped --> delivered: futuro
  unfulfilled --> cancelled: futuro
  preparing --> cancelled: futuro
```

Regras:

- 🔴 Enum existe; fluxo operacional ainda não foi implementado.

## Readiness Operacional

```mermaid
stateDiagram-v2
  [*] --> local_validado
  local_validado --> staging_preparado: checklists/envs/providers configurados
  staging_preparado --> go_live_aprovado: aprovacao humana + smoke controlado
  staging_preparado --> rollback_planejado: falha em checklist/smoke
  go_live_aprovado --> [*]
  rollback_planejado --> [*]
```

Regras:

- 🟢 Fase 12 concluiu `local_validado` com lint, typecheck, testes, build, E2E e `ops:*`.
- 🟢 Transicao para staging/producao exige configuracao externa aprovada; nao e automatica.
- 🟢 Migration real, banco real e deploy real permanecem fora da execucao automatica.
