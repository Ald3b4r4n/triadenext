# Legacy Impact: 006-fase-8-checkout-pendente

> Data: 2026-06-10
> Projeto Next: D:\Projetos\triade-essenza-next
> Legado Laravel: nao modificado
> SDD legado correto: D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| src/db/schema.ts | Orders/Data | delta-de-dados | HIGH | Adiciona cartId, centavos e snapshots para pedido pendente sem ativar pagamento. |
| drizzle/0005_glossy_talisman.sql | Orders/Data | delta-de-dados | HIGH | Migration local aditiva gerada, nao aplicada em banco real. |
| src/features/checkout/** | Checkout | componente-novo | HIGH | Orquestra validacao server-side, snapshots e criacao de pedido pendente. |
| src/features/orders/** | Orders | componente-novo | HIGH | Implementa dominio, repository, policies de leitura e componentes de pedido. |
| src/features/cart/** | Carrinho | regra-alterada | HIGH | Carrinho convertido deixa de ser reutilizado e CTA inicia checkout seguro. |
| src/app/(storefront)/checkout/page.tsx | Checkout storefront | componente-novo | HIGH | Substitui placeholder por revisao sem cartao/Stripe/PaymentIntent. |
| src/app/(customer)/pedidos/page.tsx | Area customer | componente-novo | MEDIUM | Lista pedidos proprios pendentes em leitura minima. |
| src/app/admin/pedidos/page.tsx | Admin pedidos | componente-novo | MEDIUM | Lista pedidos pendentes para admin/manager sem mutacao financeira. |
| src/tests/** | Validacao | regra-nova | MEDIUM | Cobre auth, snapshots, estoque, cupom, fallback, ownership e CTA. |
| docs/** | Documentacao | regra-nova | LOW | Documenta checkout pendente, pedidos, migration, fallback e fora de escopo. |

## Diff conceitual por componente

### Checkout

O Next passa a ter checkout autenticado que cria pedido `aguardando_pagamento` sem pagamento real. O servidor resolve sessao, carrinho, produtos, estoque, cupom, frete, endereco e totais; payload financeiro do cliente nao e fonte de verdade.

### Orders

Pedidos ganham snapshot de cliente, endereco, cupom, frete, itens e totais em centavos. `expiresAt` e calculado como `createdAt + 60 minutos`. `cartId` unico protege idempotencia por carrinho convertido.

### Carrinho

Carrinho convertido torna-se terminal para novas mutacoes e compras futuras resolvem novo carrinho ativo. O CTA do carrinho direciona visitante para login/cadastro e usuario autenticado para revisao do checkout.

### Cupons, estoque e frete

Cupom e estoque sao revalidados no checkout. `usedCount` nao e consumido. Estoque nao e baixado nem reservado. Frete selecionado e validado e copiado como snapshot; providers externos continuam inativos.

## Preservadas

- Produto compravel exige `published`, `publishedAt <= now` e estoque positivo.
- Carrinho e pedido pertencem ao usuario autenticado; visitante nao cria pedido.
- Cliente acessa somente recursos proprios.
- Admin/manager nao possui bypass de compra nem acao financeira.
- Todos os valores financeiros seguem em centavos.
- Pagamento confirmado, Stripe, captura e baixa de estoque ficam para fase futura.
- Providers externos de frete permanecem inativos.

## Modificadas

Nenhuma regra verde do legado foi removida. A regra de carrinho foi ampliada: apos criar pedido pendente, o carrinho fica `converted` e bloqueado para novas mutacoes.
