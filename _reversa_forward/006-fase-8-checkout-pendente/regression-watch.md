# Regression Watch: 006-fase-8-checkout-pendente

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|
| W001 | legacy-impact.md, Carrinho | Carrinho que gerou pedido pendente permanece `converted` e nao aceita novas mutacoes. | presença | Teste ou reextracao indicar que carrinho convertido pode receber item, cupom ou frete novo. |

## Histórico de re-extrações

| Data | Re-extração | Veredito | Evidência |
|---|---|---|---|
| 2026-06-11 | reextracao_pos_fase_10 | verde | Carrinho `converted` continua terminal para item, cupom e frete; notificacoes nao alteram o carrinho. |
| 2026-06-10 | reextracao_pos_fase_8 | 🟢 | `_reversa_sdd/state-machines.md` e `_reversa_sdd/domain.md` registram carrinho `converted` como terminal/bloqueado e nova compra futura resolvendo carrinho ativo. |

## Arquivadas

Vazio.

## Observações

A Fase 8 adiciona checkout pendente sem remover regras verdes do legado. PaymentIntent real, Stripe, coleta de cartao, baixa/reserva de estoque e consumo de `usedCount` continuam fora do watch principal porque permanecem ausentes por desenho.
