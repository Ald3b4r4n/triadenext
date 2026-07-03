# Requirements: Fase 17 - Staging Smoke Real / Go-live Readiness

> Identificador: `025-fase-17-staging-smoke`
> Data: `2026-07-03`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Validar a loja Next.js em staging/preview real, usando banco staging/dev remoto, Vercel, Stripe test mode e smoke operacional ponta a ponta quando a infraestrutura externa estiver aprovada. A fase transforma a readiness local e a importacao staging controlada das fases anteriores em evidência prática de ambiente real controlado, mas não exige URL/envs/webhook/arquivos prontos para ser planejada ou implementada. Ausências viram `pending-config` ou `pending-input`, sem go-live definitivo, sem produção e sem alterar o Laravel legado.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Visão Geral` | A Fase 16 adicionou importacao controlada para staging/dev remoto com preflight, bloqueio contra producao, upsert seguro, reset protegido e smoke pos-importacao. | 🟢 |
| `_reversa_sdd/architecture.md#Importacao Staging Controlada` | `pending-input` nao abre conexao remota; `STAGING_DATABASE_URL` e exigida sem imprimir valor; reset e opt-in protegido; producao/deploy/migration real seguem fora do fluxo. | 🟢 |
| `_reversa_sdd/domain.md#Readiness Operacional` | Deploy, migration real, banco real, credenciais reais e go-live dependem de aprovacao humana explicita. | 🟢 |
| `_reversa_sdd/domain.md#Importacao Staging Controlada` | `ops:check-staging-import-smoke` valida home, catalogo, produto, carrinho, checkout teste, admin, pedidos e outbox/notificacoes quando houver URL staging aprovada. | 🟢 |
| `_reversa_sdd/deployment.md#Variáveis Críticas` | Variaveis criticas incluem `DATABASE_URL`, credenciais Stripe/Blob/Auth e variaveis staging `STAGING_DATABASE_URL` e `STAGING_IMPORT_SMOKE_URL`, sem valores. | 🟢 |
| `_reversa_sdd/deployment.md#Scripts Operacionais Seguros` | Scripts `ops:*` validam env, migrations, build, smoke, dry-run e staging import sem imprimir secrets; smoke staging fica skipped sem URL. | 🟢 |
| `_reversa_sdd/code-analysis.md#staging-import` | `src/features/staging-import` contem environment, production guard, preflight, dry-run gate, import plan, upsert, reset guard, report writer e smoke target. | 🟢 |
| `_reversa_sdd/migration/cutover_plan.md#Pré-cutover` | Pre-cutover exige dry-run aprovado, import staging aprovado, smoke staging, relatorios fora do Git, sandbox de pagamento e rollback. | 🟢 |
| `_reversa_sdd/state-machines.md#Importacao Staging Controlada` | Estados esperados: `pending_input`, `blocked`, `planned`, `upserting`, `reported`, `smoke_skipped`, `smoke_passed` e `smoke_failed`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Operador de migração | Provar que staging/preview está pronto para ensaio real controlado. | Configura URL staging e roda checks sem expor secrets. |
| QA / validador operacional | Confirmar que o fluxo comercial funciona em URL pública controlada. | Executa smoke de home até pedido/notificacao em Stripe test mode. |
| Responsável técnico | Decidir go/no-go sem promover produção. | Analisa relatórios de env, banco, Stripe, smoke e rollback. |
| Administrador da loja | Validar admin, pedidos e outbox em staging. | Confere produtos, pedidos, status de pagamento e notificações mock/seguras. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A Fase 17 só pode operar em staging/preview/dev remoto aprovado; produção, domínio real definitivo e go-live ficam proibidos. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Importacao Staging Controlada`
   - Tipo: nova
2. **RN-02:** Validação de envs deve reportar somente presença/ausência, ambiente e modo; valores de secrets, `DATABASE_URL` e chaves Stripe nunca podem ser impressos. 🟢
   - Origem no legado: `_reversa_sdd/deployment.md#Guardrails Operacionais`
   - Tipo: nova
