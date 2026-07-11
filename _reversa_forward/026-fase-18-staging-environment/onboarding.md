# Onboarding: Fase 18 — Staging Environment Setup

> Objetivo: orientar um operador humano a preparar e validar staging sem expor secrets, alcançar produção ou depender de infraestrutura já existente.

## Antes de começar

1. Confirme o diretório `D:\Projetos\triade-essenza-next`.
2. Confirme que não está em `D:\Projetos\triadeessenzaparfum.com.br`.
3. Não copie `.env` nem use comandos que exportem envs remotas para arquivos locais.
4. Não cole URL externa, `DATABASE_URL`, chave Stripe, webhook secret, senha ou token em terminal compartilhado, relatório ou documentação.
5. Não execute deploy, conexão, migration, bootstrap remoto ou smoke mutável sem aprovação humana específica.

## Resultado esperado sem infraestrutura

| Dependência ausente | Resultado | Próxima ação humana |
| --- | --- | --- |
| Projeto/URL Vercel | `pending-config` | Vincular repositório e criar Preview/staging fora deste fluxo automático. |
| Neon staging/dev | `pending-config` | Criar projeto/branch isolado e definir restore. |
| Stripe test/webhook | `pending-config` | Configurar sandbox/test e endpoint de staging. |
| Arquivos de import | `pending-input` | Disponibilizar arquivos aprovados fora do Git. |
| Aprovação/snapshot | `blocked` | Obter aprovação e evidência antes de qualquer escrita. |

`pending-config` é sucesso do check offline, mas produz `no-go` para avanço operacional.

## Sequência operacional planejada

### 1. Validação local

1. Confirmar worktree e branch sem alterar arquivos.
2. Executar checks offline de env, migrations e staging environment.
3. Confirmar que os relatórios mostram somente presença/ausência.
4. Executar lint, typecheck, testes, build e E2E sem credenciais externas.

### 2. Vercel Preview/staging

1. Verificar manualmente se o repositório está vinculado.
2. Selecionar Preview ou ambiente customizado staging; Production é proibido.
3. Configurar variáveis no provider sem exportá-las localmente.
4. Validar build e logs sem secrets.
5. Registrar somente que uma URL aprovada existe; não registrar a URL completa em artefato versionável.
6. Não promover deployment para produção.

### 3. Neon staging/dev

1. Verificar manualmente projeto/branch isolado.
2. Confirmar role mínima, janela de restore e snapshot/branch de rollback.
3. Rodar análise estática das migrations localmente.
4. Registrar aprovação humana para alvo lógico, migrations e janela.
5. Somente então executar o comando staging armado.
6. Verificar schema e journal sem imprimir connection string.

### 4. Bootstrap master

1. Confirmar banco staging migrado e auth configurado.
2. Confirmar `ADMIN_MASTER_EMAILS` por presença e política, sem imprimir outras envs.
3. Executar bootstrap staging idempotente com aprovação.
4. Validar login de `rafasouzacruz@gmail.com` e bloqueio de customer em `/admin`.

### 5. Stripe test e webhook

1. Confirmar test/sandbox, nunca live.
2. Confirmar envs por presença, sem valores.
3. Configurar manualmente o endpoint HTTPS de staging.
4. Validar assinatura e eventos `payment_intent.succeeded`, `payment_intent.payment_failed` e `payment_intent.canceled`.
5. Executar pagamento somente com cartão/test data oficial e aprovação humana.

### 6. Smoke e decisão

1. Rodar storefront: home, catálogo, produto e carrinho.
2. Rodar checkout, pedido e pagamento em test mode.
3. Validar admin, pedidos e notificações/outbox.
4. Rodar import staging smoke somente com arquivos aprovados e dry-run `go`.
5. Gerar relatório go/no-go sanitizado.
6. Qualquer Must `pending-config`, `pending-input`, `blocked` ou `failed` mantém `no-go`.

## Comandos locais existentes para referência

```powershell
pnpm ops:check-env
pnpm ops:check-migrations
pnpm ops:check-staging-smoke
pnpm ops:check-admin-env
pnpm ops:check-staging-import-smoke
```

Os novos comandos e flags serão definidos no `actions.md`. Este onboarding não autoriza executá-los contra ambiente remoto.

## Evidências mínimas

- Inventário de configuração sanitizado.
- Checklist Vercel Preview/staging.
- Checklist Neon, snapshot e rollback.
- Aprovação de migration staging sem connection string.
- Resultado de bootstrap/login master sanitizado.
- Checklist Stripe test/webhook.
- Relatório de smoke por etapa.
- Relatório go/no-go e pendências humanas.

## Rollback e parada segura

- Pare imediatamente se houver sinal de produção, live mode ou segredo em output.
- Não continue migration se snapshot/restore não estiver confirmado.
- Não continue pagamento se webhook test não estiver validado.
- Não limpe staging automaticamente para corrigir smoke.
- Preserve evidência sanitizada e siga o runbook de rollback específico de Vercel ou Neon.
