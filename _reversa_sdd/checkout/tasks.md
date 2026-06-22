# Checkout, Tasks

> Checklist executavel da unit `checkout`.
> Escopo: revisar carrinho autenticado, validar elegibilidade, criar pedido pendente com snapshots e handoff seguro para pagamento posterior.

## 1. Rota e Estados de Entrada

- [ ] TASK-CHECKOUT-001 Confirmar que `/checkout` renderiza a etapa autenticada do storefront.
- [ ] TASK-CHECKOUT-002 Ler `searchParams.pedido` antes de iniciar novo review.
- [ ] TASK-CHECKOUT-003 Buscar pedido pendente do customer quando `pedido` estiver presente.
- [ ] TASK-CHECKOUT-004 Exibir resumo de pedido criado quando pedido pertence ao customer.
- [ ] TASK-CHECKOUT-005 Chamar `reviewPendingCheckoutAction` quando nao houver pedido valido.
- [ ] TASK-CHECKOUT-006 Exibir estado de login/cadastro para usuario nao autenticado.
- [ ] TASK-CHECKOUT-007 Exibir estado "Revise o carrinho" para carrinho invalido.
- [ ] TASK-CHECKOUT-008 Exibir revisao/formulario apenas para carrinho valido.

## 2. Autenticacao e Ownership

- [ ] TASK-CHECKOUT-009 Exigir sessao autenticada em `reviewPendingCheckout`.
- [ ] TASK-CHECKOUT-010 Exigir sessao autenticada em `createPendingCheckoutOrder`.
- [ ] TASK-CHECKOUT-011 Usar `userId` e `email` da sessao como fonte de verdade.
- [ ] TASK-CHECKOUT-012 Bloquear checkout anonimo.
- [ ] TASK-CHECKOUT-013 Validar que cart owner e do tipo `user`.
- [ ] TASK-CHECKOUT-014 Validar que `cart.owner.userId === session.userId`.
- [ ] TASK-CHECKOUT-015 Retornar `forbidden` seguro para owner divergente.

## 3. Review Server-Side do Carrinho

- [ ] TASK-CHECKOUT-016 Obter carrinho ativo do usuario autenticado.
- [ ] TASK-CHECKOUT-017 Recalcular carrinho via `recalculateCartView`.
- [ ] TASK-CHECKOUT-018 Bloquear carrinho sem id.
- [ ] TASK-CHECKOUT-019 Bloquear carrinho vazio.
- [ ] TASK-CHECKOUT-020 Bloquear carrinho com status diferente de `active`.
- [ ] TASK-CHECKOUT-021 Retornar mensagem segura para carrinho indisponivel.

## 4. Produtos e Estoque

- [ ] TASK-CHECKOUT-022 Buscar produto atual para cada item.
- [ ] TASK-CHECKOUT-023 Validar produto com `validatePurchasableProduct`.
- [ ] TASK-CHECKOUT-024 Bloquear produto inexistente.
- [ ] TASK-CHECKOUT-025 Bloquear produto draft/inativo/futuro.
- [ ] TASK-CHECKOUT-026 Bloquear produto sem estoque.
- [ ] TASK-CHECKOUT-027 Validar quantidade com `validateQuantityForStock`.
- [ ] TASK-CHECKOUT-028 Bloquear quantidade maior que estoque atual.
- [ ] TASK-CHECKOUT-029 Nao reservar nem decrementar estoque nesta etapa.

## 5. Cupom

- [ ] TASK-CHECKOUT-030 Buscar cupom aplicado quando `appliedCouponId` existir.
- [ ] TASK-CHECKOUT-031 Revalidar cupom contra subtotal atual.
- [ ] TASK-CHECKOUT-032 Bloquear cupom expirado, esgotado ou inelegivel.
- [ ] TASK-CHECKOUT-033 Criar coupon snapshot com desconto aplicado.
- [ ] TASK-CHECKOUT-034 Registrar `usedCountAtCheckout` no snapshot.
- [ ] TASK-CHECKOUT-035 Nao incrementar `usedCount` ao criar pedido pendente.

## 6. Frete

- [ ] TASK-CHECKOUT-036 Exigir `shippingQuote`.
- [ ] TASK-CHECKOUT-037 Exigir `shippingQuoteId`.
- [ ] TASK-CHECKOUT-038 Exigir `selectedOptionId`.
- [ ] TASK-CHECKOUT-039 Bloquear quote expirada com `isQuoteExpired`.
- [ ] TASK-CHECKOUT-040 Bloquear quote cujo `cartId` nao pertence ao carrinho atual.
- [ ] TASK-CHECKOUT-041 Criar shipping snapshot com option selecionada.
- [ ] TASK-CHECKOUT-042 Preservar valor original do frete no snapshot.
- [ ] TASK-CHECKOUT-043 Preservar valor efetivo do frete no snapshot.
- [ ] TASK-CHECKOUT-044 Registrar `freeShippingApplied` quando cupom zerar frete elegivel.

