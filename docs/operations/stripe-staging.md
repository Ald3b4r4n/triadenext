# Stripe Test/Webhook em Staging

Somente test mode ou sandbox é permitido nesta fase. Live mode é bloqueador.

## Checklist

- [ ] Configurar publishable key e secret key test fora do Git.
- [ ] Confirmar `STAGING_STRIPE_MODE` como test/sandbox.
- [ ] Configurar endpoint HTTPS de staging manualmente.
- [ ] Assinar e validar o webhook sem registrar signing secret.
- [ ] Habilitar `payment_intent.succeeded`.
- [ ] Habilitar `payment_intent.payment_failed`.
- [ ] Habilitar `payment_intent.canceled`.
- [ ] Confirmar idempotência por event ID.
- [ ] Usar somente dados/cartões oficiais de teste.
- [ ] Confirmar que nenhum valor ou payload bruto aparece nos relatórios.

Sem chaves test ou webhook, pagamento externo retorna `pending-config`.
