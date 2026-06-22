# Checkout

> Spec executavel da unit `checkout`.
> Foca no QUE o checkout deve garantir ao transformar um carrinho valido em pedido pendente, sem coletar dados de cartao no formulario.

## Visao Geral

A unit `checkout` e a fronteira entre carrinho ativo e pedido pendente. Ela exige usuario autenticado, valida novamente itens, estoque, cupom e frete no servidor, coleta dados de cliente/entrega, cria snapshots imutaveis e gera um pedido inicial com status `aguardando_pagamento`.

O checkout nao deve confiar em totais enviados pelo cliente. Totais, desconto, frete, itens, cliente e endereco sao derivados server-side a partir do carrinho ativo, da sessao autenticada e do formulario validado. A etapa de pagamento acontece depois, na area de pedidos/pagamento.

## Responsabilidades

- Renderizar `/checkout` como etapa autenticada do storefront.
- Bloquear visitantes e orientar login/cadastro com `returnTo=/checkout`.
- Revisar carrinho ativo antes de exibir formulario.
- Bloquear checkout de carrinho vazio.
- Bloquear checkout de carrinho convertido ou inativo.
- Validar que produtos continuam publicados, ativos, compraveis e com estoque.
- Revalidar cupom aplicado contra subtotal atual.
- Exigir frete selecionado e quote valida.
- Bloquear quote expirada.
- Bloquear quote pertencente a outro carrinho.
- Coletar dados de cliente e entrega.
- Validar formulario de checkout via schema server-side.
- Garantir que CEP do endereco corresponda ao CEP da cotacao de frete.
- Criar snapshots de cliente, endereco, itens, cupom e frete.
- Criar pedido pendente com status inicial `aguardando_pagamento`.
- Definir expiracao do pedido em 60 minutos.
- Marcar carrinho como convertido apos criar pedido.
- Revalidar carrinho, checkout, pedidos e admin de pedidos apos sucesso.
- Redirecionar para `/checkout?pedido=<id>` apos criar pedido.
- Exibir resumo de pedido pendente quando `pedido` estiver presente e pertencer ao cliente.

## Fora de Escopo

- Coletar dados de cartao no formulario de checkout.
- Confirmar pagamento.
- Capturar pagamento Stripe.
- Processar webhook Stripe.
- Baixar estoque na criacao do pedido pendente.
- Consumir contador de cupom na criacao do pedido pendente.
- Enviar e-mail de pos-pagamento.
- Gerar nota fiscal.
- Contratar etiqueta de envio.
- Rodar migrations.
- Conectar banco de producao durante validacao documental.
- Alterar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Guest | Visitante sem sessao autenticada. | Nao pode iniciar checkout; deve ser direcionado para login/cadastro. |
| Customer | Usuario autenticado com carrinho ativo. | Pode revisar checkout e criar pedido pendente do proprio carrinho. |
| Admin | Usuario administrativo. | Nao participa do checkout publico; visualiza pedidos em area admin. |
| Sistema | Services/repositories/actions. | Valida carrinho, cria snapshots, persiste pedido e converte carrinho. |
| Payment | Modulo de pagamentos. | Recebe pedido pendente posteriormente, fora desta unit. |

## Regras de Negocio

