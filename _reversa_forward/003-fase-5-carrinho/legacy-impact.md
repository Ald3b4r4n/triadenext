# Legacy Impact: Fase 5 - Carrinho

> Data: `2026-06-08`  
> Feature: `003-fase-5-carrinho`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `src/db/schema.ts` | Banco e Drizzle | delta-de-dados | HIGH | `carts` e `cart_items` passam a conter invariantes de carrinho ativo, sessao anonima, conversao e snapshot em centavos. |
| `drizzle/0002_tiny_enchantress.sql` | Banco e Drizzle | delta-de-dados | HIGH | Migration local gerada, nao aplicada contra banco real. |
| `src/features/cart/**` | Storefront / Carrinho | componente-novo | HIGH | Novo modulo de carrinho com domain, session, repository, service, actions e UI. |
| `src/features/auth/server/actions.ts` | Auth e sessao | regra-alterada | MEDIUM | Login passa a tentar merge controlado do carrinho anonimo quando houver `guestCartToken`. |
| `src/app/(storefront)/carrinho/page.tsx` | Storefront | componente-alterado | MEDIUM | Placeholder de carrinho vira pagina funcional/fallback. |
| `src/app/(storefront)/produto/[slug]/page.tsx` | Storefront / Produto | regra-alterada | MEDIUM | Produto publico passa a expor action de adicionar ao carrinho. |
| `src/lib/runtime-mode.ts` | Runtime/fallback | regra-alterada | MEDIUM | Mensagens de fallback e indisponibilidade de carrinho foram adicionadas sem expor secrets. |
| `src/tests/**/cart*.ts` | Validacao | componente-novo | MEDIUM | Testes unitarios e E2E cobrem estoque, fallback, token opaco, ownership e merge. |
| `docs/features/cart.md` | Documentacao | componente-novo | LOW | Documento funcional da Fase 5. |
| `docs/architecture/cart.md` | Documentacao | componente-novo | LOW | Documento arquitetural do carrinho. |
| `docs/architecture/database.md` | Documentacao | regra-alterada | LOW | Registra delta local de `carts`/`cart_items` e migration nao aplicada. |
| `docs/features/catalog-products-images.md` | Documentacao | regra-alterada | LOW | Registra que produto compravel alimenta o carrinho. |
| `docs/features/auth-policies.md` | Documentacao | regra-alterada | LOW | Registra merge no login e ownership do carrinho. |

## Diff conceitual por componente

### Banco e Drizzle

`carts` e `cart_items` deixam de ser apenas tabelas preparadas e ganham suporte operacional para
carrinho anonimo/autenticado. O delta inclui `session_id`, `expires_at`, `converted_at`,
`unit_price_snapshot_cents`, indices de busca por owner/status e unique por produto no carrinho.

### Storefront / Carrinho

`/carrinho` agora renderiza estado vazio, itens, quantidade, subtotal, remocao, limpeza e aviso de
fallback. O CTA de checkout permanece desabilitado e nao cria pedido, pagamento, frete ou cupom.

### Auth e sessao

Login bem-sucedido tenta reconciliar o carrinho anonimo com o carrinho autenticado. O merge soma
quantidades por produto, limita ao estoque, ignora indisponiveis e marca o carrinho anonimo como
convertido.

### Runtime/fallback

Sem `DATABASE_URL`, dev/test usam fallback explicitamente marcado como nao persistente. Preview e
producao sem banco retornam indisponibilidade segura para mutacoes reais. Erro real com banco
configurado nao e mascarado como fallback.

## Preservadas

- Produto publico/compravel exige `status = published`.
- Produto publico/compravel exige `publishedAt <= now`.
- Produto publico/compravel exige `stockQuantity > 0`.
- Produto `draft`, `inactive`, futuro ou sem estoque nao e compravel.
- Precos do dominio continuam em centavos.
- Cliente/usuario acessa apenas recursos proprios.
- Carrinho nao cria pedido nesta fase.
- Carrinho nao reserva nem baixa estoque definitivamente nesta fase.
- Build/test nao exigem banco real nem credenciais reais.
- Google OAuth, magic link, checkout, pagamento, frete e cupom seguem fora do escopo atual.

## Modificadas

Nenhuma regra verde do legado foi removida ou enfraquecida. A Fase 5 adiciona comportamento novo de
carrinho preservando as regras herdadas.
