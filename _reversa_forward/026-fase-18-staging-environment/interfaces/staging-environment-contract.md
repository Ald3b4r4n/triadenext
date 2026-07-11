# Contrato: Staging Environment

## Objetivo

Definir a entrada e o resultado do inventário de Vercel Preview/staging, Neon staging/dev, Stripe test e variáveis operacionais sem acessar valores.

## Entradas lógicas

| Campo | Obrigatório | Sensível | Regra |
| --- | --- | --- | --- |
| `targetEnvironment` | Sim | Não | Aceita somente `preview`, `staging` ou `development-remote`. |
| `humanApproval` | Para ação externa | Não | Token lógico/flag explícita; não é senha. |
| `vercelConfigured` | Não | Não | Derivado de presença/autorização, nunca de URL impressa. |
| `stagingDatabaseConfigured` | Não | Não | Derivado da presença da env e aprovação; não abre conexão no inventário. |
| `stripeTestConfigured` | Não | Não | Derivado de presença e modo redigido. |
| `stripeWebhookConfigured` | Não | Não | Presença lógica, sem secret ou endpoint no relatório. |
| `approvedInputConfigured` | Não | Não | Indica disponibilidade de arquivos aprovados para import smoke. |

## Status

| Status | Significado | Efeito externo |
| --- | --- | --- |
| `passed` | Pré-condição validada. | Nenhum por si só. |
| `pending-config` | Provider/env/URL ainda ausente. | Nenhum. |
| `pending-input` | Arquivos aprovados ausentes. | Nenhum. |
| `blocked` | Produção/live, aprovação ou backup inválidos. | Nenhum; aborta. |
| `failed` | Check executado e falhou de forma sanitizada. | Interrompe sequência. |
| `skipped` | Etapa não aplicável no contexto atual. | Nenhum. |

## Saída

```json
{
  "schemaVersion": 1,
  "target": "staging",
  "status": "pending-config",
  "checks": [
    {
      "id": "vercel-preview",
      "status": "pending-config",
      "configured": false,
      "message": "Configuração de preview pendente."
    }
  ],
  "nextActions": ["Concluir o checklist externo aprovado."],
  "goNoGo": "no-go"
}
```

## Redaction

Proibido incluir URL completa, host de banco, connection string, token, senha, cookie, e-mail não autorizado, chave Stripe, webhook secret ou payload bruto. O relatório usa rótulos lógicos e booleanos.

## Idempotência e timeout

- O inventário offline é idempotente e não usa rede.
- Adapters externos futuros precisam de timeout explícito e falha fechada.
- Retentativa nunca pode transformar `blocked` em `passed` sem nova aprovação.
