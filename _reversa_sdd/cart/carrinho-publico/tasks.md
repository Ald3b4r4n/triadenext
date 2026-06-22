# Cart / Carrinho Publico, Tasks

> Checklist executavel da subunidade `cart/carrinho-publico`. As tarefas descrevem como validar, manter ou reconstruir a tela `/carrinho` sem alterar regras criticas de pagamento, pedido ou estoque.

## 1. Rota e Renderizacao

- [ ] TASK-CART-PUB-001 Validar existencia da rota publica `/carrinho`.
  - Confirmar arquivo `src/app/(storefront)/carrinho/page.tsx`.
  - Confirmar heading principal "Carrinho".
  - Confirmar texto auxiliar "Sessao de compra".

- [ ] TASK-CART-PUB-002 Validar carregamento server-side do carrinho.
  - Confirmar chamada para `getActiveCartAction()`.
  - Aceitar resultados `success` e `fallback`.
  - Entregar `result.cart` para `CartView`.

- [ ] TASK-CART-PUB-003 Validar fallback de erro seguro na pagina.
  - Quando action falha, criar carrinho com persistencia `unavailable`.
  - Zerar totais e itens.
  - Preencher `messages` com mensagem amigavel.
  - Nao renderizar stack trace, segredo ou detalhes de conexao.

## 2. Estado Vazio

- [ ] TASK-CART-PUB-004 Validar painel de carrinho vazio.
  - Exibir "Carrinho vazio".
  - Exibir "Nenhum item adicionado".
  - Exibir orientacao para escolher produto publicado com estoque.
  - Exibir link "Ver produtos" para `/produtos`.

- [ ] TASK-CART-PUB-005 Validar resumo em carrinho vazio.
  - Resumo deve continuar renderizado.
  - Subtotal, desconto, frete e total devem ser zero.
  - CTA de checkout deve ficar desabilitado.

## 3. Mensagens e Erros de UI

- [ ] TASK-CART-PUB-006 Validar bloco de mensagens do carrinho.
  - Renderizar apenas quando `cart.messages.length > 0`.
  - Deduplicar mensagens com `Set`.
  - Usar `role="status"`.

- [ ] TASK-CART-PUB-007 Validar mensagens de formulario.
  - Cupom deve exibir sucesso ou erro com `role="status"`.
  - Frete deve exibir sucesso ou erro com `role="status"`.
  - Mensagens devem ser amigaveis e nao tecnicas.

## 4. Lista de Itens

- [ ] TASK-CART-PUB-008 Validar renderizacao de cada item.
  - Exibir `productNameSnapshot`.
  - Exibir `unitPriceSnapshotCents` formatado.
  - Exibir `itemSubtotalCents` formatado.
  - Usar `article.cart-item` para cada item.

- [ ] TASK-CART-PUB-009 Validar formulario de atualizar quantidade.
  - Enviar hidden `itemId`.
  - Usar input numerico `quantity`.
  - Definir `min="1"`.
  - Chamar `updateCartItemQuantityFormAction`.

- [ ] TASK-CART-PUB-010 Validar formulario de remover item.
  - Enviar hidden `itemId`.
  - Chamar `removeCartItemFormAction`.
  - Botao deve possuir `aria-label` com o nome do produto.

- [ ] TASK-CART-PUB-011 Validar limpar carrinho.
  - Exibir botao "Limpar carrinho" somente quando ha itens.
  - Chamar `clearCartFormAction`.
  - Apos limpar, estado vazio deve ser renderizavel.

## 5. Resumo Financeiro

- [ ] TASK-CART-PUB-012 Validar estrutura do resumo.
  - Usar `aside.cart-summary`.
  - Usar `aria-label="Resumo do carrinho"`.
  - Exibir heading "Resumo".

- [ ] TASK-CART-PUB-013 Validar linhas financeiras.
  - Exibir subtotal.
  - Exibir desconto com sinal negativo.
  - Exibir total parcial.
  - Exibir frete.
  - Exibir total com frete.
  - Formatar todos os valores com `formatMoney`.

## 6. Cupom

- [ ] TASK-CART-PUB-014 Validar painel sem cupom aplicado.
  - Exibir heading "Cupom".
  - Exibir campo `code`.
  - Exibir placeholder `DEV10`.
  - Chamar `applyCouponStateAction`.