3. **RN-03:** Stripe deve operar exclusivamente em test mode; qualquer sinal de live mode deve bloquear o smoke de pagamento. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Pagamento`
   - Tipo: nova
4. **RN-04:** Migrations contra staging/dev remoto só podem ser executadas com aprovação humana explícita, snapshot/rollback definido e nunca contra produção. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Readiness Operacional`
   - Tipo: nova
5. **RN-05:** Smoke real deve validar o fluxo comercial sem mudar regras de pagamento, estoque, cupom, frete, pedido ou notificação. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Fluxo Comercial Principal`
   - Tipo: nova
6. **RN-06:** Import staging smoke só é executável quando houver dados aprovados e ambiente staging autorizado; caso contrário, deve registrar pendência operacional. 🟢
   - Origem no legado: `_reversa_sdd/state-machines.md#Importacao Staging Controlada`
   - Tipo: nova
7. **RN-07:** Checklist go-live produzido nesta fase é preparatório; não autoriza produção, domínio real definitivo, Stripe live mode ou migração definitiva de dados reais. 🟢
   - Origem no legado: `_reversa_sdd/migration/cutover_plan.md#No-go Pos-Fase 16`
   - Tipo: nova
8. **RN-08:** Ausência de `STAGING_SMOKE_URL`, `STAGING_DATABASE_URL`, webhook Stripe test ou arquivos aprovados não deve falhar lint/test/build/e2e local; deve gerar `pending-config` ou `pending-input` com relatório de pendência. 🟢
   - Origem no legado: decisão da sessão `/reversa-clarify` de 2026-07-03
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Registrar contrato operacional de staging/preview real para Vercel, Neon staging/dev, Stripe test mode e URL pública controlada. | Must | Documento/runbook lista pré-condições, responsáveis, comandos seguros, entradas esperadas e estados `pending-config`/`pending-input`/`blocked`/`skipped`/`passed`. | 🟢 |
| RF-02 | Validar envs de staging sem expor valores. | Must | Check ou checklist mostra presença/ausência, ambiente esperado e bloqueios, sem imprimir `DATABASE_URL`, chaves Stripe, tokens Blob/Auth ou secrets; ausência de env retorna `pending-config`. | 🟢 |
| RF-03 | Bloquear produção acidental em qualquer smoke, import staging ou validação operacional. | Must | Tentativas com URL/target/labels de produção retornam erro seguro antes de pagamento, import, migration ou chamada destrutiva. | 🟢 |
| RF-04 | Validar staging DB readiness. | Must | Relatório informa schema esperado, estado de migrations, exigência de snapshot/rollback e status de aprovação humana; não roda migration sem aprovação. | 🟢 |
| RF-05 | Validar Stripe test mode e webhook test. | Must | Relatório confirma modo test, eventos esperados, webhook de teste e bloqueio de live mode, sem exibir chaves; ausência de webhook test retorna `pending-config`. | 🟢 |
| RF-06 | Executar smoke real em staging para home, catálogo, produto, carrinho, checkout, pedido, admin e outbox/notificações quando `STAGING_SMOKE_URL` ou equivalente for fornecida. | Must | Smoke gera relatório com status por etapa; sem URL aprovada retorna `pending-config`, não inventa URL e não falha build/test/e2e local. | 🟢 |
| RF-07 | Executar pagamento teste em staging com Stripe test mode quando webhook/env test estiver aprovado. | Must | Pedido de teste chega a estado pago via webhook/test mode ou registra `pending-config` se webhook/env test não estiver aprovado. | 🟡 |
| RF-08 | Executar smoke de import staging quando houver dados aprovados. | Should | `ops:check-staging-import-smoke` ou equivalente valida dados importados; sem dados aprovados retorna `pending-input`, não importa, não conecta banco e registra pendência. | 🟢 |
| RF-09 | Gerar relatório go/no-go de staging. | Must | Relatório classifica blockers, warnings, decisões humanas e próximos passos para eventual go-live posterior. | 🟢 |
| RF-10 | Criar checklist go-live posterior. | Must | Checklist cobre domínio, produção, envs, rollback, smoke pós-deploy, decisão humana e critérios de abortar. | 🟢 |
| RF-11 | Garantir que relatórios reais/sanitizados não versionem dados sensíveis. | Must | Artefatos com dados reais permanecem fora do Git; apenas templates ou relatórios sanitizados podem ser versionados. | 🟢 |
| RF-12 | Atualizar Reversa/SDD da fase sem executar push automático. | Should | Artefatos da feature registram decisões, riscos e evidências; nenhum push é disparado automaticamente. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Nunca imprimir secrets, `DATABASE_URL`, tokens, chaves Stripe ou valores de `.env`. | `_reversa_sdd/domain.md#Guardrails de Ambiente` e `_reversa_sdd/deployment.md#Guardrails Operacionais`. | 🟢 |
| Segurança | Bloquear Stripe live mode e qualquer alvo de produção. | Fora de escopo desta fase e guardrails da Fase 16. | 🟢 |
| Operacional | Ausência de URL, envs, webhook test ou dados aprovados deve virar `pending-config`, `pending-input`, `blocked` ou `skipped`, não sucesso falso nem falha indevida de lint/test/build/e2e local. | `_reversa_sdd/state-machines.md#Importacao Staging Controlada` e decisões da sessão `/reversa-clarify`. | 🟢 |
| Observabilidade | Relatórios devem ser legíveis por humanos e separar sucesso, bloqueio, pendência e no-go. | Necessário para decisão go/no-go. | 🟢 |
| Privacidade | Relatórios versionáveis devem ser sanitizados e não conter dados pessoais crus. | `_reversa_sdd/migration/cutover_plan.md#No-go Pos-Fase 16`. | 🟢 |
| Confiabilidade | Smoke deve ser repetível e abortável sem alterar produção. | Fase 17 é validação real controlada, não go-live. | 🟢 |
| Manutenibilidade | Reutilizar scripts e guardrails existentes antes de criar novos scripts. | `scripts/ops` já cobre env, migrations, smoke, dry-run e staging import. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Ambiente staging ausente
  Dado que a URL de staging ou envs obrigatórias não estão configuradas
  Quando o operador executa os checks da Fase 17
  Então o resultado é pending-config com pendência clara
  E nenhum secret é impresso
  E nenhuma conexão de produção é feita
  E lint/test/build/e2e local não dependem de credenciais reais

