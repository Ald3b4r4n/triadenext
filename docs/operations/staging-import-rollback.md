# Rollback de importacao staging

Este runbook descreve rollback para ambiente staging/dev remoto. Ele nao toca producao nem Laravel legado.

## Antes de importar

- Confirmar snapshot/backup.
- Registrar referencia humana sanitizada.
- Registrar timestamp e commit.
- Confirmar que o alvo nao e producao.

## Se a importacao falhar

1. Parar novas execucoes.
2. Guardar `pre-import-report` e `post-import-report`.
3. Classificar divergencias como `dados`, `next`, `mapeamento` ou `humana`.
4. Restaurar snapshot/backup pelo provider remoto aprovado, se necessario.
5. Registrar `rollback-report.md`.

## Reset protegido

`reset-and-upsert` so pode ser usado com:

- `--allow-reset`;
- `--backup-confirmed`;
- `--human-approval`;
- ambiente nao produtivo confirmado.

Qualquer sinal de producao deve abortar antes de conectar.
