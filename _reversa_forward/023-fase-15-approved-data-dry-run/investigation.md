# Investigation - Fase 15

## Fontes consultadas

| Fonte | Evidencia relevante |
| --- | --- |
| `_reversa_forward/023-fase-15-approved-data-dry-run/requirements.md` | Pasta aprovada `data/dry-run/input/primeira-execucao/`, arquivos esperados e bifurcacao com/sem dados reais. |
| `_reversa_sdd/architecture.md` | Fase 14 criou pipeline local: entrada em `data/dry-run/input/`, normalizacao, reconciliacao, saida em `data/dry-run/output/` e comando seguro. |
| `_reversa_sdd/code-analysis.md` | Componentes existentes: `input-discovery`, `input-contracts`, `safety`, `normalize`, normalizers, `reconciliation`, `report-writer`, `run-dry-run`, `cli`. |
| `_reversa_sdd/data-dictionary.md` | Contratos CSV/JSON pos-Fase 14 para categorias, produtos, imagens, cupons e frete. |
| `_reversa_sdd/migration/data_migration_plan.md` | Divergencias bloqueadoras: `UNSAFE_INPUT`, `INPUT_MISSING`, `INVALID_HEADER`, `INVALID_VALUE`, `DUPLICATE_KEY`, `UNKNOWN_REFERENCE`, `IMAGE_MISSING`, `SHIPPING_COVERAGE_MISSING`. |
| `_reversa_sdd/migration/cutover_plan.md` | No-go se dry-run com fonte real aprovada nao for executado/aprovado ou se houver no-go. |
| `.gitignore` | `data/dry-run/input/*` e `data/dry-run/output/` ignorados, exceto `.gitkeep` e exemplos. |
| `package.json` | Script existente `ops:check-data-dry-run`. |

## Achados tecnicos

1. O script atual roda por `pnpm ops:check-data-dry-run` e encaminha argumentos para `src/features/data-dry-run/cli.ts`.
2. A CLI aceita `--input`, `--output` e `--format=json|markdown|both`.
3. A entrada padrao atual e `data/dry-run/input/examples` quando a pasta existe.
4. `resolveSafeInputDir` restringe entradas a `data/dry-run/input/`.
5. `resolveSafeOutputDir` restringe saidas a `data/dry-run/output/`.
6. `inputFileSpecs` atual aceita `categories`, `products`, `product-images`, `coupons` e `shipping-rules`.
7. A Fase 15 espera `product_images`, `inventory` e `shipping`, entao existe delta de contrato a planejar.
8. O contrato atual trata estoque em `products.stock_quantity`; a Fase 15 pede `inventory.csv/json` separado.
9. O scanner de seguranca ja bloqueia entradas suspeitas como `UNSAFE_INPUT`.
10. O comando nao deve ler `.env`, conectar banco, importar dados, fazer upload, rodar migration ou deploy.

## Alternativas avaliadas

| Alternativa | Resultado | Motivo |
| --- | --- | --- |
| Usar somente exemplos sinteticos | Descartada para a execucao aprovada | Exemplos validam pipeline, mas nao reconciliam catalogo real. |
| Exigir dados reais antes de qualquer implementacao | Descartada | Requirements determina que a fase deve preparar o fluxo mesmo se os arquivos ainda nao existirem. |
| Criar importador real junto com dry-run | Descartada | Fora de escopo e viola aprovacao humana futura. |
| Ler banco legado automaticamente | Descartada | Viola guardrails: sem conectar banco real e Laravel somente leitura/analisavel. |
| Aceitar aliases de arquivo alem dos nomes primarios | Recomendada | Reduz friccao entre contrato da Fase 14 e nomes pedidos na Fase 15 sem quebrar examples. |
| Tratar `inventory.csv/json` como Must da primeira execucao | Recomendada | A lacuna de estoque e bloqueadora de go-live e aparece nominalmente nos requirements. |

## Implicacoes para implementacao futura

- A primeira tarefa de coding deve preservar o comportamento seguro existente antes de qualquer ajuste.
- A detecao de arquivos deve diferenciar "pasta aprovada ausente/vazia" de "arquivo Must ausente".
- `inventory.csv/json` deve entrar como contrato proprio, sem mudar banco.
- Se o export real trouxer nomes nao previstos, o plano deve gerar `INVALID_HEADER` ou decisao humana, nao relaxar contrato silenciosamente.
- A saida sanitizada deve evitar linhas de produto, precos individuais sensiveis, URLs privadas ou identificadores nao aprovados.

## Pesquisa externa

Nenhuma pesquisa externa foi necessaria. A fase depende de contratos internos e artefatos Reversa ja versionados.
