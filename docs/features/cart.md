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
continuavam fora da Fase 5. O CTA de checkout permanece indisponivel.

## Fase 6 — Cupons no carrinho

O carrinho passa a aceitar um cupom aplicado por vez:

- código normalizado no servidor;
- cupom percentual ou valor fixo;
- desconto e total parcial calculados em centavos;
- subtotal mínimo validado quando existir;
- cupom inativo, futuro, expirado ou esgotado bloqueado;
- `usedCount` consultado, mas não consumido no carrinho;
- `free_shipping` passa a zerar frete manual elegivel a partir da Fase 7.

No legado, o cupom aplicado era mantido em sessão (`cart_coupon_code`). No Next, com banco real, a
referência do cupom fica persistida no carrinho. Essa divergência é intencional para preservar a
experiência do carrinho autenticado entre sessões/dispositivos.

Checkout, pagamento, provider externo real, pedido, reserva/baixa de estoque, cupom acumulativo,
limite por usuário e restrição por produto/categoria continuam fora de escopo.

## Fase 7 — Frete manual

O carrinho passa a cotar frete manual por CEP. A selecao fica vinculada ao carrinho atual, e payloads
de cliente com valor de frete, total, owner ou `cartId` nao sao fonte confiavel. A selecao e
invalidada quando itens mudam.

Novos campos de visao:

- `shippingAmountCents`;
- `shippingPostalCode`;
- `shippingQuoteId`;
- `partialTotalWithShippingCents`.
