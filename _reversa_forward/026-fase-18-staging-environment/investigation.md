# Investigation: Fase 18 — Staging Environment Setup

> Data: 2026-07-11
> Escopo: pesquisa técnica para configurar staging/preview com gates humanos, sem executar infraestrutura externa nesta etapa.

## Fontes locais consultadas

| Fonte | Uso no plano |
| --- | --- |
| `_reversa_sdd/architecture.md` | Identificar os módulos `staging-smoke`, `staging-import`, auth, pagamentos e fronteiras externas. |
| `_reversa_sdd/c4-context.md` | Confirmar Vercel/Neon como infraestrutura e Stripe como integração financeira externa. |
| `_reversa_sdd/state-machines.md` | Preservar `pending-config`, `pending-input`, `blocked`, `smoke_passed` e rollback. |
| `_reversa_sdd/dependencies.md` | Confirmar Drizzle, Neon driver, Stripe, Playwright e `tsx` já disponíveis. |
| `_reversa_sdd/code-analysis.md#operations readiness` | Mapear scripts seguros e evitar duplicação. |
| `docs/operations/*.md` | Revisar checklists existentes de Vercel, Neon, migrations, Stripe e auth. |
| `src/features/staging-smoke` | Identificar preflight, redaction, smoke por domínio e relatório existentes. |
| `src/features/staging-import` | Reutilizar produção guard, aprovação humana, backup e conexão staging. |
| `scripts/ops/bootstrap-admin.ts` | Reutilizar bootstrap administrativo idempotente. |

## Fontes oficiais consultadas

| Fonte | Evidência aplicada |
| --- | --- |
| [Vercel — Environment variables](https://vercel.com/docs/environment-variables) | Variáveis podem ser vinculadas separadamente a Preview, Production e Development; mudanças só afetam novos deployments. |
| [Vercel — Managing environment variables across environments](https://vercel.com/docs/environment-variables/manage-across-environments) | Preview/custom environments e variáveis por branch permitem isolar staging; o plano não usará comandos que exportem valores para arquivos locais. |
| [Vercel — Deployments overview](https://vercel.com/docs/deployments/overview) | Preview possui URL própria e é distinto de Production; promoção para produção permanece fora de escopo. |
| [Neon — Branching](https://neon.com/docs/guides/branching-intro) | Branches isoladas podem sustentar preview/staging e testes de schema sem tocar produção. |
| [Neon — Point-in-time recovery](https://neon.com/blog/announcing-point-in-time-restore) | Restore por ponto no tempo/branch é opção de rollback, sujeito à janela e ao plano contratado. |
| [Stripe — API keys](https://docs.stripe.com/keys) | Test/sandbox e live usam chaves e dados separados; live deve ser bloqueado. |
| [Stripe — Webhooks](https://docs.stripe.com/webhooks?lang=node) | Endpoint público usa HTTPS, assinatura deve ser verificada e eventos test podem ser disparados em ambiente de teste. |

## Estado atual observado

- O projeto possui migrations Drizzle `0000` a `0007`, mas não há migration nova para esta fase.
- `pnpm ops:check-staging-smoke` já modela ausência de URL/env/webhook como `pending-config`.
- `pnpm ops:import-staging` já possui bloqueio de produção, aprovação humana e regras de backup.
- `pnpm ops:bootstrap-admin` e `ADMIN_MASTER_EMAILS` já oferecem base para promoção idempotente.
- `.env.example` já lista Vercel/app, banco, auth, admin, Blob, Stripe, e-mail e smoke, mas precisa ser confrontado com a matriz staging.
- Nenhuma evidência local confirma projeto Vercel, Neon staging, webhook Stripe test ou URL pública configurados.

## Alternativas avaliadas

### A. Provisionamento automático por CLI/API

- Vantagem: reduz passos manuais.
- Riscos: exige credenciais amplas, pode criar recursos no ambiente errado e contradiz `pending-config`.
- Decisão: descartado para esta fase. Serão gerados checklists e adapters opt-in, sem provisionamento automático.

### B. Configuração manual sem verificação local

- Vantagem: implementação menor.
- Riscos: erros de env, target e modo Stripe só aparecem durante smoke.
- Decisão: descartado. O plano exige preflight offline e relatório determinístico.

### C. Novo orquestrador sobre módulos existentes

- Vantagem: centraliza sequência, gates e go/no-go sem reescrever smoke/import.
- Risco: abstração adicional.
- Decisão: preferido; o componente deve ser fino e delegar regras existentes.

### D. Migration durante build/deploy

- Vantagem: automação aparente.
- Riscos: efeito externo implícito, concorrência e alvo incorreto.
- Decisão: proibido. Migration staging será comando separado com aprovação e snapshot.

### E. Um banco Neon por preview versus um staging estável

- Preview branch por deployment oferece isolamento forte, mas aumenta operação e custo.
- Staging estável simplifica smoke e webhook, mas exige disciplina de rollback e dados.
- Decisão: o contrato aceita ambos; o primeiro ambiente aprovado deve ser explicitamente rotulado não produtivo e possuir restore. A escolha física fica fora do código.

## Estratégia recomendada

1. Criar um inventário offline de configuração e status por provider.
2. Reutilizar `staging-smoke` e `staging-import` como executores especializados.
3. Adicionar gates explícitos para migration e bootstrap staging.
4. Manter configuração dos providers em runbooks manuais e envs externas.
5. Produzir relatório sanitizado com decisão determinística.
6. Considerar `pending-config` conclusão válida do check, porém `no-go` para avanço.

## Pontos de atenção para implementação futura

- Não executar `vercel env pull`, pois grava valores localmente e contraria o guardrail de não copiar `.env`.
- Não registrar a URL de staging completa em relatório versionável; usar rótulo lógico e presença/ausência.
- Não testar conectividade Neon apenas para descobrir configuração; a conexão exige aprovação.
- Não inferir test mode somente pela existência da variável; validar modo de forma redigida antes de qualquer chamada.
- Não colocar `pnpm db:migrate` em build, install ou deploy hook.
- Separar rollback de deployment e rollback de banco.
- O usuário master precisa existir no auth real do staging antes da promoção, ou o bootstrap deve retornar pendência clara.

## Conclusão

A implementação deve ser predominantemente de orquestração, contratos, checks e documentação. Sem infraestrutura externa, o resultado esperado é `pending-config` com `no-go`. Com configuração e aprovação futuras, o fluxo avança por gates independentes até migration staging, bootstrap, smoke e relatório final, mantendo produção e Laravel fora do caminho.
