# Onboarding: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`

## Objetivo para quem for implementar/testar

Validar que um pedido pago pela Fase 9 gera registros/notificacoes de e-mail para cliente e admin/gestores, sem credenciais reais obrigatorias, sem duplicidade em webhook repetido e sem afetar pagamento/estoque/cupom quando o envio falha.

## Preparacao local esperada

1. Trabalhar no projeto `D:\Projetos\triade-essenza-next`.
2. Confirmar que nao esta no legado Laravel.
3. Nao usar `.env` real nem credenciais reais.
4. Usar mock de e-mail em dev/test.
5. Se `ORDER_NOTIFICATION_RECIPIENTS=` existir em `.env.example`, manter sem valor real no repositorio.
6. Nao rodar migration em banco real.

## Fluxo feliz esperado

1. Criar pedido pendente autenticado usando fluxo da Fase 8.
2. Iniciar PaymentIntent/mock usando Fase 9.
3. Simular/receber webhook `payment_intent.succeeded`.
4. Confirmar que pedido fica `pago`.
5. Confirmar que estoque e `usedCount` seguem liquidados pela Fase 9.
6. Confirmar que outbox tem registro para cliente.
7. Confirmar que outbox tem registro para admin/gestores ou estado controlado se destinatario interno ausente.
8. Confirmar que adapter mock registra envio simulado em dev/test.

## Casos negativos essenciais

- Reprocessar o mesmo webhook nao deve criar/envia notificacao duplicada.
- Falha do adapter nao deve reverter pedido `pago`.
- Falha do adapter nao deve reverter estoque.
- Falha do adapter nao deve reverter `usedCount`.
- Sem destinatario admin configurado, registrar `skipped`/aviso controlado.
- Sem credenciais em preview/producao, nao fingir envio real.
- Templates nao devem conter dados de cartao, secrets, tokens, payload Stripe bruto ou informacoes fiscais sensiveis.

## Admin/customer

- Customer continua usando area de pedidos para ver status.
- Nao criar historico completo de notificacoes para customer.
- Admin pode ver status basico se implementado.
- Admin nao reenviara notificacao nesta fase.

## Validacoes finais futuras

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

## Observacoes

WhatsApp, SMS, Bling, NF-e, documentos fiscais, emissao fiscal, retry automatico completo e worker/fila real persistente ficam fora da Fase 10.
