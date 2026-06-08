# Investigation: Fase 5 - Carrinho e Sessao de Compra

> Data: `2026-06-08`  
> Escopo: pesquisa tecnica de planejamento, sem implementacao.

## 1. Fontes internas

| Fonte | Uso no plano |
|---|---|
| `_reversa_sdd/architecture.md` | Confirma App Router, auth, policies, Drizzle, runtime e placeholder de carrinho. |
| `_reversa_sdd/domain.md` | Confirma produto compravel, precos em centavos e fallback sem banco. |
| `_reversa_sdd/permissions.md` | Confirma `requireOwner`, roles e matriz de acesso. |
| `_reversa_sdd/data-dictionary.md` | Confirma `carts` e `cart_items` preparados, ainda nao funcionais. |
| `_reversa_sdd/state-machines.md` | Confirma estados de auth/session, produto e runtime. |
| `_reversa_sdd/dependencies.md` | Confirma Next, Better Auth, Drizzle, Vitest e Playwright. |
| `src/db/schema.ts` | Confirma `cart_status`, `carts`, `cart_items`, `guest_token`, `user_id`, snapshots e quantidade. |
| `src/app/(storefront)/carrinho/page.tsx` | Confirma carrinho atual como placeholder. |
| `_reversa_forward/002-fase-4-auth-policies/` | Base de auth/policies/ownership para carrinho autenticado. |

## 2. Fontes externas

Nao houve navegacao externa nesta etapa. O plano se baseia nos SDDs locais, requirements aprovados e estado atual do codigo.

## 3. Alternativas avaliadas

| Alternativa | Decisao | Motivo |
|---|---|---|
| Carrinho em LocalStorage como fonte primaria | Descartada | Requirements definem cookie opaco + tabela; LocalStorage nao e fonte primaria. |
| Cookie com itens/precos serializados | Descartada | Exporia dados e criaria divergencia de preco/estoque. |
| Carrinho anonimo apenas em memoria | Descartada | Nao atende persistencia anonima com banco real. |
| Um carrinho ativo principal por usuario | Escolhida | Reduz ambiguidade, melhora merge e ownership. |
| Multiplos carrinhos ativos por usuario | Descartada sem justificativa futura | Dificulta merge, subtotal e acesso cross-device. |
| Reservar estoque ao adicionar | Descartada | Fora de escopo; carrinho apenas valida disponibilidade. |
| Aplicar cupom/frete no carrinho | Descartada | Cupom/frete/checkout fora da Fase 5. |

## 4. Padroes aplicaveis

- Resolver ownership no servidor, nunca por `cartId` arbitrario do cliente.
- Separar domain, repository, service e actions.
- Usar centavos inteiros no dominio; converter apenas para exibicao.
- Tratar token anonimo como identificador opaco, nao como segredo com autorizacao forte isolada.
- Executar merge em transacao quando houver banco real.
- Marcar carrinho anonimo mesclado como `converted` para idempotencia.
- Retornar erros controlados: `unavailable`, `out_of_stock`, `quantity_invalid`, `forbidden`, `fallback`.

## 5. Pontos a investigar durante coding

| Tema | Pergunta tecnica | Acao recomendada |
|---|---|---|
| Snapshot de preco | Manter `unit_price_snapshot` numeric ou adicionar centavos? | Preferir campo em centavos se a regra de dominio exigir inteiro. |
| Carrinho ativo unico | Drizzle/Postgres precisa de unique parcial por `user_id/status=active` e por `guest_token/status=active`? | Avaliar migration local. |
| Expiracao | Usar campo novo em `carts` ou calcular por `updated_at`? | Definir no data delta antes do coding. |
| Cookie | Definir maxAge, httpOnly, sameSite e secure por ambiente. | Encapsular em `cart-session.ts`. |
| Merge | Onde acoplar ao login sem quebrar actions de auth? | Chamar service de cart apos login bem-sucedido. |
| Fallback | Como permitir e2e sem banco sem fingir persistencia? | Fixture controlada com aviso e resultado explicito. |

## 6. Conclusao

O plano e viavel com baixo risco estrutural porque o schema e auth ja estao preparados. Os riscos reais estao em invariantes de banco, merge idempotente, fallback sem falsa persistencia e preservacao rigorosa das regras de produto compravel.
