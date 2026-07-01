# Interface: Stripe Webhook e Test Mode

> Feature: `020-fase-12-production-readiness`
> Tipo: HTTP/webhook
> Endpoint existente: `POST /api/webhooks/stripe`
> Status: contrato operacional; live mode fora da execução automática.

## 1. Objetivo

Preparar Stripe test mode e webhook para staging/produção controlada sem confirmar pagamento por browser, sem cartão real e sem chave real em código.

## 2. Eventos mínimos

| Evento | Uso |
|--------|-----|
| `payment_intent.succeeded` | Fonte de verdade para settlement e pedido pago. |
| `payment_intent.payment_failed` | Falha controlada sem marcar pedido pago. |
| `payment_intent.canceled` | Cancelamento controlado sem marcar pedido pago. |

## 3. Entradas

| Entrada | Sensível | Regra |
|---------|----------|-------|
| `STRIPE_SECRET_KEY` | Sim | Server-only; test mode na Fase 12. |
| `STRIPE_WEBHOOK_SECRET` | Sim | Server-only; nunca imprimir. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Parcial | Pública, mas ainda deve ser gerenciada por ambiente. |
| URL pública de webhook | Não | Só usar quando preview/staging aprovado existir. |

## 4. Resposta esperada

O endpoint deve responder de forma controlada para payloads válidos, inválidos, duplicados e eventos fora de escopo. O domínio existente já define que settlement válido atualiza pedido/pagamento/estoque/cupom em transação e que evento duplicado não repete settlement.

## 5. Erros esperados

| Condição | Resultado esperado |
|----------|--------------------|
| Assinatura inválida | Rejeitar evento. |
| Evento duplicado | Não repetir settlement. |
| Divergência de valor/moeda/metadata | Marcar falha/divergência conforme regra existente. |
| Evento de falha/cancelamento | Não marcar pedido como pago. |
| Provider ausente em preview/produção | Falha segura, sem mock implícito. |

## 6. Smoke test seguro

- Usar Stripe test mode.
- Usar test cards ou mock/dev conforme ambiente aprovado.
- Nunca usar cartão real.
- Nunca usar live secret key.
- Nunca imprimir `whsec_*` ou `sk_*`.
- Confirmar pedido pago somente por webhook/test event, não por retorno client-side.

## 7. Idempotência e timeout

Idempotência depende de `eventId` e registros internos. Smoke deve aceitar retry sem repetir settlement. Timeouts devem ser tratados como falha de validação, não como confirmação financeira.

## 8. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Contrato inicial gerado por `/reversa-plan` | reversa |
