# Requirements: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`
> Pasta da extracao reversa: `_reversa_sdd/`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DOUBT

## 1. Objetivo

Preparar a Fase 10 para enviar notificacoes/e-mails transacionais apos pagamento confirmado, com registro auditavel de tentativas, sucesso e falha, idempotencia contra webhook duplicado e fallback/mock seguro em dev/test. A feature deve notificar cliente e admin/gestores sobre pedido pago sem alterar as regras financeiras da Fase 9, sem integrar Bling/NF-e/fiscal e sem exigir credenciais reais em build/test/e2e.

## 2. Contexto

| Fonte | Trecho relevante | Confidencia |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Payments` | `payment_intent.succeeded` e a fonte final para pagamento confirmado; settlement confere pedido, valor, moeda e estoque antes de mutar estado operacional. | 🟢 |
| `_reversa_sdd/domain.md#Settlement financeiro e operacional` | Settlement marca pagamento/pedido como pago, baixa estoque, consome cupom e registra evento processado. | 🟢 |
| `_reversa_sdd/domain.md#Regras fora do escopo` | E-mail transacional real obrigatorio, Bling, NF-e e fiscal estavam fora da Fase 9. | 🟢 |
| `_reversa_sdd/data-dictionary.md#payment_events` | Eventos de webhook possuem `event_id`, status de processamento e relacao com pedido/pagamento. | 🟢 |
| `_reversa_sdd/permissions.md#Checkout, pedido e pagamento` | Payment Element nao marca pago; webhook e a unica entrada que liquida pagamento; admin nao faz mutacao financeira. | 🟢 |
| `_reversa_sdd/dependencies.md#Riscos de dependencia` | Replays de webhook nao podem duplicar efeitos e credenciais reais devem ficar fora do repositorio. | 🟢 |

## 3. Escopo

- Criar um subdominio de notificacoes transacionais pos-pagamento.
- Emitir ou registrar evento interno de `order_paid` apos settlement confirmado.
- Enviar ou simular e-mail para cliente quando pedido vira `pago`.
- Enviar ou simular e-mail interno para admin/gestores quando pedido vira `pago`.
- Registrar tentativas, sucesso, falha, provider, destinatario, tipo, erro seguro, timestamps, `orderId`, `userId` e chave de idempotencia.
- Garantir que webhook duplicado nao gere e-mail duplicado.
- Definir contrato de adapter neutro de e-mail com mock/dev/test explicito.
- Preparar provider real configuravel por adapter futuro, sem tornar Resend/SMTP obrigatorios.
- Definir dois templates minimos: pedido pago para cliente e novo pedido pago para admin/gestores.
- Definir outbox/registro de notificacoes com idempotencia por pedido, evento, tipo e destinatario.
- Permitir exibicao admin simples de status de notificacao, sem central completa e sem reenvio manual.
- Preparar eventos internos para futuras integracoes fiscais sem executar fiscal/Bling/NF-e.

## 4. Fora de escopo

- Integracao Bling.
- Emissao de NF-e.
- Criacao de documento fiscal real.
- Fiscalizacao, contabilidade, DANFE ou XML.
- WhatsApp e SMS sem decisao humana explicita.
- Dados de cartao, payload Stripe bruto, secrets, tokens ou credenciais em e-mails, templates ou logs.
- Regras novas de pagamento, estoque ou cupom.
- Retentativa automatica completa.
- Reenvio manual por admin.
- Historico completo de notificacoes para customer.
- Central completa de notificacoes internas no painel.
- Envio real obrigatorio em build/test/e2e.
- Deploy, push, migracao em banco real ou conexao a banco de producao.

## 5. Requisitos funcionais

