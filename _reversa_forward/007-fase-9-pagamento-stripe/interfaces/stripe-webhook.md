# Interface: Stripe Webhook

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`
> Tipo: HTTP webhook

## 1. Objetivo

Receber eventos Stripe, validar assinatura e processar `payment_intent.succeeded` como fonte final de confirmacao financeira do pedido.

## 2. Endpoint conceitual

| Metodo | Caminho atual esperado | Observacao |
|--------|------------------------|------------|
| `POST` | `/api/webhooks/stripe` | Ja existe como placeholder seguro em `src/app/api/webhooks/stripe/route.ts`. |

## 3. Headers relevantes

| Header | Obrigatorio | Uso |
|--------|-------------|-----|
| `Stripe-Signature` | sim | Validacao da assinatura com endpoint secret. |

## 4. Eventos aceitos

| Evento | Acao |
|--------|------|
| `payment_intent.succeeded` | Validar pedido, valor e moeda; marcar pagamento/pedido como pago; baixar estoque; consumir cupom; registrar evento. |
| Falhas/cancelamentos correlatos de PaymentIntent | Atualizar payment intent interno como falhou/cancelado, sem marcar pedido como pago e sem efeitos finais. |
| Outros eventos | Registrar/ignorar conforme politica segura, sem mutar pedido. |

## 5. Validacoes obrigatorias

1. Ler body bruto.
2. Validar assinatura Stripe.
3. Resolver `eventId` e aplicar idempotencia.
4. Resolver PaymentIntent Stripe pelo provider reference.
5. Resolver payment intent interno.
6. Resolver pedido relacionado.
7. Conferir valor e moeda contra snapshot do pedido.
8. Conferir que pedido ainda nao esta pago.
9. Conferir estoque suficiente.
10. Processar efeitos finais em transacao atomica.

## 6. Saidas HTTP conceituais

| Status | Uso |
|--------|-----|
| `200` | Evento recebido e processado ou duplicado tratado com seguranca. |
| `400` | Assinatura invalida ou payload impossivel de validar. |
| `500` | Falha interna transiente que pode justificar retry do provider. |

## 7. Idempotencia

- `eventId` e a chave principal de deduplicacao.
- Evento duplicado nao pode repetir baixa de estoque, incremento de cupom ou mudanca operacional.
- Pedido ja `pago` deve tornar o evento repetido um no-op controlado.

## 8. Auditoria

Registrar por evento:

- `eventId`;
- tipo;
- provider reference;
- order id, se resolvido;
- assinatura valida ou invalida, quando seguro;
- status de processamento;
- motivo de falha sanitizado;
- timestamp processado.

## 9. Fora de escopo

- Refund completo.
- Disputas.
- Bling/NF-e.
- Fiscal.
- Emails transacionais obrigatorios.
- Marcacao manual de pago pelo admin.

## 10. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Interface inicial gerada por `/reversa-plan` | reversa |
