# Cart / Cupom e Frete no Carrinho

> Spec executavel da subunidade `cart/cupom-frete-carrinho`. Foca no QUE o carrinho deve garantir ao aplicar/remover cupom, cotar frete manual, selecionar/remover frete e recalcular totais.

## Visao Geral

O carrinho integra duas entradas comerciais antes do checkout: cupom e frete. Cupom depende de validacao contra subtotal atual e pode aplicar desconto ou frete gratis. Frete depende de CEP valido, regras manuais ou fixtures de desenvolvimento, cotacao persistida, selecao de opcao e recalculo do total com frete. Ambos devem operar via server actions, revalidar o carrinho e nunca confiar apenas no cliente.

## Responsabilidades

- Aplicar cupom ao carrinho ativo.
- Remover cupom aplicado.
- Validar cupom contra subtotal atual.
- Recalcular desconto apos aplicacao/remocao.
- Remover cupom invalido durante recalculo.
- Cotar frete manual por CEP.
- Usar regras manuais cadastradas ou fixtures dev/test quando nao houver regra persistida.
- Persistir cotacao de frete vinculada ao carrinho.
- Selecionar opcao de frete de cotacao pertencente ao carrinho.
- Remover selecao de frete.
- Recalcular total parcial, frete e total com frete.
- Aplicar frete gratis apenas sobre frete manual elegivel.
- Mostrar mensagens de sucesso/erro em paineis cliente.
- Atualizar a UI por `router.refresh()` apos sucesso.

## Regras de Negocio

- 🟢 Aplicar cupom deve resolver ator com `createGuestToken: true`.
- 🟢 Cupom so deve ser aplicado se `validateCouponForCart` retornar valido para o subtotal atual.
- 🟢 Cupom invalido deve retornar `coupon_invalid` e manter carrinho consistente.
- 🟢 Remover cupom deve limpar cupom aplicado e recalcular carrinho.
- 🟢 Cupom aplicado e recalculado em `recalculateCartView`.
- 🟢 Se cupom aplicado se tornar invalido, deve ser removido no recalculo.
- 🟢 Cupom de tipo `free_shipping` deve zerar apenas frete manual elegivel.
- 🟢 Painel de cupom exibe campo de codigo quando nao ha cupom.
- 🟢 Painel de cupom exibe codigo/valor e botao remover quando ha cupom.
- 🟢 Cotar frete deve resolver ator com `createGuestToken: true`.
- 🟢 CEP invalido deve retornar `validation_error`.
- 🟢 Se nao houver regras manuais persistidas, usar `devShippingRules`.
- 🟢 Se nao houver cobertura para CEP, retornar erro amigavel.
- 🟢 Cotacao deve salvar `cartId`, `cartHash`, `postalCode`, opcoes e source.
- 🟢 Primeira opcao de frete deve ser selecionada automaticamente apos cotacao.
- 🟢 Selecionar frete deve validar que a cotacao pertence ao carrinho atual.
- 🟢 Quote inexistente deve retornar `validation_error`.
- 🟢 Quote de outro carrinho deve retornar `forbidden`.
- 🟢 Remover frete deve limpar selecao de frete e recalcular totais.
- 🟢 Mudancas de item no carrinho devem limpar selecao de frete em outra parte do modulo.
- 🟡 `cartHash` usado pela UI inclui `productId:quantity`, enquanto o service cria hash com itens e subtotal.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CART-COUPON-01 | Renderizar painel de cupom sem cupom aplicado. | Must | Exibe heading "Cupom", campo "Codigo", placeholder `DEV10` e botao "Aplicar". |
| RF-CART-COUPON-02 | Aplicar cupom valido. | Must | Codigo valido e aceito, persistido e carrinho recalculado com desconto. |
| RF-CART-COUPON-03 | Rejeitar cupom invalido. | Must | Codigo invalido retorna erro amigavel e nao corrompe totais. |
| RF-CART-COUPON-04 | Renderizar cupom aplicado. | Must | Exibe codigo, valor/label do cupom e botao "Remover". |
| RF-CART-COUPON-05 | Remover cupom aplicado. | Must | Cupom e limpo, carrinho recalculado e UI atualizada. |
| RF-CART-COUPON-06 | Revalidar cupom no recalculo. | Must | Cupom que deixou de ser valido e removido durante recalculo. |
| RF-CART-COUPON-07 | Aplicar frete gratis elegivel. | Must | Cupom `free_shipping` zera frete manual elegivel e adiciona mensagem explicativa. |
| RF-CART-COUPON-08 | Atualizar UI apos cupom. | Should | Sucesso em aplicar/remover chama `router.refresh()`. |
| RF-CART-SHIP-01 | Renderizar painel de frete. | Must | Exibe heading "Frete manual", campo "CEP" e botao "Cotar". |
| RF-CART-SHIP-02 | Cotar frete por CEP valido. | Must | CEP valido gera cotacao com opcoes, seleciona primeira opcao e recalcula total. |
| RF-CART-SHIP-03 | Rejeitar CEP invalido. | Must | CEP invalido retorna `validation_error` com mensagem amigavel. |
| RF-CART-SHIP-04 | Usar regras manuais ou fixture. | Must | Se existirem regras manuais, usa regras persistidas; senao usa `devShippingRules`. |
| RF-CART-SHIP-05 | Rejeitar CEP sem cobertura. | Must | Sem opcoes, retorna "Nao ha cobertura manual para este CEP.". |
| RF-CART-SHIP-06 | Exibir opcoes de frete. | Must | Opcoes mostram label, prazo ou "Prazo a confirmar", preco formatado e botao "Selecionar". |
| RF-CART-SHIP-07 | Selecionar opcao de frete. | Should | Opcao de quote pertencente ao carrinho pode ser selecionada e total recalculado. |
| RF-CART-SHIP-08 | Bloquear quote inexistente. | Must | Quote nao encontrada retorna `validation_error`. |
| RF-CART-SHIP-09 | Bloquear quote de outro carrinho. | Must | Quote cujo `cartId` nao bate com carrinho atual retorna `forbidden`. |
| RF-CART-SHIP-10 | Remover selecao de frete. | Should | Botao "Remover frete" limpa selecao e recalcula carrinho. |
| RF-CART-SHIP-11 | Atualizar UI apos frete. | Should | Sucesso em cotar/selecionar/remover chama `router.refresh()`. |
| RF-CART-SHIP-12 | Exibir estado sem cotacao. | Must | Sem opcoes, painel mostra "Cotacao ainda nao realizada.". |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Integridade | Cupom e frete sao validados no servidor antes de persistir. | `cart-service.ts`, `cart-actions.ts` | 🟢 |
| Seguranca | Quote de outro carrinho e bloqueada. | `selectShippingOptionForActiveCart` | 🟢 |
| Resiliencia | Sem regras manuais, frete usa fixture dev/test. | `quoteShippingForActiveCart` | 🟢 |
| UX | Painel cliente mostra pending, mensagens e refresh apos sucesso. | `cart-coupon-panel.tsx`, `shipping-quote-panel.tsx` | 🟢 |
| Consistencia | Recalculo centraliza desconto, frete e total final. | `recalculateCartView` | 🟢 |
| Acessibilidade | Mensagens usam `role="status"` e campos possuem labels. | componentes de cupom/frete | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: aplicar cupom valido
  Dado carrinho ativo com subtotal elegivel
  Quando usuario informa codigo de cupom valido
  Entao cupom e aplicado ao carrinho
  E desconto aparece no resumo
  E UI mostra "Cupom aplicado ao carrinho."

