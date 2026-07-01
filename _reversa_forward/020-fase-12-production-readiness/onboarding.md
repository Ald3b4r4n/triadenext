# Onboarding: Fase 12 - Production Migration Readiness

> Identificador: `020-fase-12-production-readiness`
> Data: `2026-06-26`
> Objetivo: orientar um humano a testar e revisar a macrofase pela primeira vez, sem executar ações reais proibidas.

## 1. Antes de começar

1. Confirmar que o diretório é `D:\Projetos\triade-essenza-next`.
2. Confirmar que não está no Laravel legado `D:\Projetos\triadeessenzaparfum.com.br`.
3. Confirmar status Git e branch antes de qualquer edição futura.
4. Não copiar `.env`, não imprimir secrets, não conectar banco real, não rodar migration real e não fazer deploy.
5. Usar `.env.example` apenas como contrato de nomes, sem valores reais.

## 2. Leitura mínima

1. `_reversa_forward/020-fase-12-production-readiness/requirements.md`
2. `_reversa_forward/020-fase-12-production-readiness/roadmap.md`
3. `_reversa_forward/020-fase-12-production-readiness/data-delta.md`
4. `_reversa_forward/020-fase-12-production-readiness/interfaces/environment-contract.md`
5. `_reversa_forward/020-fase-12-production-readiness/interfaces/neon-database.md`
6. `_reversa_forward/020-fase-12-production-readiness/interfaces/vercel-deployment.md`
7. `_reversa_forward/020-fase-12-production-readiness/interfaces/stripe-webhook.md`
8. `_reversa_forward/020-fase-12-production-readiness/interfaces/blob-storage.md`

## 3. Comandos locais seguros esperados

Estes comandos são seguros porque não exigem banco real nem deploy por padrão:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm ops:check-env
```

Comandos que exigem aprovação humana explícita antes de execução contra alvo real:

```powershell
pnpm db:migrate
pnpm db:seed
pnpm db:seed:admin-dev
vercel
vercel --prod
vercel rollback
```

## 4. Fluxo de revisão da Fase 12

1. Revisar migrations Drizzle localmente e preencher relatório futuro de readiness.
2. Revisar `.env.example` e docs de `docs/operations`.
3. Conferir checklist de variáveis local, preview/staging e produção.
4. Conferir plano Neon: branch/banco alvo, backup, rollback e ponto de aprovação.
5. Conferir plano Vercel: preview, production, env vars, domínio, logs e rollback.
6. Conferir Stripe test mode: chaves test, webhook, eventos e smoke de PaymentIntent.
7. Conferir Blob/upload: token, fallback e limites.
8. Conferir scripts seguros: saída sem valores, sem rede obrigatória e sem mutação real.
9. Conferir smoke por URL: `localhost` por padrão, URL pública apenas quando aprovada.
10. Conferir checklist de go-live posterior.

## 5. Critérios de sucesso para testar a macrofase

- O time consegue responder quais variáveis são obrigatórias em local, preview/staging e produção.
- O time sabe quais migrations existem e qual ordem elas devem seguir.
- Existe ponto claro de aprovação antes de migration real ou deploy real.
- Existe plano de backup e rollback separado para Neon e Vercel.
- Stripe permanece em test mode durante readiness.
- Blob/upload não tenta chamada real sem token e sem contexto aprovado.
- Smoke cobre o fluxo principal sem cartão real, e-mail real ou ação destrutiva.
- Go-live posterior tem checklist próprio e não acontece automaticamente.

## 6. Quando parar e pedir decisão humana

Pare antes de qualquer um destes eventos:

- Uma URL real de banco aparece em terminal, log ou arquivo.
- Um comando pede confirmação para aplicar migration, deploy, rollback real ou domínio.
- Uma variável parece conter secret real.
- Um teste tenta usar live mode de Stripe.
- Um smoke exige e-mail real ou provider externo real.
- O plano pede tocar no Laravel legado.
- Aparece alteração funcional fora de docs/scripts/testes seguros planejados.

## 7. Próximo passo no pipeline

Depois deste plano, rode `/reversa-to-do` para transformar o roadmap em tarefas atômicas.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Onboarding inicial gerado por `/reversa-plan` | reversa |
