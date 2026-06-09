# Risk Plan — Fase 6 Cupons e Descontos

> Data: `2026-06-08`

## Riscos principais

| ID | Risco | Impacto | Probabilidade | Mitigação |
|----|-------|---------|---------------|-----------|
| R-01 | Desconto maior que subtotal | Alto | Médio | Domínio limita `discountCents <= subtotalCents` e testa percent/fixed. |
| R-02 | Consumo indevido de `usedCount` no carrinho | Alto | Médio | Contrato proíbe incremento em apply/remove; teste unitário dedicado. |
| R-03 | Cupom de frete grátis prometer frete real | Alto | Médio | Tipo preparado retorna mensagem controlada; nenhum cálculo de frete. |
| R-04 | Falsa persistência no fallback | Alto | Médio | Fixture dev/test marcada como `dev_fallback`; preview/prod falha segura. |
| R-05 | Acesso a carrinho alheio | Alto | Baixo | Resolver owner server-side por sessão/cookie; não aceitar `cartId` público. |
| R-06 | Admin de cupons sem proteção | Alto | Baixo | Usar `requireAdminLike` em layout/actions. |
| R-07 | Scope creep para checkout/pedido | Alto | Médio | Teste negativo contra Stripe, pedido, frete real, reserva e baixa de estoque. |
| R-08 | Concorrência ao aplicar cupom e alterar carrinho | Médio | Médio | Revalidar cupom ao recalcular carrinho e antes de persistir. |

## Critérios de rollback

- Remover/neutralizar UI e actions de cupom mantendo carrinho sem desconto.
- Manter schema/migration local sem aplicação real caso o delta de dados esteja incorreto.
- Preservar carrinho Fase 5 como baseline: subtotal sem desconto e checkout desabilitado.

## Watchlist de regressão

- `guestCartToken` continua opaco e sem itens/preços/cupom.
- Admin/manager continuam sem bypass no carrinho.
- Sem `DATABASE_URL`, não há promessa de persistência real.
- Produto indisponível continua bloqueado no carrinho.
- Checkout, pagamento, frete real e pedido seguem fora de escopo.
