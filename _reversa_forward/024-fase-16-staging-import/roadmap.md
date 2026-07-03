# Roadmap: Fase 16 - Approved Staging Import

> Identificador: `024-fase-16-staging-import`
> Data: `2026-07-02`
> Requirements: `_reversa_forward/024-fase-16-staging-import/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 16 adiciona uma camada operacional sobre o dry-run da Fase 15 para preparar importacao controlada em ambiente remoto nao produtivo. O alvo inicial e staging/dev remoto, preferencialmente Neon dev/staging separado; producao deve ser bloqueada antes de qualquer conexao. O fluxo tecnico deve validar pre-condicoes, dry-run `go` ou sem bloqueio critico, ambiente aprovado, snapshot/backup e rollback antes de permitir qualquer escrita. A escrita padrao sera upsert seguro; reset/limpeza de staging exige backup, flag explicita, aprovacao humana e confirmacao de ambiente nao produtivo. A fase deve gerar relatorios antes/depois, divergencias por origem e checklist humano para decidir a proxima fase.

## 2. Princípios aplicados

Nao ha `.reversa/principles.md` no projeto. Os guardrails aplicados vêm dos artefatos Reversa/SDD e do requirements da Fase 16.

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Laravel legado somente leitura | A importacao staging nao le `.env` legado, nao altera arquivos e nao executa comandos no legado. | respeita |
| Producao proibida nesta fase | Todo contrato operacional deve abortar antes de conectar quando detectar producao. | respeita |
| Secrets nunca impressos | Comandos, logs e relatorios devem mascarar nomes sensiveis e nunca imprimir valores. | respeita |
| Escrita conservadora | Upsert seguro e padrao; reset/limpeza exige autorizacao reforcada. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Criar fluxo staging/dev remoto separado do dry-run local. | A Fase 15 valida arquivos; a Fase 16 precisa provar escrita em ambiente real controlado sem go-live. | Importar direto em producao; manter apenas dry-run local. | 🟢 |
| D-02 | Bloquear producao por contrato antes de qualquer conexao. | Requirements e SDD proíbem producao, deploy e dominio real nesta fase. | Conectar e validar depois; confiar apenas em nome de variavel. | 🟢 |
| D-03 | Exigir ambiente alvo `staging`, `preview` ou `remote-dev`, com preferencia para Neon dev/staging separado. | A decisao de clarify definiu o alvo inicial e a necessidade de ambiente aprovado. | Usar banco local como substituto; usar branch/producao atual. | 🟢 |
| D-04 | Se Neon dev/staging nao existir, gerar pendencia operacional e bloquear importacao real. | A fase pode preparar scripts/checklists sem executar escrita remota. | Criar ambiente automaticamente; usar producao temporariamente. | 🟢 |
| D-05 | Reutilizar os contratos da Fase 15 como entrada aprovada. | `data/dry-run/input/primeira-execucao/` ja define arquivos e aliases. | Criar novo formato de importacao; ler diretamente do Laravel. | 🟢 |
| D-06 | Exigir dry-run anterior `go` ou sem bloqueio critico antes de importar. | Evita mover divergencias conhecidas para staging. | Ignorar dry-run; permitir `pending-input`. | 🟢 |
| D-07 | Usar upsert seguro como modo padrao. | Permite reexecucao controlada sem apagar dados por padrao. | Append puro duplicando registros; reset completo como padrao. | 🟢 |
| D-08 | Permitir reset/limpeza apenas com backup, flag explicita, aprovacao humana e ambiente nao produtivo. | Reduz risco de perda de dados em staging/dev remoto. | Reset automatico; limpeza sem snapshot. | 🟢 |
| D-09 | Gerar relatorios antes/depois e divergencias por origem. | A Fase 15 ja classifica `dados`, `next`, `mapeamento` e `humana`; a importacao precisa preservar essa rastreabilidade. | Log textual sem estrutura; divergencia generica. | 🟢 |
| D-10 | Smoke pos-importacao fica sobre ambiente nao produtivo e Stripe/testes seguros. | O escopo exige home, catalogo, produto, carrinho, checkout teste, admin, pedidos e outbox sem go-live. | Smoke em producao; pagamento real. | 🟢 |
| D-11 | Nao executar migrations reais automaticamente. | A fase pode revisar migrations e ambiente, mas migration real exige aprovacao humana fora desta etapa. | Rodar `db:migrate` embutido no import. | 🟢 |
| D-12 | Especificar contratos operacionais em `interfaces/`. | A implementacao futura precisa de flags, status, saidas e erros verificaveis. | Deixar formato implicito no codigo. | 🟡 |

## 4. Premissas

Nao ha premissas derivadas de duvida pendente. As tres duvidas originais foram resolvidas por `/reversa-clarify` em 2026-07-02.

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| n/a | n/a | n/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `src/features/data-dry-run` | `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | contrato-alterado | Continua validando arquivos e relatorios, mas passa a alimentar prechecks da importacao staging. |
| `scripts/ops` | `_reversa_sdd/architecture.md#Componentes-Internos` | componente-novo | Deve ganhar checks/import staging-only, com bloqueio de producao e sem imprimir secrets. |
| `src/db` | `_reversa_sdd/code-analysis.md#db` | regra-alterada | Sera usado apenas contra banco remoto nao produtivo aprovado, com upsert seguro e sem migration automatica. |
| `docs/operations` | `_reversa_sdd/deployment.md#Estado-Detectado` | componente-novo | Deve receber runbook/checklist de importacao staging, snapshot, rollback e smoke. |
| `data/dry-run/output` | `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | contrato-alterado | Deve receber relatorios sanitizados antes/depois da importacao e continuar fora do Git quando houver dados reais. |
| `_reversa_forward/024-fase-16-staging-import/interfaces` | requirements Fase 16 | contrato-novo | Define contrato operacional de comando, report e status para implementacao futura. |

## 6. Delta no modelo de dados

- Resumo das mudanças: nao ha schema novo obrigatorio, tabela nova ou migration planejada para a Fase 16. O delta e operacional: dados aprovados passam de arquivos locais para tabelas existentes em staging/dev remoto por upsert seguro.
- Entidades alvo: `categories`, `products`, `product_images`, `product_categories`, `shipping_rules`, `coupons` e estoque em `products.stockQuantity` ou campo equivalente existente.
- Detalhe completo em: `_reversa_forward/024-fase-16-staging-import/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `staging-import-command` | CLI/operacional | `_reversa_forward/024-fase-16-staging-import/interfaces/staging-import-command.md` |
| `staging-import-reports` | arquivo | `_reversa_forward/024-fase-16-staging-import/interfaces/staging-import-reports.md` |

