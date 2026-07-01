# Requirements: Fase 12 - Production Migration Readiness

> Identificador: `020-fase-12-production-readiness`
> Data: `2026-06-26`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A Fase 12 entrega uma macrofase de prontidão para migração produtiva controlada, consolidando banco, migrations, variáveis, Vercel, Neon, Stripe test mode, uploads, smoke tests e checklist operacional antes do go-live. A fase prepara staging/preview e produção para execução segura, mas não executa deploy real, migration real, conexão com banco real ou migração de dados reais sem aprovação humana explícita. O objetivo é acelerar a migração saindo de microfeatures e criando um pacote operacional verificável para rodar o Next.js em ambiente real controlado.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Visão Geral` | A aplicação é um e-commerce Next.js App Router com catálogo, carrinho, cupom, frete, checkout, PaymentIntent, webhook, settlement e notificações pós-pagamento já implementados. | 🟢 |
| `_reversa_sdd/architecture.md#Containers` | A arquitetura alvo envolve Next.js, módulos de domínio, Postgres/Neon via Drizzle, Vercel Blob, Stripe e provider de e-mail mock/unavailable. | 🟢 |
| `_reversa_sdd/architecture.md#Integrações Externas` | Stripe API/Webhook e Vercel Blob existem com guardrails; Correios/Jadlog/Melhor Envio e Bling/NF-e seguem inativos ou ausentes funcionalmente. | 🟢 |
| `_reversa_sdd/architecture.md#Guardrails` | O sistema usa fallback seguro sem `DATABASE_URL`, exige ambiente permitido para mutações reais, confirma pagamento por webhook e não deve expor secrets em docs/logs. | 🟢 |
| `_reversa_sdd/domain.md#Pagamento` | Pagamento só inicia para pedido pagável; retorno client-side não confirma pagamento; webhook `payment_intent.succeeded` é fonte da verdade financeira. | 🟢 |
| `_reversa_sdd/domain.md#Settlement` | Settlement real é transacional e falha de notificação posterior não desfaz pagamento, estoque ou cupom. | 🟢 |
| `_reversa_sdd/domain.md#Notificações` | Mock é permitido em dev/test; preview/produção sem provider real devem falhar de forma segura. | 🟢 |
| `_reversa_sdd/domain.md#Guardrails de Ambiente` | Sem `DATABASE_URL`, `db = null`; sem `BLOB_READ_WRITE_TOKEN`, upload real bloqueia; secrets não são gravados em artefatos nem mensagens. | 🟢 |
| `_reversa_sdd/inventory.md#Banco de dados` | Drizzle está configurado com migrations `drizzle/0000_*` até `drizzle/0007_*` e scripts DB existentes. | 🟢 |
| `_reversa_sdd/inventory.md#Testes` | O projeto possui Vitest e Playwright como base de validação unitária, integração e E2E. | 🟢 |
| `_reversa_sdd/deployment.md#Estado Detectado` | `next.config.ts`, `drizzle.config.ts`, `.env.example` e docs operacionais existem; deploy automático não foi detectado no repositório. | 🟢 |
| `_reversa_sdd/deployment.md#Variáveis Críticas` | Variáveis críticas incluem `DATABASE_URL`, Better Auth, Blob, Stripe, notificações e e-mail. | 🟢 |
| `_reversa_sdd/code-analysis.md#payments` | Stripe webhook valida assinatura/evento, registra idempotência e settlement confirma pedido somente por evento financeiro válido. | 🟢 |
| `_reversa_sdd/code-analysis.md#uploads` | Upload de imagem exige admin/manager, valida arquivo, exige token Blob e bloqueia upload real sem token. | 🟢 |
| `_reversa_sdd/code-analysis.md#lib` | Guardrails de runtime classificam ambiente/capabilities sem expor secrets e preview/produção sem configuração real ficam indisponíveis de modo seguro. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Desenvolvedor responsável pela migração | Preparar o projeto para staging/produção sem improvisar variáveis, banco ou scripts. | Revisa migrations, `.env.example`, scripts seguros e checklist antes de pedir aprovação para comandos reais. |
| Operador de deploy | Executar um roteiro manual claro para Vercel, Neon, Stripe test mode, Blob e rollback. | Segue plano de staging, valida critérios de sucesso/falha e registra bloqueios sem expor secrets. |
| QA/Validador de produção | Confirmar que o ambiente controlado reproduz os fluxos críticos. | Executa smoke em URL local ou pública aprovada cobrindo home, produto, carrinho, checkout, pagamento teste, pedido, admin e notificações mock/seguras. |
| Dono do negócio | Decidir se o projeto está pronto para go-live posterior. | Lê checklist consolidado, riscos restantes, rollback, backup e critérios de aprovação antes de liberar produção real. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A Fase 12 não pode alterar regras de pagamento, estoque, cupom, frete, checkout, pedidos, settlement ou notificações; ela apenas prepara execução operacional segura dessas capacidades. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Regras de Domínio`
   - Tipo: nova
2. **RN-02:** Nenhuma migration real, deploy real, conexão com banco real, migração de dados reais, uso de domínio real ou go-live pode ser executado automaticamente nesta fase. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Guardrails`
   - Tipo: nova
