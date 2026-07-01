# Legacy Impact - Fase 12 Production Migration Readiness

Data: 2026-07-01
Feature: `020-fase-12-production-readiness`

## Arquivos Afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `.env.example` | Environment contract | delta-de-contrato-externo | LOW | Consolida nomes de variaveis por ambiente sem valores reais. |
| `package.json` | Tooling operacional | regra-nova | LOW | Adiciona scripts `ops:*` seguros, sem deploy, migration real ou rede obrigatoria. |
| `pnpm-workspace.yaml` | Tooling operacional | componente-novo | LOW | Registra dependencias de build aprovadas para evitar bloqueio local do pnpm. |
| `scripts/ops/check-env-readiness.mjs` | Readiness de ambiente | regra-nova | LOW | Reporta presenca/ausencia por ambiente sem imprimir valores. |
| `scripts/ops/check-migrations-readiness.mjs` | Readiness de migrations | componente-novo | LOW | Faz leitura estatica de `drizzle/` e nao conecta em banco. |
| `scripts/ops/check-build-readiness.mjs` | Readiness de build | componente-novo | LOW | Confere scripts locais permitidos e bloqueia sinais de deploy/migration automatica nos ops. |
| `scripts/ops/check-smoke-readiness.mjs` | Readiness de smoke | componente-novo | LOW | Valida URL alvo segura sem executar smoke remoto nem expor credenciais. |
| `docs/operations/database-migrations.md` | Operacao de banco | regra-nova | LOW | Documenta ordem de migrations, backup, rollback e aprovacao humana. |
| `docs/operations/env.md` | Operacao de ambiente | delta-de-contrato-externo | LOW | Define variaveis obrigatorias/opcionais por local, preview/staging e producao. |
| `docs/operations/neon.md` | Neon readiness | regra-nova | LOW | Define checklist de banco, backup, rollback e bloqueio de logs com URL. |
| `docs/operations/vercel.md` | Vercel readiness | regra-nova | LOW | Define preview, production, env vars, logs, rollback e parada antes de deploy real. |
| `docs/operations/stripe.md` | Stripe test mode | regra-nova | LOW | Documenta test mode, webhook minimo e proibicao de live mode nesta fase. |
| `docs/operations/blob.md` | Upload/blob readiness | regra-nova | LOW | Define token, limite, tipos aceitos, fallback e aprovacao para upload real. |
| `docs/operations/production-checklist.md` | Checklist operacional | regra-nova | LOW | Consolida staging readiness e smoke seguro antes do go-live. |
| `docs/operations/go-live-checklist.md` | Go-live posterior | componente-novo | LOW | Cria checklist posterior com janela, aprovacao, backup, rollback e decisao avancar/abortar. |
| `src/tests/unit/env-readiness.test.ts` | Testes unitarios | regra-nova | LOW | Prova que check de env nao imprime valores. |
| `src/tests/unit/migration-readiness.test.ts` | Testes unitarios | componente-novo | LOW | Prova leitura estatica de migrations e ausencia de `DATABASE_URL` na saida. |
| `src/tests/unit/build-readiness.test.ts` | Testes unitarios | componente-novo | LOW | Prova que readiness de build nao chama deploy. |
| `src/tests/unit/smoke-readiness.test.ts` | Testes unitarios | componente-novo | LOW | Prova default local seguro e recusa de URL invalida. |
| `src/tests/e2e/production-readiness-smoke.spec.ts` | Smoke E2E | componente-novo | LOW | Cobre fluxo publico seguro sem banco real ou acao destrutiva. |
| `src/tests/e2e/production-readiness-payment.spec.ts` | Smoke E2E | componente-novo | LOW | Cobre pagamento/notificacoes em modo seguro sem live mode, cartao real ou envio real. |
| `_reversa_forward/020-fase-12-production-readiness/*.md` | Rastreabilidade Reversa | componente-novo | LOW | Registra requirements, plano, auditorias, readiness por provedor e checklists da macrofase. |

## Diff Conceitual

Esta fase nao altera regra de pagamento, estoque, cupom, frete, checkout, pedidos ou notificacoes. O delta e operacional: o projeto passa a ter documentacao de producao controlada, scripts locais seguros de readiness e smoke tests para preparar staging/producao sem executar operacoes reais.

O contrato externo foi ampliado apenas no nivel documental e de validacao local: variaveis de ambiente foram nomeadas, separadas por ambiente e validadas por presenca/ausencia. Nenhum valor real foi versionado, impresso ou exigido para build/test local.

As migrations Drizzle foram mapeadas e verificadas estaticamente. Nenhuma migration real foi executada e nenhum banco real foi acessado.

## Preservadas

- Produto publico continua exigindo estado publicado, `publishedAt` vigente e estoque positivo.
- Checkout continua exigindo cliente autenticado e snapshots server-side.
- Webhook Stripe continua sendo a fonte de verdade financeira para liquidacao.
- Settlement continua transacional antes de notificacao pos-pagamento.
- Fallback sem banco continua explicito e seguro.
- Superficies admin-like continuam exigindo auth, banco e papel `admin` ou `manager`.
- Canais fora de escopo continuam fora: Bling, NF-e, rotinas fiscais, WhatsApp e SMS.

## Modificadas

Nenhuma regra verde do dominio foi alterada ou removida nesta rodada.
