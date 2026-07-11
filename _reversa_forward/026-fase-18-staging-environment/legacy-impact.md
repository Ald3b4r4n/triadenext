# Legacy Impact: Fase 18 — Staging Environment Setup

> Data: 2026-07-11
> Feature: `026-fase-18-staging-environment`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
| --- | --- | --- | --- | --- |
| `src/features/staging-environment/*` | Operational Readiness | componente-novo | MEDIUM | Adiciona orquestração offline, provider readiness, gates, smoke e relatório. |
| `scripts/ops/check-staging-environment.mjs` | Operational Readiness | delta-de-contrato-externo | MEDIUM | Expõe check offline seguro e smoke remoto opt-in. |
| `scripts/ops/migrate-staging.mjs` | Database/Neon | delta-de-contrato-externo | HIGH | Cria wrapper capaz de executar migration somente após gates cumulativos. |
| `scripts/ops/bootstrap-admin-staging.ts` | Auth/Admin | delta-de-contrato-externo | HIGH | Cria wrapper de bootstrap remoto protegido e idempotente. |
| `.env.example` | Environment Contract | delta-de-contrato-externo | LOW | Documenta somente nomes de envs staging, sem valores. |
| `package.json` | Operational Readiness | delta-de-contrato-externo | LOW | Expõe três comandos staging sem acoplá-los a build/test/deploy. |
| `docs/operations/*staging*.md` | Deployment Readiness | componente-novo | LOW | Documenta Vercel, Neon, Stripe, migration, bootstrap e rollback. |
| `docs/operations/go-live-readiness.md` | Cutover | regra-nova | LOW | Exige relatório staging `go` e nova aprovação antes da próxima fase. |
| `src/tests/unit/staging-environment-*.test.ts` | Testes | componente-novo | LOW | Prova pending-config, redaction, gates e go/no-go sem rede. |
| `src/tests/e2e/staging-environment.spec.ts` | Testes | componente-novo | LOW | Prova CLI offline e mantém smoke remoto opt-in. |

## Diff conceitual por componente

### Operational Readiness

O estado local validado passa a ter um orquestrador da Fase 18. Ausência de
infraestrutura é `pending-config` e `no-go`; não é erro de lint/build nem sucesso de
staging. Provider checks trabalham por presença e nunca descobrem configuração por
rede.

### Database/Neon

As migrations existentes `0000` a `0007` não mudam. Um wrapper novo só carrega a
connection string e o subprocesso Drizzle depois de target, flags, aprovação,
revisão e snapshot. A implementação desta fase não executou o wrapper em modo remoto.

### Auth/Admin

O bootstrap local existente é reutilizado por um wrapper staging-only. A conta master
é allowlisted, a operação é idempotente e nenhuma senha ou URL é impressa. A
implementação desta fase não carregou banco ou auth remoto.

### Stripe e smoke

Test/sandbox e webhook test passam a ser requisitos explícitos do smoke externo.
Live mode é bloqueado. O smoke real continua delegado à Fase 17 e só recebe network
quando flags e aprovações específicas estiverem presentes.

## Preservadas

- 🟢 Produto público continua exigindo publicação vigente e estoque positivo.
- 🟢 Carrinho, cupom e frete continuam recalculados pelas regras atuais.
- 🟢 Checkout continua exigindo customer autenticado e snapshots server-side.
- 🟢 Webhook assinado/idempotente continua sendo a fonte de verdade financeira.
- 🟢 Settlement continua transacional e notificação continua posterior ao commit.
- 🟢 Produção e Stripe live permanecem bloqueados nas fases de staging.
- 🟢 Secrets permanecem fora de código, logs, relatórios e artefatos versionados.
- 🟢 Laravel legado permanece intocado.

## Modificadas

Nenhuma regra comercial existente foi alterada ou removida. Foram acrescentadas regras
operacionais novas:

- `pending-config` sem infraestrutura nunca abre rede/banco e sempre produz `no-go`.
- Produção e Stripe live bloqueiam qualquer ação antes de efeito externo.
- Migration staging exige target, execução explícita, duas aprovações, revisão e snapshot.
- Bootstrap master exige target, execução explícita, allowlist, auth e aprovações.
- Relatórios omitem URLs, connection strings, chaves, tokens e payloads sensíveis.
- Validações locais continuam independentes de credenciais externas.