3. **RN-03:** Qualquer passo real de banco, deploy, domínio, Stripe webhook público ou migração de dados exige aprovação humana explícita, com ambiente, comando e impacto descritos antes da execução. 🟢
   - Origem no legado: `_reversa_sdd/deployment.md#Guardrails Operacionais`
   - Tipo: nova
4. **RN-04:** Checklists e scripts operacionais não podem imprimir valores de secrets, copiar `.env`, versionar credenciais ou validar credenciais por exposição de valores. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Guardrails de Ambiente`
   - Tipo: nova
5. **RN-05:** O alvo inicial de validação deve ser staging/preview controlado, com produção preparada por checklist e go-live posterior separado. 🟡
   - Origem no legado: objetivo da macrofase e `_reversa_sdd/deployment.md#Infraestrutura Alvo Inferida`
   - Tipo: nova
6. **RN-06:** Stripe deve ser preparado primeiro em test mode, incluindo variáveis, webhook, eventos necessários e smoke de pagamento teste, sem chave real em código ou logs. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Pagamento`, `_reversa_sdd/code-analysis.md#payments`
   - Tipo: nova
7. **RN-07:** Neon deve ser preparado por contrato de variáveis, checklist de banco, plano de rollback, plano de backup e verificação segura sem imprimir secrets. 🟢
   - Origem no legado: `_reversa_sdd/inventory.md#Banco de dados`, `_reversa_sdd/deployment.md#Variáveis Críticas`
   - Tipo: nova
8. **RN-08:** Uploads/imagens devem preservar a estratégia atual de Vercel Blob e fallback seguro, bloqueando upload real quando o token estiver ausente. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#uploads`
   - Tipo: nova
9. **RN-09:** Scripts locais seguros podem ser criados ou revisados apenas quando não exigirem credenciais reais, rede obrigatória, banco real, migration real, e-mail real ou deploy. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#lib`
   - Tipo: nova
10. **RN-10:** Smoke tests de staging/produção podem aceitar uma URL pública aprovada, mas devem permanecer seguros por padrão e não devem acionar pagamento real, e-mail real ou mutação destrutiva. 🟡
    - Origem no legado: `_reversa_sdd/domain.md#Notificações`, `_reversa_sdd/inventory.md#Testes`
    - Tipo: nova