Cenario: rejeitar cupom invalido
  Dado carrinho ativo
  Quando usuario informa codigo invalido
  Entao action retorna coupon_invalid
  E totais permanecem consistentes
  E mensagem amigavel e exibida

Cenario: remover cupom
  Dado carrinho com cupom aplicado
  Quando usuario clica "Remover"
  Entao cupom e removido
  E totais sao recalculados
  E UI mostra "Cupom removido do carrinho."

Cenario: cotar frete com CEP valido
  Dado carrinho ativo
  Quando usuario preenche "01001-000"
  E clica "Cotar"
  Entao cotacao e criada
  E primeira opcao e selecionada
  E total com frete e recalculado
  E UI mostra "Cotacao de frete calculada."

Cenario: selecionar quote de outro carrinho
  Dado carrinho A
  E quote pertence ao carrinho B
  Quando usuario tenta selecionar a quote no carrinho A
  Entao retorna forbidden
  E frete do carrinho A nao e alterado

Cenario: cupom de frete gratis
  Dado carrinho com frete manual selecionado
  E cupom valido do tipo free_shipping
  Quando carrinho recalcula
  Entao frete efetivo fica R$ 0,00
  E mensagem informa que frete manual elegivel foi zerado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Aplicar/remover cupom com recalculo | Must | Impacta total comercial do carrinho. |
| Revalidar cupom no recalculo | Must | Evita desconto stale ou invalido. |
| Cotar frete por CEP | Must | Checkout depende de frete selecionado. |
| Bloquear quote de outro carrinho | Must | Evita violacao de integridade/seguranca. |
| Free shipping sobre frete manual elegivel | Must | Regra comercial explicita. |
| Selecionar/remover opcao de frete | Should | Importante para UX, mas primeira opcao ja e selecionada. |
| Refresh automatico apos actions | Should | Melhora feedback visual, mas server action ja altera estado. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/features/cart/components/cart-coupon-panel.tsx` | `CartCouponPanel` | 🟢 |
| `src/features/shipping/components/shipping-quote-panel.tsx` | `ShippingQuotePanel` | 🟢 |
| `src/features/cart/server/cart-actions.ts` | actions de cupom e frete | 🟢 |
| `src/features/cart/server/cart-service.ts` | `applyCouponToActiveCart` | 🟢 |
| `src/features/cart/server/cart-service.ts` | `removeCouponFromActiveCart` | 🟢 |
| `src/features/cart/server/cart-service.ts` | `quoteShippingForActiveCart` | 🟢 |
| `src/features/cart/server/cart-service.ts` | `selectShippingOptionForActiveCart` | 🟢 |
| `src/features/cart/server/cart-service.ts` | `removeShippingSelectionFromActiveCart` | 🟢 |
| `src/features/cart/server/cart-service.ts` | `recalculateCartView` | 🟢 |
| `src/features/coupons/server/coupon-service.ts` | validacao/calculo de cupom | 🟢 |
| `src/features/shipping/domain` | CEP, quote e opcoes manuais | 🟢 |
| `src/features/shipping/server/shipping-repository.ts` | persistencia de cotacao | 🟢 |

## Lacunas e Riscos

- 🟡 `cartHash` enviado pela UI nao inclui subtotal, enquanto o hash do service inclui subtotal; manter contrato alinhado se a validacao de hash for endurecida.
- 🟡 Frete externo real ainda nao faz parte deste fluxo; regras atuais sao manuais/fixture.
- 🟡 Cupom de frete gratis zera frete efetivo, mas a quote original permanece com preco.
- 🟡 Mensagens de cupom/frete dependem de `router.refresh()` para atualizar todo o resumo.
- 🔴 Se item muda e frete nao for limpo pelo repositorio, quote stale pode afetar total; isso e guardrail do modulo cart.