## 7. Formulario de Checkout

- [ ] TASK-CHECKOUT-045 Parsear `FormData` com `checkoutFormSchema`.
- [ ] TASK-CHECKOUT-046 Validar `fullName` obrigatorio.
- [ ] TASK-CHECKOUT-047 Validar `phone` obrigatorio.
- [ ] TASK-CHECKOUT-048 Validar `postalCode` obrigatorio.
- [ ] TASK-CHECKOUT-049 Validar `state` com UF de 2 caracteres.
- [ ] TASK-CHECKOUT-050 Validar `city`, `district`, `street` e `number`.
- [ ] TASK-CHECKOUT-051 Aceitar `recipient` opcional.
- [ ] TASK-CHECKOUT-052 Aceitar `complement` opcional.
- [ ] TASK-CHECKOUT-053 Retornar primeira mensagem amigavel de schema.

## 8. Anti-Tampering

- [ ] TASK-CHECKOUT-054 Ignorar `subtotalCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-055 Ignorar `discountCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-056 Ignorar `shippingAmountCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-057 Ignorar `grandTotalCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-058 Ignorar `userId`, `role` e `cartId` enviados pelo cliente.
- [ ] TASK-CHECKOUT-059 Derivar todos os totais do carrinho recalculado.
- [ ] TASK-CHECKOUT-060 Derivar customer e ownership da sessao.

## 9. Endereco e CEP

- [ ] TASK-CHECKOUT-061 Criar address snapshot via `buildAddressSnapshot`.
- [ ] TASK-CHECKOUT-062 Normalizar CEP do endereco.
- [ ] TASK-CHECKOUT-063 Normalizar CEP da cotacao de frete.
- [ ] TASK-CHECKOUT-064 Bloquear CEP divergente entre endereco e frete.
- [ ] TASK-CHECKOUT-065 Normalizar UF em uppercase.
- [ ] TASK-CHECKOUT-066 Definir pais `BR`.
- [ ] TASK-CHECKOUT-067 Usar `fullName` como destinatario quando `recipient` estiver vazio.

## 10. Snapshots e Draft

- [ ] TASK-CHECKOUT-068 Criar customer snapshot com e-mail da sessao.
- [ ] TASK-CHECKOUT-069 Criar address snapshot.
- [ ] TASK-CHECKOUT-070 Criar coupon snapshot.
- [ ] TASK-CHECKOUT-071 Criar shipping snapshot.
- [ ] TASK-CHECKOUT-072 Criar item snapshots com nome, sku, slug, imagem, preco e quantidade.
- [ ] TASK-CHECKOUT-073 Criar pending order draft com `userId` da sessao.
- [ ] TASK-CHECKOUT-074 Definir moeda `BRL`.
- [ ] TASK-CHECKOUT-075 Definir status inicial `aguardando_pagamento`.
- [ ] TASK-CHECKOUT-076 Definir `expiresAt` em 60 minutos apos `createdAt`.

## 11. Persistencia e Conversao

- [ ] TASK-CHECKOUT-077 Persistir pedido via `orderRepository.createPendingOrder`.
- [ ] TASK-CHECKOUT-078 Tratar resultado `unavailable` com mensagem segura.
- [ ] TASK-CHECKOUT-079 Tratar resultado `dev_fallback` como `fallback` explicito.
- [ ] TASK-CHECKOUT-080 Marcar carrinho como convertido apos pedido criado.
- [ ] TASK-CHECKOUT-081 Nao converter carrinho se pedido nao for criado.
- [ ] TASK-CHECKOUT-082 Nao iniciar pagamento automaticamente.

## 12. Revalidacao e Redirect

- [ ] TASK-CHECKOUT-083 Revalidar `/carrinho`.
- [ ] TASK-CHECKOUT-084 Revalidar `/checkout`.
- [ ] TASK-CHECKOUT-085 Revalidar `/pedidos`.
- [ ] TASK-CHECKOUT-086 Revalidar `/admin/pedidos`.
- [ ] TASK-CHECKOUT-087 Retornar `orderId` em action state de sucesso.
- [ ] TASK-CHECKOUT-088 Redirecionar para `/checkout?pedido=<id>` apos sucesso.

## 13. UI

