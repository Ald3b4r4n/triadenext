# Go-live readiness posterior

## Gate da Fase 18

- [ ] `ops:check-staging-environment` produz relatório `go` sanitizado.
- [ ] Nenhum item Must permanece `pending-config`, `pending-input`, `blocked`, `failed` ou skip não autorizado.
- [ ] Rollback Vercel e rollback Neon estão documentados separadamente.
- [ ] Migration staging, bootstrap master e smoke real possuem aprovações distintas.
- [ ] Stripe test/webhook está verde e live mode continua bloqueado.
- [ ] Nova aprovação humana foi registrada para a próxima fase.

O relatório da Fase 18 não autoriza produção, domínio definitivo ou Stripe live.

Este checklist e preparatorio. A Fase 17 nao executa go-live, dominio real, deploy final, migration em producao ou Stripe live mode.

## Decisao humana

- [ ] Responsavel tecnico aprovou o commit alvo.
- [ ] Responsavel de negocio aprovou janela e criterio de abortar.
- [ ] Staging/preview real passou sem bloqueadores.
- [ ] Pendencias `pending-config` resolvidas fora do Git.
- [ ] Pendencias `pending-input` resolvidas com arquivos aprovados.

## Ambiente

- [ ] `STAGING_SMOKE_URL` validada como ambiente nao produtivo.
- [ ] Neon staging/dev validado sem imprimir `DATABASE_URL`.
- [ ] Snapshot/rollback documentado antes de qualquer migration futura.
- [ ] Vercel preview/staging validado antes de producao.
- [ ] Logs monitorados sem secrets.

## Stripe

- [ ] Stripe test mode confirmado.
- [ ] Webhook test confirmado.
- [ ] Eventos esperados documentados.
- [ ] Stripe live mode continua fora da Fase 17.

## Smoke minimo

- [ ] Home.
- [ ] Catalogo.
- [ ] Produto.
- [ ] Carrinho.
- [ ] Checkout.
- [ ] Pagamento teste.
- [ ] Pedido.
- [ ] Admin.
- [ ] Notificacoes/outbox.
- [ ] Import staging smoke, se houver dados aprovados.

## Criterios de abortar

- [ ] Alvo ou runtime com sinal de producao.
- [ ] Stripe live mode detectado.
- [ ] Secret, token, chave ou `DATABASE_URL` aparecendo em saida.
- [ ] Falha funcional em checkout/pedido/pagamento/admin/outbox.
- [ ] Rollback ou snapshot ausente para etapa que exija banco.