11. **RN-11:** Bling, NF-e, rotinas fiscais, WhatsApp, SMS, redesign premium, mudança de regra de negócio e migração de dados reais sem aprovação humana ficam fora do escopo. 🟢
    - Origem no legado: `_reversa_sdd/architecture.md#Dívidas Técnicas`, `_reversa_sdd/domain.md#Lacunas`
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Revisar e consolidar todas as migrations Drizzle existentes. | Must | Existe relatório listando migrations atuais, ordem esperada, entidades cobertas, riscos e inconsistências sem executar migration real. | 🟢 |
| RF-02 | Preparar execução segura de migrations em staging/dev remoto. | Must | Existe roteiro com pré-checagens, backup, comando planejado, rollback, critérios de sucesso/falha e exigência de aprovação humana antes de qualquer execução real. | 🟢 |
| RF-03 | Revisar `.env.example` e documentação operacional. | Must | `.env.example` e docs listam variáveis por ambiente sem valores reais, sem secrets e com distinção clara entre local, preview/staging e produção. | 🟢 |
| RF-04 | Criar checklist objetivo de variáveis por ambiente. | Must | Checklist separa variáveis obrigatórias e opcionais para local, preview/staging e produção, incluindo finalidade e risco quando ausente, sem imprimir valores. | 🟢 |
| RF-05 | Preparar Neon para staging/produção. | Must | Checklist de Neon cobre `DATABASE_URL`, banco alvo, usuário/role, branch/projeto, backup, rollback, validação segura e bloqueio de conexão real sem aprovação. | 🟢 |
| RF-06 | Preparar Vercel para preview/staging e produção. | Must | Plano cobre build, env vars, preview, production, domínio, logs, rollback e critérios de aceite, sem executar deploy automático. | 🟢 |
| RF-07 | Preparar Stripe em test mode. | Must | Checklist cobre chaves test mode, webhook secret, endpoint, eventos necessários, smoke de PaymentIntent teste e garantia de ausência de chaves reais em código. | 🟢 |
| RF-08 | Preparar uploads/blob/imagens. | Must | Documento confirma estratégia atual, variáveis necessárias, fallback quando token ausente, limites conhecidos e validação segura de upload sem expor token. | 🟢 |
| RF-09 | Criar ou revisar scripts operacionais seguros. | Should | Scripts `check-env`, `check-build`, `check-migrations` e `check-smoke`, quando viáveis, reportam apenas presença/ausência ou estado seguro, sem imprimir secrets e sem rede obrigatória por padrão. | 🟡 |
| RF-10 | Criar plano de deploy staging manual. | Must | Plano possui passos sequenciais, responsáveis, entradas necessárias, comandos esperados, pontos de parada, critérios de sucesso/falha e rollback, sem executar deploy. | 🟢 |
| RF-11 | Criar smoke test de staging/produção. | Must | Smoke cobre home, produtos, produto, carrinho, checkout, pedido, pagamento teste, admin e outbox/notificações mock ou provider seguro, com URL configurável e sem transação real. | 🟢 |
| RF-12 | Criar checklist de go-live posterior. | Must | Checklist de go-live lista pré-requisitos, aprovações, janela, backup, rollback, DNS/domínio, monitoramento, Stripe test/live, Neon, Blob, smoke final e decisão explícita de avançar ou abortar. | 🟢 |
| RF-13 | Confirmar que build/test não exigem credenciais reais. | Must | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e E2E seguros têm caminho documentado para rodar sem secrets reais ou conexão real obrigatória. | 🟢 |
| RF-14 | Confirmar que secrets não estão versionados. | Must | Há verificação documental e/ou script seguro que procura nomes de arquivos/variáveis sensíveis sem imprimir valores e registra resultado. | 🟢 |
| RF-15 | Consolidar evidências de prontidão em relatório Reversa. | Must | A feature registra decisões, riscos, validações executadas, validações não executadas por falta de aprovação e próximos passos para staging/go-live. | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Nenhuma saída de script, doc ou teste pode exibir valores de secrets, tokens, URLs completas sensíveis ou chaves de provider. | `_reversa_sdd/domain.md#Guardrails de Ambiente` | 🟢 |
| Segurança | Comandos reais de migration, deploy, banco, domínio e Stripe webhook público exigem aprovação humana explícita antes da execução. | `_reversa_sdd/deployment.md#Guardrails Operacionais` | 🟢 |
| Confiabilidade | Roteiros de migration e deploy devem incluir backup, rollback, ponto de parada e critérios objetivos de sucesso/falha. | Necessidade operacional da Fase 12 e `_reversa_sdd/deployment.md#Infraestrutura Alvo Inferida` | 🟡 |
| Observabilidade | Staging/produção devem ter checklist de logs, healthcheck, smoke e evidência de falha segura quando provider obrigatório estiver ausente. | `_reversa_sdd/deployment.md#Guardrails Operacionais` | 🟢 |
| Compatibilidade | Preparação de produção deve respeitar Next.js App Router, Drizzle, Neon, Vercel, Stripe, Blob e os scripts existentes sem trocar stack. | `_reversa_sdd/architecture.md#Containers` | 🟢 |
| Reprodutibilidade | Checklists e scripts devem ser determinísticos e executáveis novamente sem alterar dados reais por padrão. | `_reversa_sdd/inventory.md#Testes` | 🟡 |
| Privacidade | Documentação não deve copiar `.env`, não deve registrar credenciais reais e não deve orientar validação por colagem de secrets em logs. | `_reversa_sdd/architecture.md#Guardrails` | 🟢 |
| Escopo | A fase deve consolidar readiness em uma macrofase, evitando criar microfeatures para cada provider ou checklist. | Objetivo informado para Fase 12 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: migrations Drizzle são revisadas sem execução real
  Dado que o projeto possui migrations Drizzle versionadas
  Quando a Fase 12 consolida o estado de banco
  Então existe relatório com ordem, finalidade, riscos e pendências das migrations
  E nenhuma migration real é executada sem aprovação humana explícita

