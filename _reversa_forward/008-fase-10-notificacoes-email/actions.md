# Actions - Fase 10: Notificações e e-mail pós-pagamento

## Objetivo

Decompor o plano técnico aprovado em ações atômicas e rastreáveis para implementar notificações pós-pagamento com outbox idempotente, templates seguros e adapter de e-mail neutro, sem alterar as regras financeiras, de estoque ou de cupom estabelecidas na Fase 9.

## Guardrails de execução

- Trabalhar somente em `D:\Projetos\triade-essenza-next`.
- O legado `D:\Projetos\triadeessenzaparfum.com.br` e seu `_reversa_sdd/` são somente referência.
- Não copiar `.env`, credenciais, tokens, payload Stripe bruto ou dados de cartão.
- Não aplicar migrations em banco real.
- Não exigir provider real para lint, typecheck, testes, build ou E2E.
- Não permitir mock de envio em preview ou produção.
- Notificação ocorre somente depois da liquidação válida e idempotente da Fase 9.
- Falha de notificação não reverte pagamento, estoque ou `usedCount`.
- Não implementar retry automático, worker persistente, reenvio admin ou histórico customer.
- WhatsApp, SMS, Bling, NF-e e fiscal permanecem fora do escopo.
- Não fazer push ou deploy durante `/reversa-coding`.

## Legenda

- **Tipo:** `config`, `code`, `test`, `docs` ou `validation`.
- **Paralelismo:** `[//]` indica execução paralela segura após as dependências; `[SEQ]` exige sequência.
- **Risco:** `baixo`, `médio` ou `alto`.
- **Status:** `[ ]` pendente; `[X]` concluída.

