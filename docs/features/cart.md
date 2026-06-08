# Carrinho — Fase 5

## Escopo

- Carrinho de visitante por `guestCartToken` opaco.
- Carrinho autenticado vinculado a `session.userId`.
- Itens com snapshot de nome, snapshot de preco em centavos e quantidade.
- Adicionar, atualizar quantidade, remover item e limpar carrinho.
- Subtotal em centavos.
- Merge automatico no login.
- Fallback dev/test sem banco, sempre identificado como nao persistente.

## Regras de compra

Produto compravel exige:

- `status = published`;
- `publishedAt <= now`;
- `stockQuantity > 0`.

Produto `draft`, `inactive`, futuro, sem `publishedAt` ou sem estoque nao entra no carrinho. A
quantidade minima e 1 e a maxima e `stockQuantity` no momento da validacao. Admin e manager usam o
carrinho como usuarios autenticados normais, sem bypass de estoque ou disponibilidade.

## Carrinho anonimo

O cookie `guestCartToken` armazena somente um identificador opaco. Ele nao armazena itens, precos,
subtotal, userId, role ou dados sensiveis. Quando `DATABASE_URL` existe, o carrinho anonimo e
associado a `carts.guest_token`/`carts.session_id`. Sem banco em dev/test, o fallback permite
interacoes controladas e mostra aviso de ausencia de persistencia real.

## Carrinho autenticado

O carrinho autenticado e resolvido no servidor por `session.userId`. O cliente nao envia owner,
role ou userId como fonte confiavel. Com banco real, o carrinho persiste entre sessoes/dispositivos
do mesmo usuario. Sem banco real, essa persistencia nao existe.

## Merge no login

Ao fazer login com `guestCartToken`, o carrinho anonimo e mesclado ao carrinho autenticado:

- itens iguais somam quantidade;
- a soma e limitada ao estoque disponivel;
- itens indisponiveis sao ignorados com aviso controlado;
- o carrinho anonimo e marcado como `converted`;
- retentativas nao devem duplicar itens.

## Fora de escopo

Checkout, pagamento, Stripe, frete, cupom, criacao de pedido, reserva de estoque e baixa de estoque
continuam fora da Fase 5. O CTA de checkout permanece indisponivel.