| ID | Requisito | Prioridade | Criterio de aceite | Confidencia |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Gerar evento interno de pedido pago apos settlement confirmado por webhook Stripe valido. | Must | `payment_intent.succeeded` processado uma vez produz evento/notificacao de `order_paid`. | 🟢 |
| RF-02 | Enviar ou simular e-mail de pedido pago para o cliente usando adapter neutro seguro. | Must | Cliente recebe ou teria registro mock de e-mail com numero do pedido, status, total, itens, frete e endereco resumido. | 🟢 |
| RF-03 | Enviar ou simular e-mail interno para admin/gestores sobre novo pedido pago. | Must | Destinatarios configurados recebem ou teriam registro mock com resumo operacional do pedido pago; ausencia de destinatario gera estado controlado. | 🟢 |
| RF-04 | Registrar cada tentativa de notificacao. | Must | Registro contem tipo, destinatario, status, provider, erro seguro, timestamps, `orderId`, `userId` e idempotency key. | 🟢 |
| RF-05 | Evitar notificacao duplicada em webhook duplicado ou reprocessamento. | Must | Mesmo pedido/evento/tipo/destinatario nao gera segundo envio efetivo. | 🟢 |
| RF-06 | Permitir fallback/mock em dev/test sem credenciais reais. | Must | Testes rodam sem provider real e registram envio simulado explicitamente. | 🟢 |
| RF-07 | Expor status administrativo basico de notificacoes, se couber no admin minimo. | Should | Admin/manager visualiza tentativas/status basicos sem secrets, payload bruto, filtros avancados ou reenvio. | 🟢 |
| RF-08 | Preparar evento interno para futuras integracoes fiscais. | Should | Evento/registro possui contrato claro para futuro fiscal, mas nao chama Bling/NF-e nem cria documento fiscal. | 🟢 |

## 6. Requisitos nao funcionais

| Tipo | Requisito | Evidencia ou justificativa | Confidencia |
|------|-----------|----------------------------|-------------|
| Seguranca | Secrets de e-mail, Stripe, banco, tokens e cookies nunca aparecem em docs, logs, templates ou respostas client. | Herdado dos guardrails da Fase 9 e do pedido do usuario. | 🟢 |
| Privacidade | Corpo e assunto nao incluem dados de cartao, payload Stripe bruto, public token, tokens internos ou informacoes fiscais sensiveis. | `_reversa_sdd/domain.md#Pagamento Stripe` confirma ausencia de dados sensiveis de cartao no app. | 🟢 |
| Resiliencia | Falha de e-mail nao desfaz pagamento, baixa de estoque, consumo de cupom ou status `pago`. | Settlement financeiro ja e fonte de verdade e deve permanecer intacto. | 🟢 |
| Observabilidade | Toda tentativa de notificacao deve ser auditavel com erro sanitizado. | Necessidade operacional nova da Fase 10. | 🟢 |
| Testabilidade | Build, unit, integration e e2e nao exigem credenciais reais de e-mail. | Mesmo padrao de mock/fallback usado em pagamentos. | 🟢 |
| Idempotencia | Envio efetivo deve ser protegido por chave unica derivada de pedido/evento/tipo/destinatario. | Replays de webhook ja sao risco documentado em `_reversa_sdd/dependencies.md#Riscos de dependencia`. | 🟢 |

## 7. Regras de negocio herdadas

1. **RN-H01:** Pedido e marcado como `pago` somente por webhook Stripe valido e idempotente. 🟢
2. **RN-H02:** Baixa de estoque e consumo de `usedCount` ocorrem somente apos webhook confirmado. 🟢
3. **RN-H03:** Webhook duplicado nao duplica efeitos financeiros, operacionais ou de cupom. 🟢
4. **RN-H04:** Customer acessa apenas recursos e pedidos proprios. 🟢
5. **RN-H05:** Admin/manager visualizam pedidos, mas nao marcam pedido como pago manualmente. 🟢
6. **RN-H06:** Valores financeiros ficam em centavos e derivam do servidor. 🟢
7. **RN-H07:** Pedido possui snapshots de itens, preco, cupom, frete, endereco e total. 🟢
8. **RN-H08:** PaymentIntent e eventos de webhook possuem registros internos. 🟢
9. **RN-H09:** Build/test/e2e nao devem exigir credenciais reais. 🟢

## 8. Requisitos de seguranca

1. **RS-01:** Nenhum segredo real deve ser lido de arquivos `.env` para documentacao, logs ou fixtures. 🟢
2. **RS-02:** Exemplos devem usar nomes de variaveis ou placeholders, nunca valores reais. 🟢
3. **RS-03:** Erros do provider de e-mail devem ser sanitizados antes de persistir/exibir. 🟡
4. **RS-04:** Templates nao devem conter dados de cartao, client secret, webhook secret, Stripe payload bruto, cookies, tokens, senhas ou `DATABASE_URL`. 🟢
5. **RS-05:** Historico admin de notificacoes deve ser protegido por `requireAdminLike`. 🟢
6. **RS-06:** Historico completo de notificacoes para customer fica fora da Fase 10; customer continua vendo status do pedido na area de pedidos. 🟢

