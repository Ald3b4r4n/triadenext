# Cart / Cupom e Frete no Carrinho, Tasks

> Checklist executavel da subunidade `cart/cupom-frete-carrinho`. As tarefas cobrem UI, actions, service, recalculo, seguranca e testes de cupom e frete no carrinho.

## 1. UI de Cupom

- [ ] TASK-CART-COUPON-001 Validar painel sem cupom.
  - Exibir heading "Cupom".
  - Exibir campo `code` com label "Codigo".
  - Exibir placeholder `DEV10`.
  - Exibir botao "Aplicar".

- [ ] TASK-CART-COUPON-002 Validar painel com cupom aplicado.
  - Exibir codigo do cupom.
  - Exibir `valueLabel`.
  - Exibir botao "Remover".
  - Nao exibir campo de codigo enquanto cupom esta aplicado.

- [ ] TASK-CART-COUPON-003 Validar estado pending do cupom.
  - Desabilitar "Aplicar" durante `applyPending`.
  - Desabilitar "Remover" durante `removePending`.

- [ ] TASK-CART-COUPON-004 Validar mensagens do cupom.
  - Exibir mensagem de sucesso/erro quando existir.
  - Usar `role="status"`.
  - Usar classe de sucesso para `status=success` e erro nos demais casos.

- [ ] TASK-CART-COUPON-005 Validar refresh da UI de cupom.
  - Em sucesso de aplicar, chamar `router.refresh()`.
  - Em sucesso de remover, chamar `router.refresh()`.

## 2. Actions de Cupom

- [ ] TASK-CART-COUPON-006 Validar schema de aplicar cupom.
  - `applyCouponAction` deve usar `applyCouponToCartSchema`.
  - FormData invalido retorna `validation_error`.
  - Mensagem invalida deve ser amigavel.

- [ ] TASK-CART-COUPON-007 Validar action state de aplicar cupom.
  - Sucesso ou fallback retorna `{ status: "success", message: "Cupom aplicado ao carrinho." }`.
  - Erro retorna `{ status: "error", message: result.message }`.

- [ ] TASK-CART-COUPON-008 Validar action de remover cupom.
  - `removeCouponAction` chama `removeCouponFromActiveCart`.
  - Deve revalidar caminhos do carrinho.

- [ ] TASK-CART-COUPON-009 Validar action state de remover cupom.
  - Sucesso ou fallback retorna `{ status: "success", message: "Cupom removido do carrinho." }`.
  - Erro retorna `{ status: "error", message: result.message }`.

## 3. Service de Cupom

- [ ] TASK-CART-COUPON-010 Validar ator ao aplicar cupom.
  - `applyCouponToActiveCart` deve chamar `resolveCartActor({ createGuestToken: true })`.
  - Ator `unavailable` deve retornar erro seguro.

- [ ] TASK-CART-COUPON-011 Validar subtotal antes da validacao.
  - Obter ou criar carrinho ativo.
  - Recalcular carrinho antes de validar cupom.
  - Usar `cart.subtotalCents` no `validateCouponForCart`.

- [ ] TASK-CART-COUPON-012 Validar cupom invalido.
  - Quando validation status nao e `valid`, retornar `coupon_invalid`.
  - Incluir mensagem de validacao.
  - Retornar carrinho recalculado sem corromper totais.

- [ ] TASK-CART-COUPON-013 Validar cupom valido.
  - Persistir `validation.coupon.id` via repository.
  - Recalcular carrinho.
  - Retornar `CartActionResult`.

- [ ] TASK-CART-COUPON-014 Validar remocao no service.
  - Resolver ator sem criar token.
  - Limpar cupom com `clearAppliedCoupon`.
  - Recalcular carrinho.

## 4. UI de Frete

- [ ] TASK-CART-SHIP-001 Validar painel de frete.
  - Exibir heading "Frete manual".
  - Usar `aria-label="Frete"`.
  - Exibir campo "CEP".
  - Exibir botao "Cotar".

- [ ] TASK-CART-SHIP-002 Validar campos hidden de cotacao.
  - Enviar `cartId`.
  - Enviar `cartHash`.
  - Enviar `postalCode`.

- [ ] TASK-CART-SHIP-003 Validar estado sem cotacao.
  - Sem opcoes, exibir "Cotacao ainda nao realizada.".
  - Manter formulario de CEP disponivel.

- [ ] TASK-CART-SHIP-004 Validar renderizacao de opcoes.
  - Exibir label da opcao.
  - Exibir prazo estimado ou "Prazo a confirmar".
  - Exibir preco com `formatMoney`.
  - Exibir botao "Selecionar".

