# Contrato: Relatório Operacional Go/No-go

## Objetivo

Consolidar o diagnóstico da Fase 19 em uma decisão operacional auditável, sanitizada e acionável.

## Estrutura sugerida

```json
{
  "schemaVersion": 1,
  "phase": "19-controlled-staging-execution",
  "generatedAt": "ISO-8601",
  "target": "staging-diagnostic",
  "decision": "no-go",
  "summary": {
    "passed": 0,
    "pendingConfig": 0,
    "pendingInput": 0,
    "blocked": 0,
    "skipped": 0,
    "failed": 0
  },
  "checks": [],
  "pendingActions": [],
  "blockers": [],
  "nextHumanChecklist": []
}
```

## Campos de cada check

```json
{
  "id": "CHECK-001",
  "command": "pnpm ops:check-staging-environment",
  "mode": "default",
  "status": "pending-config",
  "category": "vercel|neon|stripe|auth-admin|import-staging|dry-run|smoke|git",
  "exitCode": 0,
  "sanitizedEvidence": "Variável obrigatória ausente: STAGING_SMOKE_URL",
  "nextAction": "Configurar URL de staging fora do Git"
}
```

## Regras de decisão

| Condição | Decisão |
| --- | --- |
| Todos os Must `passed`, sem bloqueios, com aprovações externas registradas | `go` candidato humano |
| Qualquer Must `pending-config` | `no-go` |
| Qualquer Must `pending-input` | `no-go` |
| Qualquer `blocked` | `no-go` crítico |
| Qualquer `failed` | `no-go` e possível correção futura |
| `skipped` em etapa obrigatória | `no-go` |

## Sanitização obrigatória

Não registrar:

- valor de variável;
- URL completa de staging, preview, Neon ou webhook;
- `DATABASE_URL`;
- chave Stripe, webhook secret, token, cookie ou senha;
- payload real de pedido/pagamento;
- dado real importado;
- stack trace bruto com contexto sensível.

## Conteúdo permitido

Registrar:

- nome da variável ausente;
- provider afetado;
- status;
- comando executado;
- exit code;
- decisão;
- ação humana necessária;
- evidência textual sanitizada.