Cenário: Smoke real de storefront em staging
  Dado uma URL staging aprovada em STAGING_SMOKE_URL ou variável equivalente
  E envs staging válidas
  Quando o smoke real é executado
  Então home, catálogo, produto, carrinho e checkout respondem com estados esperados
  E o relatório registra status por etapa

Cenário: Pagamento em Stripe test mode
  Dado Stripe test mode configurado em staging
  E webhook test aprovado
  Quando o fluxo de checkout cria pedido e pagamento teste
  Então o pagamento é confirmado apenas por evento/webhook test
  E live mode permanece bloqueado

Cenário: Stripe test webhook ausente
  Dado que o webhook test ainda não está configurado
  Quando a fase valida o smoke de pagamento real
  Então o pagamento real em staging fica pending-config
  E a fase valida apenas checklist e bloqueio de live mode

Cenário: Banco staging não aprovado para migration
  Dado que o banco staging existe, mas não há aprovação humana de migration
  Quando a fase valida schema/migrations
  Então a fase registra pendência ou no-go operacional
  E não executa migration real

Cenário: STAGING_DATABASE_URL ausente
  Dado que STAGING_DATABASE_URL ou variável equivalente não existe
  Quando a fase valida banco staging
  Então o resultado é pending-config
  E nenhuma conexão é aberta
  E DATABASE_URL não é impresso

