# Doubts: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`
> Status: duvidas resolvidas nesta sessao de `/reversa-clarify`

## Resumo

As tres lacunas iniciais de `requirements.md` foram resolvidas por decisao humana. Nao restaram marcadores de duvida no requirements.

## Decisoes aplicadas

### D001 - Provider e ambiente

**Decisao:** usar adapter neutro de e-mail com mock explicito em dev/test.

**Regras:**

- Provider real como Resend, SMTP ou outro fica configuravel por interface/adapters.
- Nenhum provider real e obrigatorio para build/test/e2e.
- Dev/test usam mock explicito sem credenciais reais.
- Preview/producao sem credenciais falham de forma segura para envio real, sem quebrar pagamento confirmado.
- `.env.example` pode listar variaveis esperadas sem valores reais.
- Secrets de e-mail, tokens, SMTP password e API keys nao podem aparecer em codigo, docs, logs ou templates.

### D002 - Entrega operacional e outbox

**Decisao:** usar padrao outbox/registro de notificacoes com idempotencia por evento/pedido/tipo/destinatario.

**Regras:**

- Apos pagamento confirmado, criar registros para cliente e admin/gestores.
- Registro minimo: tipo, destinatario, status, provider/adaptador, `orderId`, `userId` quando aplicavel, idempotency key, timestamps e erro seguro.
- Processamento pode ser sincrono-controlado na Fase 10.
- Worker/fila real persistente nao e obrigatorio nesta fase.
- Retry automatico completo fica fora, mas o modelo deve preparar status para retry futuro.
- Falha de envio nao desfaz pagamento confirmado, baixa de estoque ou consumo de `usedCount`.
- Webhook duplicado nao gera notificacoes duplicadas.
- Retorno client-side nao dispara notificacao de pedido pago.

### D003 - Destinatarios admin/gestores

**Decisao:** destinatarios internos devem ser configuraveis por variavel de ambiente ou configuracao interna segura.

**Regras:**

- Placeholder permitido: `ORDER_NOTIFICATION_RECIPIENTS=`.
- Nao hardcodar e-mails reais como default obrigatorio.
- Sem destinatario configurado, registrar aviso/estado controlado e nao quebrar pagamento.
- Admin/manager continuam podendo visualizar pedidos pagos no painel ja existente.

### D004 - Templates MVP

**Decisao:** dois templates minimos entram na fase.

**Templates:**

- Cliente: pedido pago.
- Interno/admin: novo pedido pago.

**Conteudo permitido:**

- Numero/id do pedido.
- Status.
- Total.
- Itens resumidos.
- Frete resumido.
- Endereco snapshotado resumido.
- Mensagem de que a loja dara sequencia ao processamento.

**Conteudo proibido:**

- Dados de cartao.
- Secrets.
- Tokens.
- Payload Stripe bruto.
- Informacoes fiscais sensiveis.
- Dados fora do snapshot seguro do pedido.
- Links com tokens sensiveis.

### D005 - Customer, admin e painel

**Decisao:** historico completo de notificacoes para customer e reenvio manual admin ficam fora.

**Regras:**

- Customer continua vendo status do pedido na area de pedidos.
- Nao criar tela de historico de notificacoes para customer.
- Admin/manager podem visualizar status basico de notificacoes se o plano mantiver escopo pequeno.
- Admin nao reenviara e-mail nesta fase.
- Central de notificacoes, filtros avancados e retry ficam fora.

### D006 - Canais externos

**Decisao:** WhatsApp e SMS ficam totalmente fora da Fase 10.

**Regras:**

- Nao integrar WhatsApp.
- Nao integrar SMS.
- Nao exigir credenciais desses canais.
- Pode documentar como fase futura.

### D007 - Fiscal

**Decisao:** Bling/NF-e/documentos fiscais/emissao fiscal ficam totalmente fora.

**Regras:**

- Nao integrar Bling.
- Nao emitir NF-e.
- Nao criar documento fiscal real.
- Nao exigir credenciais fiscais.
- Nao bloquear notificacao ou pedido pago por ausencia fiscal.
- Pode preparar evento interno futuro sem integracao real.

### D008 - Relacao com pagamento, estoque e cupom

**Decisao:** Fase 10 nao altera regras financeiras/operacionais da Fase 9.

**Regras:**

- Pedido so e considerado pago apos webhook Stripe valido/idempotente.
- Estoque e `usedCount` continuam consumidos conforme Fase 9.
- Notificacao ocorre depois da confirmacao financeira e dos efeitos da Fase 9.
- Notificacao nao altera status financeiro, estoque ou `usedCount`.
- Falha de notificacao nao reverte pagamento.

## Duvidas remanescentes

Nenhuma.