- 🟢 Checkout exige sessao autenticada.
- 🟢 Usuario nao autenticado recebe status `unauthenticated` e links para login/cadastro.
- 🟢 Checkout deve revisar carrinho server-side antes de renderizar formulario.
- 🟢 Carrinho vazio nao pode iniciar checkout.
- 🟢 Carrinho convertido, bloqueado ou nao ativo nao pode iniciar checkout.
- 🟢 Cada item do carrinho deve referenciar produto compravel no momento do checkout.
- 🟢 Produto indisponivel deve bloquear checkout com mensagem segura.
- 🟢 Quantidade deve ser validada contra estoque atual.
- 🟢 Cupom aplicado deve ser revalidado contra subtotal atual.
- 🟢 Cupom invalido deve bloquear checkout.
- 🟢 Frete selecionado e obrigatorio.
- 🟢 Quote de frete deve existir.
- 🟢 Quote de frete deve pertencer ao carrinho atual.
- 🟢 Quote de frete expirada deve bloquear checkout.
- 🟢 CEP do endereco deve bater com CEP da cotacao de frete selecionada.
- 🟢 Formulario nao pode aceitar totais, owner, role, cartId ou campos financeiros do cliente.
- 🟢 Pedido pendente deve usar snapshots server-side.
- 🟢 Pedido pendente inicia com status `aguardando_pagamento`.
- 🟢 Pedido pendente expira 60 minutos apos criacao.
- 🟢 Criar pedido pendente nao decrementa estoque.
- 🟢 Criar pedido pendente nao consome `usedCount` de cupom.
- 🟢 Carrinho deve ser marcado como convertido apos pedido criado.
- 🟢 Dados de cartao nao sao coletados no checkout.
- 🟡 Resultado `fallback` pode existir em dev/test sem banco real, com mensagem explicita.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CHECKOUT-01 | Renderizar `/checkout`. | Must | Rota exibe revisao de pedido para customer autenticado com carrinho valido. |
| RF-CHECKOUT-02 | Bloquear visitante. | Must | Sem sessao, exibe "Entre para continuar" e links para login/cadastro com `returnTo=/checkout`. |
| RF-CHECKOUT-03 | Revisar carrinho ativo. | Must | Antes do formulario, service recalcula carrinho atual server-side. |
| RF-CHECKOUT-04 | Bloquear carrinho vazio. | Must | Retorna mensagem "Carrinho vazio nao pode iniciar checkout." ou equivalente. |
| RF-CHECKOUT-05 | Bloquear carrinho inativo. | Must | Carrinho convertido ou bloqueado nao inicia novo checkout. |
| RF-CHECKOUT-06 | Revalidar produto compravel. | Must | Draft, inativo, futuro, sem estoque ou inexistente bloqueia checkout. |
| RF-CHECKOUT-07 | Revalidar estoque. | Must | Quantidade maior que estoque atual retorna erro. |
| RF-CHECKOUT-08 | Revalidar cupom. | Must | Cupom esgotado, expirado ou inelegivel bloqueia checkout. |
| RF-CHECKOUT-09 | Exigir frete selecionado. | Must | Sem quote/opcao selecionada, retorna "Selecione um frete valido antes do checkout.". |
| RF-CHECKOUT-10 | Bloquear quote expirada. | Must | Quote vencida retorna "Cotacao de frete expirada. Recalcule o frete.". |
| RF-CHECKOUT-11 | Bloquear quote de outro carrinho. | Must | Quote com `cartId` divergente bloqueia checkout. |
| RF-CHECKOUT-12 | Renderizar formulario de entrega. | Must | Exibe nome, telefone, destinatario, CEP, UF, cidade, bairro, logradouro, numero e complemento. |
| RF-CHECKOUT-13 | Validar formulario no servidor. | Must | Schema rejeita dados obrigatorios ausentes ou invalidos. |
| RF-CHECKOUT-14 | Validar CEP do endereco contra frete. | Must | CEP divergente da quote bloqueia criacao do pedido. |
| RF-CHECKOUT-15 | Ignorar campos financeiros enviados pelo cliente. | Must | Totais do pedido sao derivados do carrinho recalculado. |
| RF-CHECKOUT-16 | Criar snapshots de pedido. | Must | Pedido salva snapshots de itens, cliente, endereco, frete e cupom. |
| RF-CHECKOUT-17 | Criar pedido pendente. | Must | Pedido e criado com status `aguardando_pagamento`. |
| RF-CHECKOUT-18 | Definir expiracao de pedido. | Must | `expiresAt` fica 60 minutos apos `createdAt`. |
| RF-CHECKOUT-19 | Converter carrinho apos pedido. | Must | Carrinho usado nao permanece ativo para nova compra. |
| RF-CHECKOUT-20 | Redirecionar apos sucesso. | Should | Sucesso redireciona para `/checkout?pedido=<id>`. |
| RF-CHECKOUT-21 | Exibir pedido pendente. | Should | `/checkout?pedido=<id>` mostra resumo quando pedido pertence ao customer. |
| RF-CHECKOUT-22 | Revalidar caminhos relacionados. | Should | `/carrinho`, `/checkout`, `/pedidos` e `/admin/pedidos` sao revalidados. |
| RF-CHECKOUT-23 | Nao coletar cartao. | Must | Formulario informa que dados de cartao nao sao coletados ali. |
| RF-CHECKOUT-24 | Suportar fallback dev/test. | Should | Em dev/test sem banco real, resultado pode ser `fallback` explicito. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Seguranca | Checkout exige sessao autenticada. | `reviewPendingCheckout` e `createPendingCheckoutOrder`. | 🟢 |
| Integridade | Totais sao recalculados server-side. | Cliente nao envia subtotal/discount/shipping/grand total. | 🟢 |
| Consistencia | Estoque e produto sao revalidados antes do pedido. | `validatePurchasableProduct` e `validateQuantityForStock`. | 🟢 |
| Financeiro | Cupom e frete sao snapshots, nao entradas livres do cliente. | Builders de snapshot em `orders/domain`. | 🟢 |
| Resiliencia | Sem banco em dev/test pode gerar fallback explicito. | Resultado `fallback`/`dev_fallback`. | 🟡 |
| UX | Visitante recebe caminho claro para login/cadastro. | Links com `returnTo=/checkout`. | 🟢 |
| Privacidade | Erros nao vazam stack, SQL ou secrets. | Services/actions retornam mensagens controladas. | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: visitante tenta abrir checkout
  Dado usuario sem sessao autenticada
  Quando acessa "/checkout"
  Entao ve mensagem para entrar
  E ve link para "/login?returnTo=/checkout"
  E ve link para "/cadastro?returnTo=/checkout"

