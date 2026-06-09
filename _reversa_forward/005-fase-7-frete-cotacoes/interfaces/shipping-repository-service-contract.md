# Interface Contract: Shipping Repository and Service

> Data: `2026-06-09`
> Tipo: server-only repository/service

## Repository esperado

| Operação | Entrada confiável | Saída |
|----------|-------------------|-------|
| `listActiveManualRules` | CEP normalizado, UF derivada quando disponível | Regras manuais ativas aplicáveis |
| `createManualQuote` | Carrinho resolvido, CEP, regras aplicáveis, cart hash | Opções de cotação persistidas ou fixture |
| `getQuoteForCart` | Carrinho resolvido, quote token | Cotação válida do mesmo carrinho |
| `selectQuoteForCart` | Carrinho resolvido, quote token | Seleção persistida |
| `clearSelectedShipping` | Carrinho resolvido | Seleção removida |
| `invalidateCartShipping` | Carrinho resolvido, motivo | Seleção/cotações invalidadas |

## Service esperado

| Operação | Regra |
|----------|-------|
| `quoteCartShipping` | Valida CEP, valida carrinho comprável, calcula opções manuais e validade de 30 min. |
| `selectCartShipping` | Garante ownership, expiração e cart hash antes de selecionar. |
| `removeCartShipping` | Remove seleção do carrinho atual. |
| `recalculateCartShippingTotal` | Recalcula `shippingAmountCents` e total parcial com frete. |
| `applyFreeShippingBenefit` | Zera apenas frete manual calculado e elegível. |

## Fallback

- `db = null` em dev/test: usar fixture/mock explícito.
- Preview/produção sem banco: retornar indisponível para mutações reais.
- Com `DATABASE_URL`: erro real não vira fixture silenciosa.

## Guardrails

- Repository não lê `.env` diretamente.
- Service não aceita preço/prazo do cliente.
- Sem chamadas a Correios, Jadlog ou Melhor Envio.
- Sem pedido/pagamento.
