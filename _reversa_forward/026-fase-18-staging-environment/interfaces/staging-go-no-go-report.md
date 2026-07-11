# Contrato: Relatório Go/No-go de Staging

## Objetivo

Consolidar readiness, ações autorizadas e smoke em uma decisão auditável para a próxima fase, sem autorizar produção.

## Estrutura

```json
{
  "schemaVersion": 1,
  "executionId": "identificador-nao-sensivel",
  "generatedAt": "ISO-8601",
  "target": "staging",
  "decision": "no-go",
  "summary": {
    "passed": 0,
    "pendingConfig": 3,
    "pendingInput": 0,
    "blocked": 0,
    "failed": 0
  },
  "sections": [],
  "humanApprovals": [],
  "rollback": {
    "deployment": "documented",
    "database": "pending"
  },
  "nextActions": []
}
```

## Seções obrigatórias

1. Vercel Preview/staging.
2. Neon staging/dev e migration.
3. Auth e bootstrap master.
4. Stripe test/webhook.
5. Storefront smoke.
6. Checkout, pedido e pagamento test.
7. Admin, pedidos e outbox.
8. Import staging smoke opcional.
9. Rollback e decisões humanas.

## Regra de decisão

- `go`: todos os itens Must `passed`, nenhum `blocked`/`failed`, rollback confirmado e aprovação humana final registrada.
- `no-go`: qualquer Must em `pending-config`, `pending-input`, `blocked`, `failed` ou `skipped` não autorizado.
- O relatório nunca promove deployment, executa migration ou habilita Stripe live.

## Sanitização

Não incluir URL completa, host, project ID sensível, branch ID, connection string, chaves, webhook secret, cookies, payload Stripe, dados pessoais de clientes ou stack trace bruto.

## Versionamento

- Template e exemplos sintéticos: versionáveis.
- Relatório de execução real: saída local ignorada, salvo versão explicitamente sanitizada e aprovada.
