# Investigation: Fase 12 - Production Migration Readiness

> Identificador: `020-fase-12-production-readiness`
> Data: `2026-06-26`
> Escopo: pesquisa de fundo, alternativas e padrões operacionais para o plano técnico.

## 1. Fontes locais revisadas

| Fonte | Uso no plano | Observação |
|-------|--------------|------------|
| `_reversa_sdd/architecture.md` | Containers, integrações, guardrails e dívidas. | Confirma Next.js, Drizzle/Postgres, Neon, Blob, Stripe e provider de e-mail mock/unavailable. |
| `_reversa_sdd/deployment.md` | Estado de deploy, variáveis críticas e guardrails. | Confirma `.env.example`, docs operacionais e ausência de deploy automático. |
| `_reversa_sdd/dependencies.md` | Scripts e dependências. | Confirma `pnpm db:migrate`, `pnpm test:e2e`, `ops:check-env` e dependências `latest`. |
| `_reversa_sdd/state-machines.md` | Estados críticos de pedido, pagamento e notificação. | Ajuda a manter smoke sem alterar regras de negócio. |
| `_reversa_sdd/code-analysis.md` | Módulos `payments`, `uploads`, `db`, `lib`. | Confirma webhook assinado, fallback seguro e bloqueio de Blob sem token. |
| `docs/operations/*.md` | Base documental existente. | Requer consolidação para macrofase e go-live posterior. |
| `package.json` | Scripts existentes. | Já existe `ops:check-env`; novos scripts devem ser opcionais e seguros. |
| `.env.example` | Contrato inicial de variáveis. | Deve ser revisado por ambiente, sem valores reais. |

## 2. Fontes externas primárias consultadas

| Fonte | Link | Aplicação |
|-------|------|-----------|
| Drizzle ORM migrations | https://orm.drizzle.team/docs/migrations | Sustenta decisão de usar migrations SQL versionadas e `drizzle-kit migrate`, evitando `push` em banco real. |
| Neon backups | https://neon.com/docs/manage/backups | Sustenta checklist de backup, restore window, `pg_dump` e rollback antes de migration real. |
| Neon branching | https://neon.com/docs/guides/branching-intro | Sustenta uso de branch/ambiente isolado para preview/staging e testes antes de produção. |
| Vercel environment variables | https://vercel.com/docs/environment-variables | Sustenta separação de variáveis Development, Preview e Production. |
| Vercel instant rollback | https://vercel.com/docs/instant-rollback | Sustenta checklist de rollback de deploy e ressalva sobre configuração/env antiga. |
| Stripe webhooks | https://docs.stripe.com/webhooks | Sustenta webhook testável antes de go-live e validação de assinatura. |
| Stripe testing | https://docs.stripe.com/testing | Sustenta test mode, test cards e proibição de cartões reais. |
| Vercel Blob server uploads | https://vercel.com/docs/vercel-blob/server-upload | Sustenta `BLOB_READ_WRITE_TOKEN`, upload server-side e atenção a limite de request. |

## 3. Alternativas avaliadas

| Alternativa | Veredito | Motivo |
|-------------|----------|--------|
| Rodar `drizzle-kit push` em staging para acelerar. | Descartada | Pode aplicar diffs diretamente; o projeto já versiona SQL e precisa revisão antes de ambiente real. |
| Executar migration real como parte do `/reversa-coding`. | Descartada | Viola regra de aprovação humana explícita e aumenta risco de banco errado. |
| Fazer deploy Vercel automático nesta fase. | Descartada | A fase prepara, mas não executa deploy real automático. |
| Usar produção como primeiro ambiente de validação. | Descartada | O requirements pede ambiente real controlado e go-live posterior. |
| Stripe live mode para smoke final. | Descartada | Test mode é suficiente e obrigatório antes de live mode; pagamento real fica fora. |
| Criar novos providers de upload/e-mail/fiscal. | Descartada | Fora de escopo e criaria microfeatures. |
| Manter tudo apenas documental, sem scripts. | Parcialmente descartada | Documentação é obrigatória; scripts seguros simples ajudam, desde que sem rede/secrets por padrão. |

## 4. Padrões aplicáveis

- **Gate de aprovação:** toda ação real deve ter comando, alvo, ambiente e impacto registrados antes de execução.
- **Dry-run por padrão:** scripts operacionais devem funcionar sem rede e sem credenciais reais quando possível.
- **Secret redaction:** saída deve usar `present`, `missing`, `optional` ou `configured`, nunca valores.
- **Staging antes de produção:** Vercel Preview/staging e Neon branch/staging devem ser o primeiro ambiente real controlado.
- **Rollback separado:** rollback de app, banco, domínio e pagamentos são planos diferentes e não podem ser tratados como um botão único.
- **Smoke por URL:** smoke de staging deve aceitar URL pública aprovada e preservar `localhost` como padrão seguro.

## 5. Pontos que exigem cuidado na implementação futura

- `drizzle.config.ts` usa URL placeholder quando `DATABASE_URL` falta; scripts devem deixar claro quando uma URL real será exigida e nunca imprimi-la.
- `pnpm db:migrate` já tem guarda de presença, mas isso não basta para garantir alvo correto; checklist humano continua obrigatório.
- `vercel env pull` cria arquivo `.env`; o plano deve orientar com cuidado para não versionar nem copiar secrets para artefatos.
- Stripe CLI e dashboard podem gerar webhook secrets; o plano deve registrar apenas que o segredo existe, não o valor.
- Smoke de pagamento precisa usar mock/test mode e evitar cartão real, e-mail real ou provider real obrigatório.
- Vercel Blob server upload tem limite operacional de função; o domínio atual já limita imagem a 5 MB, o que precisa aparecer no checklist.

## 6. Resultado da investigação

A abordagem recomendada é preparar um pacote operacional de produção em quatro camadas:

1. **Contratos:** env, banco, deploy, webhook e storage documentados por ambiente.
2. **Guardrails:** scripts e checklists seguros, sem valores de secrets e sem execução real por padrão.
3. **Staging:** plano manual e smoke por URL aprovada.
4. **Go-live posterior:** checklist separado com aprovação explícita, backup, rollback e smoke final.

Não há necessidade de mudar stack, regras de negócio ou schema para cumprir os requirements da Fase 12.

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Investigação inicial gerada por `/reversa-plan` | reversa |
