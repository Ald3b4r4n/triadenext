# Checkout / Snapshots e Validacao, Tasks

> Checklist executavel da subunidade `checkout/snapshots-validacao`.
> Escopo: schema allowlist, revalidacoes server-side, snapshots do pedido pendente e protecao antifraude.

## 1. Schema Allowlist

- [ ] TASK-CHECKOUT-SNAP-001 Validar formulario com `checkoutFormSchema`.
- [ ] TASK-CHECKOUT-SNAP-002 Aceitar apenas campos de cliente/endereco.
- [ ] TASK-CHECKOUT-SNAP-003 Ignorar `subtotalCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-SNAP-004 Ignorar `discountCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-SNAP-005 Ignorar `shippingAmountCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-SNAP-006 Ignorar `grandTotalCents` enviado pelo cliente.
- [ ] TASK-CHECKOUT-SNAP-007 Ignorar `userId`, `role` e `cartId` enviados pelo cliente.
- [ ] TASK-CHECKOUT-SNAP-008 Retornar erro amigavel para schema invalido.

## 2. Sessao e Ownership

- [ ] TASK-CHECKOUT-SNAP-009 Exigir sessao autenticada.
- [ ] TASK-CHECKOUT-SNAP-010 Usar `session.userId` como dono do pedido.
- [ ] TASK-CHECKOUT-SNAP-011 Usar `session.email` no customer snapshot.
- [ ] TASK-CHECKOUT-SNAP-012 Rejeitar carrinho cujo owner nao seja `user`.
- [ ] TASK-CHECKOUT-SNAP-013 Rejeitar carrinho cujo owner diverge de `session.userId`.
- [ ] TASK-CHECKOUT-SNAP-014 Nao criar snapshot em caso de owner divergente.

## 3. Recalculo do Carrinho

- [ ] TASK-CHECKOUT-SNAP-015 Carregar carrinho ativo do customer.
- [ ] TASK-CHECKOUT-SNAP-016 Recalcular carrinho via `recalculateCartView`.
- [ ] TASK-CHECKOUT-SNAP-017 Bloquear carrinho sem id.
- [ ] TASK-CHECKOUT-SNAP-018 Bloquear carrinho vazio.
- [ ] TASK-CHECKOUT-SNAP-019 Bloquear carrinho com status diferente de `active`.
- [ ] TASK-CHECKOUT-SNAP-020 Usar totals do carrinho recalculado no pedido.

## 4. Validacao de Produto e Estoque

- [ ] TASK-CHECKOUT-SNAP-021 Buscar produto atual para cada item.
- [ ] TASK-CHECKOUT-SNAP-022 Validar produto com `validatePurchasableProduct`.
- [ ] TASK-CHECKOUT-SNAP-023 Bloquear produto inexistente.
- [ ] TASK-CHECKOUT-SNAP-024 Bloquear produto indisponivel.
- [ ] TASK-CHECKOUT-SNAP-025 Validar quantidade contra estoque atual.
- [ ] TASK-CHECKOUT-SNAP-026 Bloquear quantidade acima do estoque.
- [ ] TASK-CHECKOUT-SNAP-027 Nao reservar estoque nesta etapa.
- [ ] TASK-CHECKOUT-SNAP-028 Nao decrementar estoque nesta etapa.

## 5. Validacao de Cupom

- [ ] TASK-CHECKOUT-SNAP-029 Buscar cupom quando `appliedCouponId` existir.
- [ ] TASK-CHECKOUT-SNAP-030 Validar cupom contra subtotal atual.
- [ ] TASK-CHECKOUT-SNAP-031 Bloquear cupom invalido.
- [ ] TASK-CHECKOUT-SNAP-032 Bloquear cupom expirado ou esgotado.
- [ ] TASK-CHECKOUT-SNAP-033 Nao incrementar `usedCount` nesta etapa.
- [ ] TASK-CHECKOUT-SNAP-034 Preservar desconto aplicado no snapshot.

## 6. Validacao de Frete

- [ ] TASK-CHECKOUT-SNAP-035 Exigir `shippingQuote`.
- [ ] TASK-CHECKOUT-SNAP-036 Exigir `shippingQuoteId`.
- [ ] TASK-CHECKOUT-SNAP-037 Exigir `selectedOptionId`.
- [ ] TASK-CHECKOUT-SNAP-038 Bloquear quote expirada.
- [ ] TASK-CHECKOUT-SNAP-039 Bloquear quote de outro carrinho.
- [ ] TASK-CHECKOUT-SNAP-040 Bloquear option selecionada inexistente.
- [ ] TASK-CHECKOUT-SNAP-041 Nao criar pedido sem shipping snapshot.

## 7. CEP Endereco vs Frete

- [ ] TASK-CHECKOUT-SNAP-042 Normalizar CEP do endereco.
- [ ] TASK-CHECKOUT-SNAP-043 Normalizar CEP da quote.
- [ ] TASK-CHECKOUT-SNAP-044 Comparar CEPs antes de criar draft.
- [ ] TASK-CHECKOUT-SNAP-045 Bloquear CEP divergente.
- [ ] TASK-CHECKOUT-SNAP-046 Retornar mensagem "CEP do endereco precisa ser o mesmo da cotacao de frete selecionada.".

## 8. Customer Snapshot

- [ ] TASK-CHECKOUT-SNAP-047 Criar customer snapshot com `buildCustomerSnapshot`.
- [ ] TASK-CHECKOUT-SNAP-048 Trim em `fullName`.
- [ ] TASK-CHECKOUT-SNAP-049 Lowercase em `email` da sessao.
- [ ] TASK-CHECKOUT-SNAP-050 Trim em `phone`.
- [ ] TASK-CHECKOUT-SNAP-051 Garantir que e-mail nao vem do formulario.

## 9. Address Snapshot

- [ ] TASK-CHECKOUT-SNAP-052 Criar address snapshot com `buildAddressSnapshot`.
- [ ] TASK-CHECKOUT-SNAP-053 Usar `recipient` ou fallback para `fullName`.
- [ ] TASK-CHECKOUT-SNAP-054 Normalizar `postalCode` para digitos.
- [ ] TASK-CHECKOUT-SNAP-055 Normalizar `state` para uppercase.
- [ ] TASK-CHECKOUT-SNAP-056 Trim em cidade, bairro, rua e numero.
- [ ] TASK-CHECKOUT-SNAP-057 Converter complemento vazio para null.
- [ ] TASK-CHECKOUT-SNAP-058 Definir `country` como `BR`.

## 10. Coupon Snapshot

- [ ] TASK-CHECKOUT-SNAP-059 Retornar null quando nao houver cupom.
- [ ] TASK-CHECKOUT-SNAP-060 Copiar id do cupom.
- [ ] TASK-CHECKOUT-SNAP-061 Copiar codigo do cupom.
- [ ] TASK-CHECKOUT-SNAP-062 Copiar tipo e valor do cupom.
- [ ] TASK-CHECKOUT-SNAP-063 Registrar `discountCents` aplicado.
- [ ] TASK-CHECKOUT-SNAP-064 Registrar `usedCountAtCheckout`.
- [ ] TASK-CHECKOUT-SNAP-065 Nao alterar cupom real ao montar snapshot.

## 11. Shipping Snapshot

- [ ] TASK-CHECKOUT-SNAP-066 Criar shipping snapshot com `buildShippingSnapshot`.
- [ ] TASK-CHECKOUT-SNAP-067 Copiar `quoteId`.
- [ ] TASK-CHECKOUT-SNAP-068 Copiar `optionId`.
- [ ] TASK-CHECKOUT-SNAP-069 Copiar provider e source.
- [ ] TASK-CHECKOUT-SNAP-070 Copiar label e estimatedDays.
- [ ] TASK-CHECKOUT-SNAP-071 Preservar `originalAmountCents`.
- [ ] TASK-CHECKOUT-SNAP-072 Preservar `effectiveAmountCents`.
- [ ] TASK-CHECKOUT-SNAP-073 Calcular `freeShippingApplied`.
- [ ] TASK-CHECKOUT-SNAP-074 Retornar null quando quote/opcao estiver inconsistente.

## 12. Item Snapshots

- [ ] TASK-CHECKOUT-SNAP-075 Criar item snapshots dentro de `buildPendingOrderDraft`.
- [ ] TASK-CHECKOUT-SNAP-076 Copiar `productId`.
- [ ] TASK-CHECKOUT-SNAP-077 Usar SKU do produto ou fallback productId.
- [ ] TASK-CHECKOUT-SNAP-078 Usar nome do produto ou fallback do carrinho.
- [ ] TASK-CHECKOUT-SNAP-079 Copiar slug quando houver.
- [ ] TASK-CHECKOUT-SNAP-080 Escolher imagem cover ou primeira imagem.
- [ ] TASK-CHECKOUT-SNAP-081 Copiar preco unitario do carrinho.
- [ ] TASK-CHECKOUT-SNAP-082 Copiar quantidade validada.
- [ ] TASK-CHECKOUT-SNAP-083 Copiar total de linha do carrinho.

## 13. Pending Order Draft

- [ ] TASK-CHECKOUT-SNAP-084 Criar draft com `buildPendingOrderDraft`.
- [ ] TASK-CHECKOUT-SNAP-085 Usar `userId` da sessao.
- [ ] TASK-CHECKOUT-SNAP-086 Usar `cartId` do carrinho ativo.
- [ ] TASK-CHECKOUT-SNAP-087 Definir status `aguardando_pagamento`.
- [ ] TASK-CHECKOUT-SNAP-088 Copiar subtotal do carrinho.
- [ ] TASK-CHECKOUT-SNAP-089 Copiar desconto do carrinho.
- [ ] TASK-CHECKOUT-SNAP-090 Copiar frete do carrinho.
- [ ] TASK-CHECKOUT-SNAP-091 Copiar total com frete do carrinho.
- [ ] TASK-CHECKOUT-SNAP-092 Definir moeda `BRL`.
- [ ] TASK-CHECKOUT-SNAP-093 Definir `createdAt`.
- [ ] TASK-CHECKOUT-SNAP-094 Definir `expiresAt = createdAt + 60min`.

## 14. Ordem Segura

- [ ] TASK-CHECKOUT-SNAP-095 Autenticar antes de carregar carrinho.
- [ ] TASK-CHECKOUT-SNAP-096 Validar schema antes de criar snapshots.
- [ ] TASK-CHECKOUT-SNAP-097 Recalcular carrinho antes de validar elegibilidade.
- [ ] TASK-CHECKOUT-SNAP-098 Validar carrinho antes de montar snapshots.
- [ ] TASK-CHECKOUT-SNAP-099 Validar CEP antes de criar draft.
- [ ] TASK-CHECKOUT-SNAP-100 Persistir pedido antes de converter carrinho.
- [ ] TASK-CHECKOUT-SNAP-101 Converter carrinho apenas apos pedido criado.

## 15. Testes Unitarios

- [ ] TASK-CHECKOUT-SNAP-102 Testar customer snapshot.
- [ ] TASK-CHECKOUT-SNAP-103 Testar address snapshot e normalizacao.
- [ ] TASK-CHECKOUT-SNAP-104 Testar coupon snapshot.
- [ ] TASK-CHECKOUT-SNAP-105 Testar shipping snapshot.
- [ ] TASK-CHECKOUT-SNAP-106 Testar item snapshots com produto real.
- [ ] TASK-CHECKOUT-SNAP-107 Testar item snapshots com fallback.
- [ ] TASK-CHECKOUT-SNAP-108 Testar payload financeiro ignorado.
- [ ] TASK-CHECKOUT-SNAP-109 Testar owner enviado pelo cliente ignorado.
- [ ] TASK-CHECKOUT-SNAP-110 Testar CEP divergente bloqueado.
- [ ] TASK-CHECKOUT-SNAP-111 Testar cupom nao consumido.
- [ ] TASK-CHECKOUT-SNAP-112 Testar estoque nao decrementado.

## 16. Guardrails

- [ ] TASK-CHECKOUT-SNAP-113 Nao aceitar totais do cliente.
- [ ] TASK-CHECKOUT-SNAP-114 Nao aceitar `userId`, `role` ou `cartId` do cliente.
- [ ] TASK-CHECKOUT-SNAP-115 Nao consumir cupom.
- [ ] TASK-CHECKOUT-SNAP-116 Nao baixar estoque.
- [ ] TASK-CHECKOUT-SNAP-117 Nao confirmar pagamento.
- [ ] TASK-CHECKOUT-SNAP-118 Nao recalcular snapshot depois do pedido criado sem fluxo explicito.
- [ ] TASK-CHECKOUT-SNAP-119 Nao conectar banco de producao.
- [ ] TASK-CHECKOUT-SNAP-120 Nao rodar migrations.
- [ ] TASK-CHECKOUT-SNAP-121 Nao alterar Laravel legado.

## 17. Validacoes

- [ ] TASK-CHECKOUT-SNAP-122 Rodar `pnpm lint` quando houver implementacao funcional.
- [ ] TASK-CHECKOUT-SNAP-123 Rodar `pnpm typecheck` quando houver implementacao funcional.
- [ ] TASK-CHECKOUT-SNAP-124 Rodar `pnpm test`.
- [ ] TASK-CHECKOUT-SNAP-125 Rodar `pnpm build`.
- [ ] TASK-CHECKOUT-SNAP-126 Rodar `pnpm test:e2e` quando fluxo checkout for alterado.

## 18. Definition of Done

- [ ] TASK-CHECKOUT-SNAP-127 Carrinho e revalidado antes de snapshot.
- [ ] TASK-CHECKOUT-SNAP-128 Produtos, estoque, cupom e frete sao revalidados.
- [ ] TASK-CHECKOUT-SNAP-129 Payload financeiro/ownership do cliente e ignorado.
- [ ] TASK-CHECKOUT-SNAP-130 Customer, endereco, itens, frete e cupom sao snapshotados corretamente.
- [ ] TASK-CHECKOUT-SNAP-131 Pedido pendente usa status `aguardando_pagamento`, moeda `BRL` e expiracao de 60 minutos.
- [ ] TASK-CHECKOUT-SNAP-132 Nenhum estoque, cupom ou pagamento e consumido nessa etapa.
