# Onboarding: Fase 9 - Pagamento Stripe para Pedido Pendente

> Identificador: `007-fase-9-pagamento-stripe`
> Data: `2026-06-10`

## 1. Objetivo do teste humano

Validar, quando a implementacao existir, que um cliente autenticado consegue pagar um pedido pendente via PaymentIntent/Payment Element, e que o sistema so marca pedido como pago por webhook Stripe validado.

## 2. Pre-requisitos esperados

- Projeto Next.js em `D:\Projetos\triade-essenza-next`.
- Branch de trabalho com a implementacao da Fase 9.
- Pedido pendente criado pela Fase 8 em `aguardando_pagamento`.
- Ambiente dev/test usando adapter/mock Stripe explicito, sem chaves reais obrigatorias.
- Nenhuma migration aplicada em banco real sem etapa operacional separada.

## 3. Fluxo feliz em dev/test

1. Entrar como cliente autenticado.
2. Criar carrinho valido com produto em estoque.
3. Aplicar cupom valido, se o caso de teste cobrir cupom.
4. Selecionar frete manual valido.
5. Criar pedido pendente pelo checkout da Fase 8.
6. Abrir a tela do pedido ou fluxo de pagamento.
7. Iniciar pagamento.
8. Confirmar que o servidor criou PaymentIntent com valor do snapshot.
9. Concluir o pagamento via Payment Element/mock.
10. Simular ou receber webhook `payment_intent.succeeded`.
11. Confirmar que o pedido virou `pago`.
12. Confirmar que estoque foi baixado uma vez.
13. Confirmar que `usedCount` foi incrementado uma vez quando havia cupom.

## 4. Casos negativos obrigatorios

- Pedido de outro usuario nao inicia pagamento.
- Pedido expirado nao inicia pagamento.
- Pedido ja pago nao cria novo PaymentIntent.
- Retorno client-side nao muda pedido para `pago`.
- Webhook sem assinatura valida nao altera pedido.
- Webhook duplicado nao baixa estoque nem consome cupom novamente.
- Webhook com valor ou moeda divergente nao conclui pagamento.
- Estoque insuficiente no webhook gera erro controlado.
- Preview/producao sem Stripe configurado falha de forma segura.
- Admin nao consegue marcar pedido como pago manualmente.

## 5. Comandos de validacao esperados

Quando a implementacao existir:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## 6. O que nao testar como sucesso nesta fase

- Stripe Checkout Session como fluxo principal.
- Coleta de cartao em formulario proprio.
- Marcacao manual de pago pelo admin.
- Bling/NF-e.
- Fiscal.
- Emails transacionais obrigatorios.
- Aplicacao de migration em banco real.
- Deploy.

## 7. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-10 | Onboarding inicial gerado por `/reversa-plan` | reversa |