- [ ] TASK-CART-SHIP-005 Validar remocao visual de frete.
  - Quando ha opcoes, exibir botao "Remover frete".
  - Enviar `quoteId` no formulario.

- [ ] TASK-CART-SHIP-006 Validar mensagens de frete.
  - Exibir sucesso/erro com `role="status"`.
  - Priorizar mensagem de remover, depois selecionar, depois cotar.

- [ ] TASK-CART-SHIP-007 Validar pending do frete.
  - Desabilitar "Cotar" durante `quotePending`.
  - Desabilitar "Selecionar" durante `selectPending`.
  - Desabilitar "Remover frete" durante `removePending`.

## 5. Actions de Frete

- [ ] TASK-CART-SHIP-008 Validar schema de cotacao.
  - `quoteShippingAction` deve usar `quoteShippingSchema`.
  - FormData invalido retorna `validation_error` com "CEP invalido.".

- [ ] TASK-CART-SHIP-009 Validar action state de cotacao.
  - Sucesso ou fallback retorna "Cotacao de frete calculada.".
  - Erro retorna mensagem do service.

- [ ] TASK-CART-SHIP-010 Validar schema de selecao.
  - `selectShippingOptionAction` deve validar `quoteId`, `optionId`, `postalCode`.
  - FormData invalido retorna "Selecao de frete invalida.".

- [ ] TASK-CART-SHIP-011 Validar action state de selecao.
  - Sucesso ou fallback retorna "Frete selecionado.".
  - Erro retorna mensagem do service.

- [ ] TASK-CART-SHIP-012 Validar action de remover frete.
  - Deve validar ao menos `quoteId`.
  - Deve chamar `removeShippingSelectionFromActiveCart`.
  - Sucesso ou fallback retorna "Frete removido.".

- [ ] TASK-CART-SHIP-013 Validar revalidation de frete.
  - Cotar, selecionar e remover devem chamar `revalidateCartPaths`.
  - Revalidar `/carrinho`.
  - Revalidar `/produtos`.

## 6. Service de Frete

- [ ] TASK-CART-SHIP-014 Validar ator ao cotar frete.
  - `quoteShippingForActiveCart` deve chamar `resolveCartActor({ createGuestToken: true })`.
  - Ator unavailable retorna erro seguro.

- [ ] TASK-CART-SHIP-015 Validar CEP no service.
  - Usar `validatePostalCode`.
  - CEP invalido retorna `validation_error` com mensagem do dominio.

- [ ] TASK-CART-SHIP-016 Validar fonte de regras.
  - Consultar `shippingRepository.listManualRules()`.
  - Se houver regras manuais, usar regras persistidas.
  - Se nao houver regras, usar `devShippingRules`.

- [ ] TASK-CART-SHIP-017 Validar ausencia de cobertura.
  - Se `buildManualShippingOptions` retornar lista vazia, retornar erro amigavel.
  - Mensagem esperada: "Nao ha cobertura manual para este CEP.".

- [ ] TASK-CART-SHIP-018 Validar criacao de quote.
  - Criar quote com `cartId`.
  - Criar quote com `cartHash`.
  - Criar quote com `postalCode`.
  - Criar quote com opcoes.
  - Definir `source` como `fixture` ou `manual`.

- [ ] TASK-CART-SHIP-019 Validar selecao automatica inicial.
  - Selecionar primeira opcao apos cotacao.
  - Persistir selecao no carrinho.
  - Recalcular total com frete.

- [ ] TASK-CART-SHIP-020 Validar busca de quote ao selecionar.
  - Buscar quote por `quoteId`.
  - Quote inexistente retorna `validation_error`.

- [ ] TASK-CART-SHIP-021 Validar ownership da quote.
  - Carregar carrinho ativo do ator.
  - Se `cart.id === null`, retornar `forbidden`.
  - Se `quote.cartId !== cart.id`, retornar `forbidden`.

- [ ] TASK-CART-SHIP-022 Validar selecao de opcao.
  - Chamar `selectShippingQuoteOption`.
  - Se selecao falha, retornar `validation_error`.
  - Persistir opcao selecionada no carrinho.

- [ ] TASK-CART-SHIP-023 Validar remocao de selecao.
  - Resolver ator.
  - Chamar `clearShippingSelection`.
  - Recalcular carrinho.

## 7. Recalculo de Totais

