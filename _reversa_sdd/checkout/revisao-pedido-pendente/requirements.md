# Checkout / Revisao e Pedido Pendente

> Spec executavel da subunidade `checkout/revisao-pedido-pendente`.
> Foca no QUE a revisao de checkout e a visualizacao do pedido pendente devem garantir antes do pagamento.

## Visao Geral

A revisao de checkout e a tela onde o customer autenticado confirma itens, totais, frete, cupom e dados de entrega antes de criar um pedido pendente. Apos a criacao, `/checkout?pedido=<id>` exibe o resumo do pedido aguardando pagamento, desde que o pedido pertenca ao customer autenticado.

Esta subunidade nao executa pagamento. Ela prepara um pedido pendente seguro, com snapshots server-side, e orienta o cliente a continuar o pagamento pela area de pedidos/pagamento.

## Responsabilidades

- Exibir bloqueio de autenticação quando o usuario nao estiver logado.
- Exibir revisao do carrinho quando o customer possui carrinho valido.
- Exibir bloqueio amigavel quando o carrinho nao esta elegivel para checkout.
- Mostrar itens, quantidades, precos e subtotais na revisao.
- Mostrar resumo financeiro com subtotal, desconto, frete e total.
- Mostrar cupom aplicado e frete selecionado.
- Coletar dados de cliente e entrega.
- Criar pedido pendente a partir do carrinho valido.
- Redirecionar para `/checkout?pedido=<id>` apos sucesso.
- Exibir pedido pendente quando `pedido` pertence ao customer atual.
- Bloquear acesso a pedido de outro customer.
- Manter mensagem clara de que cartao/pagamento nao sao tratados neste formulario.
- Preservar separacao entre pedido pendente e pagamento.

## Fora de Escopo

- Renderizar Payment Element.
- Criar PaymentIntent.
- Confirmar pagamento Stripe.
- Processar webhook.
- Baixar estoque.
- Consumir cupom.
- Enviar notificacao de pagamento.
- Administrar pedidos.
- Alterar status para pago.
- Rodar migrations.
- Conectar banco real de producao.
- Alterar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Guest | Visitante sem sessao. | Ve orientacao de login/cadastro; nao ve formulario de checkout. |
| Customer | Usuario autenticado. | Pode revisar o proprio carrinho e ver seus pedidos pendentes. |
| Outro customer | Usuario autenticado tentando acessar pedido alheio. | Deve receber `not_found`/mensagem segura. |
| Sistema | Services/actions/repositories. | Valida carrinho, cria pedido e resolve ownership. |
| Payment | Modulo posterior de pagamento. | Fora da revisao; e acionado pela area de pedidos/pagamento. |

## Regras de Negocio

