# Checkout / Revisao e Pedido Pendente, Tasks

> Checklist executavel da subunidade `checkout/revisao-pedido-pendente`.
> Escopo: estados da pagina `/checkout`, query `?pedido=`, revisao do carrinho, submit de pedido pendente e UI sem pagamento direto.

## 1. Parametro `pedido`

- [ ] TASK-CHECKOUT-REVIEW-001 Ler `searchParams.pedido` em `/checkout`.
- [ ] TASK-CHECKOUT-REVIEW-002 Priorizar carregamento de pedido quando `pedido` existir.
- [ ] TASK-CHECKOUT-REVIEW-003 Chamar `getCustomerPendingOrderAction(pedido)` server-side.
- [ ] TASK-CHECKOUT-REVIEW-004 Renderizar pedido criado somente quando action retornar `success`.
- [ ] TASK-CHECKOUT-REVIEW-005 Nao renderizar dados quando pedido for `not_found`.
- [ ] TASK-CHECKOUT-REVIEW-006 Nao distinguir visualmente pedido inexistente de pedido alheio.

## 2. Ownership do Pedido

- [ ] TASK-CHECKOUT-REVIEW-007 Exigir `requireCustomer` para ler pedido em query string.
- [ ] TASK-CHECKOUT-REVIEW-008 Buscar pedido por `userId` + `orderId`.
- [ ] TASK-CHECKOUT-REVIEW-009 Retornar `not_found` para pedido alheio.
- [ ] TASK-CHECKOUT-REVIEW-010 Retornar mensagem segura para acesso bloqueado.
- [ ] TASK-CHECKOUT-REVIEW-011 Cobrir ownership em teste unitario.

## 3. Estado Pedido Criado

- [ ] TASK-CHECKOUT-REVIEW-012 Renderizar heading "Pedido criado".
- [ ] TASK-CHECKOUT-REVIEW-013 Renderizar texto orientando pagamento posterior.
- [ ] TASK-CHECKOUT-REVIEW-014 Renderizar `OrderSummary`.
- [ ] TASK-CHECKOUT-REVIEW-015 Renderizar `OrderItemsSummary`.
- [ ] TASK-CHECKOUT-REVIEW-016 Mostrar status do pedido.
- [ ] TASK-CHECKOUT-REVIEW-017 Mostrar expiracao quando pedido estiver `aguardando_pagamento`.
- [ ] TASK-CHECKOUT-REVIEW-018 Mostrar status de pagamento como ainda nao iniciado quando aplicavel.

## 4. Estado Guest

- [ ] TASK-CHECKOUT-REVIEW-019 Chamar `reviewPendingCheckoutAction` quando nao houver pedido valido.
- [ ] TASK-CHECKOUT-REVIEW-020 Detectar `unauthenticated`.
- [ ] TASK-CHECKOUT-REVIEW-021 Renderizar heading "Entre para continuar".
- [ ] TASK-CHECKOUT-REVIEW-022 Renderizar link `/login?returnTo=/checkout`.
- [ ] TASK-CHECKOUT-REVIEW-023 Renderizar link `/cadastro?returnTo=/checkout`.
- [ ] TASK-CHECKOUT-REVIEW-024 Garantir que formulario de entrega nao aparece para guest.

## 5. Estado Carrinho Invalido

- [ ] TASK-CHECKOUT-REVIEW-025 Detectar review diferente de `success`.
- [ ] TASK-CHECKOUT-REVIEW-026 Renderizar heading "Revise o carrinho".
- [ ] TASK-CHECKOUT-REVIEW-027 Exibir mensagem controlada do service.
- [ ] TASK-CHECKOUT-REVIEW-028 Renderizar link `/carrinho`.
- [ ] TASK-CHECKOUT-REVIEW-029 Nao renderizar botao de criar pedido neste estado.

## 6. Estado Revisao Valida

- [ ] TASK-CHECKOUT-REVIEW-030 Renderizar heading "Revisao do pedido".
- [ ] TASK-CHECKOUT-REVIEW-031 Exibir texto sobre conferir itens, frete, cupom e endereco.
- [ ] TASK-CHECKOUT-REVIEW-032 Renderizar lista de itens.
- [ ] TASK-CHECKOUT-REVIEW-033 Renderizar formulario "Cliente e entrega".
- [ ] TASK-CHECKOUT-REVIEW-034 Renderizar aside "Resumo".
- [ ] TASK-CHECKOUT-REVIEW-035 Garantir que review usa carrinho recalculado server-side.