Cenario: customer abre checkout com carrinho valido
  Dado usuario autenticado
  E carrinho ativo com item compravel
  E frete selecionado valido
  Quando acessa "/checkout"
  Entao ve revisao do pedido
  E ve formulario de cliente e entrega
  E ve resumo com subtotal, desconto, frete e total

Cenario: carrinho vazio bloqueia checkout
  Dado usuario autenticado com carrinho vazio
  Quando acessa "/checkout"
  Entao ve mensagem para revisar o carrinho
  E nao ve formulario de criacao de pedido

Cenario: criar pedido pendente
  Dado customer autenticado com carrinho valido
  Quando envia dados validos de entrega
  Entao pedido e criado com status "aguardando_pagamento"
  E pedido expira em 60 minutos
  E carrinho e marcado como convertido
  E usuario e redirecionado para "/checkout?pedido=<id>"

Cenario: payload malicioso tenta alterar totais
  Dado customer autenticado com carrinho valido
  Quando envia subtotal, userId, role ou cartId no payload
  Entao esses campos sao ignorados
  E pedido usa dados derivados do carrinho e sessao

Cenario: CEP divergente
  Dado carrinho com frete cotado para "01001000"
  Quando usuario envia endereco com outro CEP
  Entao pedido nao e criado
  E sistema pede CEP igual ao da cotacao

Cenario: quote expirada
  Dado carrinho com quote de frete expirada
  Quando usuario tenta checkout
  Entao sistema bloqueia criacao de pedido
  E pede nova cotacao de frete