## 8. Plano de migração

1. Confirmar ambiente remoto nao produtivo, preferencialmente Neon dev/staging separado.
2. Se o ambiente nao existir ou nao estiver aprovado, gerar pendencia operacional e bloquear importacao real.
3. Confirmar arquivos aprovados em `data/dry-run/input/primeira-execucao/`.
4. Rodar ou validar dry-run anterior com resultado `go` ou sem bloqueio critico.
5. Revisar migrations estaticamente, sem aplicar migration real.
6. Confirmar snapshot/backup e rollback antes de qualquer escrita remota.
7. Executar precheck do comando staging-only sem imprimir secrets.
8. Executar importacao por upsert seguro no ambiente nao produtivo.
9. Gerar relatorio antes/depois e divergencias por origem.
10. Executar smoke pos-importacao no ambiente nao produtivo.
11. Registrar checklist humano: aprovado, aprovado com excecoes, no-go ou rollback.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Conexao acidental com producao | alto | medio | Bloquear nomes/flags/URLs produtivas antes de conectar e exigir ambiente nao produtivo explicito. |
| Secret impresso em log | alto | medio | Redacao centralizada de valores sensiveis e relatorios sem valores de env. |
| Reset indevido em staging/dev remoto | alto | medio | Reset exige snapshot, flag, aprovacao humana e confirmacao de nao producao. |
| Arquivos aprovados ausentes | medio | alto | Retornar `pending-input` ou pendencia operacional sem falhar nem importar. |
| Dry-run aprovado nao corresponde ao import | alto | medio | Reusar os mesmos contratos e gerar relatorio antes/depois com chaves e contagens. |
| Upsert duplica ou sobrescreve errado | alto | medio | Definir chaves naturais por entidade e abortar em duplicidade ou conflito nao mapeado. |
| Smoke pos-importacao exige URL indisponivel | medio | medio | Separar smoke local/preview e registrar pendencia humana quando URL nao existir. |
| Migration pendente no remoto | alto | medio | Revisar migrations e bloquear import se schema remoto nao for compativel, sem rodar migration automatica. |

## 10. Critério de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md` e `interfaces/` criados.
- [ ] `actions.md` futuro cobre ambiente staging/dev remoto, prechecks, bloqueio de producao, upsert, reset protegido, relatorios e smoke.
- [ ] Implementacao futura nao toca Laravel legado, nao copia `.env`, nao imprime secrets, nao conecta producao, nao faz deploy e nao roda migration real automatica.
- [ ] Com arquivos/ambiente ausentes, fluxo retorna `pending-input` ou pendencia operacional.
- [ ] Com arquivos e ambiente aprovados, fluxo importa por upsert seguro em staging/dev remoto e gera relatorio antes/depois.
- [ ] `cross-check.md` futuro sem CRITICAL nem HIGH.
- [ ] `regression-watch.md` futuro cobre bloqueio de producao, segredo, reset e upsert.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
