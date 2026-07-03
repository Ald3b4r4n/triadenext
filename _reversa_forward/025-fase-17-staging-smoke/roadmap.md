# Roadmap: Fase 17 - Staging Smoke Real / Go-live Readiness

> Identificador: `025-fase-17-staging-smoke`
> Data: `2026-07-03`
> Requirements: `_reversa_forward/025-fase-17-staging-smoke/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 17 cria uma camada operacional de validação staging/preview real sobre os guardrails já existentes. O delta principal é transformar `ops:check-smoke`, `ops:check-env`, `ops:check-migrations` e os scripts da Fase 16 em um fluxo de smoke real controlado que aceita infraestrutura ausente como `pending-config` ou `pending-input`, sem falhar lint/test/build/e2e local. A execução real só ocorre quando `STAGING_SMOKE_URL`, envs staging, Stripe test mode/webhook e, opcionalmente, arquivos aprovados estiverem presentes e aprovados. Produção, Stripe live, migration em produção, deploy final e Laravel legado permanecem fora de escopo.

## 2. Princípios aplicados

Não há `.reversa/principles.md` versionado no projeto. Foram aplicados os guardrails consolidados nos SDDs:

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Sem secrets em artefatos/logs | Validação de envs reporta somente presença/ausência e nunca imprime `DATABASE_URL`, tokens ou chaves. | respeita |
| Produção bloqueada por padrão | Smoke, import staging e pagamento teste abortam quando target/URL/env indicar produção ou Stripe live mode. | respeita |
| Infraestrutura ausente não quebra validação local | `pending-config` e `pending-input` são resultados operacionais esperados e não falham build/test/e2e local. | respeita |
| Laravel legado somente leitura | A fase não acessa nem altera o Laravel legado. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Criar um fluxo `staging-smoke` separado de produção e de deploy. | A Fase 17 valida ambiente real controlado sem promover tráfego definitivo. | Usar deploy de produção; reaproveitar check local como se fosse staging real. | 🟢 |
| D-02 | Representar ausência de URL/env/webhook como `pending-config`. | Requirements esclarecidos determinam que infraestrutura externa não é obrigatória para planejar/implementar. | Falhar `pnpm test:e2e`; inventar URL; exigir credenciais reais. | 🟢 |
| D-03 | Representar ausência de arquivos aprovados para import como `pending-input`. | Mantém o contrato das Fases 15/16 e evita importação sem dados aprovados. | Rodar import com exemplos sintéticos; copiar dados do Laravel; conectar banco sem input. | 🟢 |
| D-04 | Reutilizar guardrails de `src/features/staging-import` para produção, DB staging, reset e relatórios. | O módulo já contém `environment`, `production-guard`, `preflight`, `smoke-target` e `report-writer`. | Criar uma segunda lógica de validação paralela. | 🟢 |
| D-05 | Planejar novo contrato operacional de smoke staging, não novo endpoint público. | O escopo é readiness operacional e smoke; não há nova API de negócio. | Criar rota HTTP de controle; expor painel administrativo para smoke. | 🟢 |
| D-06 | Validar Stripe test mode por presença/modo/guardrail e deixar pagamento real staging como `pending-config` sem webhook test. | Evita live mode e permite progresso sem credenciais reais locais. | Usar Stripe live; simular sucesso como se fosse webhook real. | 🟢 |
| D-07 | Produzir checklist go-live/go-no-go como artefato documental versionável e relatórios reais como saída local/sanitizada. | Checklist pode ir ao Git; dados reais e relatórios brutos não. | Versionar relatório bruto; omitir evidência de decisão humana. | 🟢 |

## 4. Premissas

Não há marcadores `[DÚVIDA]` restantes no `requirements.md`. Premissas operacionais resolvidas:

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| URL staging pode estar ausente durante desenvolvimento; resultado correto é `pending-config`. | Seção 9, sessão 2026-07-03 | Se a implementação tratar ausência como erro fatal, CI local quebra sem credenciais. |
| Neon staging/envs podem estar ausentes; resultado correto é `pending-config` sem conexão. | Seção 9, sessão 2026-07-03 | Se conectar sem aprovação, viola guardrail de banco real. |
| Stripe test webhook e arquivos aprovados podem estar ausentes; pagamento vira `pending-config` e import smoke vira `pending-input`. | Seção 9, sessão 2026-07-03 | Se mascarar como sucesso, go/no-go fica falso. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `scripts/ops` | `_reversa_sdd/architecture.md#Componentes Internos` | contrato-alterado | Acrescentar/verificar comando de smoke staging real com `pending-config` e produção bloqueada. |
| `src/features/staging-import` | `_reversa_sdd/architecture.md#Importacao Staging Controlada` | regra-alterada | Reutilizar guardrails para URL staging, envs, import smoke e relatórios go/no-go. |
| `src/tests/e2e` | `_reversa_sdd/inventory.md#Testes` | contrato-alterado | Smoke staging deve ficar skipped/pending-config sem URL e cobrir jornada real quando URL aprovada existir. |
| `docs/operations` | `_reversa_sdd/deployment.md#Scripts Operacionais Seguros` | componente-novo | Novo runbook/checklist de staging smoke e go-live readiness. |
| `data/dry-run/input/primeira-execucao` | `_reversa_sdd/state-machines.md#Importacao Staging Controlada` | regra-alterada | Ausência de arquivos aprovados vira `pending-input` para import smoke. |

