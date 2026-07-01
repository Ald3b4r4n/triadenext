# Actions: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`
> Roadmap: `_reversa_forward/021-fase-13-legacy-parity/roadmap.md`

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de acoes | 39 |
| Paralelizaveis (`[//]`) | 18 |
| Maior cadeia de dependencia | 17 |

## Blocos de escopo

| Bloco | Cobertura principal | Acoes |
|-------|---------------------|-------|
| 1. Auditoria de modulos Laravel x Next | Inventarios, source maps e limites de leitura | T001-T007 |
| 2. Paridade de storefront e paginas publicas | Home, catalogo publico, produto e navegacao publica | T014, T019, T020 |
| 3. Paridade de catalogo, produtos, categorias, imagens, precos e estoque | Catalogo comercial e ativos de imagem | T015, T021, T023, T024 |
| 4. Paridade de carrinho, cupons, frete, checkout e pedidos | Fluxo de venda e integridade financeira | T016, T022, T024-T028 |
| 5. Paridade de clientes/auth/admin | Area do cliente, auth, policies e backoffice | T017, T022, T024 |
| 6. Inventario de dados legados | Entidades migraveis e decisao de obrigatoriedade | T021-T024 |
| 7. Estrategia de migracao dry-run | Formato intermediario, sanitizacao e gates | T025-T026, T032 |
| 8. Reconciliacao e relatorios de divergencia | Contagens, chaves, valores, status e assets | T027-T028, T032 |
| 9. Checklist de substituicao/go-live | Pronto para substituir, go/no-go e smoke final | T029, T031, T034 |
| 10. Rollback e riscos | Plano de retorno, abort criteria e risco operacional | T030-T031, T034 |
| 11. Validacoes finais | Impacto legado, regression watch e seguranca final | T036-T039 |

