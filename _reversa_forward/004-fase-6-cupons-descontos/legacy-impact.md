# Legacy Impact - Fase 6 Cupons e Descontos

Data: 2026-06-08

Feature: `004-fase-6-cupons-descontos`

## Arquivos Afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/db/schema.ts` | Modelo de dados ecommerce | delta-de-dados | MEDIUM | Adiciona `minimumSubtotalCents` em `coupons` e `appliedCouponId` em `carts`, preservando checkout/pedido fora de escopo. |
| `drizzle/0003_elite_titanium_man.sql` | Migration local | delta-de-dados | MEDIUM | Migration local apenas para carrinho/cupom; nao aplicada contra banco real. |
| `src/features/coupons/**` | Dominio de cupons | componente-novo | MEDIUM | Cria dominio, schemas, repository/service, fixtures, admin actions e componentes de admin. |
| `src/features/cart/**` | Carrinho e sessao de compra | regra-alterada | MEDIUM | Integra cupom aplicado, desconto e total parcial, sem criar checkout/frete/pedido. |
| `src/app/(storefront)/carrinho/page.tsx` | UI do carrinho | regra-alterada | LOW | Atualiza fallback view para novos campos de cupom/desconto. |
| `src/app/admin/cupons/**` | Admin de cupons | componente-novo | MEDIUM | Substitui placeholder por admin minimo protegido por policies. |
| `src/tests/unit/**` | Testes unitarios | delta-de-contrato-externo | LOW | Adiciona cobertura de cupom, mapeamento legado, arredondamento, payload e usedCount. |
| `src/tests/e2e/**` | Testes E2E | delta-de-contrato-externo | LOW | Cobre aplicacao/remocao de cupom, invalidez, subtotal minimo e admin protegido. |
| `docs/features/coupons.md` | Documentacao funcional | componente-novo | LOW | Documenta escopo, fora de escopo e mapeamento legado. |
| `docs/architecture/coupons.md` | Documentacao arquitetural | componente-novo | LOW | Documenta server-side trust, repository/service e divergencia intencional com o legado. |
| `docs/features/cart.md` | Documentacao de carrinho | regra-alterada | LOW | Documenta cupom aplicado no carrinho e persistencia no Next. |
| `docs/architecture/cart.md` | Arquitetura de carrinho | regra-alterada | LOW | Documenta revalidacao de cupom e limites da fase. |
| `docs/architecture/database.md` | Documentacao de banco | delta-de-dados | LOW | Registra migration local e mapeamento `percent/fixed`. |
| `docs/features/auth-policies.md` | Auth/policies | regra-alterada | LOW | Registra admin de cupons protegido e ausencia de bypass. |

## Diff Conceitual por Componente

### Cupons

O legado Laravel tinha `Coupon` com codigo normalizado, tipos `percent`/`fixed`, status calculado e
desconto limitado ao subtotal. A Fase 6 recria esse comportamento em modulo server-first no Next,
com mapeamento explicito:

- `percent` -> `percentage`;
- `fixed` -> `fixed_amount`.

`free_shipping` fica apenas preparado/modelado e nao aplica frete real.

### Carrinho

O legado mantinha cupom aplicado em sessao (`cart_coupon_code`). O Next persiste a referencia em
`carts.applied_coupon_id`. Essa divergencia e intencional para acompanhar o carrinho autenticado por
`userId` entre sessoes/dispositivos.

O carrinho passa a retornar:

- cupom aplicado;
- `discountCents`;
- `partialTotalCents`;
- mensagens controladas de elegibilidade.

### Admin

O admin de cupons e recorte minimo da Fase 6. Ele nao tenta paridade administrativa completa do
legado e nao implementa campanhas avancadas, relatorios, limite por usuario ou restricao por
produto/categoria.

## Preservadas

- Produto compravel continua exigindo `published`, `publishedAt <= now` e estoque positivo.
- Carrinho anonimo continua usando `guestCartToken` opaco sem itens/precos/dados sensiveis no cookie.
- Carrinho autenticado continua resolvido por `session.userId`.
- Cliente/visitante nao acessa carrinho de outro owner.
- Admin/manager nao tem bypass de carrinho, estoque, disponibilidade ou desconto.
- Sem `DATABASE_URL`, dev/test usam fallback explicito e preview/producao falham seguro.
- Checkout, pagamento, Stripe, frete real, pedido, reserva e baixa de estoque continuam fora de escopo.
- Aplicar/remover cupom nao consome `usedCount`.
- Desconto nunca excede subtotal.

## Modificadas

- Carrinho agora pode persistir uma referencia de cupom aplicado no banco quando `DATABASE_URL` existe.
- Carrinho agora calcula desconto e total parcial em centavos.
- Admin `/admin/cupons` deixa de ser placeholder e vira fundacao minima protegida.
- Tabela `coupons` ganha subtotal minimo opcional.