- 🟢 `/checkout` sem `pedido` deve iniciar review do carrinho ativo.
- 🟢 `/checkout?pedido=<id>` deve priorizar leitura do pedido pendente solicitado.
- 🟢 Pedido em query string so pode ser exibido ao customer dono.
- 🟢 Pedido inexistente ou de outro customer nao deve vazar existencia.
- 🟢 Guest nao ve revisao de carrinho nem formulario de entrega.
- 🟢 Guest recebe links de login e cadastro com `returnTo=/checkout`.
- 🟢 Customer com carrinho invalido ve mensagem para voltar ao carrinho.
- 🟢 Customer com carrinho valido ve itens, formulario e resumo.
- 🟢 Revisao deve usar dados server-side, nao totais enviados pelo cliente.
- 🟢 Formulario de entrega deve exigir campos obrigatorios definidos no schema.
- 🟢 Criacao de pedido pendente deve redirecionar para `?pedido=<id>`.
- 🟢 Tela de pedido criado deve mostrar resumo e itens do pedido.
- 🟢 Tela de pedido criado deve orientar pagamento pela area de pedidos.
- 🟢 Dados de cartao nao sao coletados nesta tela.
- 🟢 Criar pedido pendente nao confirma pagamento.
- 🟢 Criar pedido pendente nao baixa estoque nem consome cupom.
- 🟡 Texto da UI deve permanecer alinhado com a existencia posterior de Stripe/pagamento.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CHECKOUT-REVIEW-01 | Ler parametro `pedido`. | Must | Se `pedido` existir, a pagina tenta carregar pedido antes de revisar carrinho. |
| RF-CHECKOUT-REVIEW-02 | Exibir pedido pendente do customer. | Must | Pedido pertencente ao usuario autenticado exibe resumo e itens. |
| RF-CHECKOUT-REVIEW-03 | Nao vazar pedido alheio. | Must | Pedido inexistente ou de outro customer nao exibe dados sensiveis. |
| RF-CHECKOUT-REVIEW-04 | Bloquear guest. | Must | Usuario sem sessao ve "Entre para continuar" e links de login/cadastro. |
| RF-CHECKOUT-REVIEW-05 | Revisar carrinho valido. | Must | Customer com carrinho elegivel ve itens, formulario e resumo. |
| RF-CHECKOUT-REVIEW-06 | Bloquear carrinho invalido. | Must | Carrinho vazio/inativo/sem frete/produto invalido mostra mensagem e link para `/carrinho`. |
| RF-CHECKOUT-REVIEW-07 | Listar itens na revisao. | Must | Cada item mostra nome snapshot, quantidade, unitario e subtotal. |
| RF-CHECKOUT-REVIEW-08 | Renderizar formulario de entrega. | Must | Formulario contem nome, telefone, destinatario, CEP, UF, cidade, bairro, rua, numero e complemento. |
| RF-CHECKOUT-REVIEW-09 | Preencher CEP com frete selecionado. | Should | Campo CEP usa `cart.shippingPostalCode` como valor inicial quando existir. |
| RF-CHECKOUT-REVIEW-10 | Mostrar resumo financeiro. | Must | Resumo exibe subtotal, desconto, frete e total com frete. |
| RF-CHECKOUT-REVIEW-11 | Mostrar cupom e frete selecionado. | Should | Resumo informa codigo do cupom e label da opcao de frete. |
| RF-CHECKOUT-REVIEW-12 | Criar pedido pendente. | Must | Submit valido chama action e gera pedido `aguardando_pagamento`. |
| RF-CHECKOUT-REVIEW-13 | Redirecionar apos criacao. | Must | Sucesso redireciona para `/checkout?pedido=<id>`. |
| RF-CHECKOUT-REVIEW-14 | Exibir estado pedido criado. | Must | Tela com `pedido` mostra "Pedido criado" e resumo. |
| RF-CHECKOUT-REVIEW-15 | Orientar pagamento posterior. | Must | Tela informa que pagamento continua pela area de pedidos/pagamento. |
| RF-CHECKOUT-REVIEW-16 | Nao coletar cartao. | Must | Formulario nao possui campos de cartao e informa isso ao usuario. |
| RF-CHECKOUT-REVIEW-17 | Revalidar caminhos apos pedido. | Should | Carrinho, checkout, pedidos e admin/pedidos sao revalidados. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Seguranca | Pedido em query string respeita ownership. | `getCustomerPendingOrderAction`. | 🟢 |
| Privacidade | Pedido alheio nao vaza existencia nem detalhes. | Retorno `not_found` com mensagem generica. | 🟢 |
| Integridade | Revisao depende de carrinho recalculado. | `reviewPendingCheckoutAction`. | 🟢 |
| UX | Guest recebe caminhos claros para login/cadastro. | Links com `returnTo=/checkout`. | 🟢 |
| Acessibilidade | Formularios usam labels e botoes nativos. | `checkout/page.tsx`. | 🟡 |
| Separacao de responsabilidades | Pagamento nao acontece no formulario de checkout. | Copy e ausencia de Payment Element. | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: guest acessa checkout
  Dado visitante sem sessao
  Quando acessa "/checkout"
  Entao ve "Entre para continuar"
  E ve link para login com returnTo=/checkout
  E nao ve formulario de entrega

Cenario: customer revisa carrinho valido
  Dado customer autenticado
  E carrinho ativo com produto e frete valido
  Quando acessa "/checkout"
  Entao ve "Revisao do pedido"
  E ve os itens do carrinho
  E ve formulario "Cliente e entrega"
  E ve resumo financeiro

Cenario: carrinho invalido
  Dado customer autenticado com carrinho vazio
  Quando acessa "/checkout"
  Entao ve "Revise o carrinho"
  E ve link para "/carrinho"
  E nao ve botao de criar pedido

Cenario: pedido criado
  Dado customer autenticado com carrinho valido
  Quando envia formulario valido
  Entao sistema cria pedido pendente
  E redireciona para "/checkout?pedido=<id>"
  E mostra "Pedido criado"

