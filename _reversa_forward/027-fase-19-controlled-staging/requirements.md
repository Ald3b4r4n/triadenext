# Requirements: Fase 19 — Controlled Staging Execution

> Identificador: `027-fase-19-controlled-staging`
> Data: `2026-07-11`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A Fase 19 executará somente diagnósticos locais e seguros para revelar o estado operacional de staging da Tríade Essenza Next. A entrega será um relatório go/no-go sanitizado e um checklist humano objetivo para configurar Vercel Preview, Neon staging/dev, Stripe test, autenticação, bootstrap administrativo e importação controlada fora do Git. A fase não autoriza conexão remota, migration, importação, deploy, produção ou Stripe live.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#provider-readiness-gates-pós-fase-18` | Centraliza readiness offline, estados operacionais, gates, smoke e decisão go/no-go. | 🟢 |
| `_reversa_sdd/domain.md#readiness-de-providers-e-ambiente-staging` | Define `pending-config`, `pending-input`, bloqueios de produção/Stripe live e pré-condições humanas. | 🟢 |
| `_reversa_sdd/inventory.md#estado-pós-fase-18` | Inventaria os três comandos da Fase 18 e as validações já concluídas sem conexão remota. | 🟢 |
| `_reversa_sdd/deployment.md#guardrails-operacionais` | Mantém deploy e migration dependentes de aprovação humana explícita. | 🟢 |
| `_reversa_sdd/deployment.md#estado-pós-fase-18` | Confirma wrappers em modo check, relatório sanitizado e infraestrutura externa ainda não presumida. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Responsável técnico | Descobrir o estado real de readiness sem risco remoto | Executa diagnósticos padrão e recebe uma matriz sanitizada de pronto, pendente ou bloqueado. |
| Administrador do ambiente | Configurar providers fora do Git | Usa o checklist humano para preparar Vercel, Neon, Stripe test e autenticação sem compartilhar valores sensíveis. |
| Aprovador da migração | Decidir se a próxima etapa pode avançar | Analisa evidências, bloqueios e pré-condições antes de autorizar qualquer execução remota futura. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01: Diagnóstico sem efeito remoto.** Todos os comandos desta fase devem ser executados no modo seguro padrão, sem flags de execução, destruição, reset, conexão ou aprovação remota. 🟢
   - Origem: `_reversa_sdd/domain.md#readiness-de-providers-e-ambiente-staging`
   - Tipo: nova
2. **RN-02: Pendência é no-go seguro.** `pending-config`, `pending-input`, `blocked`, `failed` ou skip obrigatório não podem ser convertidos em `go`. 🟢
   - Origem: `_reversa_sdd/architecture.md#provider-readiness-gates-pós-fase-18`
   - Tipo: nova
3. **RN-03: Produção e Stripe live permanecem bloqueados.** Qualquer indicador de produção ou chave live encerra o diagnóstico como bloqueado antes de efeito externo. 🟢
   - Origem: `_reversa_sdd/domain.md#readiness-de-providers-e-ambiente-staging`
   - Tipo: preservada
4. **RN-04: Saída sanitizada.** Relatórios podem registrar nome da variável, provider e presença/ausência, mas nunca valor, URL privada, connection string, token, cookie, chave ou segredo de webhook. 🟢
   - Origem: `_reversa_sdd/deployment.md#estado-pós-fase-18`
   - Tipo: preservada
5. **RN-05: Separação de responsabilidade.** Pendências de configuração externa devem ser distinguidas de defeitos do projeto, pendências de dados aprovados e ações dependentes de decisão humana. 🟢
   - Origem: `_reversa_sdd/inventory.md#estado-pós-fase-18`
   - Tipo: nova
6. **RN-06: Execução remota continua futura.** O relatório desta fase não constitui aprovação para migration, bootstrap, importação, smoke remoto ou deploy. 🟢
   - Origem: `_reversa_sdd/deployment.md#guardrails-operacionais`
   - Tipo: preservada
