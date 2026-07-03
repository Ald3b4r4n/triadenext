# Data Delta: Fase 17 - Staging Smoke Real / Go-live Readiness

> Data: 2026-07-03

## Resumo

Não há delta de schema persistido nesta fase. A Fase 17 não cria tabela, campo, enum, índice, migration, seed ou importação definitiva. O delta é operacional: validar staging/dev remoto, schema compatível, envs, Stripe test mode, smoke e relatórios.

## Modelo persistido

| Área | Mudança | Observação |
| --- | --- | --- |
| Drizzle schema | Nenhuma | `src/db/schema.ts` não deve ser alterado por planejamento. |
| Migrations | Nenhuma nova migration planejada aqui | Migrations staging só podem ser validadas/executadas com aprovação humana futura. |
| Dados de catálogo | Nenhuma escrita obrigatória | Import staging smoke depende de arquivos aprovados; ausência vira `pending-input`. |
| Pedidos/pagamentos | Nenhuma mudança de regra | Smoke de pagamento usa Stripe test mode quando configurado. |
| Notificações/outbox | Nenhuma mudança de schema | Smoke valida existência/comportamento seguro quando ambiente permitir. |

## Dados operacionais temporários

| Artefato | Local esperado | Versionável? | Regra |
| --- | --- | --- | --- |
| Relatório de pending-config | Pasta operacional da feature ou output seguro a definir | Sim, se sanitizado | Não conter URL secreta, token, DB URL ou dado pessoal cru. |
| Relatório de smoke real | Pasta ignorada/sanitizada a definir | Não, se contiver dados reais | Relatório bruto deve ficar fora do Git. |
| Checklist go-live | `docs/operations` ou feature dir | Sim | Deve ser documental e não executar produção. |
| Evidência de snapshot/rollback | Checklist/documento | Sim, se sem valores sensíveis | Não anexar credenciais nem URLs privadas. |

## Env/data status

| Condição | Status esperado | Efeito |
| --- | --- | --- |
| `STAGING_SMOKE_URL` ausente | `pending-config` | Não tenta smoke real e não falha validações locais. |
| `STAGING_DATABASE_URL` ausente | `pending-config` | Não conecta banco e não roda migration. |
| Stripe test webhook ausente | `pending-config` | Smoke de pagamento real não roda; live mode segue bloqueado. |
| Arquivos aprovados ausentes | `pending-input` | Import staging smoke não roda e não conecta banco. |
| Sinal de produção ou Stripe live | `blocked` | Aborta antes de qualquer ação externa. |

## Migrações

- Não gerar migration nesta fase durante planejamento.
- Não rodar migration em produção.
- Não rodar migration staging sem aprovação humana explícita.
- Se a implementação futura precisar validar drift de schema, deve fazê-lo por leitura segura/estática ou checklist, sem imprimir URL.

## Rollback

Rollback da Fase 17 é operacional: cancelar smoke, preservar relatórios sanitizados, manter staging isolado e nunca alterar produção. Rollback de dados só se torna aplicável se uma etapa futura executar import staging com aprovação humana.
