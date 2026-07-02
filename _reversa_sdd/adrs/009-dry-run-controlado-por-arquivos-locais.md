# ADR 009 - Dry-run controlado por arquivos locais

Data: 2026-07-02

## Contexto

A Fase 13 deixou o go-live real bloqueado por dados Must ainda nao reconciliados: catalogo real, imagens, precos, estoque, cupons ativos e frete minimo. A Fase 14 precisava preparar uma forma tecnica de ensaiar esses dados sem alterar o Laravel legado, sem conectar banco real, sem importar em producao e sem fazer upload real de imagens.

## Decisao

Usar arquivos locais controlados CSV/JSON como fonte inicial do dry-run, dentro de `data/dry-run/input/`, com exemplos sinteticos versionados e dados reais mantidos fora do Git.

O processamento fica em `src/features/data-dry-run` e roda por `pnpm ops:check-data-dry-run`. O script le arquivos locais, normaliza categorias/produtos/imagens/cupons/frete, gera relatorio de reconciliacao e falha fechado quando encontra divergencia bloqueadora ou entrada insegura.

## Consequencias

- O Laravel legado continua somente leitura e nao e executado por comandos com efeito colateral.
- A Fase 14 nao faz importacao real, upload real, migration real, conexao com banco real ou deploy.
- Dados reais exportados manualmente continuam fora do Git.
- Relatorios reais em `data/dry-run/output/` tambem ficam fora do Git.
- O dry-run sintetico valida o pipeline, mas nao aprova go-live por si so.
- A importacao real futura continua dependente de checklist humano, backup/rollback e fonte real aprovada.

## Alternativas descartadas

- Conectar diretamente ao banco real do legado durante o dry-run.
- Criar importer real junto com o dry-run.
- Fazer upload automatico de imagens para Blob.
- Versionar dumps reais ou relatorios completos com dados sensiveis.

## Status

Aceito na Fase 14.
