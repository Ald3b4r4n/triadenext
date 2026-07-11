# Requirements: Fase 18 — Staging Environment Setup

> Identificador: `026-fase-18-staging-environment`
> Data: `2026-07-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confiança: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A Fase 18 deve preparar, configurar quando houver acesso aprovado e validar um ambiente externo controlado de staging/preview para a Tríade Essenza Next. A entrega cobre Vercel, Neon staging/dev remoto, Stripe em modo de teste, variáveis externas, migrations autorizadas, bootstrap do administrador master e smoke operacional completo. Quando qualquer infraestrutura ainda não existir, a fase deve produzir `pending-config` e um checklist objetivo, sem inventar configuração nem prejudicar lint, testes, build ou E2E locais. A fase deve produzir evidências para uma decisão go/no-go posterior, sem executar produção definitiva, Stripe live, domínio de produção ou migração definitiva de dados reais.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confiança |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Staging Smoke e Identidade Visual Pos-Fase 17` | O projeto já possui smoke de staging opt-in, estados seguros para configuração ausente e bloqueio de produção/Stripe live. | 🟢 |
| `_reversa_sdd/architecture.md#Integrações Externas` | Vercel, Neon, Stripe, Blob e provedor de e-mail são fronteiras externas previstas pela arquitetura atual. | 🟢 |
| `_reversa_sdd/domain.md#Guardrails de Ambiente` | Secrets pertencem ao ambiente, produção deve ser bloqueada e fallbacks locais não autorizam operação externa. | 🟢 |
| `_reversa_sdd/domain.md#Readiness Operacional` | Checks operacionais devem relatar presença/ausência sem imprimir valores ou realizar efeitos externos implícitos. | 🟢 |
| `_reversa_sdd/domain.md#Staging Smoke e Storefront Triade` | A Fase 17 preparou smoke de storefront, checkout, admin e outbox para execução futura em staging aprovado. | 🟢 |
| `_reversa_sdd/code-analysis.md#operations readiness` | Já existem scripts seguros para env, migrations, build, smoke, import staging e staging smoke. | 🟢 |
| `_reversa_sdd/deployment.md#Estado Pos-Fase 17` | A infraestrutura externa ainda precisa ser configurada e validada antes do go-live. | 🟢 |
| `_reversa_sdd/permissions.md#Guardrails` | Superfícies administrativas exigem autenticação e papel administrativo válido. | 🟢 |
| `_reversa_sdd/migration/cutover_plan.md#No-go Pos-Fase 16` | O avanço depende de ambiente isolado, backup, validação e decisão humana; a produção permanece bloqueada. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Responsável técnico | Configurar e verificar staging sem expor credenciais nem alcançar produção. | Prepara os serviços externos, aplica somente ações autorizadas e registra evidências sanitizadas. |
| Aprovador humano | Autorizar migrations e bootstrap no banco staging/dev remoto. | Confere alvo, snapshot, plano de rollback e escopo antes de liberar cada ação com escrita. |
| Administrador master | Validar autenticação e acesso ao painel administrativo no staging. | Entra com a conta `rafasouzacruz@gmail.com` e confirma permissões administrativas sem exposição pública do painel. |
| QA operacional | Executar o smoke real e classificar falhas. | Percorre storefront, compra em modo de teste, pedido, admin e notificações/outbox na URL aprovada. |
| Responsável pelo go-live | Decidir se o ambiente pode avançar para a próxima fase. | Avalia relatório consolidado, bloqueadores, rollback e critérios go/no-go sem autorizar produção nesta fase. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Quando a infraestrutura estiver disponível e aprovada, toda configuração e execução da Fase 18 deve ter como alvo exclusivo um ambiente Vercel preview/staging e um banco Neon staging/dev remoto identificados como não produtivos. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Staging Smoke e Storefront Triade`
   - Tipo: nova
2. **RN-02:** Qualquer sinal de produção, domínio definitivo, banco produtivo ou Stripe live deve interromper a operação antes de conexão, migration, bootstrap, pagamento ou smoke mutável. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Guardrails de Ambiente`
   - Tipo: nova
