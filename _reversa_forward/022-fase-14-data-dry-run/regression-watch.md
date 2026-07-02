# Regression Watch: Fase 14 - Controlled Data Dry-run and Reconciliation

> Identificador: `022-fase-14-data-dry-run`

## Itens de watch

| ID | Origem (arquivo, secao) | Regra esperada apos mudanca | Tipo de verificacao | Sinal de violacao |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `dry-run-safety-boundaries.md` | Laravel legado permanece somente leitura durante qualquer dry-run. | ausencia | Escrita, artisan, migration, cache/storage ou alteração no legado |
| W002 | `.gitignore` | Dados reais de `data/dry-run/input/` e relatórios reais de `data/dry-run/output/` ficam fora do Git. | presenca | CSV/JSON real sensível ou relatório real versionado |
| W003 | `safety.ts` | `.env`, secrets, tokens, URLs reais de banco e credenciais bloqueiam o dry-run. | presenca | Relatório aceita entrada insegura como `go` |
| W004 | `input-discovery.ts` | Entrada aceita apenas caminhos dentro de `data/dry-run/input/`. | presenca | Script lê caminho fora da pasta permitida |
| W005 | `run-dry-run.ts` | Dry-run roda em memória e não importa dados. | ausencia | Insert/update/delete, seed real ou escrita em banco |
| W006 | `run-dry-run.ts` | Dry-run não executa migration, deploy, upload ou provider externo. | ausencia | Chamada a migration, deploy, Blob real ou serviço externo |
| W007 | `reconciliation.ts` | Produto publicado sem capa ou fallback aprovado bloqueia avanço. | presenca | Relatório aprova produto publicado sem cobertura visual |
| W008 | `reconciliation.ts` | Frete mínimo precisa ter regra ativa com preço positivo. | presenca | Relatório aprova ausência de frete mínimo |
| W009 | `divergences.ts` | Divergência `CRITICAL` ou `HIGH` continua bloqueadora. | presenca | Go/no-go ignora severidade bloqueadora |
| W010 | `future-import-approval-checklist.md` | Importação real futura exige aprovação humana explícita separada da Fase 14. | presenca | Artefato ou script trata dry-run como importação real aprovada |

## Historico de re-extracoes

### Re-extração 2026-07-02

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | Laravel legado registrado como somente leitura em `_reversa_sdd/domain.md`, `architecture.md` e `migration/cutover_plan.md`. |
| W002 | 🟢 verde | `data/dry-run/input/` e `data/dry-run/output/` documentados como seguros/ignorados em `_reversa_sdd/inventory.md` e `data-dictionary.md`. |
| W003 | 🟢 verde | Scanner `UNSAFE_INPUT` descrito em `_reversa_sdd/code-analysis.md`, `domain.md` e `migration/data_migration_plan.md`. |
| W004 | 🟢 verde | Restrição de entrada dentro de `data/dry-run/input/` refletida em `_reversa_sdd/architecture.md` e `domain.md`. |
| W005 | 🟢 verde | Dry-run em memória e sem import real registrado em `_reversa_sdd/code-analysis.md` e ADR 009. |
| W006 | 🟢 verde | Ausência de migration, deploy, upload e provider externo registrada em `deployment.md`, `domain.md` e ADR 009. |
| W007 | 🟢 verde | Produto publicado sem capa/fallback segue bloqueador em `_reversa_sdd/domain.md` e `data-dictionary.md`. |
| W008 | 🟢 verde | Frete mínimo ativo com preço positivo segue bloqueador em `_reversa_sdd/domain.md` e `state-machines.md`. |
| W009 | 🟢 verde | Divergência `CRITICAL`/`HIGH` continua bloqueadora em `_reversa_sdd/code-analysis.md`, `data_migration_plan.md` e `cutover_plan.md`. |
| W010 | 🟢 verde | Importação real futura exige checklist humano e permanece separada da Fase 14 em `_reversa_sdd/domain.md` e ADR 009. |

| Data | Comando | Resultado |
|------|---------|-----------|
| 2026-07-02 | `/reversa` pós-Fase 14 | 10 verdes, 0 amarelos, 0 vermelhos |

## Arquivadas

| ID | Motivo |
|----|--------|

## Observacoes

- Nao ha regra verde modificada; os watches protegem guardrails novos da Fase 14.
- Dados reais, clientes, pedidos históricos, Bling, NF-e, WhatsApp e SMS permanecem fora do escopo desta fase.
