# Cart

> Spec executavel da unit `cart`. Foca no QUE o carrinho deve garantir para visitante, cliente autenticado, cupom, frete e transicao para checkout.

## Visao Geral

A unit `cart` gerencia a sessao de compra antes do pedido: carrinho guest ou autenticado, itens com snapshot de nome/preco, validacao de produto compravel, limite de estoque, cupom aplicado, cotacao/selecionamento de frete, totais derivados, fallback sem banco e merge do carrinho guest apos login.

## Responsabilidades

- Resolver ator do carrinho como guest, usuario autenticado ou indisponivel.
- Criar ou obter carrinho ativo para o ator.
- Adicionar produto compravel com snapshot de nome e preco.
- Atualizar quantidade respeitando estoque atual.
- Remover item e limpar carrinho.
- Recalcular subtotal, desconto, frete e total com frete.
- Remover itens indisponiveis ou limitar quantidade durante recálculo.
- Aplicar/remover cupom validado.
- Cotar, selecionar e remover frete manual.
- Limpar selecao de frete quando itens mudam.
- Mesclar carrinho guest em usuario autenticado apos login.
- Marcar carrinho como convertido quando usado por pedido.
- Renderizar pagina `/carrinho` com mensagens, itens, resumo, cupom, frete e CTA adequado.

## Regras de Negocio

- 🟢 Carrinho ativo pertence a guest token ou usuario autenticado.
- 🟢 Sem banco, carrinho usa fallback dev/fixture em memoria e comunica que nao ha persistencia real.
- 🟢 Produto so pode entrar no carrinho se for compravel: publicado, vigente e com estoque positivo.
- 🟢 Quantidade deve ser inteiro maior ou igual a 1.
- 🟢 Quantidade total do produto no carrinho nao pode exceder estoque.
- 🟢 Item guarda snapshot de `productNameSnapshot` e `unitPriceSnapshotCents`.
- 🟢 Subtotal do item = `unitPriceSnapshotCents * quantity`.
- 🟢 Subtotal do carrinho = soma dos subtotais de item.
- 🟢 Mudanca de item limpa frete selecionado porque o `cartHash` fica obsoleto.
- 🟢 Recálculo remove item cujo produto deixou de ser compravel.
- 🟢 Recálculo limita quantidade quando estoque atual e menor que quantidade no carrinho.
- 🟢 Cupom aplicado e recalculado contra subtotal atual.
- 🟢 Cupom invalido aplicado deve ser removido do carrinho.
- 🟢 Cupom `free_shipping` zera frete manual elegivel no total calculado.
- 🟢 Frete exige CEP valido e cotacao manual/fixture com opcoes.
- 🟢 Checkout exige itens e frete selecionado; guest deve ir para login com `returnTo=/checkout`.
- 🟢 Carrinho convertido nao deve continuar recebendo mutacoes de compra.
- 🟡 Fallback em memoria pode ser mutavel entre chamadas no mesmo processo de teste.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CART-01 | Obter carrinho ativo. | Must | `getActiveCart` retorna carrinho do ator ou status `unavailable` com mensagem segura. |
| RF-CART-02 | Adicionar produto compravel. | Must | Produto publico com estoque suficiente entra no carrinho com snapshot de nome/preco e subtotal. |
| RF-CART-03 | Rejeitar produto indisponivel. | Must | Produto inexistente, draft, inactive, futuro ou sem estoque retorna `product_unavailable`. |
| RF-CART-04 | Rejeitar quantidade invalida. | Must | Quantidade nao inteira ou menor que 1 retorna `validation_error`. |
| RF-CART-05 | Rejeitar quantidade acima do estoque. | Must | Quantidade total acima do estoque retorna `insufficient_stock` e `maxQuantity`. |
| RF-CART-06 | Atualizar quantidade. | Must | Item pertencente ao carrinho atual pode atualizar quantidade e limpar frete selecionado. |
| RF-CART-07 | Bloquear update/remocao de item alheio. | Must | Item inexistente no carrinho do ator retorna `forbidden`. |
| RF-CART-08 | Remover item e limpar carrinho. | Must | Remocao ou clear atualiza itens, totais e limpa frete quando aplicavel. |
| RF-CART-09 | Recalcular carrinho. | Must | Recálculo remove indisponiveis, limita estoque, calcula subtotal, desconto, frete e mensagens. |
| RF-CART-10 | Aplicar cupom. | Must | Codigo valido e aplicado ao carrinho; codigo invalido retorna `coupon_invalid` sem corromper itens. |
| RF-CART-11 | Remover cupom. | Must | Cupom aplicado pode ser removido e totais sao recalculados. |
| RF-CART-12 | Cotar frete. | Must | CEP valido gera cotacao manual/fixture, seleciona primeira opcao e recalcula total com frete. |
| RF-CART-13 | Selecionar/remover frete. | Should | Opcao de cotacao propria pode ser selecionada; selecao pode ser removida. |
| RF-CART-14 | Mesclar carrinho guest no login. | Must | Itens elegiveis do guest migram para usuario, respeitando estoque; guest cart e convertido. |
| RF-CART-15 | Renderizar pagina carrinho. | Must | `/carrinho` mostra itens ou estado vazio, mensagens, resumo, cupom, frete e CTA correto. |
| RF-CART-16 | Gate de checkout. | Must | Carrinho vazio/sem frete desabilita checkout; guest com itens/frete recebe link de login; usuario autenticado recebe `/checkout`. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Mutacoes operam somente no carrinho resolvido para o ator. | `src/features/cart/server/cart-service.ts`, `cart-repository.ts` | 🟢 |
| Consistencia | Mudancas de item limpam frete selecionado. | `src/features/cart/server/cart-repository.ts` | 🟢 |
| Integridade | Quantidade e estoque sao validados antes de add/update. | `src/features/cart/domain.ts`, `cart-service.ts` | 🟢 |
| Compatibilidade | Sem banco, fallback comunica ausencia de persistencia real. | `src/features/cart/server/cart-repository.ts`, `src/tests/e2e/cart.spec.ts` | 🟢 |
| Usabilidade | Carrinho vazio tem CTA para catalogo e resumo permanece renderizavel. | `src/features/cart/components/cart-view.tsx` | 🟢 |
| Testabilidade | Schemas de action validam FormData antes de service. | `src/features/cart/schemas.ts`, `cart-actions.ts` | 🟢 |