Cenário: Arquivos aprovados ausentes para import staging
  Dado que os arquivos aprovados de import staging ainda não existem
  Quando a fase avalia o import staging smoke
  Então o resultado é pending-input
  E nenhuma importação é executada
  E nenhuma conexão de banco é aberta

Cenário: Tentativa de usar produção
  Dado um target, URL ou variável com sinal de produção
  Quando qualquer check, smoke ou import staging for iniciado
  Então a execução aborta antes de ação externa
  E o relatório registra bloqueio crítico sem expor valores

Cenário: Checklist go-live posterior
  Dado os relatórios de staging
  Quando a fase consolida readiness
  Então existe checklist go-live com domínio, envs, rollback, smoke pós-deploy e critérios go/no-go
  E o checklist não executa deploy final nem produção
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem contrato de staging, smoke real vira operação improvisada. |
| RF-02 | Must | Validação de envs sem secrets é guardrail central do projeto. |
| RF-03 | Must | Produção é explicitamente fora de escopo. |
| RF-04 | Must | Banco staging precisa ser seguro antes de qualquer validação real. |
| RF-05 | Must | Pagamento teste precisa bloquear live mode. |
| RF-06 | Must | Smoke real é o objetivo principal da fase. |
| RF-07 | Must | Checkout/pagamento são parte crítica do go-live readiness. |
| RF-08 | Should | Import staging smoke depende de dados aprovados. |
| RF-09 | Must | Go/no-go precisa ser baseado em evidência. |
| RF-10 | Must | Checklist posterior prepara a fase seguinte sem executar produção. |
| RF-11 | Must | Dados reais e relatórios brutos não podem vazar para Git. |
| RF-12 | Should | Reversa precisa acompanhar a macrofase, mas sem push automático. |

## 9. Esclarecimentos

### Sessão 2026-07-03

- **Q:** A URL pública controlada de staging/preview já existe e está autorizada para smoke real?
  **R:** Ainda não considerar a URL como existente obrigatória. A Fase 17 deve preparar o smoke real para rodar quando `STAGING_SMOKE_URL` ou variável equivalente for fornecida. Se a URL não existir, deve retornar `pending-config`, gerar relatório de pendência, não falhar lint/test/build/e2e, não tentar deploy e não inventar URL.
- **Q:** Neon staging/dev e envs de staging já estão configurados fora do Git, incluindo variáveis obrigatórias sem valores expostos?
  **R:** Ainda não assumir que Neon staging/dev está configurado. A Fase 17 deve validar presença/ausência de envs sem imprimir valores. Se `STAGING_DATABASE_URL` ou equivalente não existir, deve retornar `pending-config`, bloquear qualquer conexão, não rodar migration, não imprimir `DATABASE_URL` e gerar checklist do que falta configurar fora do Git.
- **Q:** Stripe test mode/webhook test e arquivos aprovados para eventual import staging já estão disponíveis para a primeira validação real?
  **R:** Ainda não assumir que Stripe test webhook e arquivos aprovados existem. Sem webhook test, o smoke de pagamento real fica `pending-config`, validando apenas checklist e bloqueio de live mode. Sem arquivos aprovados, import staging smoke fica `pending-input`, sem importação e sem conexão. Quando URL/env/webhook/arquivos estiverem disponíveis futuramente, o smoke real pode rodar somente em staging/preview/dev remoto, nunca produção.

## 10. Lacunas

- Nenhuma lacuna bloqueadora restante para planejamento. Infraestrutura externa ausente deve ser tratada como `pending-config` ou `pending-input`, não como bloqueio para `/reversa-plan`.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-03 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-03 | Dúvidas bloqueadoras resolvidas por `/reversa-clarify`; adicionados estados `pending-config` e `pending-input` para infraestrutura ausente | reversa |