## 9. Requisitos de banco

- Deve ser criada ou planejada uma tabela/estrutura de outbox de notificacoes, por exemplo `notification_deliveries`.
- Campos minimos esperados: `id`, `type`, `channel`, `recipient`, `recipient_role`, `order_id`, `user_id`, `payment_event_id`, `provider`, `provider_message_id`, `idempotency_key`, `status`, `attempt_count`, `last_error`, `sent_at`, `failed_at`, `created_at`, `updated_at`.
- Deve existir restricao unica ou mecanismo equivalente para idempotencia por `idempotency_key`.
- Qualquer migration deve ser gerada localmente e nao aplicada a banco real sem validacao humana explicita.
- Registros nao devem armazenar corpo completo com dados sensiveis quando um resumo seguro for suficiente.

## 10. Requisitos de eventos/notificacoes

- O evento principal da fase e `order_paid`.
- A origem do evento deve ser somente a confirmacao financeira ja validada/idempotente no settlement de `payment_intent.succeeded`, nunca o retorno client-side.
- Falhas/cancelamentos do PaymentIntent nao enviam e-mail de pedido pago.
- Webhook duplicado deve produzir no maximo um registro de notificacao efetivamente enviado por `orderId + eventType + recipient`.
- Evento interno deve ser preparado para futura fiscalizacao, mas sem chamar Bling/NF-e.
- Falha de notificacao deve ser registrada, mas nao deve propagar rollback para pagamento confirmado, baixa de estoque ou consumo de `usedCount`.

## 11. Requisitos de e-mail

- E-mail do cliente deve usar o e-mail snapshotado ou associado ao pedido, sem aceitar destinatario vindo do client.
- E-mail interno deve usar destinatarios admin/gestores configuraveis por variavel de ambiente ou configuracao interna segura.
- `.env.example` pode listar placeholder como `ORDER_NOTIFICATION_RECIPIENTS=`, sem valor real.
- Nenhum e-mail pessoal/real deve ser hardcoded como default obrigatorio no codigo.
- Sem destinatario admin configurado, o sistema deve registrar aviso/estado controlado e nao quebrar o fluxo de pagamento.
- O assunto deve ser claro e sem dados sensiveis.
- O corpo deve conter apenas resumo operacional necessario.
- O envio real deve depender de provider configurado; em dev/test deve haver mock explicito.
- Ausencia de credenciais em preview/producao deve falhar de forma segura para envio real ou registrar pendencia controlada, sem fingir envio real e sem quebrar pagamento confirmado.

## 12. Requisitos de templates

### Template cliente: pedido pago

Conteudo minimo:

- Numero/id do pedido.
- Status `pago`.
- Total em BRL.
- Itens resumidos com nome, quantidade e subtotal.
- Frete resumido com metodo/prazo/valor.
- Endereco snapshotado resumido.
- Mensagem de continuidade: a loja dara sequencia ao processamento do pedido.
- Canal de suporte basico, se ja existir no projeto.

### Template admin/gestor: novo pedido pago

Conteudo minimo:

- Numero/id do pedido.
- Cliente resumido.
- Total em BRL.
- Itens resumidos.
- Frete resumido.
- Endereco snapshotado resumido.
- Alerta operacional de novo pedido pago para preparacao futura.

### Dados proibidos nos templates

- Dados de cartao.
- Secrets e tokens.
- Client secret ou webhook secret.
- Payload Stripe bruto.
- `DATABASE_URL`.
- Cookies/sessoes.
- Informacoes fiscais sensiveis ainda nao tratadas.

## 13. Requisitos de idempotencia

- Chave de idempotencia deve ser deterministica, por exemplo `order_paid:<orderId>:<eventType>:<notificationType>:<recipient>`.
- A mesma chave nao pode produzir dois envios efetivos.
- Reprocessamento de webhook duplicado deve retornar/registrar duplicidade sem novo envio.
- Retry automatico completo fica fora da Fase 10, mas o modelo deve preparar status/tentativas para retry futuro usando a mesma identidade logica.
- Idempotencia de notificacao nao substitui idempotencia financeira; ambas devem coexistir.

## 14. Requisitos de provider/adapters

