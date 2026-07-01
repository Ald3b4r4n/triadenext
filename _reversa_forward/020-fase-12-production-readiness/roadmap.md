# Roadmap: Fase 12 - Production Migration Readiness

> Identificador: `020-fase-12-production-readiness`
> Data: `2026-06-26`
> Requirements: `_reversa_forward/020-fase-12-production-readiness/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 12 será tratada como macrofase operacional, não como nova camada de negócio. O delta principal é consolidar contratos, checklists e scripts seguros ao redor do que já existe: Drizzle/Postgres, Neon, Vercel, Stripe test mode, Vercel Blob, Vitest/Playwright e documentação operacional. A implementação futura deve revisar migrations e variáveis, criar roteiros de staging/go-live, endurecer scripts que não imprimem secrets e ampliar smoke tests parametrizáveis por URL. Nenhum passo real de deploy, migration, banco remoto, Stripe live mode, domínio ou migração de dados será executado sem aprovação humana explícita.

## 2. Princípios aplicados

Não existe `.reversa/principles.md` no projeto. A fase aplica os guardrails Reversa e os guardrails técnicos já documentados nos artefatos SDD.

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrail de secrets | Scripts, docs e testes devem reportar presença/ausência, nunca valores de secrets. | respeita |
| Guardrail de execução real | Deploy, migration real, banco real e domínio real exigem aprovação humana explícita. | respeita |
| Guardrail de domínio | A fase não altera regras de pagamento, estoque, cupom, frete, checkout, pedido, settlement ou notificação. | respeita |
| Guardrail de legado | A fase não toca no Laravel legado nem copia `.env`. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Usar staging/preview controlado como primeiro alvo realista, deixando produção como checklist e go-live posterior. | O requirements pede ambiente real controlado sem go-live cego; Vercel separa Preview e Production por ambiente. | Deploy direto em produção; go-live dentro da Fase 12. | 🟢 |
| D-02 | Manter Drizzle em fluxo SQL versionado: revisar `drizzle/0000_*` a `drizzle/0007_*`, não usar `push` contra banco real. | O repositório já usa migrations versionadas e `pnpm db:migrate` com guardião de `DATABASE_URL`. | `drizzle-kit push`; migration em runtime; edição manual no banco. | 🟢 |
| D-03 | Criar relatório de migrations antes de qualquer execução remota. | A fase precisa consolidar ordem, entidades, riscos e rollback sem aplicar nada real. | Rodar migration para descobrir problemas; confiar somente no histórico Git. | 🟢 |
| D-04 | Preparar Neon com branch/ambiente de staging, backup/restore documentado e validação segura sem imprimir URL. | Neon/Postgres é o banco alvo e o SDD já exige guardrails para `DATABASE_URL`. | Banco local como único alvo; produção Neon como primeiro alvo. | 🟢 |
| D-05 | Preparar Vercel por checklist de env vars, build, preview, production, logs e rollback, sem executar `vercel` automaticamente. | O deploy automático não está configurado e a fase deve evitar execução real sem aprovação. | Criar deploy automático agora; configurar domínio real nesta etapa. | 🟢 |
| D-06 | Preparar Stripe apenas em test mode, com webhook `POST /api/webhooks/stripe` e eventos mínimos de PaymentIntent. | O domínio confirma que webhook assinado é a fonte de verdade financeira e Stripe test mode é o caminho seguro antes de live. | Stripe live mode; Checkout Session como fluxo principal; confirmação client-side. | 🟢 |
| D-07 | Preservar Vercel Blob como provider de upload e documentar fallback seguro quando `BLOB_READ_WRITE_TOKEN` estiver ausente. | O service de upload já exige admin/manager, valida arquivo e bloqueia upload real sem token. | Trocar provider; criar armazenamento local permanente; upload público sem guardrail. | 🟢 |
| D-08 | Revisar/criar scripts operacionais com modo seco por padrão e saída sem valores sensíveis. | `ops:check-env` já existe e o requirements permite scripts simples e seguros. | Scripts que conectam banco por padrão; scripts que imprimem env completa. | 🟢 |
| D-09 | Smoke de staging/produção deve ser parametrizado por URL e seguro por padrão. | Playwright já existe e a fase precisa validar ambiente controlado sem pagamento real ou e-mail real. | Smoke fixo em `localhost`; smoke que exige credenciais reais; testes destrutivos. | 🟡 |
| D-10 | Consolidar evidências em docs e artefatos Reversa, não espalhar decisões em mensagens soltas. | O fluxo Reversa depende de rastreabilidade para próxima etapa e go-live posterior. | Checklist informal; depender de memória do operador. | 🟢 |

## 4. Premissas

Nenhuma premissa foi adotada a partir de marcadores de dúvida não resolvidos.

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| n/a | n/a | n/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `src/db` / Drizzle | `_reversa_sdd/architecture.md#Dados` | regra-alterada | Ganha validação operacional de readiness e relatório de migrations; schema funcional não deve mudar por padrão. |
| Database / Neon | `_reversa_sdd/architecture.md#Containers` | contrato-alterado | Passa de alvo inferido para contrato operacional documentado por ambiente, backup, rollback e aprovação. |
| Web App / Vercel | `_reversa_sdd/deployment.md#Infraestrutura Alvo Inferida` | contrato-alterado | Passa a ter plano de preview/staging, produção, logs, rollback e critérios de avanço. |
| Stripe API/Webhook | `_reversa_sdd/architecture.md#Integrações Externas` | contrato-alterado | Recebe checklist de test mode, eventos mínimos e smoke seguro; live mode permanece fora da execução automática. |
| Blob Storage | `_reversa_sdd/architecture.md#Containers` | contrato-alterado | Recebe checklist de token, estratégia de upload, fallback e validação sem exposição de segredo. |
| Scripts operacionais | `_reversa_sdd/dependencies.md#Scripts declarados` | componente-novo | Podem ganhar `check-build`, `check-migrations` e `check-smoke` se forem simples, locais e não destrutivos. |
| Docs operacionais | `_reversa_sdd/deployment.md#Estado Detectado` | regra-alterada | Serão consolidados para variáveis por ambiente, staging, go-live, Neon, Vercel, Stripe, Blob e smoke. |
| Testes E2E | `_reversa_sdd/inventory.md#Testes` | regra-alterada | Devem ganhar smoke parametrizável por URL aprovada e seguro contra ações reais. |

