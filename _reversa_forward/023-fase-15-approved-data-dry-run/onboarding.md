# Onboarding - Fase 15

## Objetivo do teste humano

Validar a primeira execucao aprovada do dry-run de dados em `data/dry-run/input/primeira-execucao/`, sem importar dados, sem upload, sem banco real, sem migration, sem deploy e sem alterar o Laravel legado.

## Antes de comecar

1. Confirme que esta no projeto Next:

```powershell
Get-Location
```

Resultado esperado:

```text
D:\Projetos\triade-essenza-next
```

2. Confirme que nao esta no Laravel legado:

```powershell
Test-Path D:\Projetos\triadeessenzaparfum.com.br
```

Esse comando apenas confirma que o legado existe no disco; ele nao deve ser alterado.

3. Confirme que o worktree nao contem dados reais versionaveis por engano:

```powershell
git status --short
git check-ignore -v data/dry-run/input/primeira-execucao/products.csv
```

## Se os arquivos reais/exportados ainda nao existirem

Nao invente dados reais. Nao copie dados do Laravel. Nao use `.env`.

Execute o comando apontando explicitamente para a pasta aprovada para gerar o relatorio de pendencia:

```powershell
pnpm ops:check-data-dry-run -- --input data/dry-run/input/primeira-execucao --format both
```

O resultado esperado e `pending-input`, sem falha operacional indevida. Registre a pendencia de entrada aprovada e prepare a lista de arquivos que precisam ser colocados manualmente em:

```text
data/dry-run/input/primeira-execucao/
```

Arquivos esperados:

```text
products.csv ou products.json
categories.csv ou categories.json
product_images.csv ou product_images.json
inventory.csv ou inventory.json
coupons.csv ou coupons.json
shipping.csv ou shipping.json
```

Exemplos sinteticos permanecem em:

```text
data/dry-run/input/examples/
```

## Se os arquivos reais/exportados existirem

Execute o dry-run apontando explicitamente para a pasta aprovada:

```powershell
pnpm ops:check-data-dry-run -- --input data/dry-run/input/primeira-execucao --format both
```

Resultado esperado:

- O comando processa apenas arquivos locais.
- Nenhum banco real e acessado.
- Nenhuma migration e executada.
- Nenhum dado e importado.
- Nenhum upload de imagem e executado.
- Nenhum deploy e feito.
- O relatorio bruto fica em `data/dry-run/output/`, ignorado pelo Git.

## Como interpretar o resultado

| Resultado | Significado | Proxima acao |
| --- | --- | --- |
| `pending-input` | Arquivos reais/exportados ainda ausentes ou incompletos. | Solicitar/preparar export aprovado. |
| `go` | Dry-run sem bloqueadores nos dominios Must. | Preparar checklist humano de importacao futura. |
| `no-go` | Ha divergencia bloqueadora. | Classificar origem e corrigir somente se for problema do Next. |

Relatorios gerados:

```text
data/dry-run/output/examples-go/
data/dry-run/output/primeira-execucao-pending-input/
data/dry-run/output/primeira-execucao-go/
data/dry-run/output/primeira-execucao-no-go/
```

Essas pastas ficam ignoradas pelo Git.

## Classificacao de divergencias

Use tres donos possiveis:

- `next`: parser, contrato, normalizador, reconciliacao, relatorio ou mensagem operacional do projeto Next.
- `dados/exportacao`: dado ausente, invalido, duplicado, referencia quebrada, imagem sem referencia, frete minimo ausente ou estoque inconsistente.
- `mapeamento`: campo ou formato do export aprovado que exige ajuste explicito de contrato/normalizacao.
- `decisao-humana`: caso em que a regra e aceitabilidade precisam ser decididas antes de corrigir.

Checklist humano:

```text
_reversa_forward/023-fase-15-approved-data-dry-run/human-approval-checklist.md
```

## Fechamento esperado da implementacao

Antes de qualquer commit futuro da Fase 15, rodar:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Tambem confirmar:

```powershell
git status --short next-env.d.ts
git status --short data/dry-run/input data/dry-run/output
```

## Guardrails

- Nao alterar Laravel legado.
- Nao copiar `.env`.
- Nao imprimir secrets.
- Nao conectar banco real.
- Nao importar dados reais.
- Nao fazer upload real.
- Nao rodar migration real.
- Nao fazer deploy.
- Nao fazer push automatico.
- Nao versionar dados reais sensiveis.