3. **RN-03:** Variáveis sensíveis devem ser configuradas fora do Git e validadas somente por presença, formato seguro e ambiente esperado; URLs externas, `DATABASE_URL`, chaves Stripe, webhook secrets e demais valores nunca podem aparecer em terminal, relatório, teste ou documentação versionada. 🟢
   - Origem no legado: `_reversa_sdd/deployment.md#Guardrails Operacionais`
   - Tipo: nova
4. **RN-04:** Migrations podem ser aplicadas somente no Neon staging/dev remoto após aprovação humana explícita, confirmação do alvo não produtivo, revisão do conjunto Drizzle, snapshot/backup e rollback documentado. 🟢
   - Origem no legado: `_reversa_sdd/migration/cutover_plan.md#Rollback`
   - Tipo: nova
5. **RN-05:** O bootstrap administrativo em staging deve promover `rafasouzacruz@gmail.com` por meio de `ADMIN_MASTER_EMAILS`; senha e demais credenciais devem ser fornecidas exclusivamente fora do Git. 🟢
   - Origem no legado: `_reversa_sdd/permissions.md#Papéis`
   - Tipo: nova
6. **RN-06:** O login administrativo só é considerado validado quando a sessão real de staging reconhece o usuário master como `admin` ou `manager` e bloqueia usuários comuns. 🟢
   - Origem no legado: `_reversa_sdd/permissions.md#Matriz de Permissões`
   - Tipo: nova
7. **RN-07:** Pagamentos de staging devem usar somente Stripe test mode, com webhook de teste autenticado; chaves ou eventos live tornam o resultado `blocked`. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Pagamento`
   - Tipo: nova
8. **RN-08:** Ausência de projeto/URL Vercel, Neon staging/dev, envs Stripe test ou webhook test deve gerar `pending-config` e checklist específico; entrada aprovada ausente para import staging deve gerar `pending-input`. Esses estados não autorizam simular sucesso, inventar URL, conectar banco, executar deploy ou acessar produção. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Staging Smoke e Storefront Triade`
   - Tipo: nova
9. **RN-09:** O smoke real deve preservar as regras existentes de catálogo, carrinho, cupom, frete, checkout, pedido, pagamento e notificações; esta fase não altera regras comerciais. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Fluxo Comercial Principal`
   - Tipo: nova
10. **RN-10:** O relatório go/no-go da Fase 18 é evidência para uma decisão posterior e não constitui autorização para go-live, deploy final ou migration em produção. 🟢
    - Origem no legado: `_reversa_sdd/migration/cutover_plan.md#Pré-cutover`
    - Tipo: nova
11. **RN-11:** Lint, typecheck, testes, build e E2E locais devem permanecer independentes de URL pública, banco remoto, webhook ou credencial externa real. 🟢
    - Origem no legado: `_reversa_sdd/domain.md#Readiness Operacional`
    - Tipo: nova
