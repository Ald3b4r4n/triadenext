# Onboarding: Fase 17 - Staging Smoke Real / Go-live Readiness

> Objetivo: orientar um operador humano a testar a Fase 17 sem produção, sem secrets em logs e sem depender de infraestrutura já pronta.

## Antes de começar

1. Confirme que o diretório é `D:\Projetos\triade-essenza-next`.
2. Confirme que não está no Laravel legado `D:\Projetos\triadeessenzaparfum.com.br`.
3. Não copie `.env`.
4. Não imprima `DATABASE_URL`, chaves Stripe, tokens Blob/Auth ou secrets.
5. Não rode deploy final, migration em produção ou Stripe live mode.

## Estados esperados

| Situação | Resultado esperado |
| --- | --- |
| Sem URL staging | `pending-config` |
| Sem envs staging | `pending-config` |
| Sem `STAGING_DATABASE_URL` | `pending-config`, sem conexão |
| Sem Stripe test webhook | `pending-config` para pagamento real |
| Sem arquivos aprovados | `pending-input` para import staging smoke |
| Produção/live mode detectado | `blocked` |
| Tudo aprovado | smoke staging real executável |

## Fluxo humano planejado

1. Rodar checks locais seguros (`lint`, `typecheck`, `test`, `build`, `test:e2e`) sem credenciais reais.
2. Rodar/verificar contrato de env staging sem imprimir valores.
3. Se `STAGING_SMOKE_URL` não existir, registrar `pending-config` e parar smoke real.
4. Se URL staging existir, validar que não é produção.
5. Validar Stripe test mode e webhook test; se ausentes, registrar `pending-config` para pagamento real.
6. Validar Neon staging/dev e snapshot/rollback; se ausentes, registrar `pending-config`.
7. Executar smoke real somente em staging/preview/dev remoto aprovado.
8. Executar import staging smoke somente se arquivos aprovados existirem e dry-run/import staging estiverem liberados.
9. Gerar relatório go/no-go e checklist go-live posterior.

## Evidências esperadas

- Relatório de envs sem valores.
- Relatório de URL/target staging.
- Relatório de Stripe test mode/webhook ou pendência.
- Relatório de schema/migrations staging ou pendência.
- Relatório de smoke por etapa.
- Checklist go-live/go-no-go.

## Comandos atuais relacionados

```powershell
pnpm ops:check-env
pnpm ops:check-migrations
pnpm ops:check-smoke
pnpm ops:import-staging
pnpm ops:check-staging-import-smoke
```

Novos comandos da Fase 17 devem ser definidos em `actions.md`; este onboarding não executa nada por conta própria.

## Proibido

- Usar produção.
- Usar Stripe live mode.
- Fazer deploy final.
- Rodar migration em produção.
- Conectar banco sem aprovação humana.
- Alterar o Laravel legado.
- Versionar relatórios brutos com dados reais.
- Tratar ausência de infraestrutura como sucesso real.
