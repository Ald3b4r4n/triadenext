# Roadmap: Fase 18 — Staging Environment Setup

> Identificador: `026-fase-18-staging-environment`
> Data: `2026-07-11`
> Requirements: `_reversa_forward/026-fase-18-staging-environment/requirements.md`
> Confiança: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 18 adiciona uma camada de orquestração operacional sobre `src/features/staging-smoke`, `src/features/staging-import` e os scripts `ops:*` já existentes. O fluxo começa offline, inventariando apenas presença/ausência e produzindo `pending-config` quando Vercel, Neon ou Stripe test não estiverem configurados. Quando infraestrutura e aprovação humana forem fornecidas futuramente, a mesma sequência valida alvo não produtivo, migrations revisadas, snapshot/rollback, bootstrap do administrador master e smoke real. Ações externas ficam separadas em gates explícitos; produção, Stripe live, deploy final e migration em produção são bloqueados antes de qualquer efeito. O resultado final é um relatório go/no-go sanitizado, no qual `pending-config` é um resultado operacional válido, mas nunca equivale a `go`.

## 2. Princípios aplicados

Não há `.reversa/principles.md` versionado. Aplicam-se os guardrails consolidados no SDD:

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Produção bloqueada por padrão | Target produtivo, domínio definitivo ou Stripe live interrompem o fluxo antes de conexão, migration, bootstrap ou pagamento. | respeita |
| Secrets fora de artefatos | Checks e relatórios registram somente presença, ausência, categoria e resultado sanitizado. | respeita |
| Aprovação humana antes de efeitos externos | Migration staging, bootstrap remoto e smoke mutável exigem gate explícito e escopo registrado. | respeita |
| Infraestrutura ausente é estado conhecido | Vercel, Neon ou Stripe ausentes resultam em `pending-config`, sem quebrar validações locais. | respeita |
| Laravel legado intocado | Nenhum arquivo, banco, credencial ou processo do legado participa da execução. | respeita |

Conflitos de princípios: nenhum.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|---------------|--------------------------|-------------|
| D-01 | Criar um orquestrador `staging-environment` que componha módulos existentes, sem duplicar regras de negócio. | A Fase 17 já implementa smoke e a Fase 16 já implementa guards de importação; falta coordenar configuração e gates. | Reescrever `staging-smoke`; acoplar tudo ao script shell. | 🟢 |
| D-02 | Manter um único modelo de status: `passed`, `pending-config`, `pending-input`, `blocked`, `failed` e `skipped`. | Evita sucesso falso e mantém compatibilidade com as fases anteriores. | Booleano simples; lançar erro para configuração ausente. | 🟢 |
| D-03 | Executar primeiro um caminho offline que nunca abre rede ou banco. | O requirements exige que validações locais funcionem sem credenciais externas. | Tentar descobrir infraestrutura automaticamente; ler `.env`. | 🟢 |
| D-04 | Representar Vercel, Neon e Stripe por checks de configuração e adapters opt-in. | Permite testar gates sem credenciais e deixa integração externa substituível. | Chamadas diretas aos providers no import do módulo; SDK obrigatório novo. | 🟢 |
| D-05 | Não automatizar criação de projeto Vercel, Neon ou webhook Stripe. | Ausência deve gerar checklist e toda configuração externa depende de acesso humano. | Provisionamento automático; deploy por CLI durante checks. | 🟢 |
| D-06 | Configuração Vercel deve usar escopo Preview ou ambiente customizado staging, nunca Production. | A documentação oficial separa variáveis por ambiente e preview deployments de produção. | Variáveis compartilhadas sem escopo; branch `main` como primeiro alvo. | 🟢 |
| D-07 | Neon staging deve usar projeto/branch isolado com restore confirmado antes de migration. | Branching e restore reduzem o impacto de migrations em ambiente controlado. | Primeiro alvo ser produção; confiar apenas em rollback de deploy. | 🟢 |
| D-08 | Migration staging deve ser um comando separado, explicitamente armado, e não parte de build/deploy. | Build automático com migration cria efeito externo implícito e risco de alvo incorreto. | Migration em `postinstall`; migration automática na Vercel. | 🟢 |
| D-09 | Bootstrap do master deve reutilizar o serviço idempotente existente e exigir gate de staging. | `ops:bootstrap-admin` e `ADMIN_MASTER_EMAILS` já cobrem promoção; falta restringir execução remota. | Seed destrutivo; credencial hardcoded. | 🟢 |
| D-10 | Stripe deve aceitar somente test/sandbox e webhook HTTPS de staging, com validação de assinatura e idempotência existentes. | Mantém o webhook como fonte de verdade sem risco de cobrança real. | Mock tratado como smoke real; Stripe live. | 🟢 |
| D-11 | Relatórios brutos ficam em saída ignorada; somente templates e checklists sanitizados são versionáveis. | URLs, identificadores e dados operacionais podem ser sensíveis mesmo sem secrets. | Versionar relatório integral; imprimir envs para depuração. | 🟢 |
| D-12 | `pending-config` conclui o check offline, mas força decisão final `no-go`. | A fase pode ser implementada sem infraestrutura, porém staging não pode ser declarado pronto sem evidência real. | Tratar pendência como `go`; falhar toda a suíte local. | 🟢 |