## 6. Delta no modelo de dados

- Resumo das mudanças: não há nova entidade, campo ou enum previsto para a Fase 12. O trabalho esperado é revisar e consolidar migrations existentes, criar relatório de risco e preparar execução segura em staging/preview. Qualquer nova migration descoberta deve ser bloqueada para revisão humana antes de execução real.
- Detalhe completo em: `_reversa_forward/020-fase-12-production-readiness/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Variáveis por ambiente | arquivo/env | `_reversa_forward/020-fase-12-production-readiness/interfaces/environment-contract.md` |
| Neon/Postgres | banco externo | `_reversa_forward/020-fase-12-production-readiness/interfaces/neon-database.md` |
| Vercel deploy | plataforma/deploy | `_reversa_forward/020-fase-12-production-readiness/interfaces/vercel-deployment.md` |
| Stripe webhook/test mode | HTTP/webhook | `_reversa_forward/020-fase-12-production-readiness/interfaces/stripe-webhook.md` |
| Vercel Blob | storage externo | `_reversa_forward/020-fase-12-production-readiness/interfaces/blob-storage.md` |

## 8. Plano de migração

1. Confirmar diretório Next.js, branch, status Git e ausência do Laravel legado.
2. Inventariar migrations Drizzle atuais e mapear cada migration para entidades/feature correspondente.
3. Revisar `drizzle.config.ts`, `scripts/db/require-database-url.mjs`, `package.json` e docs DB existentes.
4. Atualizar `.env.example` e docs de ambiente para local, preview/staging e produção sem valores reais.
5. Consolidar checklist Neon com branch/banco alvo, backup, rollback e aprovação antes de `pnpm db:migrate`.
6. Consolidar checklist Vercel com env vars, preview, production, domínio, logs, rollback e pontos de parada.
7. Consolidar Stripe test mode com webhook, eventos mínimos, smoke de pagamento teste e bloqueio de live mode.
8. Consolidar Blob/upload com token, limites, fallback e validação segura.
9. Implementar ou revisar scripts seguros apenas se simples e não conectados por padrão.
10. Criar smoke parametrizável por URL aprovada cobrindo storefront, checkout, pedido, pagamento teste, admin e notificações mock/seguras.
11. Gerar checklist de go-live posterior com decisão explícita de avançar/abortar.
12. Rodar validações locais permitidas e registrar evidências; não executar deploy/migration real sem nova autorização.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Migration aplicar em banco errado | alto | médio | Requerer confirmação humana do alvo, mascarar `DATABASE_URL`, registrar branch/projeto sem valor sensível e exigir backup antes. |
| Secret aparecer em log ou doc | alto | médio | Scripts só exibem presença/ausência; revisão textual por nomes de variáveis; nunca copiar `.env`. |
| Preview/staging divergir da produção | médio | médio | Checklist separado por ambiente e smoke por URL; produção só avança após staging verde. |
| Stripe test mode ser confundido com live mode | alto | médio | Checklist exige prefixos/ambiente test mode e bloqueia live mode dentro da fase. |
| Rollback de app não cobrir rollback de banco | alto | médio | Separar rollback Vercel de rollback Neon; documentar que DDL/data rollback exige plano próprio. |
| Smoke causar mutação real indesejada | alto | baixo | Rodar com fixtures/test mode, URL aprovada e sem e-mail/pagamento real; bloquear ações destrutivas. |
| Blob upload real falhar por limite ou token ausente | médio | médio | Documentar fallback, limite atual de 5 MB no domínio e validação de token por presença sem valor. |
| Dependências `latest` gerarem comportamento diferente em build | médio | médio | Usar `pnpm-lock.yaml` como fonte efetiva e registrar versão/commit nas evidências. |

## 10. Critério de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md` e contratos em `interfaces/` criados.
- [ ] `actions.md` gerado por `/reversa-to-do` cobre migrations, Neon, Vercel, Stripe, Blob, scripts, smoke, checklist e go-live.
- [ ] Todas as ações do `actions.md` marcadas `[X]` após `/reversa-coding`.
- [ ] `cross-check.md` sem CRITICAL nem HIGH, se `/reversa-audit` for executado.
- [ ] `regression-watch.md` gerado com validações locais e bloqueios reais documentados.
- [ ] Nenhum deploy, migration real, banco real, e-mail real, push automático ou secret exposto.
- [ ] `next-env.d.ts` limpo ou restaurado se sujar automaticamente.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Versão inicial gerada por `/reversa-plan` | reversa |
