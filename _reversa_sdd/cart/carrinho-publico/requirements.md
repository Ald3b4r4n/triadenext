# Cart / Carrinho Publico

> Spec executavel da subunidade `cart/carrinho-publico`. Foca no QUE a tela publica `/carrinho` deve garantir para visitantes, clientes autenticados, fallback sem banco, cupom, frete e entrada segura no checkout.

## Visao Geral

A tela publica de carrinho e a superficie onde o usuario revisa itens adicionados, altera quantidades, remove produtos, aplica cupom, cota frete manual e recebe o CTA correto para continuar a compra. Ela deve funcionar mesmo sem banco real em dev/test, exibindo fallback seguro, e nao deve permitir checkout direto sem itens e frete selecionado.

## Responsabilidades

- Renderizar `/carrinho` como pagina publica do storefront.
- Obter carrinho ativo via server action `getActiveCartAction`.
- Exibir estado vazio amigavel quando nao ha itens.
- Exibir mensagens de fallback, validacao ou indisponibilidade sem vazar detalhes tecnicos.
- Listar itens com nome, quantidade, preco unitario e subtotal.
- Permitir atualizar quantidade de item.
- Permitir remover item.
- Permitir limpar carrinho.
- Exibir resumo com subtotal, desconto, total parcial, frete e total com frete.
- Exibir e operar painel de cupom.
- Exibir e operar painel de frete manual.
- Bloquear checkout quando carrinho esta vazio ou sem frete.
- Direcionar visitante com carrinho valido para login com `returnTo=/checkout`.
- Direcionar usuario autenticado com carrinho valido para `/checkout`.

## Regras de Negocio

- 🟢 A pagina `/carrinho` deve carregar mesmo quando o carrinho retorna fallback.
- 🟢 Quando `getActiveCartAction` retorna erro, a UI deve montar carrinho `unavailable` com mensagem segura.
- 🟢 Carrinho vazio mostra "Nenhum item adicionado" e CTA para `/produtos`.
- 🟢 Itens exibidos usam snapshots de nome e preco existentes no carrinho.
- 🟢 Alterar quantidade deve passar por server action e validacao server-side.
- 🟢 Remover item deve passar por server action.
- 🟢 Limpar carrinho so deve aparecer quando existem itens.
- 🟢 O painel de cupom deve permitir aplicar codigo quando nao ha cupom.
- 🟢 O painel de cupom deve permitir remover cupom quando ha cupom aplicado.
- 🟢 O painel de frete deve permitir cotar CEP e selecionar/remover opcao.
- 🟢 Checkout deve ficar bloqueado enquanto nao houver itens e frete selecionado.
- 🟢 Visitante com itens e frete selecionado deve receber link `/login?returnTo=/checkout`.
- 🟢 Usuario autenticado com itens e frete selecionado deve receber link `/checkout`.
- 🟡 O texto informativo de checkout na UI ainda menciona "sem cartão, sem Stripe e sem pagamento real", o que pode estar defasado apos as fases de pagamento.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CART-PUB-01 | Renderizar pagina publica do carrinho. | Must | Acessar `/carrinho` exibe heading "Carrinho" e secao "Resumo". |
| RF-CART-PUB-02 | Carregar carrinho via action server-side. | Must | A pagina chama `getActiveCartAction` e entrega `CartView` para o componente de visualizacao. |
| RF-CART-PUB-03 | Exibir erro seguro. | Must | Falha da action gera carrinho indisponivel com mensagem amigavel, sem stack trace. |
| RF-CART-PUB-04 | Exibir estado vazio. | Must | Carrinho sem itens mostra "Carrinho vazio", "Nenhum item adicionado" e link "Ver produtos". |
| RF-CART-PUB-05 | Exibir mensagens do carrinho. | Must | Mensagens aparecem em bloco com `role="status"` e sao deduplicadas. |
| RF-CART-PUB-06 | Listar itens do carrinho. | Must | Cada item mostra nome snapshot, preco unitario, subtotal e controle de quantidade. |
| RF-CART-PUB-07 | Atualizar quantidade. | Must | Formulario envia `itemId` e `quantity` para action de update. |
| RF-CART-PUB-08 | Remover item. | Must | Botao acessivel remove item via server action. |
| RF-CART-PUB-09 | Limpar carrinho. | Should | Botao "Limpar carrinho" aparece apenas quando ha itens. |
| RF-CART-PUB-10 | Exibir resumo financeiro. | Must | Resumo mostra subtotal, desconto, total parcial, frete e total com frete. |
| RF-CART-PUB-11 | Aplicar/remover cupom. | Must | Painel de cupom aplica codigo ou remove cupom existente e atualiza pagina. |
| RF-CART-PUB-12 | Cotar frete. | Must | Painel de frete aceita CEP e retorna mensagem de cotacao calculada quando sucesso. |
| RF-CART-PUB-13 | Selecionar/remover frete. | Should | Opcoes de frete podem ser selecionadas e removidas. |
| RF-CART-PUB-14 | Bloquear checkout incompleto. | Must | Sem itens ou sem frete, CTA de checkout fica desabilitado como "Selecione itens e frete". |
| RF-CART-PUB-15 | Direcionar guest para login. | Must | Guest com itens e frete ve link "Entrar para checkout" para `/login?returnTo=/checkout`. |
| RF-CART-PUB-16 | Direcionar autenticado para checkout. | Must | Usuario autenticado com itens e frete ve link "Iniciar checkout" para `/checkout`. |
| RF-CART-PUB-17 | Funcionar sem banco real em dev/test. | Must | Em fallback, pagina carrega e exibe texto contendo `dev/fixture`. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Erros de carrinho sao convertidos em mensagem segura. | `src/app/(storefront)/carrinho/page.tsx` | 🟢 |
| Acessibilidade | Blocos de status usam `role="status"` e botoes possuem labels. | `cart-view.tsx`, `cart-coupon-panel.tsx`, `shipping-quote-panel.tsx` | 🟢 |
| Resiliencia | Pagina carrega sem banco real em fallback. | `src/tests/e2e/cart.spec.ts` | 🟢 |
| Consistencia | Mutacoes passam por server actions e revalidam `/carrinho`. | `cart-actions.ts` | 🟢 |
| UX | Estado vazio guia usuario para catalogo. | `cart-view.tsx` | 🟢 |
| Integridade | Checkout nao aparece como link direto sem frete. | `cart-view.tsx` | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: visitante abre carrinho vazio em fallback
  Dado ambiente dev/test sem DATABASE_URL
  Quando acessa "/carrinho"
  Entao ve heading "Carrinho"
  E ve heading "Resumo"
  E ve "Nenhum item adicionado"
  E ve mensagem contendo "dev/fixture"
  E ve link "Ver produtos"

