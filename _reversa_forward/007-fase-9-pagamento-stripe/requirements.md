# Requirements: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`
> Pasta da extracao reversa: `_reversa_sdd/`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Esta fase habilita o pagamento de pedidos pendentes criados na Fase 8 usando Stripe como provedor externo, sem coleta direta de cartao pela aplicacao. O cliente autenticado inicia o pagamento a partir do proprio pedido `aguardando_pagamento`, o servidor cria um PaymentIntent com valor snapshotado do pedido e o cliente conclui via Stripe.js/Payment Element. A confirmacao final passa por webhook assinado `payment_intent.succeeded`. Pedidos expirados, cancelados, pagos ou pertencentes a outro usuario permanecem bloqueados, e estoque e `usedCount` de cupom so sao consumidos no processamento atomico do webhook confirmado.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidencia |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Checkout` | Checkout atual ja valida sessao, carrinho, produtos, cupom, frete e endereco no servidor, sem campos de cartao ou PaymentIntent na Fase 8. | 🟢 |
| `_reversa_sdd/architecture.md#Orders` | Pedido nasce `aguardando_pagamento`, expira em 60 minutos, guarda snapshots e usa `cartId` como idempotencia por carrinho convertido. | 🟢 |
| `_reversa_sdd/architecture.md#Guardrails arquiteturais atuais` | Payload cliente nao e fonte de verdade para subtotal, desconto, frete, total, `userId`, `cartId`, role ou status. | 🟢 |
| `_reversa_sdd/domain.md#Checkout pendente` | O checkout eh autenticado, recalcula tudo no servidor e cria o pedido pendente apos validacoes finais. | 🟢 |
| `_reversa_sdd/domain.md#Pedido pendente` | O pedido pendente pertence a um `userId`, expira em 60 minutos e nao representa pagamento autorizado, pago ou capturado. | 🟢 |
| `_reversa_sdd/domain.md#Customer e admin` | Customer lista somente pedidos proprios e admin/manager lista pedidos pendentes em leitura minima, sem acao financeira. | 🟢 |
| `_reversa_sdd/domain.md#Fallback sem banco` | Sem `DATABASE_URL`, checkout/pedido falham de forma segura; em dev/test pode haver fixture explicita. | 🟢 |
| `_reversa_sdd/inventory.md#Checkout e pedidos - superficie tecnica` | O sistema ja possui modulos de checkout e orders, com action/service separados e superficie tecnica preparada para evolucao. | 🟢 |
| `_reversa_sdd/inventory.md#Integracoes externas` | Stripe ainda era tratado como fora do escopo produtivo na Fase 8, servindo aqui como proxima integracao a ser ativada. | 🟡 |
| `_reversa_sdd/dependencies.md#Checkout e pedidos` | O modulo de checkout depende de auth, cart, products, coupons, shipping e orders; a nova fase adiciona o contrato de pagamento e webhook. | 🟡 |
| `_reversa_sdd/dependencies.md#Riscos de dependencia` | Ativar Stripe real exige credenciais, idempotencia externa, webhook e novos testes dedicados. | 🟢 |
| `_reversa_sdd/state-machines.md#Pedido` | O estado atual modela `aguardando_pagamento` e estados futuros de pagamento, envio e conclusao. | 🟢 |
| `_reversa_sdd/state-machines.md#Admin de pedidos` | Admin/manager podem listar pedidos pendentes e ver detalhe basico, mas nao ha transicao para marcar pago ou mutar financeiro. | 🟢 |
| `_reversa_sdd/permissions.md#Matriz de acesso` | Acesso a pedido e checkout continua restrito ao owner, com admin/manager apenas em leitura minima de pedidos pendentes. | 🟢 |

## 3. Personas e cenarios de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Customer autenticado | Pagar um pedido pendente proprio | Abre o pedido `aguardando_pagamento`, inicia o PaymentIntent e conclui o pagamento via Stripe.js/Payment Element. |
| Admin/manager | Consultar situacao financeira minima | Visualiza pedidos pendentes e pagos em leitura, sem marcar pagamento ou alterar valores. |
| Stripe webhook / servico externo | Confirmar ou negar o pagamento | Envia evento assinado que atualiza o status do pagamento e dispara os efeitos finais. |

## 4. Regras de negocio novas ou alteradas