- Deve haver interface de adapter neutro de e-mail.
- O adapter deve suportar ao menos `sendTransactionalEmail(input)`.
- O retorno deve indicar `sent`, `mocked`, `failed` ou equivalente.
- Provider real inicial deve ser configuravel por adapter, com Resend/SMTP/outros tratados como futuros ou opcionais; nenhum deles e dependencia obrigatoria rigida para build/test/e2e.
- Adapter mock deve ser usado em dev/test sem credenciais.
- Secrets do provider devem ficar apenas server-side.
- `.env.example` pode listar variaveis esperadas sem valores reais.

## 15. Requisitos de fallback/mock

- Dev/test sem credenciais deve registrar envio mock explicito.
- Build/e2e nao podem depender de rede externa ou credenciais reais.
- Preview/producao sem credenciais nao devem fingir envio real.
- Falha de provider deve ser registrada como falha segura e nao quebrar pagamento.
- Mock nao deve ser confundido com envio real em mensagens, logs ou admin.

## 16. Requisitos de customer/admin

- Customer deve receber ou ter e-mail mock de pedido pago para pedido proprio.
- Customer nao pode acessar notificacoes de outro pedido/usuario.
- Admin/manager deve receber ou ter e-mail mock interno de novo pedido pago, conforme destinatarios definidos.
- Customer continua vendo status do pedido na area de pedidos; nao ha tela de historico de notificacoes para customer nesta fase.
- Admin/manager pode visualizar status basico de envio/notificacao se isso nao ampliar demais o escopo.
- Central de notificacoes, filtros avancados e acoes de retry ficam fora desta fase.
- Admin nao pode marcar notificacao como enviada sem registro/idempotencia.
- Admin nao deve reenviar e-mail nesta fase.

## 17. Requisitos de logs/auditoria

- Registrar tentativa antes ou durante o envio de forma recuperavel.
- Registrar sucesso com provider e identificador externo quando existir.
- Registrar falha com erro sanitizado.
- Registrar timestamps de criacao, tentativa, sucesso e falha.
- Nao persistir payload bruto Stripe nem corpo completo se contiver dados sensiveis.
- Logs de aplicacao devem evitar destinatarios completos quando nao necessario; mascaramento e desejavel.

## 18. Criterios de aceite

```gherkin
Cenario: Pagamento confirmado gera notificacoes
  Dado um pedido aguardando pagamento com PaymentIntent valido
  Quando o webhook payment_intent.succeeded for processado com sucesso
  Entao o pedido permanece pago
  E uma notificacao de pedido pago para cliente e registrada/enviada
  E uma notificacao interna para admin/gestores e registrada/enviada

Cenario: Webhook duplicado nao duplica e-mail
  Dado um evento payment_intent.succeeded ja processado
  Quando o mesmo evento ou a mesma chave de notificacao for processada novamente
  Entao nenhum segundo envio efetivo e produzido
  E o historico indica duplicidade ou envio ja existente

Cenario: Falha de e-mail nao desfaz pagamento
  Dado um pedido pago por webhook valido
  Quando o provider de e-mail falhar
  Entao o pedido continua pago
  E estoque e cupom permanecem liquidados
  E a falha de notificacao e registrada com erro seguro

Cenario: Ambiente de teste sem credenciais
  Dado ambiente dev/test sem credenciais reais de e-mail
  Quando uma notificacao transacional for disparada
  Entao o adapter mock registra envio simulado
  E nenhum e-mail real e enviado

Cenario: Dados sensiveis nao aparecem
  Dado um pedido pago
  Quando templates e registros de notificacao forem gerados
  Entao dados de cartao, secrets, tokens, payload Stripe bruto e DATABASE_URL nao aparecem
```

## 19. Cenarios de teste

- Unit: adapter mock retorna envio simulado sem rede.
- Unit: adapter real ausente em dev/test usa mock explicito.
- Unit: preview/producao sem provider configurado falha de forma segura.
- Unit: idempotency key bloqueia envio duplicado.
- Unit: falha do provider persiste erro sanitizado.
- Unit: templates nao incluem dados proibidos.
- Unit: notificacao de cliente usa snapshot/dados server-side, nao payload client.
- Integration: settlement confirmado dispara evento de notificacao apos pedido pago.
- Integration: webhook duplicado nao duplica notificacao.
- Integration: falha de notificacao nao reverte pedido/pagamento/estoque/cupom.
- E2E: fluxo mock confirma pagamento e registra/mostra notificacao mock quando houver UI/admin.
- E2E: admin sem autenticacao continua bloqueado.
- Validacoes obrigatorias futuras: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.

