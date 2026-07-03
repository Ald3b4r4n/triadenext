# Interface: staging-import-reports

> Feature: `024-fase-16-staging-import`
> Tipo: arquivo/relatorio operacional
> Status: contrato implementado na Fase 16

## Objetivo

Definir a estrutura dos relatorios gerados pela importacao controlada em staging/dev remoto.

A implementacao fica em `src/features/staging-import/report-writer.ts` e grava apenas relatorios sanitizados no output operacional.

## Local de saida

Local planejado:

```text
data/dry-run/output/<execution-name>-<status>/
```

Alternativa aceitavel:

```text
data/staging-import/output/<execution-name>-<status>/
```

Qualquer relatorio bruto com dados reais deve permanecer fora do Git. Relatorios sanitizados podem ser versionaveis apenas se nao contiverem dados pessoais crus, URLs privadas, connection strings ou secrets.

## Arquivos esperados

| Arquivo | Obrigatorio | Conteudo |
| --- | --- | --- |
| `pre-import-report.json` | sim | Prechecks, ambiente, dry-run, snapshot/backup, modo e bloqueios. |
| `pre-import-report.md` | sim | Versao legivel do precheck, sem secrets. |
| `post-import-report.json` | sim quando houver escrita | Contagens antes/depois, entidades importadas, divergencias e status. |
| `post-import-report.md` | sim quando houver escrita | Resumo legivel, sem secrets. |
| `divergence-report.json` | sim | Lista estruturada de divergencias por origem/severidade. |
| `rollback-report.md` | condicional | Gerado quando rollback for necessario ou acionado. |
| `human-approval-summary.md` | sim | Checklist humano para decidir proxima fase. |

## Status de relatorio

| Status | Significado |
| --- | --- |
| `pending-input` | Arquivos aprovados ausentes ou incompletos; nenhuma escrita feita. |
| `blocked` | Precondicao falhou; nenhuma escrita feita. |
| `planned` | Precheck aprovado em modo sem escrita. |
| `imported` | Upsert concluido em staging/dev remoto. |
| `no-go` | Divergencia bloqueadora ou decisao humana impede avancar. |
| `rollback-required` | Estado exige rollback ou avaliacao humana antes de prosseguir. |
| `rolled-back` | Rollback executado ou confirmado manualmente. |

## Schema conceitual de `pre-import-report.json`

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "feature": "024-fase-16-staging-import",
  "target": {
    "kind": "staging|preview|remote-dev",
    "provider": "neon|other",
    "productionBlocked": true,
    "approvedByHuman": true
  },
  "source": {
    "inputDir": "data/dry-run/input/primeira-execucao",
    "dryRunStatus": "go|pending-input|no-go",
    "criticalBlockers": 0
  },
  "safety": {
    "secretsPrinted": false,
    "databaseUrlPrinted": false,
    "legacyTouched": false,
    "productionConnectionAttempted": false
  },
  "writePlan": {
    "mode": "check|upsert|reset-and-upsert",
    "backupConfirmed": true,
    "resetRequested": false,
    "humanApprovalRef": "sanitized-reference"
  },
  "result": {
    "status": "planned|pending-input|blocked",
    "blockers": []
  }
}
```

## Schema conceitual de `post-import-report.json`

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "feature": "024-fase-16-staging-import",
  "target": {
    "kind": "staging|preview|remote-dev",
    "provider": "neon|other"
  },
  "summary": {
    "status": "imported|no-go|rollback-required",
    "mode": "upsert|reset-and-upsert",
    "entitiesWritten": 0,
    "blockers": 0,
    "warnings": 0
  },
  "counts": [
    {
      "entity": "products",
      "before": 0,
      "input": 0,
      "after": 0,
      "inserted": 0,
      "updated": 0,
      "skipped": 0
    }
  ],
  "divergences": [
    {
      "id": "DIV-001",
      "origin": "dados|next|mapeamento|humana",
      "severity": "CRITICAL|HIGH|MEDIUM|LOW",
      "entity": "products",
      "code": "SCHEMA_MISMATCH",
      "message": "sanitized message",
      "recommendedAction": "corrigir-origem|corrigir-mapeamento|aceitar-excecao|nova-fase"
    }
  ],
  "safety": {
    "secretsPrinted": false,
    "databaseUrlPrinted": false,
    "productionConnectionAttempted": false,
    "realDeploy": false,
    "realMigration": false,
    "legacyTouched": false
  }
}
```

## Campos proibidos

Relatorios nao devem conter:

- `DATABASE_URL` completo.
- Tokens ou segredos.
- Chaves Stripe.
- Blob token.
- `.env` copiado.
- Dados pessoais crus.
- URL privada de banco.
- Dumps reais.

## Divergencias

As divergencias devem preservar a taxonomia da Fase 15:

| Origem | Encaminhamento |
| --- | --- |
| `dados` | Corrigir arquivo/export/fonte aprovada. |
| `next` | Corrigir codigo do Next em fase aprovada. |
| `mapeamento` | Ajustar contrato ou transformacao aprovada. |
| `humana` | Decisao, excecao ou aprovacao pendente. |

## Checklist humano

`human-approval-summary.md` deve conter:

- ambiente alvo;
- status de precheck;
- status da importacao;
- resumo de divergencias;
- confirmacao de backup/snapshot;
- confirmacao de rollback;
- decisao: aprovado, aprovado com excecoes, no-go ou rollback;
- assinatura/referencia humana sanitizada.

## Retencao

- Relatorios brutos ficam locais e ignorados pelo Git.
- Relatorios sanitizados podem ser versionados apenas apos revisao humana.
- Qualquer suspeita de secret torna o relatorio nao versionavel.
