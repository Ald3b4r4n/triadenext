# Risk Plan: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`

## Riscos principais

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Pedido duplicado por reenvio ou duplo clique | Alto | Medio | Idempotencia por cart convertido/fingerprint e bloqueio atomico do carrinho de origem. |
| Snapshot financeiro divergente do carrinho no momento da gravacao | Alto | Medio | Validacao final server-side imediatamente antes da persistencia. |
| Fallback dev/test ser confundido com persistencia real | Alto | Medio | Mensagens explicitas de fixture/dev e falha segura em preview/producao sem `DATABASE_URL`. |
| Cliente acessar pedido alheio | Alto | Baixo | Filtragem por `userId` no servidor e policy de ownership. |
| Admin realizar acao financeira indevida | Alto | Baixo | Read-only no admin minimo desta fase. |
| Stripe entrar no fluxo por engano | Alto | Baixo | Manter pagamento real fora do escopo e documentado como fase futura. |
| Baixa/reserva de estoque acontecer nesta fase | Alto | Baixo | Nenhuma action de estoque nesta fase; apenas validacao. |
| Drift entre docs e implementacao | Medio | Medio | Atualizar docs de cart, coupons, shipping, database e payments durante a entrega. |

## Critérios de rollback

- qualquer evidencia de pedido anonimo;
- qualquer chamada a Stripe ou PaymentIntent real;
- qualquer baixa/reserva definitiva de estoque;
- qualquer consumo de `usedCount` na criacao do pedido;
- qualquer pedido criado sem snapshots completos;
- qualquer pedido criado com subtotal, desconto, frete ou total vindos do client-side;
- qualquer quebra de login obrigatorio para checkout;
- qualquer quebra do bloqueio do carrinho convertido;
- qualquer erro de fallback mascarado em preview/producao.

## Respostas de contencao

1. Reverter apenas a feature de checkout/order e manter cart, coupon e shipping intactos.
2. Restaurar o checkout placeholder se o fluxo ficar inconsistente.
3. Manter os documentos Reversa como fonte de verdade enquanto a implementacao e corrigida.
4. Nao aplicar migracao real ate o pacote fechar sem regressao.

## Monitoramento manual esperado

- status do pedido ao criar;
- expiracao em 60 minutos;
- ownership por `userId`;
- cart convertido/bloqueado;
- customer e admin listando apenas o que devem;
- ausencia total de Stripe, cartao e PaymentIntent real.

## Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Risk plan inicial gerado por `/reversa-plan` | reversa |
