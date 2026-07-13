# Matriz de status operacional — Fase 19

> Data da execução: `2026-07-13`
> Alvo: diagnóstico local de staging
> Regra: nenhum valor de configuração, URL completa ou credencial é registrado.

## Resumo

| Status | Quantidade |
| --- | ---: |
| `passed` | 2 |
| `pending-config` | 9 |
| `pending-input` | 2 |
| `blocked` | 1 |
| `skipped` | 1 |
| `failed` | 0 |

## Checks normalizados

| ID | Comando ou área | Status | Exit code | Origem | Evidência sanitizada | Próxima ação |
| --- | --- | --- | ---: | --- | --- | --- |
| CHECK-001 | Higiene Git e `next-env.d.ts` | `passed` | 0 | projeto | Arquivo gerado automaticamente foi restaurado; Laravel legado permaneceu fora do alvo. | Manter a higiene até o commit. |
| CHECK-002 | Matriz de envs staging | `pending-config` | 0 | configuração externa | Variáveis obrigatórias de staging estão ausentes; somente os nomes foram avaliados. | Configurar envs fora do Git. |
| CHECK-003 | Vercel Preview/staging | `pending-config` | 0 | configuração externa | Projeto, target e URL aprovada não estão declarados no ambiente local. | Configurar Preview/staging na Vercel. |
| CHECK-004 | Neon staging/dev | `pending-config` | 0 | configuração externa | Conexão e role de staging não estão declaradas; nenhuma conexão foi aberta. | Criar ambiente Neon isolado e definir restore. |
| CHECK-005 | Stripe test mode | `pending-config` | 0 | configuração externa | Chaves test não estão declaradas; Stripe live permanece bloqueado. | Configurar chaves test fora do Git. |
| CHECK-006 | Webhook Stripe test | `pending-config` | 0 | configuração externa | Signing secret e endpoint test não estão declarados. | Criar webhook test com eventos aprovados. |
| CHECK-007 | Auth/admin staging | `pending-config` | 0 | configuração externa | Auth, allowlist master e banco staging não estão completos. | Configurar auth e master fora do Git. |
| CHECK-008 | `ops:check-staging-smoke` | `pending-config` | 0 | configuração externa | Smoke readiness terminou sem URL aprovada e sem rede. | Configurar URL e aprovar smoke futuro. |
| CHECK-009 | Smoke remoto de storefront, checkout, admin e outbox | `skipped` | 0 | decisão humana | Etapas remotas não foram executadas porque os gates externos não estão completos. | Executar somente após configuração e aprovação. |
| CHECK-010 | `ops:check-staging-import-smoke` | `pending-input` | 0 | input aprovado | Alvo/input de smoke pós-importação não está disponível; nenhuma URL foi acessada. | Disponibilizar configuração e dados aprovados. |
| CHECK-011 | `ops:check-data-dry-run` | `passed` | 0 | projeto | Exemplos sintéticos retornaram `go`, sem bloqueadores nem escrita externa. | Repetir futuramente com input aprovado. |
| CHECK-012 | Input `primeira-execucao` | `pending-input` | 0 | input aprovado | Arquivos reais/exportados aprovados não estão presentes. | Disponibilizar os seis conjuntos esperados fora do Git. |
| CHECK-013 | `ops:import-staging` | `blocked` | 1 | bloqueio de segurança | Precheck bloqueou alvo não aprovado e input ausente antes de carregar conexão. | Resolver configuração, input e aprovação futura. |
| CHECK-014 | `ops:migrate-staging` | `pending-config` | 0 | decisão humana | Wrapper permaneceu em modo check; nenhuma migration ou conexão foi iniciada. | Definir banco, revisão, snapshot e aprovações. |
| CHECK-015 | `ops:bootstrap-admin-staging` | `pending-config` | 0 | decisão humana | Wrapper permaneceu em modo check; banco e auth não foram carregados. | Configurar auth/admin e aprovar bootstrap futuro. |

## Política aplicada

- `pending-config` e `pending-input` concluem o diagnóstico, mas impedem `go`.
- `blocked` confirma que o guardrail funcionou e torna a decisão `no-go` obrigatória.
- `skipped` em smoke obrigatório permanece `no-go` até a pré-condição externa existir.
- `passed` dos exemplos sintéticos não substitui dry-run com arquivos aprovados.
- Nenhuma ocorrência `failed` foi identificada.