```

## Contratos de Entrada

| Campo | Origem | Regra |
|-------|--------|-------|
| `fullName` | Formulario checkout | Obrigatorio, minimo definido no schema. |
| `phone` | Formulario checkout | Obrigatorio, minimo definido no schema. |
| `recipient` | Formulario checkout | Opcional. |
| `postalCode` | Formulario checkout | Obrigatorio, normalizado e comparado ao CEP do frete. |
| `state` | Formulario checkout | Obrigatorio, UF com ate 2 caracteres. |
| `city` | Formulario checkout | Obrigatorio. |
| `district` | Formulario checkout | Obrigatorio. |
| `street` | Formulario checkout | Obrigatorio. |
| `number` | Formulario checkout | Obrigatorio. |
| `complement` | Formulario checkout | Opcional. |
| sessao autenticada | Auth | Deve fornecer `userId`, `email` e role. |
| carrinho ativo | Cart | Deve possuir item e frete selecionado valido. |

## Contratos de Saida

| Resultado | Quando ocorre | Saida esperada |
|-----------|---------------|----------------|
| `success` | Pedido persistido em storage real. | Pedido pendente, mensagem e `orderId`. |
| `fallback` | Pedido criado em fallback dev/test. | Pedido pendente e mensagem explicita. |
| `unauthenticated` | Sem sessao autenticada. | Mensagem de login/cadastro. |
| `validation_error` | Carrinho/formulario/frete/cupom/produto invalido. | Mensagem amigavel. |
| `forbidden` | Carrinho nao pertence ao usuario. | Mensagem segura. |
| `unavailable` | Ambiente ou repository indisponivel. | Mensagem controlada. |

## Snapshots Obrigatorios

- Customer snapshot:
  - nome completo;
  - e-mail da sessao;
  - telefone.
- Address snapshot:
  - CEP normalizado;
  - UF;
  - cidade;
  - bairro;
  - logradouro;
  - numero;
  - complemento;
  - destinatario quando informado.
- Item snapshot:
  - productId;
  - nome;
  - quantidade;
  - preco unitario;
  - subtotal do item.
- Shipping snapshot:
  - quoteId;
  - optionId;
  - label;
  - valor original;
  - valor efetivo;
  - prazo;
  - source seguro.
- Coupon snapshot:
  - codigo;
  - tipo;
  - desconto aplicado;
  - frete gratis quando aplicavel.

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/app/(storefront)/checkout/page.tsx` | UI de revisao, formulario e resumo de pedido pendente. |
| `src/features/checkout/server/checkout-actions.ts` | Actions de review/criacao e redirect. |
| `src/features/checkout/server/checkout-service.ts` | Validacao server-side e criacao de pedido pendente. |
| `src/features/orders/schemas.ts` | Schema do formulario de checkout. |
| `src/features/orders/domain.ts` | Builders de snapshots, status e expiracao. |
| `src/features/orders/server/order-repository.ts` | Persistencia de pedido pendente. |
| `src/features/cart/server/cart-service.ts` | Recalculo server-side do carrinho. |
| `src/features/cart/server/cart-repository.ts` | Carrinho ativo e conversao. |
| `src/features/products/server/product-repository.ts` | Revalidacao de produto/estoque. |
| `src/features/coupons/server/coupon-service.ts` | Revalidacao de cupom aplicado. |
| `src/features/shipping/domain` | Expiracao de quote e CEP. |
| `src/tests/unit/checkout-service.test.ts` | Cobertura de bloqueios e criacao de pedido. |
| `src/tests/e2e/checkout-no-payment.spec.ts` | Fluxo E2E sem coleta de cartao. |

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Autenticacao obrigatoria | Must | Pedido precisa de customer dono. |
| Validar carrinho/produtos/estoque | Must | Evita pedido com item invalido. |
| Exigir frete valido | Must | Total e entrega dependem de snapshot de frete. |
| Criar pedido pendente | Must | E a saida principal do checkout. |
| Ignorar totais enviados pelo cliente | Must | Protecao financeira. |
| Redirecionar para pedido pendente | Should | Melhora UX pos-criacao. |
| Fallback dev/test | Should | Ajuda desenvolvimento sem banco real. |

## Lacunas e Riscos

- 🟡 Checkout nao reserva estoque; validacao precisa repetir em pagamento/settlement.
- 🟡 Pedido pendente expira em 60 minutos, mas a politica de limpeza/expiracao operacional precisa ser garantida por fluxo proprio.
- 🟡 Texto da UI precisa permanecer alinhado com a fase atual de pagamento Stripe.
- 🟡 Fallback dev/test nao deve ser confundido com pedido real.
- 🔴 Confiar em totais do cliente permitiria manipulacao financeira.
- 🔴 Criar pedido sem frete valido quebraria checkout/pagamento.
- 🔴 Criar pedido sem ownership de usuario permitiria exposicao ou tomada de pedido.

## Guardrails

- Nao coletar dados de cartao no checkout.
- Nao iniciar pagamento automaticamente ao criar pedido pendente.
- Nao baixar estoque na criacao do pedido pendente.
- Nao consumir cupom na criacao do pedido pendente.
- Nao aceitar totais enviados pelo cliente.
- Nao conectar banco de producao durante validacao documental.
- Nao rodar migrations.
- Nao copiar `.env`.
- Nao expor secrets.
- Nao alterar Laravel legado.

## Definition of Done

- Visitante e bloqueado com caminho claro para login/cadastro.
- Customer com carrinho valido ve revisao e formulario.
- Carrinho invalido bloqueia checkout com mensagem segura.
- Produtos, estoque, cupom e frete sao revalidados server-side.
- CEP do endereco e consistente com frete selecionado.
- Pedido pendente e criado com snapshots server-side.
- Pedido inicia em `aguardando_pagamento` e expira em 60 minutos.
- Carrinho e convertido apos pedido.
- Nenhum dado de cartao e coletado no formulario.