## 6. Delta no modelo de dados

- Resumo das mudanças: não há alteração de schema, enum, migration ou tabela. A Fase 17 apenas valida estado de schema/migrations em staging quando aprovado e produz relatórios/checklists operacionais.
- Detalhe completo em: `_reversa_forward/025-fase-17-staging-smoke/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `staging-smoke-command` | comando operacional | `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-smoke-command.md` |
| `staging-smoke-report` | arquivo/relatório | `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-smoke-report.md` |
| `staging-env-contract` | ambiente/configuração | `_reversa_forward/025-fase-17-staging-smoke/interfaces/staging-env-contract.md` |

## 8. Plano de migração

1. Não criar migration nem alterar schema.
2. Planejar validação estática/operacional de migrations staging com aprovação humana explícita.
3. Em ambiente ausente, registrar `pending-config` sem conexão.
4. Quando staging estiver aprovado, validar schema compatível e snapshot/rollback antes de qualquer migration.
5. Manter produção e Laravel legado fora do fluxo.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| URL staging ausente bloquear CI local | médio | alto | `pending-config` deve ser sucesso operacional nos checks locais. |
| Secret impresso em relatório | alto | médio | Centralizar redaction e testar padrões `DATABASE_URL`, tokens e chaves. |
| Stripe live mode usado por engano | alto | médio | Bloquear live mode por prefixo/modo/target antes do smoke. |
| Migration ou conexão contra produção | alto | baixo | Guardrail de produção antes de qualquer conexão e aprovação humana explícita. |
| Relatório real com dados sensíveis versionado | alto | médio | Saídas reais em pasta ignorada; versionar apenas templates/checklists sanitizados. |
| Smoke real mascarar ausência de webhook/dados como sucesso | alto | médio | Separar `passed`, `pending-config`, `pending-input`, `blocked` e `failed`. |

## 10. Critério de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md` e contratos em `interfaces/` criados.
- [ ] `actions.md` gerado e auditado antes de implementação.
- [ ] Todas as ações do `actions.md` marcadas `[X]`.
- [ ] `pending-config` cobre URL/env/webhook ausentes sem quebrar lint/test/build/e2e.
- [ ] `pending-input` cobre arquivos aprovados ausentes sem importação ou conexão.
- [ ] Produção, Stripe live mode, migration em produção e deploy final bloqueados.
- [ ] Smoke staging real documentado para home, catálogo, produto, carrinho, checkout teste, pedido, admin e outbox/notificações.
- [ ] Checklist go-live/go-no-go criado.
- [ ] `cross-check.md` sem CRITICAL nem HIGH.
- [ ] `regression-watch.md` gerado.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-03 | Versão inicial gerada por `/reversa-plan` | reversa |