## Fase 1, Preparacao

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T001 | Confirmar workspace Next, caminho Laravel legado e guardrails read-only para a execucao da Fase 13. | - | - | `_reversa_forward/021-fase-13-legacy-parity/legacy-readonly-guardrails.md` | 🟢 | `[X]` |
| T002 | Criar mapa de fontes permitidas para auditoria, separando Laravel read-only, Next atual, SDD e artefatos da Fase 12. | T001 | - | `_reversa_forward/021-fase-13-legacy-parity/legacy-source-map.md` | 🟢 | `[X]` |
| [//] T003 | Inventariar superficie Laravel por dominios sem ler `.env`, sem artisan, sem banco e sem escrita no legado. | T002 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/legacy-module-inventory.md` | 🟢 | `[X]` |
| [//] T004 | Inventariar capacidades Next atuais por rotas, features, SDD, docs operacionais e testes existentes. | T002 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/next-capability-inventory.md` | 🟢 | `[X]` |
| [//] T005 | Documentar comandos e limites seguros da fase, incluindo proibicao de secrets, banco real, migrations reais, deploy e import real. | T002 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/safety-boundaries.md` | 🟢 | `[X]` |
| T006 | Definir taxonomia final de paridade e lacunas: `substituido`, `parcial`, `ausente`, `fora-do-go-live`, `decisao-humana` e `bloqueador`. | T003, T004, T005 | - | `_reversa_forward/021-fase-13-legacy-parity/parity-classification-model.md` | 🟢 | `[X]` |
| T007 | Definir indice de artefatos da Fase 13, donos logicos e ordem de preenchimento para evitar conflito de arquivos. | T006 | - | `_reversa_forward/021-fase-13-legacy-parity/parity-artifact-index.md` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T008 | Criar checklist de evidencia para paridade, exigindo fonte Laravel, fonte Next, status e justificativa por dominio. | T006, T007 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/parity-evidence-checklist.md` | 🟢 | `[X]` |
| [//] T009 | Criar template de validacao de inventario de dados com contagem, chave comercial, status, valor financeiro e assets. | T006, T007 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/data-inventory-validation.md` | 🟡 | `[X]` |
| [//] T010 | Criar checklist de seguranca para dry-run, cobrindo dados sanitizados, ambiente isolado e zero escrita em producao. | T006, T007 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/dry-run-safety-checklist.md` | 🟢 | `[X]` |
| [//] T011 | Definir criterios de aceite de reconciliacao para contagens, chaves, valores em centavos, status, amostras mascaradas e imagens. | T006, T007 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/reconciliation-acceptance.md` | 🟡 | `[X]` |
| [//] T012 | Definir smoke checklist para readiness de substituicao usando dados controlados, sem credenciais reais e sem deploy automatico. | T006, T007 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/go-live-smoke-checklist.md` | 🟢 | `[X]` |
| T013 | Consolidar plano de regression watch semantico para preservar guardrails e regras ja implementadas durante a fase. | T008, T009, T010, T011, T012 | - | `_reversa_forward/021-fase-13-legacy-parity/regression-watch-plan.md` | 🟢 | `[X]` |

## Fase 3, Nucleo

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T014 | Auditar paridade de storefront e paginas publicas entre Laravel e Next, incluindo home, catalogo, produto e navegacao publica. | T003, T004, T008 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/parity-storefront.md` | 🟢 | `[X]` |
| [//] T015 | Auditar paridade de catalogo, produtos, categorias, imagens, precos, estoque e criterios de catalogo vendavel. | T003, T004, T008 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/parity-catalog.md` | 🟢 | `[X]` |
| [//] T016 | Auditar paridade de carrinho, cupons, frete, checkout, pedidos e integridade financeira do fluxo de compra. | T003, T004, T008 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/parity-commerce-flow.md` | 🟢 | `[X]` |
| [//] T017 | Auditar paridade de auth, cliente, minha conta, pedidos do cliente, admin e policies operacionais. | T003, T004, T008 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/parity-customer-admin.md` | 🟢 | `[X]` |
| [//] T018 | Auditar dominios legados fora do escopo ou de decisao humana, incluindo Bling, NF-e, rotinas fiscais, WhatsApp, SMS, frete externo, relatorios e analytics. | T003, T004, T008 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/parity-integrations-out-of-scope.md` | 🟢 | `[X]` |
| T019 | Consolidar matriz de paridade com status, evidencias, lacunas e justificativa por dominio. | T014, T015, T016, T017, T018 | - | `_reversa_forward/021-fase-13-legacy-parity/legacy-parity-matrix.md` | 🟢 | `[X]` |
| T020 | Criar registro de lacunas bloqueadoras, nao bloqueadoras, pos-go-live, fora de escopo e decisao humana. | T019 | - | `_reversa_forward/021-fase-13-legacy-parity/legacy-gap-register.md` | 🟢 | `[X]` |
| [//] T021 | Inventariar dados legados de categorias, produtos, imagens, precos, estoque, cupons e regras/configuracoes de frete. | T020, T009 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/legacy-data-inventory-catalog.md` | 🟡 | `[X]` |
| [//] T022 | Inventariar dados legados de clientes, enderecos, pedidos, itens, pagamentos/status e dados administrativos. | T020, T009 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/legacy-data-inventory-operational.md` | 🟡 | `[X]` |
| [//] T023 | Inventariar ativos de imagem e estrategia de correspondencia produto-imagem, incluindo capa, fallback e arquivos ausentes. | T020, T009 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/legacy-image-inventory.md` | 🟡 | `[X]` |
| T024 | Consolidar inventario de dados legados com obrigatoriedade inicial, risco, transformacao esperada e reconciliacao por entidade. | T021, T022, T023 | - | `_reversa_forward/021-fase-13-legacy-parity/legacy-data-inventory.md` | 🟡 | `[X]` |
| T025 | Definir formato intermediario, sanitizacao e mapeamento origem-destino para migracao controlada em dry-run. | T024, T010 | - | `_reversa_forward/021-fase-13-legacy-parity/controlled-migration-plan.md` | 🟢 | `[X]` |
| T026 | Definir modelo de execucao do dry-run com gates de aprovacao humana e proibicao de importacao real automatica. | T025 | - | `_reversa_forward/021-fase-13-legacy-parity/dry-run-execution-model.md` | 🟢 | `[X]` |
| T027 | Definir reconciliacao por contagens, chaves comerciais, valores em centavos, status, amostras mascaradas e assets. | T024, T011 | - | `_reversa_forward/021-fase-13-legacy-parity/dry-run-reconciliation.md` | 🟡 | `[X]` |
| T028 | Definir relatorio de divergencias por severidade, dominio, impacto no go-live e proxima acao recomendada. | T027 | - | `_reversa_forward/021-fase-13-legacy-parity/divergence-report-model.md` | 🟡 | `[X]` |
| [//] T029 | Rascunhar checklist de substituicao/go-live com pre-requisitos, smoke final, janela, criterio de avancar e criterio de abortar. | T019, T020, T012, T028 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/go-live-substitution-checklist.md` | 🟢 | `[X]` |
| [//] T030 | Rascunhar plano de rollback com legado intacto, descarte de dry-run, backup futuro e retorno operacional. | T020, T028 | `[//]` | `_reversa_forward/021-fase-13-legacy-parity/rollback-plan.md` | 🟢 | `[X]` |

## Fase 4, Integracao

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T031 | Integrar matriz de paridade, gap register, checklist e rollback em um framework de decisao go/no-go. | T020, T029, T030 | - | `_reversa_forward/021-fase-13-legacy-parity/go-live-decision-framework.md` | 🟢 | `[X]` |
| T032 | Integrar inventario de dados, plano de dry-run e reconciliacao em um roteiro unico de migracao controlada. | T024, T025, T026, T027, T028 | - | `_reversa_forward/021-fase-13-legacy-parity/controlled-migration-readiness.md` | 🟢 | `[X]` |
| T033 | Alinhar os resultados da Fase 13 aos checklists e scripts seguros da Fase 12 sem alterar scripts operacionais. | T031, T032 | - | `_reversa_forward/021-fase-13-legacy-parity/phase12-readiness-alignment.md` | 🟢 | `[X]` |
| T034 | Consolidar checklist final de substituicao com itens pre-go-live, itens pos-go-live e bloqueadores reais. | T031, T032, T033 | - | `_reversa_forward/021-fase-13-legacy-parity/final-substitution-checklist.md` | 🟢 | `[X]` |
| T035 | Registrar criterios finais de pronto para go-live futuro e recomendacao de proxima etapa sem executar deploy, migration ou import real. | T013, T034 | - | `_reversa_forward/021-fase-13-legacy-parity/go-live-readiness-note.md` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T036 | Gerar `legacy-impact.md` da Fase 13, documentando que o Laravel foi apenas analisado em leitura e nao modificado. | T035 | - | `_reversa_forward/021-fase-13-legacy-parity/legacy-impact.md` | 🟢 | `[X]` |
| T037 | Gerar `regression-watch.md` da Fase 13 com guardrails de dominio, seguranca, dados, secrets, deploy e Laravel read-only. | T036 | - | `_reversa_forward/021-fase-13-legacy-parity/regression-watch.md` | 🟢 | `[X]` |
| T038 | Registrar validacoes seguras da fase, incluindo status Git, ausencia de alteracao funcional, ausencia de secrets e `next-env.d.ts` limpo. | T037 | - | `_reversa_forward/021-fase-13-legacy-parity/validation-results.md` | 🟢 | `[X]` |
| T039 | Fazer revisao final dos artefatos da Fase 13 e confirmar que nao houve commit, push, deploy, migration real, banco real, import real ou alteracao no Laravel. | T038 | - | `_reversa_forward/021-fase-13-legacy-parity/final-safety-review.md` | 🟢 | `[X]` |

## Notas de execucao

- O Laravel legado em `D:\Projetos\triadeessenzaparfum.com.br` e fonte somente leitura.
- Nao ler, copiar, imprimir ou versionar `.env` ou secrets.
- Nao executar artisan, migrations reais, importacao real, conexao com banco real, deploy ou push durante a implementacao da fase.
- Bling, NF-e, rotinas fiscais, WhatsApp e SMS devem aparecer como lacunas/out-of-scope ou decisao humana, nao como implementacao.
- As tarefas paralelizaveis foram marcadas somente quando usam arquivos alvo diferentes e nao dependem diretamente umas das outras.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-07-01 | Versao inicial gerada por `/reversa-to-do` | reversa |