- [ ] TASK-CART-PUB-015 Validar painel com cupom aplicado.
  - Exibir codigo do cupom.
  - Exibir label de valor.
  - Exibir botao "Remover".
  - Chamar `removeCouponStateAction`.

- [ ] TASK-CART-PUB-016 Validar refresh apos cupom.
  - Em sucesso de aplicar, chamar `router.refresh()`.
  - Em sucesso de remover, chamar `router.refresh()`.
  - Botoes devem ficar desabilitados durante pending.

- [ ] TASK-CART-PUB-017 Validar aviso de frete gratis.
  - Exibir texto informando que frete gratis pode zerar apenas frete manual elegivel.
  - Nao prometer frete gratis global fora da regra de cupom.

## 7. Frete

- [ ] TASK-CART-PUB-018 Validar formulario de cotacao.
  - Exibir heading "Frete manual".
  - Enviar `cartId`.
  - Enviar `cartHash`.
  - Enviar `postalCode`.
  - Chamar `quoteShippingStateAction`.

- [ ] TASK-CART-PUB-019 Validar estado sem cotacao.
  - Quando nao houver opcoes, exibir "Cotacao ainda nao realizada.".
  - Manter formulario de CEP disponivel.

- [ ] TASK-CART-PUB-020 Validar listagem de opcoes.
  - Exibir label da opcao.
  - Exibir prazo estimado ou "Prazo a confirmar".
  - Exibir preco formatado.
  - Exibir botao "Selecionar".

- [ ] TASK-CART-PUB-021 Validar selecao de opcao de frete.
  - Enviar `quoteId`, `optionId` e `postalCode`.
  - Chamar `selectShippingOptionStateAction`.
  - Em sucesso, chamar `router.refresh()`.

- [ ] TASK-CART-PUB-022 Validar remocao de frete.
  - Exibir botao "Remover frete" quando ha opcoes.
  - Enviar `quoteId`.
  - Chamar `removeShippingSelectionStateAction`.
  - Em sucesso, chamar `router.refresh()`.

- [ ] TASK-CART-PUB-023 Validar mensagem de sucesso de frete.
  - Cotacao bem-sucedida deve mostrar "Cotacao de frete calculada.".
  - Selecao bem-sucedida deve mostrar "Frete selecionado.".
  - Remocao bem-sucedida deve mostrar "Frete removido.".

## 8. Gate de Checkout

- [ ] TASK-CART-PUB-024 Bloquear checkout sem itens.
  - Carrinho vazio deve mostrar botao desabilitado "Selecione itens e frete".
  - Nao deve renderizar link para `/checkout`.

- [ ] TASK-CART-PUB-025 Bloquear checkout sem frete.
  - Carrinho com itens e sem `shippingQuoteId` deve mostrar botao desabilitado.
  - Nao deve renderizar link para `/checkout`.

- [ ] TASK-CART-PUB-026 Direcionar guest para login.
  - Carrinho guest com itens e frete deve renderizar link "Entrar para checkout".
  - Link deve apontar para `/login?returnTo=/checkout`.

- [ ] TASK-CART-PUB-027 Direcionar autenticado para checkout.
  - Carrinho autenticado com itens e frete deve renderizar link "Iniciar checkout".
  - Link deve apontar para `/checkout`.

- [ ] TASK-CART-PUB-028 Garantir que a pagina nao inicia pagamento.
  - `/carrinho` nao deve criar PaymentIntent.
  - `/carrinho` nao deve confirmar pedido.
  - `/carrinho` apenas navega para login ou checkout.

## 9. Fallback Sem Banco

- [ ] TASK-CART-PUB-029 Validar carregamento sem `DATABASE_URL`.
  - Em dev/test, acessar `/carrinho` deve carregar.
  - Deve exibir estado vazio ou carrinho fixture.
  - Deve mostrar mensagem contendo `dev/fixture`.

- [ ] TASK-CART-PUB-030 Validar produto fixture no carrinho.
  - Em fallback, adicionar produto fixture publicado deve funcionar.
  - Carrinho deve mostrar "Produto publicado de exemplo".
  - Subtotal esperado deve aparecer.

