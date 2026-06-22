# Checkout / Snapshots e Validacao

> Spec executavel da subunidade `checkout/snapshots-validacao`.
> Foca no QUE deve ser revalidado server-side e no QUE deve ser congelado como snapshot ao criar pedido pendente.

## Visao Geral

Snapshots sao a fronteira entre o carrinho mutavel e o pedido pendente. Antes de criar o pedido, o checkout revalida sessao, carrinho, produto, estoque, cupom, frete e formulario. Depois disso, cria snapshots de cliente, endereco, itens, cupom e frete para preservar a decisao comercial daquele momento.

Esta subunidade protege o sistema contra payload manipulado, totais client-side, produto stale, estoque insuficiente, cupom invalido, frete vencido e pedido sem ownership correto.

## Responsabilidades

- Revalidar carrinho ativo no servidor.
- Revalidar produto atual de cada item.
- Revalidar quantidade contra estoque atual.
- Revalidar cupom aplicado contra subtotal atual.
- Revalidar quote de frete selecionada.
- Revalidar ownership do carrinho.
- Validar formulario por schema allowlist.
- Ignorar campos financeiros/ownership vindos do cliente.
- Normalizar e comparar CEP de entrega com CEP da quote.
- Criar snapshot de cliente.
- Criar snapshot de endereco.
- Criar snapshot de cupom.
- Criar snapshot de frete.
- Criar snapshots de itens.
- Criar draft de pedido pendente com totais server-side.
- Definir status e expiracao do pedido.

## Fora de Escopo

- Reservar estoque.
- Baixar estoque.
- Consumir cupom.
- Confirmar pagamento.
- Criar PaymentIntent.
- Processar webhook Stripe.
- Enviar notificacao de pagamento.
- Gerar nota fiscal.
- Recalcular snapshots depois que pedido foi criado.
- Alterar Laravel legado.

## Regras de Negocio

- 🟢 Snapshot deve ser gerado apenas apos carrinho validado.
- 🟢 Pedido pendente deve usar `userId` da sessao autenticada.
- 🟢 Customer snapshot deve usar e-mail da sessao.
- 🟢 Address snapshot deve normalizar CEP e UF.
- 🟢 Address snapshot deve assumir `country = BR`.
- 🟢 Destinatario vazio deve cair para nome completo.
- 🟢 Item snapshot deve preservar nome, SKU, slug, imagem, preco unitario, quantidade e total de linha.
- 🟢 Item snapshot pode enriquecer dados com produto atual, mas nao recalcular preco enviado pelo cliente.
- 🟢 Coupon snapshot deve copiar codigo, tipo, valor e desconto aplicado.
- 🟢 Coupon snapshot deve registrar `usedCountAtCheckout`.
- 🟢 Criar pedido pendente nao incrementa `usedCount`.
- 🟢 Shipping snapshot deve copiar quote, option, provider, source, label, prazo e valores.
- 🟢 Shipping snapshot deve preservar valor original e valor efetivo.
- 🟢 `freeShippingApplied` deve refletir quando cupom zerou frete elegivel.
- 🟢 Totais do pedido devem vir do carrinho recalculado.
- 🟢 Moeda do pedido pendente deve ser `BRL`.
- 🟢 Status inicial deve ser `aguardando_pagamento`.
- 🟢 Expiracao deve ser 60 minutos apos criacao.
- 🟢 Campos como `subtotalCents`, `userId`, `role` e `cartId` enviados pelo cliente devem ser ignorados.
- 🟡 Sem reserva de estoque, validação de estoque precisa repetir no pagamento/settlement.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CHECKOUT-SNAP-01 | Recalcular carrinho antes do snapshot. | Must | Pedido usa `recalculateCartView`, nao payload do cliente. |
| RF-CHECKOUT-SNAP-02 | Revalidar produtos. | Must | Cada item e conferido no product repository. |
| RF-CHECKOUT-SNAP-03 | Revalidar estoque. | Must | Quantidade acima do estoque bloqueia pedido. |
| RF-CHECKOUT-SNAP-04 | Revalidar cupom. | Must | Cupom invalido bloqueia pedido. |
| RF-CHECKOUT-SNAP-05 | Revalidar frete. | Must | Quote ausente, expirada ou de outro carrinho bloqueia pedido. |
| RF-CHECKOUT-SNAP-06 | Validar ownership do carrinho. | Must | Carrinho precisa pertencer ao user da sessao. |
| RF-CHECKOUT-SNAP-07 | Validar schema allowlist. | Must | Apenas campos do formulario de entrega entram no input. |
| RF-CHECKOUT-SNAP-08 | Ignorar payload financeiro. | Must | Cliente nao consegue alterar subtotal, desconto, frete ou total. |
| RF-CHECKOUT-SNAP-09 | Criar customer snapshot. | Must | Snapshot contem nome, e-mail da sessao e telefone. |
| RF-CHECKOUT-SNAP-10 | Criar address snapshot. | Must | Snapshot contem endereco normalizado e pais BR. |
| RF-CHECKOUT-SNAP-11 | Comparar CEP com frete. | Must | CEP divergente bloqueia pedido. |
| RF-CHECKOUT-SNAP-12 | Criar item snapshots. | Must | Itens preservam produto, nome, SKU, imagem, preco e quantidade. |
| RF-CHECKOUT-SNAP-13 | Criar coupon snapshot. | Should | Quando cupom existe, snapshot registra codigo, tipo, valor, desconto e usedCount. |
| RF-CHECKOUT-SNAP-14 | Criar shipping snapshot. | Must | Snapshot registra quote/opcao, label, provider/source, prazo e valores. |
| RF-CHECKOUT-SNAP-15 | Registrar frete gratis aplicado. | Must | `freeShippingApplied` true quando original > 0 e efetivo = 0. |
| RF-CHECKOUT-SNAP-16 | Criar draft de pedido pendente. | Must | Draft contem userId, cartId, status, totais, snapshots e itens. |
| RF-CHECKOUT-SNAP-17 | Definir expiracao. | Must | `expiresAt` = `createdAt + 60min`. |
| RF-CHECKOUT-SNAP-18 | Nao aplicar efeitos colaterais comerciais indevidos. | Must | Estoque e cupom nao sao consumidos na criacao pendente. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Integridade financeira | Totais derivam do carrinho recalculado. | `buildPendingOrderDraft` usa `cart.*Cents`. | 🟢 |
| Antifraude | Payload do cliente nao define owner/totais. | Schema allowlist e service usam sessao. | 🟢 |
| Consistencia temporal | Pedido preserva snapshots do momento do checkout. | Snapshots em `PendingOrderDraft`. | 🟢 |
| Rastreabilidade | Cupom/frete guardam metadados do checkout. | `usedCountAtCheckout`, quoteId, optionId. | 🟢 |
| Resiliencia | Produto atual pode enriquecer snapshot, fallback usa dados do carrinho. | `product?.name ?? item.productNameSnapshot`. | 🟢 |
| Segurança | Pedido pertence ao user autenticado. | `userId` da sessao e cart owner. | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: criar snapshots com carrinho valido
  Dado customer autenticado com carrinho valido
  Quando envia formulario de checkout
  Entao pedido pendente contem customer snapshot
  E address snapshot
  E item snapshots
  E shipping snapshot
  E coupon snapshot quando houver cupom

