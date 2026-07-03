# Investigation - Fase 16 Approved Staging Import

> Identificador: `024-fase-16-staging-import`
> Data: `2026-07-02`

## Fontes internas consultadas

| Fonte | Uso no plano |
| --- | --- |
| `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | Base para entrada `primeira-execucao`, relatorios em `data/dry-run/output/` e ausencia de efeitos reais no dry-run. |
| `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada` | Guardrails de importacao real, banco real, deploy real, Laravel read-only e aprovacao humana. |
| `_reversa_sdd/code-analysis.md#data-dry-run` | Funcoes existentes de descoberta, contrato, seguranca, normalizacao, reconciliacao e relatorio. |
| `_reversa_sdd/code-analysis.md#db` | Entidades persistidas existentes e uso condicional do Drizzle/Postgres. |
| `_reversa_sdd/deployment.md#Scripts-Operacionais-Seguros` | Padrao de scripts `ops:*` sem secrets, deploy, migration, banco real ou provider externo. |
| `_reversa_sdd/migration/data_migration_plan.md#Estado-Pos-Fase-15` | Entrada aprovada, aliases, inventario em memoria e divergencias por origem. |
| `_reversa_sdd/state-machines.md#Paridade-e-Migracao-Controlada` | Transicao de `primeira_execucao_pending_input` para fonte real aprovada e reconciliacao aprovada. |

## Fontes externas de referencia

Estas fontes sao referencias para a implementacao futura. Elas nao autorizam deploy, migration real, banco real ou importacao nesta etapa.

| Fonte | Link | Relevancia |
| --- | --- | --- |
| Neon protected branches / branching | https://neon.com/docs/guides/protected-branches | Orienta uso de branches/ambientes separados e reforca que connection strings devem ser tratadas como segredo. |
| Vercel environments | https://vercel.com/docs/deployments/environments | Diferencia preview/pre-production de producao para smoke e variaveis por ambiente. |
| Vercel environment variables | https://vercel.com/docs/environment-variables | Referencia para configurar envs sem versionar `.env` nem imprimir valores. |
| Drizzle migrations | https://orm.drizzle.team/docs/migrations | Referencia para revisar migrations e evitar rodar migration automatica sem aprovacao. |
| Stripe testing use cases | https://docs.stripe.com/testing-use-cases | Referencia para manter checkout/pagamento em modo teste/sandbox durante smoke. |
| Stripe webhooks | https://docs.stripe.com/webhooks | Referencia para validar outbox/webhook de teste sem live mode. |

## Alternativas avaliadas

### Alternativa A, manter apenas dry-run local

- Beneficio: risco minimo, sem conexao remota.
- Limite: nao prova schema remoto, auth/admin, dados importados reais ou smoke em ambiente real controlado.
- Decisao: descartada como objetivo final da Fase 16, mas preservada como precheck obrigatorio.

### Alternativa B, importar direto em producao

- Beneficio: encurta caminho ate go-live.
- Limite: contradiz escopo, aumenta risco de perda de dados e impede ensaio seguro.
- Decisao: descartada e bloqueada por contrato.

### Alternativa C, staging/dev remoto com upsert seguro

- Beneficio: prova fluxo real controlado, preserva rollback e reduz risco de destruicao.
- Limite: exige ambiente aprovado, snapshot/backup e cuidado com secrets.
- Decisao: escolhida.

### Alternativa D, reset completo de staging antes de importar

- Beneficio: ambiente previsivel.
- Limite: destrutivo e arriscado se ambiente estiver errado.
- Decisao: permitido apenas como caminho reforcado com snapshot/backup, flag explicita, aprovacao humana e confirmacao de nao producao.

## Padroes aplicaveis

- Fail closed: sem ambiente aprovado, sem arquivos, sem dry-run `go` ou sem snapshot, bloquear escrita.
- Least privilege: comando de importacao deve receber apenas o necessario para staging/dev remoto.
- Redaction by default: valores sensiveis nunca aparecem em logs, relatorios ou erros.
- Idempotencia operacional: upsert seguro deve permitir repetir a execucao sem duplicar chaves naturais.
- Separation of duties: scripts preparam e validam; aprovacao humana decide import, reset e avancar.

## Componentes provaveis a tocar na implementacao futura

| Area | Motivo |
| --- | --- |
| `src/features/data-dry-run` | Reaproveitar contratos, normalizadores e relatorio de divergencias. |
| `scripts/ops` | Criar checks e import staging-only sem secrets. |
| `src/db` | Usar schema e Drizzle contra staging/dev remoto aprovado. |
| `docs/operations` | Criar runbook de importacao staging, snapshot, rollback e smoke. |
| `src/tests/unit` | Cobrir bloqueio de producao, upsert, reset protegido e relatorios. |
| `src/tests/e2e` | Smoke pos-importacao em URL nao produtiva quando disponivel. |

## Pontos que permanecem fora

- Producao, go-live, dominio real e deploy final.
- Migration real automatica.
- Conexao com producao.
- Alteracao no Laravel legado.
- Bling, NF-e, rotinas fiscais, WhatsApp e SMS.
- Mudanca de regra de negocio de catalogo, estoque, cupom, frete, pedido ou pagamento.

## Conclusao

A Fase 16 deve ser desenhada como uma ponte entre dry-run local e importacao remota controlada. O caminho seguro e preparar contratos, prechecks, import staging-only, relatorios e smoke, mas abortar qualquer execucao real quando ambiente, arquivos, dry-run, backup ou aprovacao humana estiverem ausentes.
