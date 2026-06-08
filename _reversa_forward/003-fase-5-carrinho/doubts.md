# Doubts: Fase 5 - Carrinho e sessao de compra

> Identificador: `003-fase-5-carrinho`
> Data: `2026-06-08`
> Status: todas as duvidas iniciais foram resolvidas por decisao humana.

## Duvidas resolvidas

| ID | Duvida | Decisao aplicada |
|---|---|---|
| D-01 | Estrategia do carrinho anonimo | Usar cookie seguro/opaco `guestCartToken` combinado com tabela `carts` por `sessionId`/`guestToken`; itens e precos ficam fora do cookie. |
| D-02 | Merge ao login | Somar quantidades por produto, limitar ao estoque disponivel, remover/bloquear indisponiveis com aviso e marcar carrinho anonimo como convertido/mesclado. |
| D-03 | Reserva de estoque | Carrinho nao reserva estoque nesta fase; apenas valida disponibilidade e estoque. |
| D-04 | Quantidade maxima por item | Minimo 1; maximo igual a `stockQuantity` no momento da validacao; sem limite comercial proprio nesta fase. |
| D-05 | Admin/manager usando carrinho | Podem usar como usuarios autenticados normais, sem privilegios especiais e sem burlar regras de compra. |
| D-06 | Fallback sem `DATABASE_URL` | Dev/test permitem fixture/interacoes controladas sem falsa persistencia; preview/producao sem banco falham seguro; erro real com banco nao vira fallback silencioso. |
| D-07 | Persistencia entre dispositivos | Carrinho autenticado persiste entre dispositivos quando ha banco real, vinculado a `userId`; sem banco real fica indisponivel. |

## Decisoes fora de escopo preservadas

- Nao implementar checkout nesta fase.
- Nao implementar pagamento, Stripe ou webhooks.
- Nao implementar frete, cupom ou pedido.
- Nao baixar ou reservar estoque definitivamente.
- Nao rodar migrations contra banco real sem validacao humana explicita.
- Nao expor `.env`, `DATABASE_URL`, cookies, tokens, senhas ou secrets.
- Nao alterar o Laravel legado.

## Duvidas remanescentes

Nenhuma.
