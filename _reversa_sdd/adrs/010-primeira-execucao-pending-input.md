# ADR 010 - Primeira execucao aprovada e pending-input

Data: 2026-07-02

## Contexto

A Fase 14 criou o dry-run controlado por arquivos locais e validou o pipeline com exemplos sinteticos. A Fase 15 precisava preparar a primeira execucao aprovada sem assumir que os arquivos reais/exportados ja existem e sem transformar ausencia de dados em sucesso ou falha indevida.

## Decisao

A primeira execucao aprovada passa a ser `data/dry-run/input/primeira-execucao/`.

Quando essa pasta estiver ausente, vazia ou sem arquivos Must, o dry-run deve retornar `pending-input`, gerar relatorio de pendencias e preservar a seguranca operacional. O estado `pending-input` significa que faltam arquivos aprovados; nao autoriza importacao, upload, banco, migration ou deploy.

Os nomes primarios da Fase 15 sao:

- `products.csv` ou `products.json`
- `categories.csv` ou `categories.json`
- `product_images.csv` ou `product_images.json`
- `inventory.csv` ou `inventory.json`
- `coupons.csv` ou `coupons.json`
- `shipping.csv` ou `shipping.json`

Aliases da Fase 14 continuam aceitos para compatibilidade:

- `product-images.csv` ou `product-images.json`
- `shipping-rules.csv` ou `shipping-rules.json`

## Consequencias

- A ausencia de arquivos reais/exportados vira pendencia humana, nao `go`.
- A reconciliacao de inventario roda em memoria e nao altera schema ou banco.
- Divergencias sao classificadas por origem: `dados`, `next`, `mapeamento` ou `humana`.
- Relatorios continuam em `data/dry-run/output/`, ignorados pelo Git.
- Dados reais em `data/dry-run/input/primeira-execucao/` continuam ignorados pelo Git.
- O Laravel legado permanece somente leitura.
- Nao ha importacao real, upload real, migration real, banco real, deploy ou segredo em codigo.

## Alternativas descartadas

- Falhar com `no-go` quando a primeira execucao ainda nao tem arquivos.
- Usar exemplos sinteticos como fallback silencioso para `primeira-execucao`.
- Conectar banco legado para preencher automaticamente a pasta aprovada.
- Versionar relatorios brutos da execucao real.

## Status

Aceito na Fase 15.
