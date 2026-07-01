# Regression Watch: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`

## Itens de watch

| ID | Origem (arquivo, secao) | Regra esperada apos mudanca | Tipo de verificacao | Sinal de violacao |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `legacy-readonly-guardrails.md` | Laravel legado permanece somente leitura durante comparacao e dry-run planning. | ausencia | Qualquer escrita, artisan, migration, cache/storage ou alteracao no legado |
| W002 | `safety-boundaries.md` | `.env`, tokens, URLs reais e secrets nao entram em artefatos versionados. | ausencia | Valor secreto ou dado sensivel cru em docs/logs |
| W003 | `controlled-migration-plan.md` | Import real exige aprovacao humana explicita. | presenca | Script/acao executa import real automaticamente |
| W004 | `dry-run-execution-model.md` | Migration real e banco real ficam bloqueados sem aprovacao. | ausencia | Comando conecta banco real ou roda migration real |
| W005 | `go-live-decision-framework.md` | Catalogo real sem reconciliacao permanece bloqueador de go-live. | presenca | Checklist marca go-live pronto sem dados Must reconciliados |
| W006 | `parity-integrations-out-of-scope.md` | Bling, NF-e, rotinas fiscais, WhatsApp e SMS ficam fora de escopo/decisao humana. | presenca | Artefato transforma essas lacunas em implementacao silenciosa |
| W007 | `dry-run-reconciliation.md` | Divergencia financeira nao explicada bloqueia avancar. | presenca | Relatorio aceita preco/total divergente sem justificativa |
| W008 | `rollback-plan.md` | Legado continua base de rollback ate aceite formal. | presenca | Plano remove/descarta legado antes do aceite |

## Historico de re-extracoes

### Re-extração 2026-07-01 17:45

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | Laravel read-only registrado em `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada` e rollback preservado. |
| W002 | 🟢 verde | Guardrails de secrets preservados em `_reversa_sdd/domain.md#Guardrails-de-Ambiente` e deployment. |
| W003 | 🟢 verde | Import real exige aprovacao humana em `_reversa_sdd/migration/data_migration_plan.md`. |
| W004 | 🟢 verde | Banco real e migration real bloqueados em `_reversa_sdd/domain.md` e `_reversa_sdd/deployment.md`. |
| W005 | 🟢 verde | Catalogo real sem reconciliacao permanece bloqueador em `_reversa_sdd/domain.md` e `deployment.md`. |
| W006 | 🟢 verde | Bling, NF-e, rotinas fiscais, WhatsApp e SMS permanecem fora de escopo/decisao humana. |
| W007 | 🟢 verde | Divergencia financeira nao explicada bloqueia avancar em `_reversa_sdd/domain.md`. |
| W008 | 🟢 verde | Laravel legado permanece base de rollback em `_reversa_sdd/migration/cutover_plan.md`. |

| Data | Comando | Resultado |
|------|---------|-----------|

## Arquivadas

| ID | Motivo |
|----|--------|

## Observacoes

- Nao ha regra verde modificada; os watches acima protegem guardrails novos da Fase 13.
- Lacunas com confianca amarela continuam como decisao humana, nao como regressao.
