# QA Route Matrix: Fase 11

> Data: `2026-06-22`
> Escopo: rotas publicas, customer e admin do App Router.

## Storefront

| Rota | Arquivo | Verificacoes Fase 11 |
|------|---------|----------------------|
| `/` | `src/app/(storefront)/page.tsx` | Marca, header, hero, CTA, vitrine ou estado vazio, ausencia de placeholder antigo. |
| `/produtos` | `src/app/(storefront)/produtos/page.tsx` | Catalogo, cards, BRL, CTA, estado vazio e texto PT-BR. |
| `/produto/[slug]` | `src/app/(storefront)/produto/[slug]/page.tsx` | Detalhe do produto, imagem, preco, estoque, CTA de carrinho e indisponibilidade segura. |
| `/carrinho` | `src/app/(storefront)/carrinho/page.tsx` | Itens, carrinho vazio, cupom, frete, totais e CTA de checkout. |
| `/checkout` | `src/app/(storefront)/checkout/page.tsx` | Login exigido, revisao do pedido, endereco, totais e criacao de pedido pendente. |

## Auth e customer

| Rota | Arquivo | Verificacoes Fase 11 |
|------|---------|----------------------|
| `/login` | `src/app/(auth)/login/page.tsx` | Formulario legivel, erro amigavel, retorno seguro e link de cadastro. |
| `/cadastro` | `src/app/(auth)/cadastro/page.tsx` | Cadastro customer, textos finais e retorno para minha conta. |
| `/minha-conta` | `src/app/(customer)/minha-conta/page.tsx` | Estado minimo apresentavel, sem linguagem de reconstrucao. |
| `/enderecos` | `src/app/(customer)/enderecos/page.tsx` | Estado futuro controlado, sem prometer funcionalidade completa. |
| `/pedidos` | `src/app/(customer)/pedidos/page.tsx` | Lista/estado vazio, status, total e CTA de pagamento quando aplicavel. |
| `/pedidos/[id]/pagamento` | `src/app/(customer)/pedidos/[id]/pagamento/page.tsx` | Payment Element/mock, textos seguros e retorno para pedidos. |

## Admin

| Rota | Arquivo | Verificacoes Fase 11 |
|------|---------|----------------------|
| `/admin` | `src/app/admin/page.tsx` | Dashboard minimo protegido, sem placeholder tecnico. |
| `/admin/produtos` | `src/app/admin/produtos/page.tsx` | Tabela, empty state, CTA e mensagens operacionais seguras. |
| `/admin/cupons` | `src/app/admin/cupons/page.tsx` | Cupons, status, empty state e formacao PT-BR. |
| `/admin/frete` | `src/app/admin/frete/page.tsx` | Regras manuais, empty state e ausencia de provider externo real. |
| `/admin/fretes` | `src/app/admin/fretes/page.tsx` | Rota de compatibilidade orientando para `/admin/frete`. |
| `/admin/pedidos` | `src/app/admin/pedidos/page.tsx` | Pedidos, pagamento, notificacoes somente leitura e admin protegido. |
| `/admin/documentos-fiscais` | `src/app/admin/documentos-fiscais/page.tsx` | Fiscal fora de escopo: Bling/NF-e/rotinas fiscais continuam futuros. |

## Breakpoints

- Mobile: `360px` e `430px`.
- Tablet: `768px`.
- Desktop: `1366px`.

Critico: sem overflow horizontal, botoes clicaveis, formularios legiveis e admin usavel em desktop.
