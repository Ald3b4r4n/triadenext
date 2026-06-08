# Roadmap: Fase 5 - Carrinho e Sessao de Compra

> Identificador: `003-fase-5-carrinho`  
> Data: `2026-06-08`  
> Requirements: `_reversa_forward/003-fase-5-carrinho/requirements.md`  
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 5 ativa o dominio de carrinho sobre a base pos-Fase 4: catalogo persistente, produto publico/compravel, Better Auth, sessao server-side e policies de ownership. O carrinho anonimo sera resolvido por cookie seguro/opaco `guestCartToken` associado a `carts.guestToken` quando houver banco real; o carrinho autenticado sera resolvido por `session.userId`. As actions de carrinho devem validar produto, estoque, ownership e fallback antes de qualquer persistencia. A fase nao implementa checkout, pagamento, frete, cupom, pedido ou reserva/baixa definitiva de estoque.

## 2. Principios aplicados

`.reversa/principles.md` nao existe no projeto. A feature segue os guardrails confirmados nos SDDs e nos requirements.

| Principio/guardrail | Como a feature se relaciona | Status |
|---|---|---|
| Fallback sem banco explicito | Carrinho sem `DATABASE_URL` nao promete persistencia real. | respeita |
| Auth e ownership server-side | Carrinho autenticado usa `session.userId`; carrinho anonimo usa token opaco resolvido no servidor. | respeita |
| Produto compravel preservado | Reusa regra `published`, `publishedAt <= now`, `stockQuantity > 0`. | respeita |
| Sem secrets expostos | Cookie/token nao aparece em logs, docs ou mensagens. | respeita |
| Checkout fora de escopo | Carrinho nao cria pedido, frete, cupom, pagamento ou reserva de estoque. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confidencia |
|---|---|---|---|---|
| D-01 | Usar `guestCartToken` como cookie opaco para visitante. | Decisao humana validada; evita armazenar itens/precos no cliente. | LocalStorage como fonte primaria; cookie com itens serializados. | 🟢 |
| D-02 | Persistir carrinho anonimo em `carts.guestToken` quando houver banco. | Requirements e schema ja possuem `carts.guestToken`. | Carrinho somente em memoria; carrinho somente em LocalStorage. | 🟢 |
| D-03 | Resolver carrinho autenticado por `session.userId`. | Fase 4 ja normaliza sessao e `requireOwner`. | Aceitar `userId` vindo do cliente. | 🟢 |
| D-04 | Manter um carrinho ativo principal por usuario. | Requirements exigem persistencia entre dispositivos e evitam ambiguidade no merge. | Multiplos carrinhos ativos sem regra de escolha. | 🟢 |
| D-05 | Merge no login soma quantidades e limita ao estoque. | Decisao humana validada. | Perguntar ao usuario; substituir um carrinho pelo outro. | 🟢 |
| D-06 | Carrinho nao reserva estoque. | Escopo explicito; reserva/baixa fica para pedido/pagamento. | Reservar ao adicionar; baixar estoque no carrinho. | 🟢 |
| D-07 | Calcular subtotal em centavos a partir de snapshot. | Regras RN-PRICE-001 e RCS-01 a RCS-03. | Float decimal no dominio; subtotal final com frete/cupom. | 🟢 |
| D-08 | Tratar fallback sem banco como dev/test controlado. | Preserva Fase 3 e Fase 4: sem falsa persistencia. | Fixture silencioso em preview/producao. | 🟢 |
| D-09 | Gerar migration local somente se indices/constraints forem ajustados. | Schema ja tem tabelas, mas faltam invariantes operacionais de carrinho ativo. | Aplicar migration real nesta etapa. | 🟢 |
| D-10 | Repository/service de carrinho separado de produtos. | Carrinho possui lifecycle, ownership e merge proprios. | Inserir regras de carrinho no product repository. | 🟡 |

## 4. Premissas

Nao ha marcadores `[DÚVIDA]` ou `[DOUBT]` remanescentes. A auditoria aprovou os requirements.

| Premissa | Origem | Risco se errada |
|---|---|---|
| N/a | N/a | N/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem | Tipo de mudanca | Resumo |
|---|---|---|---|
| Storefront | `_reversa_sdd/architecture.md#1-visao-geral` | componente-alterado | `/carrinho` deixa de ser placeholder e passa a renderizar estado real/fallback. |
| Auth e sessao | `_reversa_sdd/architecture.md#4-auth-e-sessao` | contrato-alterado | Login deve acionar reconciliacao de carrinho anonimo/autenticado. |
| Policies | `_reversa_sdd/architecture.md#5-policies` | regra-alterada | `requireOwner` passa a proteger carrinhos autenticados. |
| Banco e Drizzle | `_reversa_sdd/architecture.md#8-banco-e-drizzle` | regra-alterada | `carts`/`cart_items` saem de preparados para operacionais, com possivel delta de indices/constraints. |
| Catalogo/repository | `_reversa_sdd/domain.md#5-produto-publico` | regra-preservada | Carrinho usa produto compravel como filtro de adicao/atualizacao. |
| Runtime/fallback | `_reversa_sdd/domain.md#7-persistencia-e-fallback` | regra-alterada | Adicionar comportamento explicito de carrinho sem banco. |