Cenario: visitante adiciona produto e cota frete
  Dado produto publicado de exemplo disponivel
  Quando adiciona o produto ao carrinho
  E acessa "/carrinho"
  E preenche CEP "01001-000"
  E clica "Cotar"
  Entao ve "Cotacao de frete calculada."
  E ve "Produto publicado de exemplo"
  E ve "Subtotal do item: R$ 159,90"
  E ve link "Entrar para checkout"

Cenario: carrinho sem item ou frete nao inicia checkout
  Dado carrinho vazio ou sem cotacao de frete
  Quando a pagina renderiza resumo
  Entao o CTA "Selecione itens e frete" esta desabilitado

Cenario: falha segura ao obter carrinho
  Dado `getActiveCartAction` retorna erro
  Quando a pagina renderiza
  Entao mostra mensagem amigavel
  E nao exibe stack trace
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Renderizar `/carrinho` com estado vazio e resumo | Must | Superficie essencial da compra. |
| Listar e manipular itens | Must | Sem isso nao ha jornada de carrinho. |
| Cupom e frete no carrinho | Must | Checkout atual depende de frete selecionado e totais consistentes. |
| Gate de checkout | Must | Evita fluxo invalido para pedido/pagamento. |
| Fallback dev/test | Must | Permite desenvolvimento seguro sem banco real. |
| Remover frete selecionado | Should | Melhora UX, mas cotar novamente cobre parte do fluxo. |
| Melhorar copy defasada de pagamento | Should | Nao quebra regra de negocio, mas reduz confusao apos Fase 9. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/app/(storefront)/carrinho/page.tsx` | `CarrinhoPage` | 🟢 |
| `src/features/cart/server/cart-actions.ts` | `getActiveCartAction`, actions de item/cupom/frete | 🟢 |
| `src/features/cart/components/cart-view.tsx` | `CartView` | 🟢 |
| `src/features/cart/components/cart-coupon-panel.tsx` | `CartCouponPanel` | 🟢 |
| `src/features/shipping/components/shipping-quote-panel.tsx` | `ShippingQuotePanel` | 🟢 |
| `src/tests/e2e/cart.spec.ts` | cenarios publicos de carrinho/fallback | 🟢 |

## Lacunas e Riscos

- 🟡 Copy do resumo diz que checkout cria pedido sem cartao/Stripe/pagamento real; isso pode estar obsoleto apos a implementacao de pagamento.
- 🟡 A UI nao exibe imagem do item no carrinho, embora o modelo de item possa carregar imagem em outras superficies.
- 🟡 Quantidade maxima e validada no servidor; o input numerico nao necessariamente conhece o estoque atual como `max`.
- 🟡 O fallback em memoria pode manter estado entre cenarios se o processo de teste nao for isolado.
- 🔴 Nao ha reserva de estoque no carrinho; a validacao final precisa continuar acontecendo no checkout/settlement.
