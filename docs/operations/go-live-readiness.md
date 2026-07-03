# Go-live readiness posterior

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
