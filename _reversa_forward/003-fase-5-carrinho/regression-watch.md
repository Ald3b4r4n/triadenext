# Regression Watch: Fase 5 - Carrinho

> Feature: `003-fase-5-carrinho`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| - | - | Nenhuma regra verde herdada foi modificada ou removida nesta rodada. | - | - |

## Observações

- Verificar em re-extrações futuras que carrinho continua sem checkout, pagamento, frete, cupom,
  pedido, reserva e baixa de estoque.
- Verificar que `guestCartToken` segue opaco e sem itens/precos no cookie.
- Verificar que fallback sem banco continua explicito e nao promete persistencia real.
- Verificar que admin/manager continuam sem bypass de estoque/disponibilidade no carrinho.

## Histórico de re-extrações

| Data | Re-extração | Resultado |
|---|---|---|
| 2026-06-11 | Re-extração pós-Fase 10 | verde: carrinho convertido segue terminal; guest token/ownership e calculos server-side permanecem; notificacoes nao mutam carrinho. |
| 2026-06-08 | Re-extração pós-Fase 5 | 🟢 Sem regressão semântica detectada: carrinho segue sem checkout/pagamento/frete/cupom/pedido/reserva/baixa de estoque; `guestCartToken` segue opaco; fallback sem banco segue explícito; admin/manager seguem sem bypass documentado. |

## Arquivadas

Vazio.