- [ ] TASK-CART-PUB-031 Validar cotacao fixture.
  - CEP `01001-000` deve gerar cotacao em fallback.
  - Mensagem de cotacao calculada deve aparecer.
  - Gate de checkout guest deve liberar link de login.

## 10. Acessibilidade e UX

- [ ] TASK-CART-PUB-032 Validar hierarquia de headings.
  - `h1` principal deve ser "Carrinho".
  - Resumo deve ter heading "Resumo".
  - Paineis internos devem usar headings coerentes.

- [ ] TASK-CART-PUB-033 Validar labels de formulario.
  - Quantidade deve ter label.
  - Cupom deve ter label.
  - CEP deve ter label.

- [ ] TASK-CART-PUB-034 Validar estados pending.
  - Botoes de cupom devem desabilitar durante pending.
  - Botoes de frete devem desabilitar durante pending.
  - UI deve continuar navegavel apos refresh.

- [ ] TASK-CART-PUB-035 Revisar copy defasada de checkout.
  - Avaliar texto "sem cartão, sem Stripe e sem pagamento real".
  - Se o fluxo de pagamento real estiver ativo, abrir issue ou planejar ajuste em feature propria.
  - Nao alterar regra funcional nesta subunidade documental.

## 11. Testes

- [ ] TASK-CART-PUB-036 Cobrir E2E de carrinho vazio.
  - Abrir `/carrinho`.
  - Esperar heading "Carrinho".
  - Esperar "Nenhum item adicionado".
  - Esperar mensagem `dev/fixture`.

- [ ] TASK-CART-PUB-037 Cobrir E2E de adicionar produto.
  - Abrir produto fixture publicado.
  - Clicar "Adicionar ao carrinho".
  - Abrir `/carrinho`.
  - Confirmar nome do produto e subtotal.

- [ ] TASK-CART-PUB-038 Cobrir E2E de frete e gate guest.
  - Preencher CEP.
  - Clicar "Cotar".
  - Confirmar mensagem de sucesso.
  - Confirmar link "Entrar para checkout".

- [ ] TASK-CART-PUB-039 Cobrir E2E de produtos indisponiveis.
  - Confirmar que produto sem estoque nao aparece como compravel.
  - Confirmar que produto futuro nao aparece como compravel.
  - Confirmar que produto inactive nao aparece como compravel.

- [ ] TASK-CART-PUB-040 Cobrir falha segura de carrinho.
  - Mockar action/service com erro.
  - Confirmar que UI mostra mensagem amigavel.
  - Confirmar ausencia de stack trace.

## 12. Validacoes Recomendadas

- [ ] TASK-CART-PUB-041 Rodar `pnpm lint`.
- [ ] TASK-CART-PUB-042 Rodar `pnpm typecheck`.
- [ ] TASK-CART-PUB-043 Rodar `pnpm test`.
- [ ] TASK-CART-PUB-044 Rodar `pnpm test:e2e -- src/tests/e2e/cart.spec.ts` quando a ferramenta permitir filtro.
- [ ] TASK-CART-PUB-045 Rodar `pnpm build` se houver alteracao funcional.

## 13. Guardrails

- [ ] TASK-CART-PUB-046 Nao conectar banco real para validar fallback.
- [ ] TASK-CART-PUB-047 Nao criar pedido dentro da tela de carrinho.
- [ ] TASK-CART-PUB-048 Nao criar PaymentIntent dentro da tela de carrinho.
- [ ] TASK-CART-PUB-049 Nao expor checkout para carrinho vazio ou sem frete.
- [ ] TASK-CART-PUB-050 Nao confiar no cliente para estoque, cupom ou frete.
- [ ] TASK-CART-PUB-051 Nao alterar regras de pagamento, pedidos, estoque ou cupom ao mexer apenas na UI publica do carrinho.

## 14. Definition of Done

- [ ] `/carrinho` carrega com sucesso em dev/test sem banco real.
- [ ] Estado vazio, itens, resumo, cupom, frete e gate de checkout estao documentados.
- [ ] Requisitos RF-CART-PUB-01 a RF-CART-PUB-17 possuem tarefas rastreaveis.
- [ ] Lacunas de copy, imagem e input de estoque estao explicitadas.
- [ ] Trio `requirements.md`, `design.md`, `tasks.md` da subunidade esta completo.