## 6. Delta no modelo de dados

- Resumo das mudancas: usar `cart_status`, `carts` e `cart_items` ja existentes; avaliar indices/constraints para um carrinho ativo por usuario/guest token; avaliar snapshot em centavos para evitar dependência de numeric decimal no dominio; definir expiracao/conversao/abandono sem ativar checkout.
- Detalhe completo em: `_reversa_forward/003-fase-5-carrinho/data-delta.md`

## 7. Delta de contratos

| Contrato | Tipo | Arquivo de detalhe |
|---|---|---|
| Cart session | HTTP cookie + server-only resolver | `_reversa_forward/003-fase-5-carrinho/interfaces/cart-session-contract.md` |
| Cart repository/service | server-only module | `_reversa_forward/003-fase-5-carrinho/interfaces/cart-repository-service-contract.md` |
| Cart actions | server actions | `_reversa_forward/003-fase-5-carrinho/interfaces/cart-actions-contract.md` |

## 8. Plano de migracao

1. Comparar `src/db/schema.ts` com as invariantes da Fase 5.
2. Planejar indices/constraints de carrinho ativo por `userId` e por `guestToken`.
3. Planejar campo de snapshot em centavos se o schema atual `unit_price_snapshot` numeric for insuficiente para a regra do dominio.
4. Planejar migration local com `pnpm db:generate` apenas na etapa de implementacao.
5. Nao executar `db:migrate`, `drizzle-kit migrate` ou comandos equivalentes contra banco real sem validacao humana explicita.
6. Planejar fallback dev/test sem banco antes de ativar repository real.

## 9. Arquivos provavelmente alterados

| Caminho | Motivo |
|---|---|
| `src/db/schema.ts` | Ajustar indices/constraints/campos de `carts` e `cart_items`, se necessario. |
| `src/lib/runtime-mode.ts` | Mensagens/flags para carrinho sem banco e preview/producao. |
| `src/app/(storefront)/carrinho/page.tsx` | Substituir placeholder por UI real/fallback. |
| `src/app/(storefront)/produto/[slug]/page.tsx` | Adicionar entrada para adicionar ao carrinho, se a UI de produto for usada. |
| `src/features/products/domain.ts` | Reusar ou expor regra de produto compravel para carrinho. |
| `src/features/auth/server/actions.ts` | Acionar merge apos login, preservando logout/cadastro. |
| `src/features/auth/server/policies.ts` | Reusar `requireOwner`; ajustar mensagens se necessario. |
| `src/tests/unit/**` | Cobrir dominio, repository, actions, merge e fallback. |
| `src/tests/e2e/**` | Cobrir visitante, autenticado, estoque, fallback e carrinho. |
| `docs/architecture/database.md` | Registrar delta de schema. |
| `docs/features/catalog-products-images.md` | Registrar impacto de produto compravel no carrinho. |
| `docs/features/auth-policies.md` | Registrar impacto de merge/ownership. |

## 10. Arquivos provavelmente criados

| Caminho | Motivo |
|---|---|
| `src/features/cart/types.ts` | Tipos de carrinho, item, status e resultados. |
| `src/features/cart/domain.ts` | Regras de subtotal, quantidade, disponibilidade e merge. |
| `src/features/cart/schemas.ts` | Validacao de inputs de actions. |
| `src/features/cart/server/cart-session.ts` | Resolver/emitir `guestCartToken` de forma server-side. |
| `src/features/cart/server/cart-repository.ts` | Repository Drizzle/fallback. |
| `src/features/cart/server/cart-service.ts` | Orquestrar regras de negocio e merge. |
| `src/features/cart/server/cart-actions.ts` | Actions de adicionar, atualizar, remover e limpar. |
| `src/features/cart/components/*` | UI de lista, item, subtotal, estado vazio e avisos. |
| `src/tests/unit/cart-domain.test.ts` | Testes de subtotal, quantidade e merge. |
| `src/tests/unit/cart-repository.test.ts` | Testes de fallback/repository. |
| `src/tests/unit/cart-actions.test.ts` | Testes de actions e erros controlados. |
| `src/tests/e2e/cart.spec.ts` | E2E de carrinho. |
| `docs/features/cart.md` | Documento funcional da feature. |
| `docs/architecture/cart.md` | Arquitetura de carrinho. |
| `docs/operations/cart-env.md` | Operacao e fallback, se houver env/cookie relevante. |

