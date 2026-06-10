# Regression Watch: 006-fase-8-checkout-pendente

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | legacy-impact.md, Carrinho | Carrinho que gerou pedido pendente permanece `converted` e nao aceita novas mutacoes. | presença | Teste ou reextracao indicar que carrinho convertido pode receber item, cupom ou frete novo. |

## Histórico de re-extrações

Vazio nesta rodada. Preencher em futura re-extração `/reversa`.

## Arquivadas

Vazio.

## Observações

A Fase 8 adiciona checkout pendente sem remover regras verdes do legado. PaymentIntent real, Stripe, coleta de cartao, baixa/reserva de estoque e consumo de `usedCount` continuam fora do watch principal porque permanecem ausentes por desenho.