Cenário: variáveis por ambiente ficam claras e seguras
  Dado que o projeto precisa rodar local, preview/staging e produção
  Quando o checklist de variáveis é gerado
  Então cada ambiente lista variáveis obrigatórias e opcionais
  E nenhum valor de secret é impresso, copiado ou versionado

Cenário: Neon fica preparado para staging controlado
  Dado que o banco alvo usa Neon/Postgres
  Quando o checklist de Neon é preenchido
  Então há plano de banco, backup, rollback, validação segura e ponto de aprovação
  E nenhuma conexão real é feita automaticamente

Cenário: Vercel fica preparado sem deploy automático
  Dado que o runtime alvo é Vercel
  Quando o plano de staging é criado
  Então build, env vars, preview, produção, domínio, logs e rollback estão documentados
  E nenhum deploy real é executado automaticamente

Cenário: Stripe usa test mode primeiro
  Dado que pagamentos existentes usam PaymentIntent e webhook
  Quando a preparação Stripe é concluída
  Então variáveis test mode, webhook, eventos e smoke de pagamento teste ficam especificados
  E chaves reais não aparecem em código, docs ou logs

Cenário: uploads preservam fallback seguro
  Dado que upload de imagem depende de Vercel Blob
  Quando o token Blob está ausente
  Então o plano mantém bloqueio seguro de upload real
  E documenta como validar presença/ausência sem imprimir o token

Cenário: smoke de staging/produção é seguro por padrão
  Dado que existe uma URL local ou pública aprovada para teste
  Quando o smoke é executado
  Então ele cobre home, produtos, produto, carrinho, checkout, pedido, pagamento teste, admin e notificações mock/seguras
  E não aciona pagamento real, e-mail real, migration real ou ação destrutiva

Cenário: go-live fica separado da readiness
  Dado que a Fase 12 termina com checklists e planos aprováveis
  Quando o time avalia produção real
  Então existe checklist de go-live posterior com pré-requisitos, riscos, rollback e decisão explícita
  E a execução de go-live não ocorre dentro desta fase sem nova aprovação humana

Cenário: item fora de escopo é solicitado durante a fase
  Dado que alguém pede Bling, NF-e, rotinas fiscais, WhatsApp, SMS, redesign premium ou alteração de regra de negócio
  Quando a solicitação é avaliada na Fase 12
  Então ela é registrada como fora de escopo
  E não é implementada como parte desta macrofase
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Migrations são o maior risco antes de qualquer ambiente real. |
| RF-02 | Must | Execução remota segura precisa de aprovação, backup e rollback antes de acontecer. |
| RF-03 | Must | `.env.example` e docs são o contrato operacional sem expor credenciais. |
| RF-04 | Must | Variáveis por ambiente evitam deploy incompleto e falha silenciosa. |
| RF-05 | Must | Neon é a base de dados alvo e precisa de plano de rollback/backup. |
| RF-06 | Must | Vercel é o runtime alvo e precisa de roteiro de preview/produção. |
| RF-07 | Must | Stripe test mode é obrigatório antes de qualquer pagamento real. |
| RF-08 | Must | Imagens/uploads são parte da operação de catálogo e precisam de fallback claro. |
| RF-09 | Should | Scripts seguros aceleram validação, mas só entram se mantiverem guardrails. |
| RF-10 | Must | Staging manual é o próximo passo operacional antes do go-live. |
| RF-11 | Must | Smoke de staging/produção prova o fluxo crítico em ambiente controlado. |
| RF-12 | Must | Go-live posterior precisa de checklist próprio para não virar execução cega. |
| RF-13 | Must | Build/test sem credenciais reais protegem fluxo local e CI futuro. |
| RF-14 | Must | Secrets versionados são bloqueador de produção. |
| RF-15 | Must | Evidência Reversa fecha a macrofase e preserva rastreabilidade. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` apenas se uma lacuna crítica surgir antes do planejamento.

## 10. Lacunas

Nenhuma lacuna pendente no requirements inicial. As decisões operacionais assumidas são: staging/preview controlado antes de produção, Stripe test mode antes de live mode, go-live fora da execução automática da Fase 12 e scripts seguros somente quando não imprimirem secrets nem exigirem rede real por padrão.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Versão inicial gerada por `/reversa-requirements` | reversa |