Cenario: payload malicioso com totais
  Dado customer autenticado com carrinho valido
  Quando envia subtotalCents e grandTotalCents manipulados
  Entao pedido ignora esses valores
  E usa totais do carrinho recalculado

Cenario: payload malicioso com ownership
  Dado customer autenticado com carrinho valido
  Quando envia userId, role ou cartId no formulario
  Entao pedido usa userId da sessao
  E cartId do carrinho ativo

Cenario: estoque insuficiente
  Dado produto no carrinho com quantidade acima do estoque atual
  Quando customer tenta criar pedido
  Entao pedido nao e criado
  E mensagem informa estoque insuficiente

Cenario: CEP divergente
  Dado frete cotado para CEP "01001000"
  Quando endereco informa CEP diferente
  Entao pedido nao e criado
  E mensagem pede CEP igual ao frete selecionado

Cenario: frete gratis aplicado
  Dado carrinho com frete manual selecionado
  E cupom free_shipping valido
  Quando pedido e criado
  Entao shipping snapshot preserva valor original
  E registra valor efetivo zero
  E marca freeShippingApplied true
```

## Contratos de Snapshot

### Customer

| Campo | Origem | Regra |
|-------|--------|-------|
| `fullName` | Formulario | Trimado. |
| `email` | Sessao | Lowercase, nunca do cliente. |
| `phone` | Formulario | Trimado. |

### Endereco

| Campo | Origem | Regra |
|-------|--------|-------|
| `recipient` | Formulario ou fullName | Fallback para nome completo. |
| `postalCode` | Formulario | Normalizado para digitos. |
| `state` | Formulario | Uppercase. |
| `city` | Formulario | Trimado. |
| `district` | Formulario | Trimado. |
| `street` | Formulario | Trimado. |
| `number` | Formulario | Trimado. |
| `complement` | Formulario | Trimado ou null. |
| `country` | Sistema | Literal `BR`. |

### Cupom

| Campo | Origem | Regra |
|-------|--------|-------|
| `id` | Coupon real | Copiado se existir. |
| `code` | Coupon real | Copiado. |
| `type` | Coupon real | Copiado. |
| `value` | Coupon real | Copiado. |
| `discountCents` | Carrinho recalculado | Valor aplicado no momento. |
| `usedCountAtCheckout` | Coupon real | Observacional; nao incrementa. |

### Frete

| Campo | Origem | Regra |
|-------|--------|-------|
| `postalCode` | Quote | Normalizado. |
| `quoteId` | Quote | Copiado. |
| `optionId` | Opcao selecionada | Copiado. |
| `provider` | Opcao selecionada | Copiado. |
| `source` | Opcao selecionada | Copiado. |
| `label` | Opcao selecionada | Copiado. |
| `estimatedDays` | Opcao selecionada | Copiado. |
| `originalAmountCents` | Opcao selecionada | Valor original. |
| `effectiveAmountCents` | Carrinho recalculado | Valor final aplicado. |
| `freeShippingApplied` | Derivado | `original > 0 && effective === 0`. |

### Item

| Campo | Origem | Regra |
|-------|--------|-------|
| `productId` | Carrinho | Copiado. |
| `skuSnapshot` | Produto ou productId | Fallback para productId. |
| `nameSnapshot` | Produto ou carrinho | Fallback para snapshot do carrinho. |
| `slugSnapshot` | Produto | Null se ausente. |
| `imageSnapshot` | Imagem cover/produto | Null se ausente. |
| `unitPriceCents` | Carrinho | Preco do carrinho. |
| `quantity` | Carrinho | Quantidade validada. |
| `lineTotalCents` | Carrinho | Subtotal do item. |

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/features/checkout/server/checkout-service.ts` | Orquestra validacao e criacao de pedido. |
| `src/features/orders/domain.ts` | Builders de snapshots e draft. |
| `src/features/orders/types.ts` | Tipos dos snapshots e pedido. |
| `src/features/orders/schemas.ts` | Schema allowlist do formulario. |
| `src/features/cart/server/cart-service.ts` | Recalculo do carrinho. |
| `src/features/products/server/product-repository.ts` | Produto atual e estoque. |
| `src/features/coupons/server/coupon-service.ts` | Cupom atual. |
| `src/features/shipping/domain` | Expiracao da quote e normalizacao relacionada. |
| `src/tests/unit/checkout-service.test.ts` | Snapshots, payload malicioso, cupom e estoque. |
| `src/tests/unit/checkout-domain.test.ts` | Status, expiracao e normalizacao. |

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Recalcular carrinho | Must | Fonte de verdade financeira. |
| Revalidar produto/estoque/cupom/frete | Must | Evita pedido invalido. |
| Ignorar payload financeiro | Must | Protecao antifraude. |
| Customer/address/item/shipping snapshots | Must | Pedido precisa ser imutavel e auditavel. |
| Coupon snapshot | Should | Importante para rastreio, mas ausente quando nao ha cupom. |
| Produto enriquecendo snapshot | Should | Melhora historico, com fallback seguro. |