## 7. Lista de Itens

- [ ] TASK-CHECKOUT-REVIEW-036 Mostrar nome snapshot do item.
- [ ] TASK-CHECKOUT-REVIEW-037 Mostrar quantidade.
- [ ] TASK-CHECKOUT-REVIEW-038 Mostrar preco unitario formatado.
- [ ] TASK-CHECKOUT-REVIEW-039 Mostrar subtotal do item formatado.
- [ ] TASK-CHECKOUT-REVIEW-040 Usar chave estavel por item.

## 8. Formulario de Entrega

- [ ] TASK-CHECKOUT-REVIEW-041 Definir action `createPendingOrderAndRedirect`.
- [ ] TASK-CHECKOUT-REVIEW-042 Renderizar e-mail da conta vindo da sessao.
- [ ] TASK-CHECKOUT-REVIEW-043 Renderizar campo `fullName`.
- [ ] TASK-CHECKOUT-REVIEW-044 Renderizar campo `phone`.
- [ ] TASK-CHECKOUT-REVIEW-045 Renderizar campo `recipient`.
- [ ] TASK-CHECKOUT-REVIEW-046 Renderizar campo `postalCode`.
- [ ] TASK-CHECKOUT-REVIEW-047 Usar `cart.shippingPostalCode` como default do CEP quando existir.
- [ ] TASK-CHECKOUT-REVIEW-048 Renderizar campo `state`.
- [ ] TASK-CHECKOUT-REVIEW-049 Renderizar campo `city`.
- [ ] TASK-CHECKOUT-REVIEW-050 Renderizar campo `district`.
- [ ] TASK-CHECKOUT-REVIEW-051 Renderizar campo `street`.
- [ ] TASK-CHECKOUT-REVIEW-052 Renderizar campo `number`.
- [ ] TASK-CHECKOUT-REVIEW-053 Renderizar campo `complement`.
- [ ] TASK-CHECKOUT-REVIEW-054 Renderizar botao "Criar pedido pendente".

## 9. Resumo Financeiro

- [ ] TASK-CHECKOUT-REVIEW-055 Mostrar subtotal.
- [ ] TASK-CHECKOUT-REVIEW-056 Mostrar desconto.
- [ ] TASK-CHECKOUT-REVIEW-057 Mostrar frete.
- [ ] TASK-CHECKOUT-REVIEW-058 Mostrar total com frete.
- [ ] TASK-CHECKOUT-REVIEW-059 Mostrar cupom aplicado ou "nenhum".
- [ ] TASK-CHECKOUT-REVIEW-060 Mostrar label do frete selecionado quando disponivel.
- [ ] TASK-CHECKOUT-REVIEW-061 Mostrar aviso de expiracao de pedido em 60 minutos.
- [ ] TASK-CHECKOUT-REVIEW-062 Mostrar aviso de que cartao nao e coletado no formulario.

## 10. Criacao e Redirect

- [ ] TASK-CHECKOUT-REVIEW-063 Garantir que submit valido chama `createPendingOrderAction`.
- [ ] TASK-CHECKOUT-REVIEW-064 Garantir que action valida `checkoutFormSchema`.
- [ ] TASK-CHECKOUT-REVIEW-065 Garantir que service cria pedido pendente.
- [ ] TASK-CHECKOUT-REVIEW-066 Revalidar `/carrinho`.
- [ ] TASK-CHECKOUT-REVIEW-067 Revalidar `/checkout`.
- [ ] TASK-CHECKOUT-REVIEW-068 Revalidar `/pedidos`.
- [ ] TASK-CHECKOUT-REVIEW-069 Revalidar `/admin/pedidos`.
- [ ] TASK-CHECKOUT-REVIEW-070 Redirecionar para `/checkout?pedido=<id>` quando houver sucesso.

## 11. Separacao Checkout/Pagamento

