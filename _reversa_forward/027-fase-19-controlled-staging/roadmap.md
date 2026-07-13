# Roadmap: Fase 19 — Controlled Staging Execution

> Identificador: `027-fase-19-controlled-staging`
> Data: `2026-07-11`
> Requirements: `_reversa_forward/027-fase-19-controlled-staging/requirements.md`
> Confiança: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 19 é uma execução operacional controlada dos gates criados na Fase 18, mas sem ativar efeitos remotos. O plano executa apenas comandos em modo padrão seguro, consolida a saída em uma matriz de status e transforma pendências externas em checklist humano. Os wrappers de migration, bootstrap e importação entram como diagnóstico/precheck, nunca como execução armada. A decisão final é conservadora: `passed` apenas informa checks verdes; qualquer `pending-config`, `pending-input`, `blocked`, `skipped` obrigatório ou `failed` mantém `no-go`. O resultado esperado em um ambiente ainda não configurado é um relatório `no-go` útil, sanitizado e acionável.

## 2. Princípios aplicados

Não há `.reversa/principles.md` versionado. Aplicam-se os guardrails consolidados no SDD e nos ADRs recentes:

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Execução remota bloqueada por padrão | Todos os comandos rodam sem flags de execução, reset, deploy, conexão ou aprovação remota. | respeita |
| Produção e Stripe live proibidos | Qualquer sinal de produção ou live mode vira `blocked` e interrompe avanço operacional. | respeita |
| Secrets fora de logs e relatórios | A fase registra nomes de variáveis e categorias, nunca valores, URLs privadas, tokens ou connection strings. | respeita |
| Infraestrutura ausente é diagnóstico válido | Ausência de Vercel, Neon, Stripe, URL ou arquivos aprovados gera `pending-config`/`pending-input`, não falha de implementação. | respeita |
| Laravel legado intocado | O Laravel legado não é lido como fonte operacional e não recebe alteração. | respeita |

Conflitos de princípios: nenhum.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|---------------|--------------------------|-------------|
| D-01 | Tratar a fase como orquestração de diagnóstico, não como nova integração. | A Fase 18 já criou readiness gates e wrappers protegidos; agora falta descobrir o estado real sem armar execução. | Criar novos providers; conectar remoto para descobrir estado. | 🟢 |
| D-02 | Executar somente comandos que já possuem modo padrão seguro. | O requirements lista scripts existentes e proíbe flags remotas/destrutivas. | Passar flags de aprovação; rodar comandos shell customizados contra providers. | 🟢 |
| D-03 | Consolidar todos os resultados em uma matriz única de status. | Evita interpretar `pending-config` como sucesso e permite checklist humano objetivo. | Relatórios soltos por comando; booleano simples `ok/falhou`. | 🟢 |
| D-04 | Separar scripts executáveis sem flags de scripts apenas listáveis como pendência. | `ops:import-staging`, `ops:migrate-staging` e `ops:bootstrap-admin-staging` só são aceitáveis em modo default/precheck. | Omitir esses wrappers; executar ações remotas para obter evidência. | 🟢 |
| D-05 | Não persistir relatório real com valores de runtime. | Saídas podem conter URLs, IDs ou dados operacionais; a fase deve documentar formato sanitizado e checklist. | Versionar relatório bruto; copiar `.env` para auditoria. | 🟢 |
| D-06 | Classificar pendências por origem operacional. | Distinguir configuração externa, input aprovado, decisão humana, bloqueio de segurança e problema do Next evita correções no lugar errado. | Agrupar todas as pendências como erro genérico. | 🟢 |
| D-07 | Manter avanço para staging real como decisão futura separada. | Esta fase descobre prontidão; não aprova migration, importação, deploy ou smoke remoto. | Avançar automaticamente quando todos os checks passarem. | 🟢 |

## 4. Premissas

Não há `[DÚVIDA]` pendente no `requirements.md`.

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Os scripts da Fase 18 mantêm modo padrão seguro sem conexão remota. | Seções 5 e 7 | Se algum script mudar seu default, a implementação deve bloquear execução e registrar `blocked`. |
| O ambiente externo pode estar totalmente ausente. | Seções 6 e 10 | O relatório deve ser `no-go`, mas não deve quebrar lint/test/build/e2e. |
| A etapa não autoriza flags de execução remota. | Seções 4, 6 e 11 | Qualquer tentativa com flags deve ser tratada como violação de escopo. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `src/features/staging-environment` | `_reversa_sdd/architecture.md#provider-readiness-gates-pós-fase-18` | regra-alterada | Usar readiness existente como fonte do diagnóstico operacional da Fase 19. |
| `src/features/staging-smoke` | `_reversa_sdd/architecture.md#staging-smoke-e-identidade-visual` | contrato-alterado | Rodar somente check seguro sem URL obrigatória; ausência vira `pending-config`/`skipped`. |
| `src/features/staging-import` | `_reversa_sdd/architecture.md#importacao-staging-controlada` | contrato-alterado | Rodar somente precheck/default; ausência de arquivos/env/aprovação vira pendência sem conexão. |
| `scripts/ops` | `_reversa_sdd/inventory.md#estado-pós-fase-18` | contrato-alterado | Sequenciar comandos seguros e registrar exit code/status sanitizados. |
| `docs/operations` | `_reversa_sdd/deployment.md#estado-pós-fase-18` | contrato-alterado | Produzir checklist humano enxuto para Vercel, Neon, Stripe, auth/admin e import staging. |
| `_reversa_forward/027-fase-19-controlled-staging` | `requirements.md` da feature | componente-novo | Guardar plano, ações, auditoria e relatório operacional sanitizado da execução. |