7. **RN-07: Laravel legado somente leitura.** Nenhum diagnóstico pode alterar arquivos, configuração ou banco do Laravel legado. 🟢
   - Origem: `_reversa_sdd/architecture.md#guardrails`
   - Tipo: preservada

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Auditar o estado inicial do Git e confirmar que `next-env.d.ts` está limpo. | Must | O relatório registra somente branch, limpeza do worktree e situação de `next-env.d.ts`, sem alterar arquivos funcionais. | 🟢 |
| RF-02 | Executar `pnpm ops:check-staging-environment` no modo padrão. | Must | O comando termina sem conexão remota e produz estado sanitizado por provider e decisão preliminar. | 🟢 |
| RF-03 | Executar os checks de smoke staging e import staging em seus modos seguros. | Must | `pnpm ops:check-staging-smoke` e `pnpm ops:check-staging-import-smoke` retornam resultado controlado, inclusive skip/pending quando a URL estiver ausente. | 🟢 |
| RF-04 | Executar o diagnóstico de dry-run de dados sem usar entrada real não aprovada. | Must | `pnpm ops:check-data-dry-run` usa o comportamento seguro previsto, não conecta banco, não importa e registra `pending-input` ou resultado sintético separadamente. | 🟢 |
| RF-05 | Executar `pnpm ops:import-staging` somente no modo padrão de precheck. | Must | O comando não recebe flag de execução e não abre conexão; ausência de arquivos/env/aprovação gera pendência ou bloqueio explícito. | 🟢 |
| RF-06 | Executar os wrappers de migration e bootstrap somente em modo check. | Must | `pnpm ops:migrate-staging` e `pnpm ops:bootstrap-admin-staging` não recebem flags de execução e confirmam que nenhum driver remoto foi carregado. | 🟢 |
| RF-07 | Consolidar variáveis e configurações ausentes sem mostrar valores. | Must | O relatório lista apenas nomes/categorias e presença/ausência para Vercel, Neon, Stripe test, autenticação e staging. | 🟢 |
| RF-08 | Classificar cada pendência operacional. | Must | Cada item é marcado como configuração externa, input aprovado, bloqueio de segurança, problema do Next ou decisão humana. | 🟢 |
| RF-09 | Gerar relatório go/no-go operacional sanitizado. | Must | O relatório apresenta checks executados, estados, bloqueadores, evidências e decisão; qualquer Must pendente impede `go`. | 🟢 |
| RF-10 | Gerar checklist humano enxuto para configuração fora do Git. | Must | O checklist ordena ações de Vercel, Neon, Stripe test, auth/admin e import staging, com responsável, evidência esperada e gate de aprovação. | 🟢 |
| RF-11 | Registrar critérios para uma futura execução remota aprovada. | Should | O documento separa claramente pré-condições de migration, bootstrap, importação e smoke, sem executar nenhuma delas. | 🟢 |
| RF-12 | Preservar rastreabilidade no ciclo Reversa. | Must | Requirements, plano futuro, ações e relatório da execução referenciam os scripts e guardrails da Fase 18. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Nenhum comando pode receber flag destrutiva, de execução remota ou de produção. | `_reversa_sdd/architecture.md#provider-readiness-gates-pós-fase-18` | 🟢 |
| Privacidade | Nenhuma saída pode revelar URL privada, `DATABASE_URL`, credencial Stripe, token, cookie ou webhook secret. | `_reversa_sdd/domain.md#readiness-de-providers-e-ambiente-staging` | 🟢 |
| Isolamento | Diagnósticos devem funcionar sem Vercel, Neon, Stripe ou URL externa configurados. | `_reversa_sdd/deployment.md#estado-pós-fase-18` | 🟢 |
| Confiabilidade | Cada comando deve registrar exit code e estado sem mascarar pendência como sucesso de go-live. | ADR 013 e regression watch da Fase 18 | 🟢 |
| Auditabilidade | O relatório deve indicar comando, modo seguro, resultado, categoria da pendência e ação humana correspondente. | Objetivo operacional da Fase 19 | 🟢 |
| Reprodutibilidade | A sequência diagnóstica deve ser documentada e repetível sem depender de valores secretos. | `_reversa_sdd/inventory.md#estado-pós-fase-18` | 🟢 |
| Compatibilidade | Lint, typecheck, testes, build e E2E locais não podem passar a depender de infraestrutura externa. | `_reversa_sdd/architecture.md#provider-readiness-gates-pós-fase-18` | 🟢 |
| Linguagem | Relatórios e checklists humanos devem usar PT-BR claro, com gramática e acentuação revisadas. | Regra de copy do projeto | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Diagnóstico completo sem infraestrutura externa
  Dado que Vercel, Neon ou Stripe test podem não estar configurados
  Quando os scripts operacionais são executados sem flags remotas
  Então o resultado registra pending-config ou pending-input de forma sanitizada
  E nenhuma conexão, migration, importação ou deploy é iniciado