## 4. Premissas

Não há dúvidas pendentes no `requirements.md`. As decisões da sessão de esclarecimento são condições explícitas:

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Vercel e URL de staging podem estar ausentes; o resultado é `pending-config`. | Seção 9, sessão 2026-07-09 | Um fluxo que tente deploy ou invente URL violaria o escopo. |
| Neon staging pode estar ausente; nenhuma conexão ou migration ocorre nesse estado. | Seção 9, sessão 2026-07-09 | Conexão de descoberta poderia alcançar banco não aprovado. |
| Stripe test e webhook podem estar ausentes; pagamento externo fica bloqueado. | Seção 9, sessão 2026-07-09 | Smoke poderia produzir cobrança real ou sucesso falso. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `src/features/staging-environment` | `_reversa_sdd/architecture.md#Staging Smoke e Identidade Visual Pos-Fase 17` | componente-novo | Orquestrar inventário, gates, status, checklists e decisão go/no-go sem chamadas externas por padrão. |
| `src/features/staging-smoke` | `_reversa_sdd/architecture.md#Staging Smoke e Identidade Visual Pos-Fase 17` | contrato-alterado | Receber configuração aprovada do orquestrador e preservar `pending-config`/bloqueio de produção. |
| `src/features/staging-import` | `_reversa_sdd/architecture.md#Importacao Staging Controlada` | contrato-alterado | Reutilizar guardrails de banco, aprovação, backup e relatórios para migrations/bootstrap staging. |
| `scripts/ops` | `_reversa_sdd/code-analysis.md#operations readiness` | contrato-alterado | Adicionar checks/orquestração de ambiente e comandos armados separados para operações staging autorizadas. |
| `docs/operations` | `_reversa_sdd/deployment.md#Scripts Operacionais Seguros` | contrato-alterado | Consolidar runbook Vercel, Neon, Stripe, migration, bootstrap, smoke e rollback. |
| `src/tests/unit` | `_reversa_sdd/inventory.md#Testes` | contrato-alterado | Cobrir status, redaction, produção/live bloqueados, gates e decisão go/no-go. |
| `src/tests/e2e` | `_reversa_sdd/inventory.md#Testes` | contrato-alterado | Manter checks remotos opt-in e executar jornada real apenas com URL/aprovação. |

## 6. Delta no modelo de dados

