# Ambiente Staging — Fase 18

## Sequência

1. Rodar `pnpm ops:check-staging-environment` sem credenciais externas.
2. Tratar Vercel, Neon ou Stripe ausentes como `pending-config` e `no-go`.
3. Configurar providers manualmente fora do Git.
4. Confirmar target não produtivo e revisar logs sanitizados.
5. Aprovar migration staging somente após snapshot e revisão SQL.
6. Aprovar bootstrap master somente após schema e auth.
7. Aprovar smoke externo somente com URL e Stripe test/webhook.
8. Consolidar relatório; qualquer Must pendente mantém `no-go`.

## Parada segura

Pare se houver produção, Stripe live, output sensível, snapshot ausente ou gate
incompleto. Não tente corrigir staging limpando dados automaticamente.

## Rollback

- Vercel: reverter/reapontar apenas o Preview aprovado.
- Neon: restaurar branch/snapshot confirmado antes da migration.
- Bootstrap: não apagar usuário automaticamente.
- Smoke: encerrar e preservar apenas relatório sanitizado.

Produção e Laravel legado permanecem intocados.