> Inferido a partir de dominio, service, repository, actions, pagina, componentes e testes E2E de carrinho.

## Criterios de Aceitacao

```gherkin
Cenario: visitante ve carrinho vazio sem banco real
  Dado ambiente sem DATABASE_URL
  Quando acessa "/carrinho"
  Entao ve heading "Carrinho"
  E ve "Nenhum item adicionado"
  E ve mensagem de fallback dev/fixture

Cenario: visitante adiciona produto valido
  Dado produto publicado vigente e com estoque
  Quando clica "Adicionar ao carrinho"
  Entao o item aparece em "/carrinho"
  E subtotal do item usa snapshot de preco

Cenario: produto indisponivel nao entra no carrinho
  Dado produto sem estoque, futuro, draft ou inactive
  Quando tentativa de adicionar ocorre
  Entao retorna product_unavailable

Cenario: quantidade acima do estoque
  Dado produto com estoque menor que a quantidade solicitada
  Quando add/update e executado
  Entao retorna insufficient_stock com maxQuantity

Cenario: checkout exige frete e autenticacao
  Dado carrinho guest com itens e frete selecionado
  Quando a pagina renderiza resumo
  Entao mostra link "Entrar para checkout" para "/login?returnTo=/checkout"
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Add/update/remove item com estoque | Must | Base da compra e integridade comercial. |
| Recalculo de totais | Must | Alimenta cupom, frete, checkout e pedido. |
| Fallback sem banco | Must | Permite dev/test seguro. |
| Cupom e frete no carrinho | Must | Entradas obrigatorias para checkout atual. |
| Merge guest para usuario | Must | Preserva jornada de visitante para checkout autenticado. |
| Selecionar/remover opcao de frete | Should | Importante para UX, mas primeira cotacao ja e selecionada. |
| Estoque reservado no carrinho | Could | Fora do comportamento atual; estoque baixa no settlement. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/features/cart/types.ts` | `CartActor`, `CartView`, `CartItem`, `CartActionResult` | 🟢 |
| `src/features/cart/domain.ts` | subtotal, estoque, produto compravel | 🟢 |
| `src/features/cart/server/cart-service.ts` | add/update/remove/clear/coupon/frete/merge/recalculate | 🟢 |
| `src/features/cart/server/cart-repository.ts` | Drizzle/fallback repository, active cart, items, shipping, conversion | 🟢 |
| `src/features/cart/server/cart-actions.ts` | Server Actions e revalidation | 🟢 |
| `src/features/cart/schemas.ts` | schemas de FormData | 🟢 |
| `src/app/(storefront)/carrinho/page.tsx` | pagina carrinho | 🟢 |
| `src/features/cart/components/cart-view.tsx` | UI de itens, resumo e checkout gate | 🟢 |
| `src/features/cart/components/cart-coupon-panel.tsx` | UI de cupom | 🟢 |
| `src/features/cart/components/add-to-cart-form.tsx` | CTA de produto para carrinho | 🟢 |
| `src/features/shipping/components/shipping-quote-panel.tsx` | UI de frete no carrinho | 🟢 |
| `src/tests/e2e/cart.spec.ts` | fluxos basicos de carrinho/fallback | 🟢 |

## Lacunas e Riscos

- 🔴 Carrinho nao reserva estoque; estoque e baixado apenas apos pagamento confirmado.
- 🔴 Nao ha expiracao operacional completa de carrinho alem de campos/status.
- 🟡 Fallback em memoria pode exigir reset entre testes longos.
- 🟡 Frete selecionado depende de `cartHash`; mudancas de item limpam selecao para evitar stale quote.
- 🟡 Mensagens de recálculo podem acumular avisos e precisam ser deduplicadas na UI.