Cenário: Wrappers protegidos permanecem em modo check
  Dado que não existe aprovação para execução remota
  Quando os wrappers de migration e bootstrap são executados no modo padrão
  Então eles apenas avaliam os gates
  E nenhum driver de banco ou autenticação remoto é carregado

Cenário: Produção ou Stripe live são rejeitados
  Dado que o ambiente contém indicador de produção ou Stripe live
  Quando o diagnóstico avalia a configuração
  Então o estado é blocked
  E nenhum valor sensível ou efeito externo é produzido

Cenário: Smoke sem URL aprovada
  Dado que nenhuma URL pública controlada foi fornecida
  Quando os checks de smoke são executados
  Então o resultado é pending-config ou skipped esperado
  E nenhuma URL é inventada nem acessada

Cenário: Entrada aprovada ausente
  Dado que data/dry-run/input/primeira-execucao não contém os arquivos aprovados
  Quando o diagnóstico de dry-run ou import staging é executado
  Então o resultado é pending-input
  E nenhum dado real é inventado ou importado

Cenário: Relatório go/no-go conservador
  Dado que pelo menos um requisito Must está pendente, bloqueado ou falhou
  Quando o relatório operacional é consolidado
  Então a decisão final é no-go
  E o checklist informa a ação humana necessária fora do Git

Cenário: Higiene do repositório preservada
  Dado um worktree inicialmente limpo
  Quando a fase termina
  Então nenhum secret, dado real, arquivo .env ou alteração no Laravel legado foi criado
  E next-env.d.ts permanece limpo
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-10 | Must | Formam o diagnóstico seguro e a entrega operacional mínima da macrofase. |
| RF-11 | Should | Prepara a próxima decisão sem conceder autorização remota. |
| RF-12 | Must | Mantém rastreabilidade e regression watch no fluxo Reversa. |
| Segurança, privacidade e isolamento | Must | Impedem produção acidental, conexão remota e exposição de secrets. |
| Auditabilidade e reprodutibilidade | Must | Tornam a decisão go/no-go verificável e repetível. |
| Execução remota, migration, importação e deploy | Won't | Permanecem explicitamente fora da Fase 19. |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada. O escopo já determina execução exclusivamente diagnóstica e sem flags remotas.

## 10. Lacunas

Nenhuma lacuna bloqueadora para planejar a Fase 19. A disponibilidade real de Vercel, Neon, Stripe test, URL e arquivos aprovados é justamente objeto do diagnóstico e deve produzir `pending-config` ou `pending-input` quando ausente.

## 11. Fora de escopo

- Produção, go-live e domínio final.
- Stripe live mode.
- Migration remota ou migration em produção.
- Conexão com banco remoto sem aprovação humana explícita.
- Importação definitiva ou alteração de dados remotos.
- Deploy preview, staging ou produção.
- Bling, NF-e, rotinas fiscais, WhatsApp ou SMS.
- Alteração de regra de pagamento, pedido, estoque, cupom, frete ou importação.
- Alteração no Laravel legado.
- Cópia de `.env`, versionamento de dados reais ou exposição de secrets.

## 12. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-11 | Versão inicial gerada por `/reversa-requirements` | reversa |
