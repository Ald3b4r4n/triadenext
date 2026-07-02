# Guia Operacional do Dry-run Controlado

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Objetivo

Executar uma validação local, segura e repetível dos dados Must da migração: categorias, produtos, imagens por referência, preços, estoque, cupons e frete mínimo.

## Comando padrão seguro

```powershell
pnpm ops:check-data-dry-run
```

Sem parâmetros, o comando usa exemplos sintéticos em `data/dry-run/input/examples/` e escreve relatórios em `data/dry-run/output/`.

## Comando com fonte local aprovada

```powershell
pnpm ops:check-data-dry-run -- --input data/dry-run/input/<pasta-aprovada>
```

Regras:

- A pasta de entrada precisa ficar dentro de `data/dry-run/input/`.
- Dados reais ou sensíveis continuam ignorados pelo Git.
- O script não lê `.env` e não exige credenciais.
- O script não conecta banco, não importa dados, não roda migration, não copia imagens, não faz upload e não faz deploy.

## Formatos de saída

```powershell
pnpm ops:check-data-dry-run -- --format json
pnpm ops:check-data-dry-run -- --format markdown
pnpm ops:check-data-dry-run -- --format both
```

Arquivos gerados:

- `data/dry-run/output/reconciliation-report.json`
- `data/dry-run/output/reconciliation-report.md`

## Exit codes

| Código | Significado |
|--------|-------------|
| `0` | Resultado `go` ou `conditional-go`; ainda exige aprovação humana antes de import real. |
| `1` | Resultado `no-go`, entrada insegura, pasta fora do permitido ou erro de contrato. |

## Como interpretar o relatório

| Seção | Uso operacional |
|-------|-----------------|
| `summary` | Decide `go`, `conditional-go` ou `no-go`. |
| `counts` | Compara quantidade de registros de origem e normalizados. |
| `keys` | Mostra chaves comerciais normalizadas. |
| `money` | Confere preço, cupom e frete em centavos. |
| `assets` | Confere capa, fallback e referências de imagem. |
| `shipping` | Confere cobertura mínima por UF ou faixa de CEP. |
| `coupons` | Confere código, tipo, valor e status de cupons. |
| `divergences` | Lista bloqueios e ações recomendadas. |
| `privacy` | Confirma se houve sinal de secret ou dado cru sensível. |

## Critérios de bloqueio

- `summary.goNoGo = no-go`.
- Divergência `CRITICAL` ou `HIGH`.
- `goLiveImpact = bloqueador`.
- `privacy.secretsDetected = true`.
- Produto publicado sem imagem/fallback, preço positivo, estoque positivo ou data válida.
- Frete mínimo ausente.

## Próxima ação após execução

1. Corrigir a fonte ou o mapeamento quando houver bloqueador.
2. Reexecutar o dry-run.
3. Guardar relatório real fora do Git se contiver dados reais.
4. Usar `future-import-approval-checklist.md` apenas para preparar a decisão humana futura.

## Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Guia operacional inicial da Fase 14 | reversa-coding |