- [ ] TASK-CHECKOUT-089 Mostrar links `/login?returnTo=/checkout` e `/cadastro?returnTo=/checkout`.
- [ ] TASK-CHECKOUT-090 Mostrar itens do carrinho na revisao.
- [ ] TASK-CHECKOUT-091 Mostrar formulario de cliente e entrega.
- [ ] TASK-CHECKOUT-092 Mostrar subtotal, desconto, frete e total.
- [ ] TASK-CHECKOUT-093 Mostrar cupom e frete selecionado no resumo.
- [ ] TASK-CHECKOUT-094 Informar que dados de cartao nao sao coletados no formulario.
- [ ] TASK-CHECKOUT-095 Mostrar orientacao para pagamento posterior quando pedido for criado.

## 14. Testes Unitarios

- [ ] TASK-CHECKOUT-096 Testar bloqueio sem sessao.
- [ ] TASK-CHECKOUT-097 Testar bloqueio de carrinho vazio.
- [ ] TASK-CHECKOUT-098 Testar bloqueio de carrinho inativo.
- [ ] TASK-CHECKOUT-099 Testar criacao de pedido pendente com snapshots.
- [ ] TASK-CHECKOUT-100 Testar expiracao de 60 minutos.
- [ ] TASK-CHECKOUT-101 Testar payload malicioso ignorado.
- [ ] TASK-CHECKOUT-102 Testar cupom esgotado bloqueado.
- [ ] TASK-CHECKOUT-103 Testar que cupom nao e consumido.
- [ ] TASK-CHECKOUT-104 Testar que estoque nao e decrementado.
- [ ] TASK-CHECKOUT-105 Testar CEP divergente bloqueado.
- [ ] TASK-CHECKOUT-106 Testar quote expirada bloqueada.
- [ ] TASK-CHECKOUT-107 Testar quote de outro carrinho bloqueada.

## 15. E2E

- [ ] TASK-CHECKOUT-108 Abrir `/checkout` sem login e confirmar bloqueio.
- [ ] TASK-CHECKOUT-109 Confirmar links de login/cadastro com `returnTo`.
- [ ] TASK-CHECKOUT-110 Abrir checkout autenticado com carrinho valido.
- [ ] TASK-CHECKOUT-111 Confirmar formulario de entrega.
- [ ] TASK-CHECKOUT-112 Criar pedido pendente com dados validos.
- [ ] TASK-CHECKOUT-113 Confirmar redirect para `/checkout?pedido=<id>`.
- [ ] TASK-CHECKOUT-114 Confirmar resumo de pedido criado.
- [ ] TASK-CHECKOUT-115 Confirmar que nao ha coleta de cartao no formulario.

## 16. Guardrails

- [ ] TASK-CHECKOUT-116 Nao coletar dados de cartao.
- [ ] TASK-CHECKOUT-117 Nao iniciar pagamento automaticamente.
- [ ] TASK-CHECKOUT-118 Nao baixar estoque na criacao do pedido pendente.
- [ ] TASK-CHECKOUT-119 Nao consumir cupom na criacao do pedido pendente.
- [ ] TASK-CHECKOUT-120 Nao aceitar totais enviados pelo cliente.
- [ ] TASK-CHECKOUT-121 Nao conectar banco de producao.
- [ ] TASK-CHECKOUT-122 Nao rodar migrations.
- [ ] TASK-CHECKOUT-123 Nao copiar `.env`.
- [ ] TASK-CHECKOUT-124 Nao expor secrets.
- [ ] TASK-CHECKOUT-125 Nao alterar Laravel legado.

## 17. Validacoes

- [ ] TASK-CHECKOUT-126 Rodar `pnpm lint` quando houver implementacao funcional.
- [ ] TASK-CHECKOUT-127 Rodar `pnpm typecheck` quando houver implementacao funcional.
- [ ] TASK-CHECKOUT-128 Rodar `pnpm test`.
- [ ] TASK-CHECKOUT-129 Rodar `pnpm build`.
- [ ] TASK-CHECKOUT-130 Rodar `pnpm test:e2e` cobrindo checkout.

## 18. Definition of Done

- [ ] TASK-CHECKOUT-131 Visitante e bloqueado com caminho claro para login/cadastro.
- [ ] TASK-CHECKOUT-132 Customer com carrinho valido ve revisao e formulario.
- [ ] TASK-CHECKOUT-133 Carrinho invalido bloqueia checkout com mensagem segura.
- [ ] TASK-CHECKOUT-134 Produtos, estoque, cupom e frete sao revalidados server-side.
- [ ] TASK-CHECKOUT-135 CEP do endereco e consistente com frete selecionado.
- [ ] TASK-CHECKOUT-136 Pedido pendente e criado com snapshots server-side.
- [ ] TASK-CHECKOUT-137 Pedido inicia em `aguardando_pagamento` e expira em 60 minutos.
- [ ] TASK-CHECKOUT-138 Carrinho e convertido apos pedido.
- [ ] TASK-CHECKOUT-139 Nenhum dado de cartao e coletado no formulario.