## 6. Delta no modelo de dados

- Resumo das mudanças: não há alteração de schema, migration, tabela, enum, índice ou seed. A fase apenas diagnostica readiness e pode gerar artefatos documentais/relatórios sanitizados.
- Detalhe completo em: `_reversa_forward/027-fase-19-controlled-staging/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `controlled-staging-diagnostic-sequence` | comando operacional | `_reversa_forward/027-fase-19-controlled-staging/interfaces/controlled-staging-diagnostic-sequence.md` |
| `operational-go-no-go-report` | arquivo/relatório | `_reversa_forward/027-fase-19-controlled-staging/interfaces/operational-go-no-go-report.md` |
| `human-staging-checklist` | checklist operacional | `_reversa_forward/027-fase-19-controlled-staging/interfaces/human-staging-checklist.md` |

## 8. Plano de migração

1. Confirmar diretório, branch, worktree e `next-env.d.ts` sem alterar código funcional.
2. Executar `pnpm ops:check-staging-environment` sem flags.
3. Executar `pnpm ops:check-staging-smoke` sem URL inventada e sem flags remotas.
4. Executar `pnpm ops:check-staging-import-smoke` sem importação.
5. Executar `pnpm ops:check-data-dry-run` usando comportamento seguro e entradas aprovadas se existirem.
6. Executar `pnpm ops:import-staging` apenas se o modo padrão for precheck sem conexão; se exigir ação remota, registrar pendência em vez de executar.
7. Executar `pnpm ops:migrate-staging` e `pnpm ops:bootstrap-admin-staging` apenas em modo check/default; qualquer necessidade de flag vira pendência humana.
8. Consolidar matriz de status e classificar pendências.
9. Gerar relatório go/no-go sanitizado e checklist humano.
10. Preservar `no-go` enquanto houver pendência Must, bloqueio, input ausente ou configuração externa ausente.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Um wrapper mudar default e tentar conexão remota | alto | baixo | Antes de executar, tratar qualquer requisito de flag/aprovação como pendência e auditar `actions.md`. |
| Saída de comando conter valor sensível | alto | médio | Redigir relatório manualmente a partir de status/categorias; não colar saída bruta com valores. |
| `pending-config` ser confundido com sucesso operacional | alto | médio | Regra determinística: qualquer Must pendente gera `no-go`. |
| Operador tentar resolver pendência copiando `.env` | alto | médio | Checklist orienta configurar fora do Git e nunca imprimir valores. |
| Scripts de smoke acessarem URL não aprovada | médio | baixo | Não inventar URL; ausência vira `pending-config`/`skipped`. |
| Diagnóstico mascarar defeito do Next como pendência externa | médio | médio | Classificar origem: configuração externa, input, bloqueio, Next, decisão humana. |
| Laravel legado ser usado como atalho de dados | alto | baixo | Reafirmar legado intocado e nenhuma leitura/importação não aprovada. |

## 10. Critério de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md` e contratos operacionais criados.
- [ ] `actions.md` gerado com comandos seguros, dependências e paralelizáveis sem conflito.
- [ ] `cross-check.md` sem CRITICAL nem HIGH antes da execução.
- [ ] Scripts seguros executados conforme `actions.md`, sem flags remotas/destrutivas.
- [ ] Matriz de status consolidada com `passed`, `pending-config`, `pending-input`, `blocked`, `skipped` e `failed`.
- [ ] Relatório go/no-go sanitizado criado sem secrets, URLs privadas ou `DATABASE_URL`.
- [ ] Checklist humano para Vercel, Neon, Stripe test, auth/admin e import staging criado.
- [ ] `next-env.d.ts` limpo.
- [ ] Nenhum deploy, migration remota, banco remoto, importação, produção ou Laravel legado envolvido.
- [ ] `regression-watch.md` gerado na implementação.
- [ ] Re-extração reversa posterior recomendada se a fase for commitada.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-11 | Versão inicial gerada por `/reversa-plan` | reversa |
