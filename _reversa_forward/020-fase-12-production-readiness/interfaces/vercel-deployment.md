# Interface: Vercel Deploy

> Feature: `020-fase-12-production-readiness`
> Tipo: plataforma/deploy
> Status: contrato operacional; nenhum deploy autorizado por este documento.

## 1. Objetivo

Preparar Vercel Preview/Staging e Production com env vars, build, logs, domínio e rollback documentados.

## 2. Ambientes Vercel

| Ambiente | Uso na Fase 12 | Execução automática |
|----------|----------------|---------------------|
| Development | Referência local, sem secrets reais obrigatórios. | Permitida localmente. |
| Preview | Primeiro alvo controlado para staging/smoke. | Não executar sem aprovação. |
| Production | Preparar checklist e go-live posterior. | Proibida sem aprovação futura. |

## 3. Entradas

- Projeto Vercel aprovado.
- Branch Git aprovada.
- Lista de env vars por ambiente.
- URL de preview/staging aprovada para smoke.
- Plano de rollback e logs.

## 4. Operações planejadas

| Operação | Permitida automaticamente? | Observação |
|----------|----------------------------|------------|
| Rodar `pnpm build` local | Sim | Não exige deploy. |
| Documentar env vars Vercel | Sim | Sem valores reais. |
| Rodar `vercel` para preview | Não | Precisa aprovação explícita. |
| Rodar `vercel --prod` | Não | Fora da execução automática da fase. |
| Configurar domínio real | Não | Go-live posterior. |
| Rodar rollback real | Não | Só após incidente/aprovação. |

## 5. Critérios de sucesso

- Build local documentado.
- Variáveis preview/production listadas sem valores.
- URL de preview/staging aceita como entrada para smoke.
- Logs e rollback documentados.
- Domínio real permanece em checklist de go-live posterior.

## 6. Critérios de falha

- Deploy executado sem autorização.
- Production usado antes de Preview/Staging.
- Domínio real configurado nesta etapa.
- Env vars reais registradas em arquivo versionado.
- Rollback Vercel tratado como rollback de banco.

## 7. Rollback

Rollback Vercel reverte o deployment da aplicação, mas não reverte alterações de banco, env vars ou dados. O checklist deve separar rollback de app, banco, Stripe, Blob e domínio.

## 8. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Contrato inicial gerado por `/reversa-plan` | reversa |