1. **RN-01:** Somente pedido proprio em `aguardando_pagamento` pode iniciar pagamento. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Pedido pendente`
   - Tipo: alterada
2. **RN-02:** Pedido expirado, cancelado, pago ou de outro usuario nao pode iniciar novo pagamento nem reutilizar payment intent anterior. 🟢
   - Origem no legado: `_reversa_sdd/state-machines.md#Pedido`
   - Tipo: alterada
3. **RN-03:** O valor cobrado vem do snapshot server-side do pedido, nunca do payload do cliente. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Guardrails arquiteturais atuais`
   - Tipo: alterada
4. **RN-04:** A confirmacao final do pagamento vem do webhook assinado do Stripe para `payment_intent.succeeded`, com idempotencia por evento. 🟢
   - Origem no legado: `_reversa_sdd/dependencies.md#Riscos de dependencia`
   - Tipo: nova
5. **RN-05:** Estoque e `usedCount` de cupom so sao consumidos imediatamente no processamento atomico do webhook confirmado, nunca na criacao do PaymentIntent nem no retorno client-side. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Pedido pendente`
   - Tipo: alterada
6. **RN-06:** Admin/manager continuam sem permissao para marcar pedido como pago manualmente ou editar valores financeiros. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Customer e admin`
   - Tipo: mantida
7. **RN-07:** Pagamento real via PaymentIntent entra nesta fase, mas Stripe Checkout Session, fiscal, Bling/NF-e, emails transacionais obrigatorios e demais efeitos nao financeiros ficam fora do escopo. 🟢
   - Origem no legado: `_reversa_sdd/state-machines.md#Fluxos ainda inexistentes`
   - Tipo: nova
