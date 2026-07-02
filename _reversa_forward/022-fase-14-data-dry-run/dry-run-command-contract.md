# Dry-run Command Contract

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Script

O comando operacional planejado é:

```powershell
pnpm ops:check-data-dry-run
```

## Entrada padrão

- Diretório padrão: `data/dry-run/input/examples`.
- Diretório real permitido: qualquer caminho dentro de `data/dry-run/input/`.
- Dados reais sensíveis devem ficar ignorados pelo Git.

## Parâmetros

| Parâmetro | Uso |
|-----------|-----|
| `--input <path>` | Define a pasta de entrada, obrigatoriamente dentro de `data/dry-run/input/`. |
| `--output <path>` | Define a pasta de saída, obrigatoriamente dentro de `data/dry-run/output/`. |
| `--format json` | Escreve apenas relatório JSON. |
| `--format markdown` | Escreve apenas relatório Markdown. |
| `--format both` | Escreve JSON e Markdown. Valor padrão. |

## Comportamento esperado

- Ler apenas arquivos locais CSV/JSON.
- Normalizar dados em memória.
- Gerar relatório em `data/dry-run/output/`.
- Retornar exit code `0` quando o resultado for `go` ou `conditional-go`.
- Retornar exit code `1` quando o resultado for `no-go` ou quando houver bloqueio de segurança.

## Bloqueios

O script deve falhar fechado se detectar:

- `.env` ou valor com aparência de secret.
- URL real de banco ou provider.
- Caminho fora de `data/dry-run/input/`.
- Tentativa de usar output fora de `data/dry-run/output/`.
- Entrada que pareça dump bruto sensível.

## Operações proibidas

- Conectar banco.
- Rodar migration.
- Importar dados.
- Alterar Laravel legado.
- Copiar binários de imagem.
- Fazer upload real.
- Fazer deploy.
- Fazer push.