## 1. Preparação e segurança

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-001 | Executar checkpoint pré-coding | Confirmar diretório, branch, alterações pendentes e ausência de mudança funcional inesperada antes de editar código. | Git; `.reversa/active-requirements.json`; diretório da feature | Nenhuma | validation | [SEQ] | Diretório Next confirmado; legado excluído; status Git registrado; somente artefatos Reversa da Fase 10 estão pendentes. | baixo | [X] |
| F10-002 | Registrar guardrails da execução | Fixar no progresso da feature as proibições de secrets, banco real, envio real obrigatório, push e deploy. | `_reversa_forward/008-fase-10-notificacoes-email/progress.jsonl` | F10-001 | docs | [//] | Primeiro registro de progresso contém os guardrails e o escopo aprovado. | baixo | [X] |
| F10-003 | Mapear a superfície técnica real | Localizar schema, repositories, settlement Stripe, páginas de pedidos, configuração e padrões de testes atuais. | `src/db/**`; `src/features/payments/**`; `src/features/orders/**`; `src/app/**`; `tests/**` | F10-001 | code | [SEQ] | Mapa de arquivos confirma os pontos de integração sem modificar o comportamento existente. | baixo | [X] |
| F10-004 | Auditar infraestrutura de e-mail existente | Verificar dependências, helpers e variáveis já existentes para evitar duplicação ou provider rígido. | `package.json`; `pnpm-lock.yaml`; `.env.example`; `src/**` | F10-003 | config | [SEQ] | Decisão de reutilização ou criação está registrada e não introduz dependência obrigatória desnecessária. | baixo | [X] |
| F10-005 | Fechar mapa de implementação | Definir arquivos novos e alterados, preservando ownership entre notifications, payments, orders e UI. | Artefatos da Fase 10; mapa da F10-003 | F10-003, F10-004 | docs | [SEQ] | A ordem de edição e os limites de cada módulo estão claros antes de alterar arquivos críticos. | baixo | [X] |

## 2. Configuração e ambiente

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-006 | Declarar variáveis esperadas | Adicionar placeholders sem valores reais para modo/provider e destinatários internos. | `.env.example` | F10-005 | config | [SEQ] | `ORDER_NOTIFICATION_RECIPIENTS` e variáveis equivalentes estão descritas sem e-mails ou secrets reais. | baixo | [X] |
| F10-007 | Criar configuração segura de notificações | Centralizar leitura de ambiente e defaults seguros sem tornar credenciais obrigatórias. | `src/features/notifications/config.ts`; schemas de env existentes | F10-006 | code | [SEQ] | Dev/test selecionam mock explícito; ausência de provider real não quebra build/test/E2E. | médio | [X] |
| F10-008 | Normalizar destinatários admin | Interpretar lista configurável, remover vazios/duplicados e validar endereços sem hardcode. | `src/features/notifications/config.ts`; `src/features/notifications/recipients.ts` | F10-007 | code | [SEQ] | Lista válida e deduplicada é retornada; configuração ausente produz resultado controlado. | baixo | [X] |
| F10-009 | Bloquear mock fora de dev/test | Impedir que o adapter mock represente envio real em preview ou produção. | `src/features/notifications/config.ts`; `src/features/notifications/providers/**` | F10-007 | code | [SEQ] | Preview/produção sem provider configurado usam falha segura, nunca sucesso simulado. | alto | [X] |
| F10-010 | Documentar política de configuração | Registrar seleção de adapter, ausência segura de credenciais e destinatários configuráveis. | `docs/operations/env.md` | F10-006 | docs | [//] | Documentação não contém valores reais e afirma que credenciais não são necessárias nas validações locais. | baixo | [X] |

## 3. Schema e migration local

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-011 | Confirmar delta de persistência | Confrontar `data-delta.md` com o schema atual e fechar nomes, tipos e relacionamentos da outbox. | `src/db/schema.ts`; `data-delta.md`; interfaces da feature | F10-005 | code | [SEQ] | Estrutura final cobre pedido, usuário opcional, evento, destinatário, provider, status, idempotência, timestamps e erro seguro. | médio | [X] |
| F10-012 | Modelar notification deliveries | Adicionar tabela e enums equivalentes para os registros de notificação. | `src/db/schema.ts` | F10-011 | code | [SEQ] | Schema representa `pending`, `sending`, `sent`, `mocked`, `failed` e `skipped`; duplicidade e resultado idempotente, não estado persistido. | alto | [X] |
| F10-013 | Criar constraints e índices | Garantir unicidade da chave idempotente e consultas eficientes por pedido/status. | `src/db/schema.ts` | F10-012 | code | [SEQ] | Constraint única impede duplicidade e índices suportam lookup por pedido, status e criação. | alto | [X] |
| F10-014 | Gerar migration local | Gerar migration Drizzle a partir do schema aprovado, sem aplicar em banco. | `drizzle/*.sql`; metadados Drizzle | F10-013 | code | [SEQ] | Nova migration local é gerada e nenhuma conexão ou aplicação em banco real ocorre. | alto | [X] |
| F10-015 | Revisar migration gerada | Inspecionar SQL, constraints e ausência de operações destrutivas não planejadas. | Nova migration em `drizzle/`; `src/db/schema.ts` | F10-014 | validation | [SEQ] | SQL corresponde ao delta, não contém secrets e não altera tabelas financeiras fora do necessário. | alto | [X] |

## 4. Domínio de notificações

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-016 | Definir tipos de domínio | Criar tipos para eventos, notificações, status, recipients e resultados de entrega. | `src/features/notifications/types.ts` | F10-005 | code | [SEQ] | Tipos incluem `customer_order_paid` e `admin_order_paid` e não aceitam dados sensíveis de cartão. | médio | [X] |
| F10-017 | Definir schemas de validação | Validar comandos de criação/processamento e limites dos campos persistidos. | `src/features/notifications/schemas.ts`; `types.ts` | F10-016 | code | [SEQ] | Entradas inválidas são rejeitadas com mensagens seguras e sem ecoar conteúdo sensível. | médio | [X] |
| F10-018 | Implementar chave idempotente | Produzir chave determinística por pedido, evento, tipo e destinatário normalizado. | `src/features/notifications/idempotency.ts` | F10-016, F10-008 | code | [SEQ] | Mesma combinação gera a mesma chave; destinatários ou eventos diferentes geram chaves distintas. | alto | [X] |
| F10-019 | Formalizar transições de status | Restringir mudanças válidas entre estados da outbox e preparar tentativas futuras. | `src/features/notifications/status.ts`; `types.ts` | F10-016 | code | [SEQ] | Transições inválidas são bloqueadas e `attemptCount` pode evoluir sem retry automático nesta fase. | médio | [X] |
| F10-020 | Sanitizar erros de entrega | Converter falhas técnicas em código/mensagem segura para persistência e logs. | `src/features/notifications/errors.ts` | F10-016 | code | [SEQ] | Erro persistido não contém API key, senha SMTP, token, payload Stripe ou stack sensível. | alto | [X] |
| F10-021 | Validar destinatários de domínio | Aplicar normalização final e distinguir destinatário inválido de configuração ausente. | `src/features/notifications/recipients.ts`; `schemas.ts` | F10-008, F10-017 | code | [SEQ] | Cliente inválido falha de modo controlado; ausência de admins permite registro `skipped`. | médio | [X] |
| F10-022 | Projetar payload seguro de template | Extrair somente snapshots permitidos do pedido para renderização. | `src/features/notifications/template-data.ts`; tipos de orders | F10-016, F10-003 | code | [SEQ] | Payload contém apenas id, status, total, itens, frete, endereço resumido e mensagem operacional. | alto | [X] |

## 5. Provider e adapters

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-023 | Criar contrato de provider | Definir interface neutra de envio e resultado sem acoplar domínio a Resend ou SMTP. | `src/features/notifications/providers/email-provider.ts` | F10-016, F10-020 | code | [SEQ] | Contrato aceita mensagem renderizada e retorna sucesso/falha sanitizável. | médio | [X] |
| F10-024 | Implementar adapter mock | Registrar entregas determinísticas em dev/test sem rede ou credenciais reais. | `src/features/notifications/providers/mock-email-provider.ts` | F10-023 | code | [SEQ] | Mock suporta sucesso e falha controlada, identifica-se como mock e não usa rede. | médio | [X] |
| F10-025 | Implementar adapter indisponível | Representar provider ausente em preview/produção com falha segura. | `src/features/notifications/providers/unavailable-email-provider.ts` | F10-023 | code | [SEQ] | Tentativa falha de modo observável e seguro, sem simular envio e sem afetar pedido pago. | alto | [X] |
| F10-026 | Preparar extensão para provider real | Isolar configuração/contrato futuro de Resend ou SMTP sem instalar nem exigir provider real. | `src/features/notifications/providers/index.ts`; interfaces/config | F10-023, F10-007 | code | [SEQ] | Arquitetura aceita adapter futuro sem condicionar build/test/E2E a SDK ou credenciais. | baixo | [X] |
| F10-027 | Resolver adapter por ambiente | Selecionar mock somente em dev/test e indisponível quando envio real não estiver configurado. | `src/features/notifications/providers/resolve-email-provider.ts` | F10-009, F10-024, F10-025, F10-026 | code | [SEQ] | Resolução é determinística e produção nunca recebe mock silencioso. | alto | [X] |
| F10-028 | Sanitizar telemetria do provider | Garantir que logs/resultados não persistam headers, secrets ou respostas brutas sensíveis. | `src/features/notifications/providers/**`; logger existente | F10-020, F10-027 | code | [SEQ] | Somente provider, código seguro, timestamps e identificadores internos são observáveis. | alto | [X] |

## 6. Templates MVP

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-029 | Criar template de pedido pago do cliente | Renderizar assunto e corpo mínimos a partir do snapshot seguro. | `src/features/notifications/templates/customer-order-paid.ts` | F10-022 | code | [//] | Template informa pedido, status, total, itens, frete, endereço resumido e sequência operacional. | médio | [X] |
| F10-030 | Criar template interno de novo pedido pago | Renderizar mensagem mínima para admin/gestores sem dados além do snapshot seguro. | `src/features/notifications/templates/admin-order-paid.ts` | F10-022 | code | [//] | Template interno contém os campos permitidos e nenhum dado financeiro sensível do Stripe. | médio | [X] |
| F10-031 | Criar formatadores compartilhados | Padronizar moeda, itens, frete, endereço e escaping usados pelos dois templates. | `src/features/notifications/templates/formatters.ts`; templates | F10-029, F10-030 | code | [SEQ] | Valores são formatados no servidor e conteúdo dinâmico é escapado adequadamente. | médio | [X] |
| F10-032 | Aplicar guarda de conteúdo proibido | Impedir inclusão acidental de cartão, secrets, tokens, payload bruto e links sensíveis. | `src/features/notifications/templates/guards.ts`; templates | F10-031 | code | [SEQ] | Renderização aceita somente o DTO seguro e falha em fixtures com campos proibidos. | alto | [X] |

## 7. Outbox e processamento

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-033 | Definir contrato do repository | Especificar criação idempotente, atualização de status e consulta por pedido. | `src/features/notifications/repository.ts` | F10-016, F10-018, F10-019 | code | [SEQ] | Interface separa persistência do serviço e expressa criação nova versus registro existente. | médio | [X] |
| F10-034 | Implementar criação idempotente em Drizzle | Inserir delivery protegida pela constraint de idempotência. | `src/features/notifications/drizzle-repository.ts`; `src/db/schema.ts` | F10-015, F10-033 | code | [SEQ] | Concorrência/duplicata retorna o registro existente sem criar segunda entrega. | alto | [X] |
| F10-035 | Implementar atualização de tentativa e status | Persistir início, sucesso mock/real, falha ou skip com timestamps e erro seguro. | `src/features/notifications/drizzle-repository.ts` | F10-034, F10-020 | code | [SEQ] | Estados e timestamps seguem a máquina definida e `attemptCount` é consistente. | alto | [X] |
| F10-036 | Implementar consulta básica por pedido | Disponibilizar status mínimo das notificações para o admin. | `src/features/notifications/drizzle-repository.ts` | F10-034 | code | [SEQ] | Consulta retorna metadados seguros e não expõe corpo, secrets ou ação de reenvio. | médio | [X] |
| F10-037 | Criar serviço de orquestração | Coordenar criação idempotente, renderização, provider e persistência de resultado. | `src/features/notifications/service.ts` | F10-027, F10-032, F10-033, F10-035 | code | [SEQ] | Serviço não conhece Stripe bruto e retorna resultado controlado sem lançar falha financeira. | alto | [X] |
| F10-038 | Criar entrega do cliente | Gerar registro de `customer_order_paid` para o e-mail snapshotado/validado do cliente. | `src/features/notifications/service.ts`; templates | F10-034, F10-037 | code | [SEQ] | Um pedido pago gera no máximo uma entrega por destinatário cliente e evento. | alto | [X] |
| F10-039 | Criar entregas de admin/gestores | Gerar uma entrega por destinatário configurado ou estado controlado quando a lista estiver vazia. | `src/features/notifications/service.ts`; recipients/config | F10-034, F10-037, F10-021 | code | [SEQ] | Destinatários são deduplicados; ausência de configuração não quebra o fluxo. | alto | [X] |
| F10-040 | Processar envio síncrono controlado | Executar tentativa após registro, registrando sucesso/falha sem exigir worker real. | `src/features/notifications/service.ts` | F10-035, F10-038, F10-039 | code | [SEQ] | Cada entrega registra tentativa e resultado; falha não propaga rollback para o chamador financeiro. | alto | [X] |
| F10-041 | Preparar estados para retry futuro | Preservar contagem, último erro e status sem criar scheduler ou retry automático. | `src/features/notifications/service.ts`; repository/types | F10-040 | code | [SEQ] | Modelo permite retry futuro, mas nenhuma repetição automática ou endpoint de reenvio existe. | médio | [X] |

## 8. Integração pós-pagamento

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-042 | Definir contrato do evento pós-pagamento | Criar fronteira explícita entre settlement concluído e notificações. | `src/features/notifications/post-payment-event.ts`; interfaces da feature | F10-022, F10-037 | code | [SEQ] | Evento recebe somente identificadores e snapshots seguros após liquidação concluída. | alto | [X] |
| F10-043 | Integrar após settlement confirmado | Invocar notificações somente após pedido/pagamento/estoque/cupom concluírem com sucesso. | `src/features/payments/**`; `src/features/orders/**`; notification event | F10-040, F10-042 | code | [SEQ] | Chamada ocorre depois do commit financeiro e não participa da transação que liquida o pedido. | alto | [X] |
| F10-044 | Montar dados a partir do pedido persistido | Alimentar notificações com snapshots server-side, nunca com valores financeiros do client. | `src/features/orders/**`; `src/features/notifications/template-data.ts` | F10-043 | code | [SEQ] | Total, moeda, itens, frete, cliente e endereço vêm do pedido persistido e validado. | alto | [X] |
| F10-045 | Bloquear origem client-side | Confirmar que retorno do Payment Element e páginas customer não disparam evento de pedido pago. | `src/app/**/checkout/**`; `src/features/payments/**`; actions relacionadas | F10-043 | code | [SEQ] | Busca e testes mostram que apenas settlement server-side pode criar notificações pagas. | alto | [X] |
| F10-046 | Tratar webhook duplicado como no-op | Reutilizar idempotência do settlement e da outbox para impedir registros ou envios duplicados. | `src/features/payments/**`; `src/features/notifications/**` | F10-043, F10-044 | code | [SEQ] | Mesmo evento Stripe repetido mantém uma entrega por chave idempotente. | alto | [X] |
| F10-047 | Isolar falha de notificação | Capturar falhas pós-settlement sem reverter pedido pago, estoque ou `usedCount`. | `src/features/payments/**`; `src/features/notifications/**` | F10-043, F10-040 | code | [SEQ] | Falha fica registrada na outbox; estado financeiro e efeitos da Fase 9 permanecem concluídos. | alto | [X] |

## 9. Admin e customer

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-048 | Agregar status básico ao pedido admin | Consultar deliveries por pedido sem ampliar permissões ou expor conteúdo sensível. | `src/features/orders/**`; `src/features/notifications/repository.ts` | F10-036 | code | [SEQ] | Admin/manager recebem somente tipo, destinatário mascarado, status e timestamps necessários. | médio | [X] |
| F10-049 | Exibir status básico no admin | Mostrar estados de notificação na visualização existente de pedidos. | `src/app/admin/pedidos/**`; componentes existentes | F10-048 | code | [SEQ] | UI é somente leitura, preserva policies e trata ausência de deliveries. | médio | [X] |
| F10-050 | Garantir ausência de reenvio admin | Remover ou não criar controles/actions/endpoints de retry manual. | `src/app/admin/pedidos/**`; server actions; routes | F10-049 | validation | [SEQ] | Não existe botão, action ou endpoint de reenvio na Fase 10. | baixo | [X] |
| F10-051 | Preservar escopo customer | Manter somente status do pedido atual, sem histórico ou central de notificações. | `src/app/(customer)/**`; features de orders | F10-043 | validation | [SEQ] | Nenhuma tela, rota ou consulta de histórico de notificações é adicionada ao customer. | baixo | [X] |

## 10. Fallback e mock

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-052 | Implementar fallback de repository em dev/test | Permitir testes determinísticos sem banco real, seguindo o padrão existente do projeto. | `src/features/notifications/memory-repository.ts`; factory do repository | F10-033 | code | [SEQ] | Repository em memória preserva idempotência, transições e consulta sem conexão externa. | médio | [X] |
| F10-053 | Registrar ausência de admins de forma controlada | Produzir warning/estado `skipped` sem lançar erro sobre o pagamento confirmado. | `src/features/notifications/service.ts`; repository | F10-039, F10-052 | code | [SEQ] | Sem recipients, fluxo conclui com estado observável e nenhuma exceção financeira. | médio | [X] |
| F10-054 | Garantir execução local sem rede | Verificar que mock, repositories de teste e templates não acessam provider ou banco reais. | Configuração de testes; notifications providers/repositories | F10-024, F10-052 | validation | [SEQ] | Testes podem rodar sem chaves de e-mail, rede de provider ou `DATABASE_URL` real. | alto | [X] |
| F10-055 | Auditar proibição de mock em produção | Cobrir seleção de ambiente e mensagens de falha segura para configurações incompletas. | `src/features/notifications/config.ts`; provider resolver | F10-027, F10-054 | validation | [SEQ] | Cenário de produção sem credenciais não envia, não simula sucesso e não quebra pedido pago. | alto | [X] |

## 11. Testes unitários e de integração

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-056 | Testar domínio e templates seguros | Cobrir idempotência, transições, formatação, escaping e campos proibidos. | `tests/**/notifications-domain*.test.*`; `tests/**/notification-templates*.test.*` | F10-018, F10-019, F10-032 | test | [//] | Testes provam determinismo e ausência de cartão, token, secret e payload Stripe bruto. | médio | [X] |
| F10-057 | Testar config e adapters | Cobrir mock dev/test, provider indisponível, recipients e bloqueio do mock em produção. | `tests/**/notification-provider*.test.*`; `tests/**/notification-config*.test.*` | F10-027, F10-028, F10-055 | test | [//] | Nenhum teste exige credencial real; produção sem provider falha de modo seguro. | alto | [X] |
| F10-058 | Testar repository e idempotência | Cobrir insert único, duplicata, status, timestamps, erro seguro e fallback em memória. | `tests/**/notification-repository*.test.*` | F10-035, F10-036, F10-052 | test | [SEQ] | Duplicatas não criam segunda delivery e transições persistidas são válidas. | alto | [X] |
| F10-059 | Testar serviço de notificações | Cobrir cliente, múltiplos admins, lista vazia, sucesso mock, falha e skip. | `tests/**/notification-service*.test.*` | F10-041, F10-053, F10-056, F10-057, F10-058 | test | [SEQ] | Serviço cria as entregas corretas e registra falhas sem lançar rollback ao chamador. | alto | [X] |
| F10-060 | Testar regressões da liquidação | Provar que duplicidade/falha de e-mail não altera pagamento, estoque ou `usedCount`. | Testes de `payments`, `orders`, `coupons`, `stock`, `notifications` | F10-047, F10-059 | test | [SEQ] | Pedido permanece pago e efeitos da Fase 9 ocorrem uma única vez em todos os cenários. | alto | [X] |

## 12. E2E

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-061 | Cobrir pagamento confirmado com mock | Validar o fluxo completo gerando deliveries de cliente e admin sem envio real. | `tests/e2e/**`; fixtures/helpers Stripe e notifications | F10-049, F10-060 | test | [SEQ] | Webhook confirmado produz status visível no admin e registros mockados esperados. | alto | [X] |
| F10-062 | Cobrir duplicidade, falha e escopo negativo | Validar webhook duplicado, provider falhando, ausência de credenciais e ausência de ações fora do escopo. | `tests/e2e/**` | F10-061 | test | [SEQ] | Não há duplicidade, rollback financeiro, reenvio admin, WhatsApp, SMS, Bling ou NF-e. | alto | [X] |

## 13. Documentação

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-063 | Documentar feature e arquitetura | Explicar fluxo pós-pagamento, outbox, adapters, templates, idempotência e falha segura. | `docs/features/notifications.md`; `docs/architecture/notifications.md` | F10-047, F10-055 | docs | [//] | Documentos refletem o comportamento implementado e não incluem secrets ou promessa de envio real obrigatório. | baixo | [X] |
| F10-064 | Atualizar pagamentos e banco | Registrar o ponto pós-settlement e a estrutura de deliveries sem alterar regras da Fase 9. | `docs/features/payments.md`; `docs/architecture/payments.md`; `docs/architecture/database.md` | F10-015, F10-047 | docs | [//] | Documentação afirma que notificação não participa da liquidação nem reverte seus efeitos. | baixo | [X] |
| F10-065 | Consolidar operação e fora de escopo | Documentar env, mock, recipients, provider ausente e exclusões da fase. | `docs/operations/env.md` | F10-010, F10-055, F10-063, F10-064 | docs | [SEQ] | WhatsApp, SMS, retry, reenvio admin, customer history, Bling, NF-e e fiscal estão explicitamente fora. | baixo | [X] |

## 14. Validações finais e fechamento

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|---|---|---|---|---|---|---|---|---|---|
| F10-066 | Executar suíte completa | Rodar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`. | Projeto inteiro | F10-062, F10-063, F10-064, F10-065 | validation | [SEQ] | Todos os comandos concluem com sucesso e contagens/resultados são registrados. | alto | [X] |
| F10-067 | Auditar segurança e escopo final | Revisar diff, secrets, rotas, migrations, dependências e limites da Fase 10. | `git diff`; arquivos alterados; migration local | F10-066 | validation | [SEQ] | Não há secrets, envio real acidental, mudança financeira, integração fora do escopo ou migration aplicada. | alto | [X] |
| F10-068 | Gerar artefatos finais de coding | Atualizar progresso e produzir impactos/regressões da implementação concluída. | `progress.jsonl`; `legacy-impact.md`; `regression-watch.md`; `actions.md` | F10-067 | docs | [SEQ] | Todas as ações concluídas estão `[X]`; impactos e regressões residuais estão documentados de forma verificável. | baixo | [X] |

## Dependências críticas

1. `F10-012` a `F10-015` formam a sequência única do schema e migration local.
2. `F10-018` e `F10-034` implementam as duas camadas de idempotência: chave de domínio e constraint persistida.
3. `F10-027`, `F10-032` e `F10-035` precisam estar prontos antes do serviço `F10-037`.
4. `F10-043` só pode ocorrer depois do processamento controlado e deve ficar fora da transação financeira.
5. `F10-047` e `F10-060` são os checkpoints centrais que preservam pagamento, estoque e `usedCount`.
6. A UI admin depende da consulta segura `F10-036`; não deve introduzir comandos de reenvio.
7. E2E começa somente após os testes de regressão financeira passarem.
8. A suíte final depende da implementação, testes e documentação concluídos.

## Riscos principais

| Risco | Mitigação nas ações |
|---|---|
| Webhook duplicado gerar notificações duplicadas | F10-018, F10-013, F10-034, F10-046, F10-058 e F10-062 |
| Falha de e-mail reverter settlement | F10-040, F10-043, F10-047, F10-060 e F10-062 |
| Mock simular envio real em produção | F10-009, F10-025, F10-027, F10-055 e F10-057 |
| Vazamento de secrets ou dados de cartão | F10-020, F10-022, F10-028, F10-032, F10-056 e F10-067 |
| Provider real virar requisito de CI | F10-006, F10-007, F10-024, F10-054, F10-057 e F10-066 |
| Ausência de destinatário admin quebrar pagamento | F10-008, F10-021, F10-039, F10-053 e F10-059 |
| Expansão indevida para retry/reenvio/central | F10-041, F10-050, F10-051, F10-062 e F10-065 |
| Migration alterar dados fora do escopo | F10-011 a F10-015 e F10-067 |

## Resumo de execução

- **Total de ações:** 68
- **Ações sequenciais:** 60
- **Ações paralelizáveis:** 8
- **Fases:** 14
- **Primeira ação:** F10-001
- **Última ação:** F10-068
- **Próxima etapa após o coding:** `/reversa` para re-extração futura
