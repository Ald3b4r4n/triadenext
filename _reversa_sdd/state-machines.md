# State Machines - Triade Essenza Next

Atualizado em: 2026-07-03
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

## Paridade e Migracao Controlada

```mermaid
stateDiagram-v2
  [*] --> paridade_documentada
  paridade_documentada --> bloqueadores_identificados: gap register Fase 13
  bloqueadores_identificados --> dry_run_sintetico_validado: Fase 14 exemplos/contratos
  dry_run_sintetico_validado --> primeira_execucao_pending_input: Fase 15 sem arquivos reais
  primeira_execucao_pending_input --> dry_run_fonte_real_aprovada: arquivos CSV/JSON aprovados presentes
  dry_run_sintetico_validado --> dry_run_fonte_real_aprovada: fonte local aprovada completa
  dry_run_fonte_real_aprovada --> reconciliacao_aprovada: catalogo/imagens/precos/estoque/cupons/frete batem
  reconciliacao_aprovada --> importacao_staging_planejada: Fase 16 preflight staging
  importacao_staging_planejada --> importacao_staging_executada: upsert staging aprovado
  importacao_staging_executada --> pronto_para_cutover_planejado: smoke staging aprovado + decisoes humanas fechadas
  bloqueadores_identificados --> no_go: dados Must sem reconciliacao
  dry_run_fonte_real_aprovada --> no_go: divergencia financeira/secret/dado cru
  importacao_staging_planejada --> no_go: producao, sem backup, sem aprovacao ou sem STAGING_DATABASE_URL
  pronto_para_cutover_planejado --> rollback_planejado: smoke/cutover falha
```

Regras:

- 🟢 Fase 13 concluiu `paridade_documentada` e `bloqueadores_identificados`.
- 🟢 Fase 14 concluiu `dry_run_sintetico_validado` com exemplos locais, contratos CSV/JSON e `ops:check-data-dry-run`.
- 🟢 Fase 15 introduziu `primeira_execucao_pending_input`: a pasta aprovada existe conceitualmente, mas sem arquivos reais/exportados o resultado seguro e `pending-input`.
- 🟢 Fase 16 introduziu `importacao_staging_planejada` e `importacao_staging_executada`: somente staging/dev remoto aprovado, com producao bloqueada, upsert seguro e reset protegido.
- 🔴 `dry_run_fonte_real_aprovada` ainda nao ocorreu; depende de arquivos CSV/JSON reais aprovados em `data/dry-run/input/primeira-execucao/`.
- 🟢 `no_go` e obrigatorio enquanto catalogo real, imagens, precos, estoque, cupons ativos e frete minimo nao forem reconciliados com fonte real.
- 🟢 `rollback_planejado` preserva o Laravel legado intacto ate aceite formal.

## Importacao Staging Controlada

```mermaid
stateDiagram-v2
  [*] --> preflight
  preflight --> pending_input: arquivos aprovados ausentes
  preflight --> blocked: producao, sem aprovacao, sem backup exigido ou sem STAGING_DATABASE_URL
  preflight --> planned: staging/dev remoto aprovado + dry-run go
  planned --> upserting: upsert seguro
  planned --> reset_requested: flag reset explicita
  reset_requested --> blocked: sem backup/aprovacao/ambiente nao produtivo
  reset_requested --> upserting: reset protegido aprovado
  upserting --> reported: relatorios antes/depois e divergencias
  reported --> smoke_skipped: sem STAGING_IMPORT_SMOKE_URL
  reported --> smoke_passed: URL staging aprovada
  reported --> smoke_failed: divergencia pos-importacao
```

Regras:

- 🟢 `pending_input` e seguro e nao abre conexao remota.
- 🟢 `blocked` impede escrita e deve explicar a precondicao ausente sem imprimir secrets.
- 🟢 `upserting` so ocorre contra staging/dev remoto aprovado.
- 🟢 `smoke_skipped` sem URL e esperado na suite E2E local; nao autoriza go-live.