- [ ] TASK-CHECKOUT-REVIEW-071 Nao renderizar Payment Element na revisao.
- [ ] TASK-CHECKOUT-REVIEW-072 Nao criar PaymentIntent nesta tela.
- [ ] TASK-CHECKOUT-REVIEW-073 Nao confirmar pagamento nesta tela.
- [ ] TASK-CHECKOUT-REVIEW-074 Nao coletar numero de cartao, CVV ou validade.
- [ ] TASK-CHECKOUT-REVIEW-075 Orientar que pagamento continua pela area de pedidos/pagamento.

## 12. Testes Unitarios

- [ ] TASK-CHECKOUT-REVIEW-076 Testar `getCustomerPendingOrderAction` com customer dono.
- [ ] TASK-CHECKOUT-REVIEW-077 Testar `getCustomerPendingOrderAction` com pedido inexistente.
- [ ] TASK-CHECKOUT-REVIEW-078 Testar pedido alheio como `not_found`.
- [ ] TASK-CHECKOUT-REVIEW-079 Testar `reviewPendingCheckoutAction` para guest.
- [ ] TASK-CHECKOUT-REVIEW-080 Testar action de criacao com formulario valido.
- [ ] TASK-CHECKOUT-REVIEW-081 Testar action de criacao com formulario invalido.

## 13. E2E

- [ ] TASK-CHECKOUT-REVIEW-082 Abrir `/checkout` sem login.
- [ ] TASK-CHECKOUT-REVIEW-083 Confirmar links login/cadastro.
- [ ] TASK-CHECKOUT-REVIEW-084 Abrir `/checkout` autenticado com carrinho valido.
- [ ] TASK-CHECKOUT-REVIEW-085 Confirmar lista de itens, formulario e resumo.
- [ ] TASK-CHECKOUT-REVIEW-086 Submeter formulario valido.
- [ ] TASK-CHECKOUT-REVIEW-087 Confirmar redirect para `?pedido=`.
- [ ] TASK-CHECKOUT-REVIEW-088 Confirmar "Pedido criado".
- [ ] TASK-CHECKOUT-REVIEW-089 Confirmar ausencia de campos de cartao.
- [ ] TASK-CHECKOUT-REVIEW-090 Confirmar comportamento seguro para pedido alheio/inexistente.

## 14. Guardrails

- [ ] TASK-CHECKOUT-REVIEW-091 Nao coletar cartao nesta tela.
- [ ] TASK-CHECKOUT-REVIEW-092 Nao iniciar pagamento automaticamente.
- [ ] TASK-CHECKOUT-REVIEW-093 Nao expor pedido de outro customer.
- [ ] TASK-CHECKOUT-REVIEW-094 Nao aceitar totals do cliente.
- [ ] TASK-CHECKOUT-REVIEW-095 Nao baixar estoque.
- [ ] TASK-CHECKOUT-REVIEW-096 Nao consumir cupom.
- [ ] TASK-CHECKOUT-REVIEW-097 Nao conectar banco de producao.
- [ ] TASK-CHECKOUT-REVIEW-098 Nao rodar migrations.
- [ ] TASK-CHECKOUT-REVIEW-099 Nao alterar Laravel legado.

## 15. Validacoes

- [ ] TASK-CHECKOUT-REVIEW-100 Rodar `pnpm lint` quando houver implementacao funcional.
- [ ] TASK-CHECKOUT-REVIEW-101 Rodar `pnpm typecheck` quando houver implementacao funcional.
- [ ] TASK-CHECKOUT-REVIEW-102 Rodar `pnpm test`.
- [ ] TASK-CHECKOUT-REVIEW-103 Rodar `pnpm build`.
- [ ] TASK-CHECKOUT-REVIEW-104 Rodar `pnpm test:e2e` cobrindo checkout.

## 16. Definition of Done

- [ ] TASK-CHECKOUT-REVIEW-105 Guest e direcionado para login/cadastro.
- [ ] TASK-CHECKOUT-REVIEW-106 Customer com carrinho valido ve revisao completa.
- [ ] TASK-CHECKOUT-REVIEW-107 Carrinho invalido bloqueia criacao de pedido.
- [ ] TASK-CHECKOUT-REVIEW-108 Submit valido cria pedido pendente e redireciona.
- [ ] TASK-CHECKOUT-REVIEW-109 `?pedido=` exibe apenas pedido do customer dono.
- [ ] TASK-CHECKOUT-REVIEW-110 Tela nao coleta cartao e orienta pagamento posterior.
