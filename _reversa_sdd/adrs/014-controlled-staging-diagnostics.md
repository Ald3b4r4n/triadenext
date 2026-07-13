# ADR 014 — Diagnóstico controlado de staging

## Status

Aceita em 2026-07-13.

## Contexto

A Fase 18 criou readiness offline e wrappers protegidos para Vercel, Neon, Stripe test, migration e bootstrap. A Fase 19 precisava verificar o estado operacional real sem converter ausência de infraestrutura em falha indevida e sem autorizar conexão, escrita ou deploy.

## Decisão

- Os sete comandos operacionais podem ser avaliados somente sem flags, depois de comprovado que o modo padrão é check, precheck ou dry-run local.
- Resultados são normalizados como `passed`, `pending-config`, `pending-input`, `blocked`, `skipped` ou `failed`.
- `pending-config`, `pending-input`, `blocked`, `failed` e skip obrigatório impedem decisão `go`.
- `ops:import-staging` deve bloquear no precheck antes de carregar banco quando target, input ou aprovação estiverem ausentes.
- `ops:migrate-staging` e `ops:bootstrap-admin-staging` permanecem check-only no modo padrão.
- O dry-run sintético prova somente o harness local; não comprova dados aprovados nem autoriza importação.
- Relatórios versionáveis registram apenas status, exit code, categoria e evidência sanitizada. URL completa, host, caminho, connection string e valores sensíveis são proibidos.
- A decisão operacional da execução de 2026-07-13 é `NO-GO`; o avanço depende do checklist humano fora do Git e de aprovações específicas por operação.

## Consequências

- Vercel, Neon, Stripe test, webhook test e autenticação/admin permanecem `pending-config` até configuração externa aprovada.
- A entrada `data/dry-run/input/primeira-execucao/` permanece `pending-input` até receber arquivos aprovados não versionados.
- Importação staging permanece bloqueada; migration e bootstrap permanecem em check.
- A matriz operacional e o checklist humano passam a ser a fonte de verdade para a próxima decisão go/no-go.
- O projeto preserva validações locais sem credenciais reais e sem depender de infraestrutura externa.

## Guardrails

- Produção, Stripe live, conexão remota, migration, importação, bootstrap e deploy não são autorizados por esta ADR.
- Nenhuma aprovação é implícita ou reutilizável entre operações.
- Nenhum valor de URL ou secret pode aparecer em stdout, stderr, relatório ou documentação versionável.
- O Laravel legado permanece fora do alvo e somente leitura quando uma análise futura for explicitamente aprovada.