12. **RN-12:** O Laravel legado permanece somente como referência histórica e não pode ser alterado, configurado ou acessado para escrita durante a Fase 18. 🟢
    - Origem no legado: `_reversa_sdd/architecture.md#Paridade Legado x Next`
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confiança |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Inventariar o estado externo de Vercel, Neon e Stripe test antes de qualquer alteração. | Must | O relatório inicial identifica cada recurso como disponível, ausente, sem acesso ou pendente de aprovação, sem registrar valores sensíveis. | 🟢 |
| RF-02 | Conectar ou validar o projeto Vercel com o repositório GitHub da aplicação e manter produção fora da execução. | Must | Com acesso aprovado, projeto e branch ficam identificados e preview/staging é distinguido de produção; sem projeto ou acesso, o resultado é `pending-config` com checklist e sem deploy automático. | 🟢 |
| RF-03 | Criar ou validar uma implantação preview/staging com URL pública controlada. | Must | A URL aprovada é HTTPS, não corresponde ao domínio produtivo e pode ser consumida pelo smoke; sem URL, o estado é `pending-config`. | 🟡 |
| RF-04 | Criar ou validar um Neon staging/dev remoto isolado de produção. | Must | Com ambiente aprovado, o banco é identificado como não produtivo e possui responsável, acesso, snapshot/backup e rollback; sem Neon staging/dev, o resultado é `pending-config`, sem conexão ou migration. | 🟢 |
| RF-05 | Consolidar o contrato de variáveis por ambiente e validar `.env.example` contra staging. | Must | Cada variável é classificada como obrigatória ou opcional para local, preview/staging e produção; a checagem não imprime valores nem copia `.env`. | 🟢 |
| RF-06 | Configurar no Vercel as variáveis obrigatórias de staging por mecanismo externo seguro quando houver projeto e acesso aprovados. | Must | Com acesso, o ambiente recebe somente as variáveis necessárias no escopo preview/staging; sem acesso, existe checklist `pending-config`; em ambos os casos, o relatório registra somente presença/ausência. | 🟢 |
| RF-07 | Revisar migrations Drizzle e aplicar somente as aprovadas no Neon staging/dev remoto. | Must | Há evidência da revisão, aprovação humana, snapshot prévio, execução restrita ao alvo staging e verificação pós-migration; sem aprovação, nenhuma migration roda. | 🟢 |
| RF-08 | Executar o bootstrap administrativo no staging/dev remoto. | Must | O bootstrap é idempotente, não imprime senha ou URL de banco e termina com registro sanitizado de sucesso, falha ou pendência. | 🟢 |
| RF-09 | Promover e validar o usuário master definido em `ADMIN_MASTER_EMAILS`. | Must | `rafasouzacruz@gmail.com` possui papel administrativo no staging, consegue autenticar e acessar `/admin`; usuário comum continua bloqueado. | 🟢 |
| RF-10 | Configurar e validar Stripe test mode no staging quando as envs externas estiverem disponíveis. | Must | Com envs disponíveis, presença e modo test são validados sem valores; sem envs, o resultado é `pending-config` e checkout/pagamento externo fica bloqueado; qualquer configuração live é bloqueada. | 🟢 |
| RF-11 | Configurar e validar o webhook Stripe de teste quando a URL e o acesso externo estiverem aprovados. | Must | Com configuração disponível, o endpoint HTTPS de staging recebe eventos test, valida assinatura e mantém idempotência; sem webhook, retorna `pending-config`; eventos live nunca são aceitos. | 🟢 |
| RF-12 | Executar smoke real do storefront no staging somente com URL e aprovação humana. | Must | Home, catálogo, produto e carrinho respondem na URL aprovada sem erro crítico, conteúdo provisório ou quebra impeditiva; sem URL/aprovação, retorna `pending-config`. | 🟢 |
| RF-13 | Executar smoke real do fluxo comercial em modo de teste somente com Stripe test/webhook e aprovação humana. | Must | Checkout cria pedido controlado, pagamento test é confirmado por webhook, pedido muda de estado e nenhuma regra comercial é alterada; sem pré-condições, pagamento externo não é iniciado. | 🟢 |
| RF-14 | Executar smoke real das superfícies administrativas e da outbox. | Must | Login master, painel admin, pedidos e notificações/outbox são verificados com acesso protegido e relatório sanitizado. | 🟢 |
| RF-15 | Integrar o smoke de import staging quando existirem arquivos aprovados e dry-run `go`. | Should | Com pré-condições atendidas, o smoke valida a importação staging; sem arquivos, retorna `pending-input` sem importar nem conectar por esse fluxo. | 🟢 |
| RF-16 | Gerar relatório consolidado go/no-go para a próxima fase. | Must | O relatório lista evidências, bloqueadores, avisos, pendências humanas, rollback e decisão recomendada, sem autorizar produção. | 🟢 |
| RF-17 | Preservar execução local independente de credenciais reais. | Must | `lint`, `typecheck`, testes, build e E2E local continuam executáveis sem segredos ou infraestrutura externa, com skips/pending explícitos para checks remotos. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confiança |
|------|-----------|----------------------------|-------------|
| Segurança | Bloquear tecnicamente produção, Stripe live e qualquer destino não aprovado antes de efeitos externos. | `_reversa_sdd/domain.md#Guardrails de Ambiente`. | 🟢 |
| Segurança | Não imprimir ou registrar URLs externas, `DATABASE_URL`, tokens, senhas, cookies, chaves Stripe, webhook secrets, secrets de auth ou valores de env. | `_reversa_sdd/deployment.md#Guardrails Operacionais`. | 🟢 |
| Privacidade | Evidências versionáveis devem ser sanitizadas; dumps, relatórios brutos, credenciais e dados pessoais reais permanecem fora do Git. | `_reversa_sdd/migration/cutover_plan.md#Pré-cutover`. | 🟢 |
| Confiabilidade | Migrations e bootstrap devem ser idempotentes ou possuir retentativa segura e resultado verificável. | A fase atua em ambiente remoto sujeito a falha parcial e repetição operacional. | 🟡 |
| Recuperação | Toda escrita remota deve possuir snapshot/backup identificável e procedimento de rollback testável antes da execução. | `_reversa_sdd/migration/cutover_plan.md#Rollback`. | 🟢 |
| Observabilidade | Relatórios devem registrar etapa, horário, status, alvo lógico e erro sanitizado, sem valores sensíveis. | Necessário para auditoria e decisão go/no-go. | 🟢 |
| Disponibilidade | Falta de configuração externa deve resultar em `pending-config` ou `pending-input`, sem quebrar validações locais independentes. | `_reversa_sdd/deployment.md#Estado Pos-Fase 17`. | 🟢 |
| Desempenho | O smoke deve usar volume controlado e não executar carga, benchmark ou teste destrutivo. | O objetivo é validação funcional de staging, não teste de capacidade. | 🟢 |
| Manutenibilidade | Reutilizar guardrails e scripts `ops:*` existentes sempre que cobrirem o contrato da fase. | `_reversa_sdd/code-analysis.md#operations readiness`. | 🟢 |
| Linguagem | Mensagens humanas, checklists e relatórios devem usar PT-BR claro, correto e sem jargão desnecessário. | Regra de copy PT-BR vigente no projeto. | 🟢 |
| Compatibilidade | O Laravel legado deve permanecer intocado e fora de qualquer configuração, conexão ou escrita da fase. | Guardrail permanente de migração do projeto. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Inventário externo sem exposição de secrets
  Dado que a Fase 18 foi iniciada
  Quando o responsável audita Vercel, Neon e Stripe test
  Então cada dependência recebe um status operacional verificável
  E nenhum valor sensível é exibido ou versionado