8. **RN-08:** Retorno client-side do Stripe nunca marca pedido como pago; ele apenas informa estado visual ou aguarda confirmacao do webhook. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Guardrails arquiteturais atuais`
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de aceite | Confidencia |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O sistema deve permitir iniciar o pagamento de um pedido proprio em `aguardando_pagamento`. | Must | Cliente autenticado consegue abrir o fluxo de pagamento a partir do proprio pedido pendente. | 🟢 |
| RF-02 | O sistema deve bloquear inicio de pagamento para pedido expirado, cancelado, pago ou de outro usuario. | Must | A tentativa retorna erro controlado e nao cria nem reusa pagamento. | 🟢 |
| RF-03 | O sistema deve criar e persistir um payment intent interno ligado ao pedido. | Must | O pedido ganha referencia interna, status do pagamento e identificadores do provedor. | 🟢 |
| RF-04 | O sistema deve criar PaymentIntent direto no Stripe com base no snapshot server-side do pedido. | Must | O valor, moeda e referencia usados no Stripe correspondem aos dados persistidos do pedido, sem Checkout Session. | 🟢 |
| RF-05 | O sistema deve permitir que o cliente conclua o pagamento via Stripe.js/Payment Element. | Must | A aplicacao nao coleta cartao em formulario proprio e usa o fluxo client-side autorizado da Stripe. | 🟢 |
| RF-06 | O sistema deve expor o retorno de sucesso, erro ou processamento para a UI de checkout/pagamento sem marcar pedido como pago. | Must | O usuario recebe estado claro, mas a mudanca para pago depende do webhook. | 🟢 |
| RF-07 | O sistema deve aceitar webhook do Stripe com verificacao de assinatura. | Must | Eventos sem assinatura valida ou duplicados nao alteram o estado final duas vezes. | 🟢 |
| RF-08 | O sistema deve tratar `payment_intent.succeeded` como fonte final para marcar pagamento confirmado. | Must | O pedido so muda para pago apos evento confiavel, idempotente e conferido contra pedido, valor e moeda. | 🟢 |
| RF-09 | O sistema deve atualizar o status do payment intent e registrar os eventos recebidos. | Must | Cada evento relevante fica auditavel com providerReference, eventId e resultado do processamento. | 🟢 |
| RF-10 | O sistema deve atualizar estoque somente no webhook confirmado. | Must | Nenhuma baixa ou reserva definitiva ocorre na criacao do PaymentIntent ou retorno client-side. | 🟢 |
| RF-11 | O sistema deve consumir `usedCount` do cupom somente no webhook confirmado. | Must | O cupom aplicado no pedido nao altera contador antes do evento assinado e validado. | 🟢 |
| RF-12 | O sistema deve processar atomicamente pedido pago, pagamento interno pago, baixa de estoque e consumo de cupom. | Must | Sucesso parcial nao deixa estado operacional inconsistente. | 🟢 |
| RF-13 | O sistema deve tratar falhas/cancelamentos correlatos do PaymentIntent sem marcar pedido como pago. | Must | Eventos de falha atualizam pagamento interno de forma segura e mantem efeitos finais bloqueados. | 🟢 |
| RF-14 | O sistema deve impedir que admin marque pedido como pago manualmente. | Must | A interface administrativa continua em leitura minima para pedidos financeiros. | 🟢 |
| RF-15 | O sistema deve permitir tentativa de pagamento de novo apenas quando houver retry valido e o pedido continuar elegivel. | Should | Reenvio nao gera pedidos duplicados nem intentos duplicados para o mesmo pedido ativo. | 🟡 |
| RF-16 | O sistema deve oferecer fallback/mock Stripe em dev e test sem depender de chaves reais ou cartao real. | Should | Testes e ambiente local executam o fluxo sem credenciais produtivas e sem capturar cartao. | 🟢 |
| RF-17 | O sistema deve falhar de forma segura em preview/producao sem Stripe configurado. | Must | Pagamento real nao inicia quando a configuracao necessaria estiver ausente. | 🟢 |
| RF-18 | O sistema deve manter area customer minima para acompanhar o status do proprio pagamento e pedido. | Must | Cliente ve numero/id, status do pedido, status do pagamento, total e timestamps relevantes. | 🟢 |
| RF-19 | O sistema deve manter area admin minima para leitura de pedidos com status financeiro. | Must | Admin/manager ve pedidos pendentes e pagos, mas sem mutacao financeira. | 🟢 |
| RF-20 | O sistema deve registrar logs e trilha de auditoria sem expor secrets, tokens ou payload sensivel. | Must | Registros operacionais permitem diagnostico sem vazar credenciais ou dados de cartao. | 🟢 |

## 6. Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia ou justificativa | Confidencia |
|------|-----------|----------------------------|-------------|
| Seguranca | Verificacao de assinatura do webhook e obrigatoria. | `_reversa_sdd/dependencies.md#Riscos de dependencia` | 🟢 |
| Seguranca | Nao expor segredos, tokens, cookies ou dados de cartao em logs, erros ou payloads. | Guardrails de autenticacao e pagamento | 🟢 |
| Seguranca | A aplicacao nao deve coletar dados de cartao em formulario proprio. | Decisao humana da clarificacao | 🟢 |
| Confiabilidade | Processamento de webhook deve ser idempotente por evento e por pedido. | Stripe pode reenviar eventos e o sistema nao deve duplicar efeitos. | 🟢 |
| Confiabilidade | Falha de pagamento nao pode marcar pedido como pago nem consumir estoque/cupom. | Regra de negocio da fase | 🟢 |
| Confiabilidade | Divergencia de pedido, valor, moeda ou estoque insuficiente no webhook deve gerar erro controlado sem concluir estado inconsistente. | Decisao humana da clarificacao | 🟢 |
| Observabilidade | Cada evento relevante deve gerar trilha consultavel por pedido e payment intent. | Necessidade de auditoria financeira minima | 🟢 |
| Resiliencia | Mock/fallback de Stripe deve existir para dev/test sem mascarar falhas reais em preview/producao. | `_reversa_sdd/domain.md#Fallback sem banco` e riscos de dependencia | 🟢 |
| Integracao | A fase deve funcionar sem dependencias manuais de cartao ou interventao humana no fluxo normal. | Objetivo da fase | 🟢 |
| Performance | O inicio do pagamento e a validacao de webhook devem concluir sem reprocessamento desnecessario. | Fluxo financeiro precisa evitar duplicidade e latencia evitavel | 🟡 |

## 7. Criterios de Aceitação

