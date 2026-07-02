# Legacy Impact - Fase 15 Approved Data Dry-run Execution and Blocker Fixes

## Cabecalho

- Data: 2026-07-02
- Feature: `023-fase-15-approved-data-dry-run`
- Escopo: dry-run aprovado por arquivos locais, pendencia de entrada, inventario, classificacao de divergencias e relatorios sanitizados.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| --- | --- | --- | --- | --- |
| `src/features/data-dry-run/types.ts` | `src/features/data-dry-run` | delta-de-dados | LOW | Adiciona `pending-input`, inventario e origem de divergencias em memoria, sem schema real. |
| `src/features/data-dry-run/input-discovery.ts` | `src/features/data-dry-run` | regra-alterada | LOW | Detecta `data/dry-run/input/primeira-execucao/` e pendencia sem criar/copiar dados reais. |
| `src/features/data-dry-run/input-contracts.ts` | `src/features/data-dry-run` | delta-de-contrato-externo | MEDIUM | Aceita nomes primarios da Fase 15 e aliases da Fase 14 para CSV/JSON locais. |
| `src/features/data-dry-run/normalizers/inventory.ts` | `src/features/data-dry-run` | componente-novo | MEDIUM | Normaliza inventario local em memoria, sem banco e sem importacao. |
| `src/features/data-dry-run/normalizers/products.ts` | `src/features/data-dry-run` | regra-alterada | LOW | Permite estoque separado em `inventory.csv/json` sem mudar regra de produto persistido. |
| `src/features/data-dry-run/normalize.ts` | `src/features/data-dry-run` | delta-de-dados | LOW | Integra inventario ao modelo normalizado temporario do dry-run. |
| `src/features/data-dry-run/divergences.ts` | `src/features/data-dry-run` | regra-nova | LOW | Classifica origem de divergencias para dados, Next, mapeamento ou decisao humana. |
| `src/features/data-dry-run/reconciliation.ts` | `src/features/data-dry-run` | regra-alterada | MEDIUM | Gera `pending-input`, reconcilia inventario e enriquece divergencias. |
| `src/features/data-dry-run/report-writer.ts` | `src/features/data-dry-run` | regra-alterada | LOW | Escreve relatorios por execucao e resumo sanitizado em `data/dry-run/output/`. |
| `src/features/data-dry-run/run-dry-run.ts` | `src/features/data-dry-run` | regra-alterada | LOW | Curto-circuita pendencia de entrada sem falha operacional indevida. |
| `src/features/data-dry-run/safety.ts` | `src/features/data-dry-run` | regra-alterada | LOW | Redige valores inseguros antes de evidencias de relatorio. |
| `src/tests/unit/data-dry-run-*.test.ts` | Testes unitarios | componente-novo | LOW | Cobre pasta aprovada, aliases, inventario, pendencia e resumo sanitizado. |
| `_reversa_forward/023-fase-15-approved-data-dry-run/*` | Reversa Forward | componente-novo | LOW | Registra requirements, plano, actions, auditoria, checklist, progresso e watch. |

## Diff conceitual por componente

### `src/features/data-dry-run`

O pipeline da Fase 14 continua read-only e local. A Fase 15 adiciona a execucao aprovada `primeira-execucao`, trata ausencia de arquivos reais como `pending-input`, aceita contratos CSV/JSON novos (`product_images`, `inventory`, `shipping`) e preserva aliases existentes (`product-images`, `shipping-rules`).

### Relatorios

Relatorios brutos continuam em `data/dry-run/output/`, ignorados pelo Git. A escrita agora separa subpastas por fonte/status, como `examples-go` e `primeira-execucao-pending-input`, e gera resumo sanitizado agregado.

### Reversa Forward

A feature passa a ter checklist humano, progress log, impacto legado e watch items para retomar o ciclo de re-extracao futura.

## Preservadas

- 🟢 Laravel legado permanece somente leitura e nao foi alterado.
- 🟢 O dry-run usa apenas arquivos locais dentro de `data/dry-run/input/`.
- 🟢 Dados reais em `data/dry-run/input/` permanecem fora do Git.
- 🟢 Relatorios em `data/dry-run/output/` permanecem fora do Git.
- 🟢 `ops:check-data-dry-run` nao conecta banco, nao importa dados, nao roda migration, nao faz upload, nao faz deploy e nao le `.env`.
- 🟢 Entradas com aparencia de `.env`, secret, token, URL real de banco ou credencial continuam classificadas como inseguras.
- 🟢 Regras de pagamento, estoque persistido, cupons, frete funcional, checkout, pedidos e notificacoes nao foram alteradas.

## Modificadas

Nenhuma regra verde do SDD foi removida ou enfraquecida.
