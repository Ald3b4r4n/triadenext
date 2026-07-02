# Actions: Fase 14 - Controlled Data Dry-run and Reconciliation

> Identificador: `022-fase-14-data-dry-run`
> Data: `2026-07-02`
> Roadmap: `_reversa_forward/022-fase-14-data-dry-run/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 36 |
| Paralelizáveis (`[//]`) | 18 |
| Maior cadeia de dependência | 16 |

## Blocos de escopo

| Bloco | Cobertura | Ações |
|-------|-----------|-------|
| 1. Preparação segura da estrutura `data/dry-run/` | Estrutura local, `.gitkeep`, `.gitignore`, contrato de comando e aprovação de fonte | T001-T006 |
| 2. Contratos de entrada CSV/JSON | Fixtures e testes de segurança/contrato | T007-T013 |
| 3. Normalizadores de produtos/categorias/preços/estoque | Tipos, parser, categorias, produtos, dinheiro e estoque | T014-T019, T023 |
| 4. Normalizadores de cupons e frete mínimo | Cupons, regras de frete e cobertura mínima | T020-T021, T023 |
| 5. Validação de referências de imagens | Referências, capa, fallback e ausentes | T022-T023 |
| 6. Dry-run sem escrita real | Runner local fail-closed e CLI operacional | T027-T029 |
| 7. Relatório de reconciliação | Engine, serializadores JSON/Markdown e validação de saída | T025-T026 |
| 8. Divergências bloqueadoras/não bloqueadoras | Modelo de severidade e impacto go-live | T024-T025 |
| 9. Checklist de aprovação humana | Checklist e guia operacional | T030-T031 |
| 10. Testes unitários/e2e/smoke seguros | Unitários, fixtures e smoke seguro | T007-T013 |
| 11. Validações finais | Watch, impacto legado, validações e revisão final | T032-T036 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Confirmar workspace Next, caminho Laravel legado e guardrails da Fase 14 sem tocar no legado. | - | - | `_reversa_forward/022-fase-14-data-dry-run/dry-run-safety-boundaries.md` | 🟢 | `[X]` |
| T002 | Definir mapa de arquivos da implementação, donos lógicos e ordem de execução para evitar conflito de edição. | T001 | - | `_reversa_forward/022-fase-14-data-dry-run/dry-run-file-map.md` | 🟢 | `[X]` |
| [//] T003 | Criar estrutura segura `data/dry-run/input/` com `.gitkeep` e padrões de ignore para entradas/saídas reais. | T002 | `[//]` | `.gitignore` | 🟢 | `[X]` |
| [//] T004 | Criar exemplos sintéticos seguros para categorias, produtos, imagens, cupons e frete mínimo. | T002 | `[//]` | `data/dry-run/input/examples/` | 🟢 | `[X]` |
| [//] T005 | Definir contrato de comando do dry-run, incluindo nome do script, parâmetros aceitos e bloqueios de operação real. | T002 | `[//]` | `_reversa_forward/022-fase-14-data-dry-run/dry-run-command-contract.md` | 🟢 | `[X]` |
| [//] T006 | Criar template de registro de aprovação humana da fonte local usada no dry-run. | T002 | `[//]` | `_reversa_forward/022-fase-14-data-dry-run/source-approval-template.md` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Criar fixtures sintéticas de teste para entradas válidas, inválidas e perigosas de dry-run. | T003, T004 | - | `src/tests/fixtures/data-dry-run/` | 🟢 | `[X]` |
| [//] T008 | Cobrir descoberta de entrada, bloqueio de paths inseguros e ausência de dados reais versionáveis. | T007 | `[//]` | `src/tests/unit/data-dry-run-input-safety.test.ts` | 🟢 | `[X]` |
| [//] T009 | Cobrir normalização de categorias, produtos, preços em centavos e estoque. | T007 | `[//]` | `src/tests/unit/data-dry-run-catalog-normalizers.test.ts` | 🟢 | `[X]` |
| [//] T010 | Cobrir normalização de cupons ativos, tipos, vigência, limites e valores. | T007 | `[//]` | `src/tests/unit/data-dry-run-coupon-normalizer.test.ts` | 🟢 | `[X]` |
| [//] T011 | Cobrir normalização de frete mínimo por UF/faixa de CEP, preço e prazo. | T007 | `[//]` | `src/tests/unit/data-dry-run-shipping-normalizer.test.ts` | 🟢 | `[X]` |
| [//] T012 | Cobrir validação de referências de imagem, capa, fallback e ausências bloqueadoras. | T007 | `[//]` | `src/tests/unit/data-dry-run-image-references.test.ts` | 🟢 | `[X]` |
| [//] T013 | Cobrir reconciliação, severidade, go/no-go e privacidade do relatório. | T007 | `[//]` | `src/tests/unit/data-dry-run-reconciliation.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T014 | Criar tipos, entidades normalizadas, erros e taxonomias da Fase 14. | T003, T004, T005, T006 | - | `src/features/data-dry-run/types.ts` | 🟢 | `[X]` |
| T015 | Implementar descoberta segura de arquivos locais e validação de pasta permitida. | T014 | - | `src/features/data-dry-run/input-discovery.ts` | 🟢 | `[X]` |
| T016 | Implementar parser CSV/JSON e validação de cabeçalhos/campos obrigatórios sem nova dependência externa obrigatória. | T015 | - | `src/features/data-dry-run/input-contracts.ts` | 🟢 | `[X]` |
| T017 | Implementar scanner de segurança para `.env`, secrets, URL real de banco, dado cru sensível e sinais de operação real. | T015 | - | `src/features/data-dry-run/safety.ts` | 🟢 | `[X]` |
| [//] T018 | Implementar normalizador de categorias com slug, hierarquia, ativo e ordenação. | T016, T017 | `[//]` | `src/features/data-dry-run/normalizers/categories.ts` | 🟢 | `[X]` |
| [//] T019 | Implementar normalizador de produtos com SKU, slug, status, preço em centavos e estoque. | T016, T017 | `[//]` | `src/features/data-dry-run/normalizers/products.ts` | 🟢 | `[X]` |
| [//] T020 | Implementar normalizador de cupons com código uppercase, tipo, valor, vigência, uso e subtotal mínimo. | T016, T017 | `[//]` | `src/features/data-dry-run/normalizers/coupons.ts` | 🟢 | `[X]` |
| [//] T021 | Implementar normalizador de frete mínimo com UF/faixa CEP, preço em centavos, prazo e prioridade. | T016, T017 | `[//]` | `src/features/data-dry-run/normalizers/shipping.ts` | 🟢 | `[X]` |
| [//] T022 | Implementar normalizador e validador de imagens por referência, capa, ordem, alt e fallback aprovado. | T016, T017 | `[//]` | `src/features/data-dry-run/normalizers/images.ts` | 🟢 | `[X]` |
| T023 | Agregar normalizadores e aplicar gates de entidades Must sem persistir dados. | T018, T019, T020, T021, T022 | - | `src/features/data-dry-run/normalize.ts` | 🟢 | `[X]` |
| T024 | Implementar modelo de divergências com severidade, impacto go-live e ação recomendada. | T014 | - | `src/features/data-dry-run/divergences.ts` | 🟢 | `[X]` |
| T025 | Implementar engine de reconciliação para contagens, chaves, dinheiro, assets, cupons, frete e privacidade. | T023, T024 | - | `src/features/data-dry-run/reconciliation.ts` | 🟢 | `[X]` |
| T026 | Implementar serializadores de relatório JSON e Markdown sem dados sensíveis crus. | T025 | - | `src/features/data-dry-run/report-writer.ts` | 🟢 | `[X]` |
| T027 | Implementar runner de dry-run fail-closed, sem banco real, import real, migration, upload, deploy ou provider externo. | T017, T026 | - | `src/features/data-dry-run/run-dry-run.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T028 | Criar script operacional local para executar o dry-run sobre arquivos controlados e retornar código de saída seguro. | T027 | - | `scripts/ops/check-data-dry-run-readiness.mjs` | 🟢 | `[X]` |
| T029 | Registrar script `ops:check-data-dry-run` sem adicionar dependências, migration, banco, upload ou deploy. | T028 | - | `package.json` | 🟢 | `[X]` |
| [//] T030 | Criar checklist de aprovação humana para importação real futura, separado de go-live, deploy e migration. | T025 | `[//]` | `_reversa_forward/022-fase-14-data-dry-run/future-import-approval-checklist.md` | 🟢 | `[X]` |
| T031 | Criar guia operacional da Fase 14 com comando local, entradas esperadas, saídas e critérios de bloqueio. | T029, T030 | - | `_reversa_forward/022-fase-14-data-dry-run/dry-run-operator-guide.md` | 🟢 | `[X]` |
| [//] T032 | Criar plano de validação final com comandos seguros e proibições explícitas de operação real. | T029 | `[//]` | `_reversa_forward/022-fase-14-data-dry-run/validation-plan.md` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| [//] T033 | Gerar `legacy-impact.md` confirmando Laravel somente leitura e ausência de import, banco, deploy, upload e secrets. | T032 | `[//]` | `_reversa_forward/022-fase-14-data-dry-run/legacy-impact.md` | 🟢 | `[X]` |
| [//] T034 | Gerar `regression-watch.md` para catálogo, imagens, preços, estoque, cupons, frete e guardrails de operação real. | T032 | `[//]` | `_reversa_forward/022-fase-14-data-dry-run/regression-watch.md` | 🟢 | `[X]` |
| T035 | Registrar resultados de lint, typecheck, testes, build, E2E e dry-run seguro com fixtures sintéticas. | T008, T009, T010, T011, T012, T013, T029, T031, T033, T034 | - | `_reversa_forward/022-fase-14-data-dry-run/validation-results.md` | 🟢 | `[X]` |
| T036 | Fazer revisão final dos artefatos e confirmar que não houve commit, push, deploy, migration, banco real, import real, upload real, secrets ou alteração no Laravel. | T035 | - | `_reversa_forward/022-fase-14-data-dry-run/final-safety-review.md` | 🟢 | `[X]` |

## Notas de execução

- Não executar importação real em produção.
- Não executar migration real.
- Não conectar banco real ou legado.
- Não copiar `.env` ou imprimir secrets.
- Não copiar binários reais de imagem nem fazer upload real.
- Não alterar Laravel legado.
- Clientes, endereços e pedidos históricos ficam fora do escopo Must inicial.
- Bling, NF-e, WhatsApp e SMS permanecem fora de escopo.
- Se `next-env.d.ts` sujar, restaurar antes de finalizar a execução.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-to-do` | reversa |
