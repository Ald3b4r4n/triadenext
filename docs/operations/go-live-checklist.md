# Checklist de go-live posterior

Este checklist e para uma etapa futura. Ele nao autoriza go-live dentro da Fase 12.

## 1. Decisao

- [ ] Responsavel tecnico aprovado.
- [ ] Responsavel de negocio aprovado.
- [ ] Janela de publicacao definida.
- [ ] Criterio de abortar definido.
- [ ] Canal de comunicacao interno definido.

## 2. Pre-requisitos tecnicos

- [ ] Branch/commit de release identificado.
- [ ] Staging/preview verde.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` verdes.
- [ ] Smoke em URL de staging aprovado.
- [ ] Secrets de producao configurados no provedor, sem valores em docs.
- [ ] `.env.example` atualizado apenas com nomes.

## 3. Banco Neon

- [ ] Banco/branch de producao confirmado.
- [ ] Backup/restore confirmado antes de migration.
- [ ] Plano de rollback de dados aprovado.
- [ ] Comando de migration revisado com alvo.
- [ ] Migration real executada somente apos aprovacao final.

## 4. Vercel e dominio

- [ ] Env vars Production configuradas.
- [ ] Deploy Production aprovado.
- [ ] Dominio/DNS aprovado.
- [ ] Plano de rollback Vercel separado do rollback de banco.
- [ ] Logs monitorados durante a janela.

## 5. Stripe

- [ ] Decisao test/live documentada.
- [ ] Webhook de producao configurado se live mode for aprovado.
- [ ] Evento `payment_intent.succeeded` validado.
- [ ] Nenhuma chave real aparece em codigo, log ou doc.

## 6. Blob e e-mail

- [ ] Blob token configurado se upload real for liberado.
- [ ] Upload real validado com arquivo fixture aprovado.
- [ ] Provider de e-mail configurado ou falha segura aceita.
- [ ] Destinatarios admin revisados fora do repositorio.

## 7. Smoke final

- [ ] Home.
- [ ] Produtos.
- [ ] Produto.
- [ ] Carrinho.
- [ ] Checkout.
- [ ] Pedido.
- [ ] Pagamento teste ou live aprovado.
- [ ] Admin protegido.
- [ ] Outbox/notificacoes seguras.

## 8. Decisao final

- [ ] Avancar.
- [ ] Abortar.
- [ ] Registrar motivo e proxima acao.
