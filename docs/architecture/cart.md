# Arquitetura de Carrinho

## Camadas

- `src/features/cart/domain.ts`: subtotal, quantidade e validade de produto compravel.
- `src/features/cart/server/cart-session.ts`: resolucao de ator por sessao server-side ou
  `guestCartToken`.
- `src/features/cart/server/cart-repository.ts`: Drizzle quando ha banco; fallback dev/test quando
  nao ha banco.
- `src/features/cart/server/cart-service.ts`: regras de negocio, estoque, ownership e merge.
- `src/features/cart/server/cart-actions.ts`: server actions seguras para UI.
- `src/features/cart/components/*`: formulario de adicionar e visualizacao do carrinho.

## Persistencia

Com `DATABASE_URL`, o repository usa `carts` e `cart_items`. Sem `DATABASE_URL`, dev/test usam
fallback em memoria de processo marcado como `dev_fallback`. Preview/producao sem banco retornam
`unavailable` para mutacoes reais.

Erro real com banco configurado nao deve cair em fallback silencioso.

## Seguranca

- O cookie do visitante contem apenas token opaco.
- Server actions nao aceitam `cartId`, `userId`, role ou owner como fonte confiavel.
- Carrinho autenticado e filtrado por `session.userId`.
- Carrinho anonimo e filtrado pelo token resolvido no servidor.
- Logs e mensagens nao devem expor cookie, token, sessao, SQL sensivel ou secrets.

## Merge

O merge e disparado apos login bem-sucedido. O service soma itens por produto, limita por estoque,
ignora indisponiveis e marca o carrinho anonimo como `converted` para idempotencia.
