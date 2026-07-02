# Interface: Reconciliation Report

> Tipo: arquivo local JSON/Markdown
> Feature: `022-fase-14-data-dry-run`

## Finalidade

Definir o contrato do relatório gerado pelo dry-run. O relatório deve apoiar decisão humana sobre importação futura, sem executar import, migration, deploy, upload real ou conexão com banco real.

## Saídas esperadas

| Arquivo | Uso |
|---------|-----|
| `reconciliation-report.json` | Saída estruturada para automação e testes. |
| `reconciliation-report.md` | Saída legível para revisão humana. |

Arquivos gerados com dados reais ou sensíveis devem permanecer fora do Git. Relatórios versionáveis precisam usar dados sintéticos ou mascarados.

## Estrutura JSON

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-02T00:00:00-03:00",
  "source": {
    "type": "local-files",
    "pathLabel": "data/dry-run/input",
    "approvedBy": "manual",
    "containsSensitiveData": false
  },
  "summary": {
    "goNoGo": "no-go",
    "blockers": 0,
    "warnings": 0
  },
  "counts": [],
  "keys": [],
  "money": [],
  "assets": [],
  "shipping": [],
  "coupons": [],
  "divergences": [],
  "privacy": {
    "secretsDetected": false,
    "rawPersonalDataInReport": false
  }
}
```

## Seções obrigatórias

| Seção | Conteúdo |
|-------|----------|
| `source` | Tipo de fonte, rótulo da pasta e aprovação manual, sem imprimir caminho secreto ou credenciais. |
| `summary` | Go/no-go, quantidade de bloqueadores, warnings e status geral. |
| `counts` | Contagens por entidade: origem, normalizado, diferença e justificativa. |
| `keys` | Duplicatas/ausências em SKU, slug, código de cupom e regra de frete. |
| `money` | Preço, cupom e frete comparados em centavos. |
| `assets` | Produto, referência de imagem, capa, fallback e ausentes. |
| `shipping` | Cobertura mínima de UF/CEP, valor e prazo. |
| `coupons` | Cupons ativos, tipo, valor, vigência, limite e divergências. |
| `divergences` | Lista classificada por severidade e impacto no go-live. |
| `privacy` | Confirmação de ausência de secrets e dados pessoais crus no relatório. |

## Modelo de divergência

| Campo | Obrigatório | Exemplo |
|-------|-------------|---------|
| `id` | sim | `DVG-001` |
| `code` | sim | `UNSAFE_INPUT`, `INVALID_VALUE`, `IMAGE_MISSING` |
| `domain` | sim | `catalogo`, `imagens`, `cupons`, `frete` |
| `entityKey` | sim | SKU, slug, coupon code ou rule code |
| `severity` | sim | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `goLiveImpact` | sim | `bloqueador`, `decisao-humana`, `pos-go-live`, `fora-de-escopo` |
| `message` | sim | Descrição curta. |
| `recommendedAction` | sim | `corrigir-origem`, `corrigir-mapeamento`, `aceitar-excecao`, `nova-fase` |

## Critérios de go/no-go

| Resultado | Condição |
|-----------|----------|
| `go` | Zero divergência bloqueadora em produtos publicados, preços, estoque, imagens/fallback, cupons ativos e frete mínimo. |
| `conditional-go` | Existem divergências não bloqueadoras aceitas formalmente. |
| `no-go` | Há divergência financeira, produto publicado inválido, imagem/fallback ausente, frete mínimo ausente, secret ou dado cru no relatório. |

## Segurança

- Não imprimir `.env`.
- Não imprimir URL real de banco.
- Não imprimir secrets.
- Não incluir dados pessoais crus.
- Não incluir binários de imagem.
- Não declarar import real como executado.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