## Lacunas e Riscos

- 🟡 Sem reserva de estoque, disponibilidade pode mudar antes do pagamento.
- 🟡 Snapshot de imagem depende de imagem de capa atual ou primeira imagem disponivel.
- 🟡 `usedCountAtCheckout` e observacional; consumo real precisa ocorrer em settlement.
- 🔴 Aceitar totais do cliente permitiria fraude.
- 🔴 Criar pedido sem shipping snapshot quebraria pagamento e entrega.
- 🔴 Usar e-mail do formulario em vez da sessao poderia permitir impersonation.

## Guardrails

- Nao aceitar totais do cliente.
- Nao aceitar `userId`, `role` ou `cartId` do cliente.
- Nao consumir cupom nesta etapa.
- Nao baixar estoque nesta etapa.
- Nao confirmar pagamento nesta etapa.
- Nao recalcular snapshot depois do pedido criado sem fluxo explicito.
- Nao conectar banco de producao.
- Nao rodar migrations.
- Nao alterar Laravel legado.

## Definition of Done

- Carrinho e revalidado antes de snapshot.
- Produtos, estoque, cupom e frete sao revalidados.
- Payload financeiro/ownership do cliente e ignorado.
- Customer, endereco, itens, frete e cupom sao snapshotados corretamente.
- Pedido pendente usa status `aguardando_pagamento`, moeda `BRL` e expiracao de 60 minutos.
- Nenhum estoque, cupom ou pagamento e consumido nessa etapa.
