# Investigation: Fase 17 - Staging Smoke Real / Go-live Readiness

> Data: 2026-07-03
> Escopo: pesquisa técnica local para planejar smoke real staging/preview sem produção.

## Fontes locais consultadas

| Fonte | Uso no plano |
| --- | --- |
| `_reversa_sdd/architecture.md` | Identificar componentes afetados, Fase 16 e guardrails de staging import. |
| `_reversa_sdd/domain.md` | Regras de ambiente, pagamento, import staging, `pending-config`/`pending-input` e proibições. |
| `_reversa_sdd/deployment.md` | Variáveis críticas, scripts ops existentes e riscos de deploy/migration. |
| `_reversa_sdd/dependencies.md` | Confirmar dependências já disponíveis: Next, Playwright, Stripe, Drizzle, Neon, tsx. |
| `_reversa_sdd/code-analysis.md` | Mapear módulo `src/features/staging-import` e scripts `ops:*` relevantes. |
| `_reversa_sdd/migration/cutover_plan.md` | Critérios pré-cutover, no-go e smoke mínimo. |
| `_reversa_sdd/state-machines.md` | Estados `pending_input`, `blocked`, `reported`, `smoke_skipped`, `smoke_passed`. |

## Alternativas avaliadas

### A. Smoke staging acoplado ao Playwright E2E atual

- Vantagem: reaproveita `pnpm test:e2e`.
- Risco: se exigir URL/env real, quebra validação local.
- Decisão: usar apenas se protegido por `pending-config`/skip explícito.

### B. Script ops separado para readiness/smoke staging

- Vantagem: expressa melhor `pending-config`, relatórios e checklist humano.
- Risco: duplicar lógica de produção guard.
- Decisão: preferido, desde que reutilize `src/features/staging-import` e helpers existentes.

### C. Executar deploy/migration como parte da fase

- Vantagem: valida ponta a ponta real.
- Risco: viola fora de escopo e guardrails.
- Decisão: descartado. A fase prepara e valida, mas não executa deploy final nem migration em produção.

### D. Tratar ausência de URL/env como erro

- Vantagem: força configuração.
- Risco: impede desenvolvimento e CI sem credenciais.
- Decisão: descartado. A decisão de `/reversa-clarify` exige `pending-config`.

## Padrões aplicáveis

- Checks operacionais devem imprimir status e nunca valores sensíveis.
- URL/target produtivo deve ser bloqueado antes de qualquer ação externa.
- Stripe test mode deve ser condição explícita para pagamento real em staging.
- Relatórios reais devem ficar fora do Git se contiverem dados ou URLs sensíveis.
- Go-live checklist deve ser preparação, não autorização automática.

## Pontos de atenção para implementação futura

- Usar `STAGING_SMOKE_URL` como nome primário, aceitando equivalente/alias se o plano técnico definir.
- Manter compatibilidade com `STAGING_IMPORT_SMOKE_URL` da Fase 16 para smoke de import staging.
- Evitar chamar Vercel CLI automaticamente.
- Não ler `.env`; validar apenas `process.env` no processo atual ou exemplos/documentação.
- Separar claramente `pending-config` de `blocked`: ausência esperada não é violação, produção/live mode é violação.

## Conclusão

A estratégia recomendada é criar uma camada operacional de staging smoke que reutiliza os guardrails existentes, adiciona contratos de status e relatórios e permite execução real somente quando infraestrutura e aprovação humana estiverem presentes.