## 20. Gaps e duvidas

Nenhuma lacuna aberta apos a sessao de clarificacao de 2026-06-10. As decisoes humanas foram incorporadas nas secoes de escopo, fora de escopo, provider/adapters, fallback/mock, eventos, templates, idempotencia, customer/admin e auditoria.

## 21. Glossario minimo

| Termo | Definicao |
| --- | --- |
| Notificacao transacional | Comunicacao gerada por evento operacional, como pedido pago. |
| Adapter de e-mail | Interface interna que isola provider real ou mock. |
| Provider de e-mail | Servico externo ou mecanismo SMTP usado para envio real. |
| Mock de e-mail | Implementacao que simula envio em dev/test sem rede ou credenciais reais. |
| Outbox | Registro persistente de mensagens pendentes/enviadas/falhas para entrega confiavel. |
| Idempotency key | Chave deterministica que impede envio duplicado da mesma notificacao. |
| `order_paid` | Evento interno proposto apos settlement confirmado. |
| Settlement | Confirmacao atomica de pedido, pagamento, estoque e cupom apos webhook valido. |

## 22. Esclarecimentos

### Sessao 2026-06-10

- **Q:** Qual provider/ambiente deve orientar a Fase 10?
  **R:** Usar arquitetura com adapter neutro de e-mail e mock explicito para dev/test. Resend, SMTP ou outros providers podem ser preparados por interface/adapters, mas nao sao obrigatorios para build/test/e2e. Preview/producao sem credenciais devem falhar de forma segura para envio real, sem quebrar pagamento confirmado. `.env.example` pode listar variaveis esperadas sem valores reais.

- **Q:** Como deve funcionar a entrega operacional e a relacao com o webhook Stripe?
  **R:** Usar padrao outbox/registro de notificacoes com idempotencia por `orderId + eventType + recipient`. Apos pagamento confirmado pelo webhook valido/idempotente da Fase 9, criar registros para cliente e admin/gestores. O processamento pode ser sincrono-controlado nesta fase, desde que registre tentativa/sucesso/falha e nao bloqueie pagamento, estoque ou cupom. Retry automatico completo fica fora, mas o modelo deve preparar status para retry futuro.

- **Q:** Quem recebe notificacao interna?
  **R:** Destinatarios admin/gestores devem ser configuraveis por variavel de ambiente ou configuracao interna segura, sem hardcode de e-mails reais. `ORDER_NOTIFICATION_RECIPIENTS=` pode aparecer como placeholder em `.env.example`. Sem destinatario configurado, registrar aviso/estado controlado e nao quebrar fluxo de pagamento.

- **Q:** Quais templates entram no MVP?
  **R:** Dois templates: e-mail para cliente de pedido pago e e-mail interno/admin de novo pedido pago. Conteudo minimo: numero/id do pedido, status, total, itens resumidos, frete resumido, endereco snapshotado resumido e mensagem de continuidade operacional da loja. Dados de cartao, secrets, tokens, payload Stripe bruto, informacoes fiscais sensiveis, dados fora do snapshot seguro e links com tokens sensiveis sao proibidos.

- **Q:** Quais canais e interfaces ficam fora ou limitados?
  **R:** Historico completo de notificacoes para customer fica fora; customer continua vendo status do pedido. Reenvio manual pelo admin fica fora. Admin/manager podem visualizar status basico de notificacoes se nao ampliar demais o escopo, mas central completa, filtros avancados e retry ficam fora. WhatsApp e SMS ficam totalmente fora.

- **Q:** Bling/NF-e/fiscal entram nesta fase?
  **R:** Nao. Bling, NF-e, documentos fiscais e emissao fiscal ficam totalmente fora. A fase pode preparar evento interno futuro, mas sem integracao real, credenciais fiscais, emissao ou bloqueio do pedido/notificacao por ausencia fiscal.

- **Q:** A Fase 10 altera pagamento, estoque ou cupom?
  **R:** Nao. Pedido so e pago apos webhook Stripe valido/idempotente; estoque e `usedCount` seguem a Fase 9. Notificacao ocorre depois da confirmacao financeira e dos efeitos de negocio, nao altera status financeiro, estoque ou cupom, e falha de notificacao nao reverte pagamento.

## 23. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Versao inicial gerada por `/reversa-requirements` | reversa |