- [ ] TASK-CART-TOTAL-001 Validar desconto de cupom.
  - Buscar cupom por `appliedCouponId`.
  - Calcular desconto com `calculateCouponDiscountCents`.
  - Recalcular usando subtotal atual.

- [ ] TASK-CART-TOTAL-002 Validar cupom aplicado invalido.
  - Se `appliedCouponId` existe e recalculo nao retorna cupom, limpar cupom aplicado.
  - Preservar mensagens do recalculo.

- [ ] TASK-CART-TOTAL-003 Validar frete gratis.
  - Se cupom e `free_shipping` e frete > 0, frete efetivo deve ser 0.
  - Adicionar mensagem "Cupom de frete gratis zerou o frete manual elegivel.".

- [ ] TASK-CART-TOTAL-004 Validar total parcial.
  - `partialTotalCents = subtotalCents - discountCents`.
  - Total parcial deve refletir cupom atual.

- [ ] TASK-CART-TOTAL-005 Validar total com frete.
  - `partialTotalWithShippingCents = partialTotalCents + effectiveShippingAmountCents`.
  - Frete gratis deve usar frete efetivo zero.

## 8. Testes

- [ ] TASK-CART-COUPON-015 Cobrir aplicar cupom valido.
  - Cupom valido altera desconto.
  - Mensagem de sucesso aparece.

- [ ] TASK-CART-COUPON-016 Cobrir cupom invalido.
  - Retorna `coupon_invalid` ou mensagem de erro.
  - Carrinho permanece consistente.

- [ ] TASK-CART-COUPON-017 Cobrir remover cupom.
  - Cupom e limpo.
  - Totais sao recalculados.

- [ ] TASK-CART-COUPON-018 Cobrir cupom de frete gratis.
  - Frete manual selecionado fica efetivo zero.
  - Mensagem explicativa aparece.

- [ ] TASK-CART-SHIP-024 Cobrir cotacao de frete valida.
  - CEP valido cria quote.
  - Primeira opcao e selecionada.
  - Total com frete muda.

- [ ] TASK-CART-SHIP-025 Cobrir CEP invalido.
  - Retorna `validation_error`.
  - Nenhuma selecao de frete e persistida.

- [ ] TASK-CART-SHIP-026 Cobrir CEP sem cobertura.
  - Retorna mensagem "Nao ha cobertura manual para este CEP.".

- [ ] TASK-CART-SHIP-027 Cobrir quote inexistente.
  - Selecionar quote inexistente retorna `validation_error`.

- [ ] TASK-CART-SHIP-028 Cobrir quote de outro carrinho.
  - Retorna `forbidden`.
  - Carrinho atual nao muda.

- [ ] TASK-CART-SHIP-029 Cobrir remover frete.
  - Selecao e limpa.
  - Total com frete e recalculado.

## 9. Validacoes Recomendadas

- [ ] TASK-CART-COUPON-019 Rodar `pnpm lint`.
- [ ] TASK-CART-COUPON-020 Rodar `pnpm typecheck`.
- [ ] TASK-CART-COUPON-021 Rodar `pnpm test`.
- [ ] TASK-CART-SHIP-030 Rodar `pnpm test:e2e` para fluxo de carrinho/frete.
- [ ] TASK-CART-SHIP-031 Rodar `pnpm build` se houver alteracao funcional.

## 10. Guardrails

- [ ] TASK-CART-GUARD-001 Nao confiar em desconto calculado no cliente.
- [ ] TASK-CART-GUARD-002 Nao confiar em frete calculado no cliente.
- [ ] TASK-CART-GUARD-003 Nao permitir quote de outro carrinho.
- [ ] TASK-CART-GUARD-004 Nao manter frete selecionado apos mudanca de item.
- [ ] TASK-CART-GUARD-005 Nao usar frete externo real sem feature propria.
- [ ] TASK-CART-GUARD-006 Nao conectar banco real em testes de fallback.
- [ ] TASK-CART-GUARD-007 Nao alterar regras de pagamento/pedido ao mexer em cupom/frete do carrinho.

## 11. Definition of Done

- [ ] Painel de cupom documentado para aplicar, remover, pending e mensagens.
- [ ] Painel de frete documentado para cotar, selecionar, remover, pending e mensagens.
- [ ] Services de cupom/frete documentados com validacoes server-side.
- [ ] Recalculo de desconto, frete e total com frete esta rastreado.
- [ ] Riscos de `cartHash`, frete externo e quote stale estao explicitados.
- [ ] Trio `requirements.md`, `design.md`, `tasks.md` da subunidade esta completo.