Cenário: Preview de staging disponível
  Dado que o projeto Vercel está conectado ao repositório aprovado
  Quando uma implantação preview/staging é validada
  Então existe uma URL HTTPS controlada e distinta da produção
  E a URL pode ser usada pelo staging smoke

Cenário: URL de staging ausente
  Dado que não existe URL preview/staging aprovada
  Quando o smoke remoto é solicitado
  Então o resultado é pending-config
  E nenhum deploy final ou URL inventada é usado

Cenário: Neon staging ausente
  Dado que não existe Neon staging/dev aprovado
  Quando a readiness de banco é avaliada
  Então o resultado é pending-config com checklist de criação e configuração
  E nenhuma conexão ou migration é iniciada
  E DATABASE_URL não é exibida

Cenário: Neon staging preparado
  Dado um Neon staging/dev remoto isolado
  E snapshot ou backup confirmado
  Quando o precheck de banco é concluído
  Então o alvo é classificado como não produtivo
  E existe rollback documentado antes de qualquer escrita

Cenário: Migration staging autorizada
  Dado que o conjunto Drizzle foi revisado
  E o alvo não produtivo, snapshot e rollback foram confirmados
  E existe aprovação humana explícita para a execução
  Quando a migration é aplicada
  Então somente o banco staging/dev remoto é alterado
  E o schema resultante é verificado sem imprimir DATABASE_URL

Cenário: Migration sem aprovação
  Dado que não existe aprovação humana explícita
  Quando uma execução de migration é solicitada
  Então a operação é bloqueada antes da conexão
  E produção permanece intocada

Cenário: Bootstrap e login do administrador master
  Dado que o banco staging está autorizado e o auth está configurado
  E ADMIN_MASTER_EMAILS contém rafasouzacruz@gmail.com
  Quando o bootstrap administrativo é executado
  Então a conta master pode autenticar e acessar /admin
  E uma conta customer não pode acessar /admin

Cenário: Stripe test configurado
  Dado que as credenciais e o webhook pertencem ao modo test
  Quando um pedido controlado é pago no staging
  Então a confirmação ocorre por webhook test assinado e idempotente
  E o pedido e a outbox refletem o estado esperado

