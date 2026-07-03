# Interface: staging-smoke-command

> Tipo: comando operacional
> Fase: 17

## Objetivo

Definir o contrato de um comando/check futuro para smoke real staging/preview, sem produção e sem depender de credenciais reais em validações locais.

## Entrada

| Campo/env | Obrigatório para smoke real | Ausente gera | Regra |
| --- | --- | --- | --- |
| `STAGING_SMOKE_URL` | Sim | `pending-config` | Deve apontar para staging/preview/dev remoto, nunca produção. |
| `--url` | Alternativa manual | `pending-config` | Deve ser URL http(s), sem credenciais. |
| `--allow-network` | Sim para smoke remoto | `pending-config` | Sem esta flag, o comando nao faz requisicoes externas. |
| `--human-approval` | Sim para smoke remoto | `pending-config` | Registrar referencia sanitizada de aprovacao humana. |
| `STAGING_DATABASE_URL` | Apenas para validação DB/import staging aprovada | `pending-config` | Nunca imprimir valor; não conectar sem aprovação. |
| Stripe test envs | Apenas para pagamento real staging | `pending-config` | Live mode bloqueia. |
| Stripe test webhook | Apenas para confirmação real staging | `pending-config` | Sem webhook, validar só checklist e live-mode guard. |
| Arquivos aprovados | Apenas para import staging smoke | `pending-input` | Não usar exemplos sintéticos como se fossem reais. |

## Saída

| Status | Significado | Exit code planejado |
| --- | --- | --- |
| `passed` | Smoke real executado e aprovado. | 0 |
| `pending-config` | Falta URL/env/webhook/aprovação externa. | 0 para CI local, com relatório claro |
| `pending-input` | Faltam arquivos aprovados para import staging smoke. | 0 para CI local, com relatório claro |
| `blocked` | Produção/live mode/secret/exigência de segurança violada. | 1 |
| `failed` | Smoke real executou e encontrou falha funcional. | 1 |
| `skipped` | Etapa opcional não aplicável no contexto local. | 0 |

## Regras

- Não fazer deploy.
- Não rodar migration.
- Não conectar produção.
- Não imprimir secrets.
- Não inventar URL.
- Não mascarar `pending-config` como `passed`.
- Não executar rede sem `--allow-network` e aprovação humana.