- Resumo das mudanças: não há novo schema, tabela, enum ou migration. A fase poderá aplicar, sob aprovação humana, apenas as migrations Drizzle já versionadas `0000` a `0007` em um Neon staging/dev remoto vazio ou isolado. Evidências e relatórios são operacionais, não registros de negócio.
- Detalhe completo em: `_reversa_forward/026-fase-18-staging-environment/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `staging-environment-contract` | ambiente/configuração | `_reversa_forward/026-fase-18-staging-environment/interfaces/staging-environment-contract.md` |
| `staging-execution-gates` | comando operacional | `_reversa_forward/026-fase-18-staging-environment/interfaces/staging-execution-gates.md` |
| `staging-admin-bootstrap` | comando operacional | `_reversa_forward/026-fase-18-staging-environment/interfaces/staging-admin-bootstrap.md` |
| `staging-go-no-go-report` | arquivo/relatório | `_reversa_forward/026-fase-18-staging-environment/interfaces/staging-go-no-go-report.md` |

## 8. Plano de migração

1. Executar inventário offline e gerar `pending-config` para cada dependência externa ausente.
2. Revisar `.env.example`, contrato por ambiente e matriz de redaction sem inserir valores.
3. Consolidar checklists manuais para criar/vincular Vercel Preview, Neon staging e Stripe test.
4. Validar localmente produção/live bloqueados e ausência de credenciais tolerada.
5. Quando houver autorização, confirmar Vercel Preview/staging e URL controlada sem deploy final.
6. Quando houver autorização, confirmar Neon isolado, snapshot/restore e migrations `0000` a `0007` revisadas.
7. Executar migration staging somente em janela e gate humano separados; verificar schema sem imprimir URL.
8. Executar bootstrap idempotente do master somente após banco/auth aprovados.
9. Configurar e validar Stripe test/webhook somente fora do Git e executar smoke test aprovado.
10. Consolidar evidências e produzir `go`, `no-go` ou `pending-config`; qualquer pendência crítica resulta em `no-go`.
11. Em falha, interromper smoke, restaurar o Neon conforme checklist e manter produção/Laravel intactos.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Preview Vercel disparar produção pela branch errada | alto | médio | Validar ambiente/branch antes do deploy e proibir promoção/`--prod`. |
| URL ou secret aparecer em relatório | alto | médio | Redaction central, allowlist de campos e testes com padrões sensíveis. |
| Migration atingir banco incorreto | alto | baixo | Gate de alvo, aprovação humana, snapshot e comando separado do build. |
| Rollback de deploy ser confundido com rollback de banco | alto | médio | Checklists e evidências independentes para Vercel e Neon. |
| Bootstrap master alterar usuário indevido | alto | baixo | Allowlist exata, idempotência, confirmação do e-mail e target staging. |
| Stripe live ser usado por engano | alto | baixo | Bloquear prefixos/modo live antes de qualquer chamada e exigir webhook test. |
| `pending-config` ser interpretado como `go` | alto | médio | Política determinística: qualquer Must pendente produz `no-go`. |
| Smoke criar dados repetidos | médio | médio | Identificadores de execução, idempotência e limpeza apenas por rollback aprovado. |
| Infraestrutura indisponível quebrar CI local | médio | alto | Adapters opt-in, mocks e status `pending-config`/skip explícito. |

## 10. Critério de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md` e contratos operacionais criados.
- [ ] `actions.md` gerado e auditado antes de implementação.
- [ ] Inventário offline retorna `pending-config` sem rede, banco ou credenciais.
- [ ] Produção, domínio definitivo, Stripe live e migration em produção são bloqueados.
- [ ] `.env.example` e matriz por ambiente estão coerentes, sem valores reais.
- [ ] Migration staging exige alvo, revisão, snapshot e aprovação humana explícita.
- [ ] Bootstrap master é idempotente, staging-only e não imprime credenciais.
- [ ] Smoke real cobre storefront, checkout/pagamento test, pedido, admin e outbox quando configurado.
- [ ] Relatório go/no-go não classifica `pending-config` como `go`.
- [ ] Lint, typecheck, testes, build e E2E locais passam sem infraestrutura externa.
- [ ] Todas as ações do `actions.md` marcadas `[X]`.
- [ ] `cross-check.md` sem CRITICAL nem HIGH.
- [ ] `regression-watch.md` gerado.
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-11 | Versão inicial gerada por `/reversa-plan` | reversa |