Cenario: pedido de outro customer
  Dado customer A autenticado
  E pedido pertence ao customer B
  Quando customer A acessa "/checkout?pedido=<id>"
  Entao dados do pedido nao sao exibidos
  E o fluxo volta para review ou mensagem segura

Cenario: checkout nao coleta cartao
  Dado customer autenticado no checkout
  Quando visualiza formulario
  Entao nao ha campos de cartao
  E ha texto informando que dados de cartao nao sao coletados ali
```

## Contratos de Entrada

| Campo | Origem | Regra |
|-------|--------|-------|
| `pedido` | Query string | Opcional; quando presente, deve ser resolvido por action customer-scoped. |
| `fullName` | Formulario | Obrigatorio para criar pedido pendente. |
| `phone` | Formulario | Obrigatorio para criar pedido pendente. |
| `recipient` | Formulario | Opcional. |
| `postalCode` | Formulario | Obrigatorio e deve bater com frete selecionado. |
| `state` | Formulario | Obrigatorio, UF. |
| `city` | Formulario | Obrigatorio. |
| `district` | Formulario | Obrigatorio. |
| `street` | Formulario | Obrigatorio. |
| `number` | Formulario | Obrigatorio. |
| `complement` | Formulario | Opcional. |

## Contratos de Saida

| Estado | Quando ocorre | UI |
|--------|---------------|----|
| `pedido_created` | `pedido` valido pertence ao customer. | Resumo de pedido e itens. |
| `unauthenticated` | Sem sessao. | Login/cadastro. |
| `review_success` | Carrinho valido. | Itens, formulario e resumo. |
| `review_blocked` | Carrinho invalido. | Mensagem e link para carrinho. |
| `create_success` | Pedido criado. | Redirect para `?pedido=<id>`. |
| `create_error` | Formulario/carrinho invalido. | Mensagem amigavel. |

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/app/(storefront)/checkout/page.tsx` | Estados de checkout, formulario e pedido criado. |
| `src/features/checkout/server/checkout-actions.ts` | Review, criacao e redirect. |
| `src/features/checkout/server/checkout-service.ts` | Validacao e criacao de pedido pendente. |
| `src/features/orders/server/order-actions.ts` | Leitura customer-scoped de pedido pendente. |
| `src/features/orders/components/order-summary.tsx` | Resumo e itens do pedido criado. |
| `src/features/orders/domain.ts` | Snapshots e expiracao do pedido. |
| `src/features/orders/schemas.ts` | Schema do formulario. |
| `src/tests/e2e/checkout-no-payment.spec.ts` | E2E de checkout sem coleta de pagamento. |
| `src/tests/unit/checkout-actions.test.ts` | Actions e validacao de payload. |
| `src/tests/unit/checkout-service.test.ts` | Regras de service e snapshots. |

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Bloquear guest | Must | Checkout exige customer. |
| Review de carrinho valido | Must | Usuario precisa confirmar compra antes do pedido. |
| Bloquear carrinho invalido | Must | Evita pedido quebrado. |
| Criar pedido pendente | Must | Saida principal da revisao. |
| Ownership de `?pedido=` | Must | Evita vazamento de pedido. |
| Redirecionar para pedido criado | Should | Melhora clareza pos-submit. |
| Mostrar label de frete/cupom | Should | Ajuda UX, mas nao muda regra financeira. |

## Lacunas e Riscos

- 🟡 Se a copy sobre pagamento ficar defasada, o usuario pode achar que nao existe Stripe.
- 🟡 Pedido pendente criado precisa de fluxo claro para chegar ao pagamento.
- 🟡 Pedido expirado precisa ser tratado pela area de pedidos/pagamento.
- 🔴 Exibir pedido de outro customer seria vazamento critico.
- 🔴 Criar pedido sem frete/produto validos quebraria pagamento posterior.

## Guardrails

- Nao coletar cartao nesta tela.
- Nao iniciar pagamento automaticamente.
- Nao expor pedido de outro customer.
- Nao aceitar totals do cliente.
- Nao baixar estoque.
- Nao consumir cupom.
- Nao conectar banco de producao.
- Nao rodar migrations.
- Nao alterar Laravel legado.

## Definition of Done

- Guest e direcionado para login/cadastro.
- Customer com carrinho valido ve revisao completa.
- Carrinho invalido bloqueia criacao de pedido.
- Submit valido cria pedido pendente e redireciona.
- `?pedido=` exibe apenas pedido do customer dono.
- Tela nao coleta cartao e orienta pagamento posterior.