## 11. Estrategia por area

### Cookie/guest token

- Criar token opaco, nao derivado de dados pessoais.
- Armazenar apenas o identificador no cookie `guestCartToken`.
- Configurar cookie com atributos seguros apropriados ao ambiente.
- Nao registrar o token em logs, erros ou snapshots de teste.
- Associar token a `carts.guestToken`/`sessionId` quando houver banco.

### Merge ao login

- Detectar carrinho anonimo pelo cookie antes/depois do login bem-sucedido.
- Resolver carrinho autenticado ativo por `session.userId`.
- Somar quantidades por produto, revalidar produto e limitar ao estoque.
- Remover ou bloquear indisponiveis com aviso controlado.
- Marcar o carrinho anonimo como `converted`/mesclado.
- Garantir idempotencia por status e transacao quando houver banco.

### Produto/estoque

- Permitir apenas produto `published`, com `publishedAt <= now` e `stockQuantity > 0`.
- Bloquear `draft`, `inactive`, futuro, sem `publishedAt`, sem estoque ou quantidade acima do estoque.
- Revalidar em adicionar, atualizar, visualizar/recalcular e futuro pre-checkout.
- Nao reservar nem baixar estoque nesta fase.

### Ownership

- Carrinho autenticado sempre por `session.userId`.
- Carrinho anonimo por token opaco resolvido no servidor.
- Server actions nao aceitam `cartId`, `userId` ou owner como fonte confiavel.
- Acesso cruzado retorna erro generico seguro.

### Fallback sem banco

- Dev/test podem usar fixture/interacao controlada, marcada como nao persistente.
- Preview/producao sem banco falham de forma segura.
- Erro real com `DATABASE_URL` nao vira fallback silencioso.

### UI

- `/carrinho` com estado vazio, lista de itens, quantidade, subtotal e acoes.
- CTA de checkout apenas como placeholder/desabilitado.
- Preparacao visual para cupom/frete sem processar regra real.
- Aviso claro quando nao houver persistencia real.

## 12. Impactos

| Area | Impacto |
|---|---|
| Storefront | Produto e carrinho passam a interagir; catalogo continua publico. |
| Auth | Login passa a disparar merge de carrinho. |
| Customer | Carrinho autenticado passa a ser recurso proprio. |
| Admin/manager | Podem usar carrinho como autenticados normais, sem bypass. |
| Banco | `carts`/`cart_items` passam a ser operacionais. |
| Documentacao | Criar docs de cart e atualizar database/auth/catalogo. |

## 13. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|---|---|---|---|
| Cookie ser tratado como autorizacao forte | alto | medio | Token opaco + ownership server-side + sem dados sensiveis. |
| Merge duplicar itens em retentativa | alto | medio | Status `converted`, transacao e idempotencia. |
| Produto indisponivel entrar no carrinho | alto | medio | Reusar regra de produto publico e testar todos os status. |
| Fallback sem banco fingir persistencia | medio | medio | Resultado `dev_fallback`/aviso explicito. |
| Preview/producao cair em fixture | alto | baixo | Guardrail por ambiente. |
| Subtotal usar decimal/float | medio | medio | Calcular em centavos e testar. |
| Carrinho ativo duplicado por usuario | medio | medio | Constraint/indice parcial ou regra transacional. |

## 14. Criterio de pronto

- [ ] `actions.md` executado na etapa apropriada e marcado.
- [ ] Carrinho anonimo usa cookie opaco sem itens/precos.
- [ ] Carrinho autenticado respeita `session.userId`.
- [ ] Merge no login soma, limita estoque e marca anonimo como convertido.
- [ ] Produto indisponivel/sem estoque nao entra no carrinho.
- [ ] Quantidade minima 1 e maxima `stockQuantity`.
- [ ] Subtotal calculado em centavos.
- [ ] Fallback sem banco explicito e seguro.
- [ ] Checkout/pagamento/frete/cupom/pedido/reserva de estoque continuam fora de escopo.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` aprovados na implementacao futura.

## 15. Ordem recomendada de implementacao

1. Criar tipos, schemas e dominio de carrinho.
2. Planejar/ajustar schema Drizzle e gerar migration local, se necessario.
3. Implementar resolver de `guestCartToken`.
4. Implementar repository Drizzle/fallback.
5. Implementar service de carrinho e subtotal.
6. Implementar actions de adicionar, atualizar, remover e limpar.
7. Integrar merge ao login.
8. Construir UI de `/carrinho`.
9. Adicionar entrada de adicionar ao carrinho em produto/catalogo.
10. Criar testes unitarios.
11. Criar testes e2e.
12. Atualizar documentacao.

## 16. Historico de alteracoes

| Data | Alteracao | Autor |
|---|---|---|
| 2026-06-08 | Versao inicial gerada por `/reversa-plan` | reversa |