Cenário: Stripe test ou webhook ausente
  Dado que as envs Stripe test ou o webhook test não estão configurados
  Quando o smoke externo de pagamento é avaliado
  Então o resultado é pending-config com checklist de configuração
  E checkout e pagamento externo permanecem bloqueados
  E nenhum valor sensível é registrado

Cenário: Stripe live detectado
  Dado que uma chave, webhook ou ambiente indica live mode
  Quando a validação de pagamento é iniciada
  Então a operação é bloqueada antes da chamada externa
  E o relatório não revela a credencial

Cenário: Smoke comercial completo
  Dado staging configurado e aprovado
  Quando o smoke real é executado
  Então home, catálogo, produto, carrinho, checkout, pedido, admin e notificações/outbox são verificados
  E cada etapa possui resultado sanitizado

Cenário: Arquivos aprovados de import ausentes
  Dado que a pasta de entrada aprovada não contém os arquivos esperados
  Quando o import staging smoke é avaliado
  Então o resultado é pending-input
  E nenhuma importação ou conexão desse fluxo é executada

Cenário: Relatório go/no-go
  Dado que os checks disponíveis foram concluídos
  Quando a Fase 18 consolida os resultados
  Então o relatório separa sucesso, bloqueio, pendência de configuração, pendência de entrada e decisão humana
  E não executa go-live ou produção

Cenário: Validações locais sem infraestrutura externa
  Dado que Vercel, Neon e Stripe test ainda não estão configurados
  Quando lint, typecheck, testes, build e E2E locais são executados
  Então as validações independentes continuam operacionais
  E checks remotos ausentes usam pending-config ou skip explícito
  E nenhuma credencial real é exigida
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-07 | Must | Sem infraestrutura identificada, envs seguras e banco staging autorizado, nenhuma validação remota é confiável. |
| RF-08 e RF-09 | Must | O administrador master é necessário para validar a operação administrativa real. |
| RF-10 e RF-11 | Must | Checkout e pagamento só podem avançar em modo test com webhook autenticado. |
| RF-12 a RF-14 | Must | O smoke ponta a ponta é a evidência central da fase. |
| RF-15 | Should | O import staging depende de arquivos aprovados e dry-run `go`; sua ausência não invalida os demais checks. |
| RF-16 | Must | A próxima fase precisa de decisão baseada em evidência e rollback. |
| RF-17 | Must | Desenvolvimento local não pode depender de infraestrutura ou credenciais reais. |
| Teste de carga | Won't | Não é necessário para validar configuração funcional de staging nesta fase. |

## 9. Esclarecimentos

### Sessão 2026-07-09

- **Q:** O projeto Vercel e uma URL preview/staging já existem e estão acessíveis?
  **R:** Não devem ser presumidos. Sem projeto ou URL, a fase retorna `pending-config`, gera checklist, não falha validações locais, não tenta deploy automático e não inventa URL. Quando forem configurados futuramente, a URL será validada e o smoke real dependerá de aprovação humana, sem produção ou domínio definitivo.
- **Q:** Já existe um Neon staging/dev remoto isolado e autorizado para migrations?
  **R:** Não deve ser presumido. Sem Neon staging/dev, a fase retorna `pending-config`, gera checklist, não conecta banco, não executa migration e não imprime `DATABASE_URL`. Quando existir futuramente, deve ser validado como não produtivo e toda migration exigirá aprovação humana explícita, snapshot/backup e bloqueio de produção.
- **Q:** As credenciais Stripe test e o webhook test já existem fora do Git?
  **R:** Não devem ser presumidos. Sem Stripe test ou webhook, a fase retorna `pending-config`, gera checklist e bloqueia o smoke externo de checkout/pagamento. Quando estiverem disponíveis futuramente, somente a presença será validada, chaves live serão bloqueadas e o smoke de pagamento test exigirá aprovação humana.

## 10. Lacunas

- Nenhuma lacuna bloqueadora restante para o planejamento. Infraestrutura externa ausente deve resultar em `pending-config` e checklist seguro até que configuração e aprovação humanas estejam disponíveis.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-09 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-09 | Três dúvidas bloqueadoras resolvidas; definidos os fluxos `pending-config` e os gates humanos para Vercel, Neon e Stripe test | reversa |