```gherkin
Cenario: Cliente inicia pagamento de pedido proprio
  Dado um cliente autenticado com pedido proprio em aguardando_pagamento
  Quando inicia o pagamento
  Entao o sistema cria o payment intent interno
  E cria PaymentIntent direto no Stripe com valor snapshotado do pedido
  E registra a referencia do provedor
  E permite conclusao via Stripe.js/Payment Element

Cenario: Pedido invalido nao inicia pagamento
  Dado um pedido expirado, cancelado, pago ou de outro usuario
  Quando o cliente tenta iniciar pagamento
  Entao o sistema bloqueia a operacao
  E nao cria novo payment intent

Cenario: Webhook confirma pagamento
  Dado um payment intent pendente com pedido elegivel
  Quando o Stripe envia evento assinado payment_intent.succeeded
  Entao o sistema marca o pagamento como confirmado
  E marca o pedido como pago
  E baixa estoque
  E consome usedCount do cupom quando houver cupom aplicado
  E registra a trilha do evento

Cenario: Webhook duplicado nao duplica efeitos
  Dado um evento Stripe ja processado com sucesso
  Quando o mesmo evento chega novamente
  Entao o sistema ignora a duplicacao
  E nao desconta estoque duas vezes
  E nao consome cupom duas vezes

Cenario: Falha de pagamento nao finaliza pedido
  Dado um payment intent ativo
  Quando o Stripe informa falha, cancelamento ou expiracao
  Entao o pedido permanece sem pagamento confirmado
  E estoque e cupom nao sao consumidos

Cenario: Admin consulta pedidos sem mutacao financeira
  Dado um usuario admin ou manager
  Quando acessa a area minima de pedidos
  Entao ve pedidos com status financeiro
  E nao consegue marcar pedido como pago

Cenario: Retorno client-side nao marca pagamento
  Dado um cliente que concluiu o fluxo visual do Stripe
  Quando a UI recebe retorno de sucesso ou processamento
  Entao o sistema nao marca o pedido como pago por esse retorno
  E aguarda o webhook assinado

Cenario: Webhook divergente nao conclui estado financeiro
  Dado um webhook assinado com pedido, valor, moeda ou estoque divergente
  Quando o sistema processa o evento
  Entao registra erro controlado
  E nao conclui pedido como pago
  E nao baixa estoque nem consome cupom
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-08 | Must | Sem eles nao existe fluxo de pagamento seguro nem confirmacao confiavel. |
| RF-09 a RF-14 | Must | Sem auditoria, idempotencia, atomicidade e bloqueios administrativos o fluxo fica inconsistente. |
| RF-15 | Should | Melhora retry e resiliencia sem ampliar escopo do pedido. |
| RF-16 | Should | Suporta desenvolvimento e testes sem risco operacional. |
| RF-17 a RF-20 | Must | Mantem falha segura, leitura minima, rastreabilidade e protecao de dados. |

## 9. Esclarecimentos

### Sessao 2026-06-10

- **Q:** Como o pagamento deve ser iniciado?
  **R:** A Fase 9 deve usar PaymentIntent direto criado pelo servidor para pedido pendente `aguardando_pagamento`, com cliente autenticado. O cliente usa Stripe.js/Payment Element para concluir o pagamento. Stripe Checkout Session nao entra como fluxo principal, cartao nao e coletado em formulario proprio, o valor financeiro nao vem do client, dev/test usam adapter/mock explicito e preview/producao sem Stripe configurado falham de forma segura.
- **Q:** Quais eventos Stripe devem fechar o ciclo financeiro como fonte final?
  **R:** O evento principal e `payment_intent.succeeded`, recebido por webhook Stripe validado por assinatura e processado com idempotencia. Retorno client-side nao marca pedido como pago. Falhas/cancelamentos correlatos atualizam o pagamento interno com seguranca, sem marcar pedido como pago. Webhook duplicado, fora de ordem ou com valor divergente deve ser tratado de forma controlada.
- **Q:** Quando estoque e `usedCount` do cupom devem ser consumidos?
  **R:** Estoque e `usedCount` devem ser consumidos imediatamente no webhook Stripe valido, assinado, idempotente e conferido contra pedido, valor e moeda. A operacao deve ser atomica: marcar pedido como pago, marcar pagamento interno como pago, baixar estoque e consumir `usedCount`. Criacao do PaymentIntent e retorno client-side nao baixam estoque nem consomem cupom. Admin nao pode marcar como pago manualmente. Bling/NF-e, fiscal e emails transacionais obrigatorios seguem fora desta fase.

## 10. Lacunas

Nenhuma lacuna aberta apos a sessao de clarificacao de 2026-06-10.

## 11. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Versao inicial gerada por `/reversa-requirements` | reversa |
| 2026-06-10 | Duvidas resolvidas por `/reversa-clarify` com decisoes humanas | reversa |
