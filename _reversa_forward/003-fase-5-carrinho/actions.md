# Actions: Fase 5 - Carrinho e Sessao de Compra

> Identificador: `003-fase-5-carrinho`
> Data: `2026-06-08`
> Roadmap: `_reversa_forward/003-fase-5-carrinho/roadmap.md`

## Resumo

| Metrica | Valor |
|---|---|
| Total de acoes | 90 |
| Paralelizaveis (`[//]`) | 13 |
| Maior cadeia de dependencia | 63 |

## Fase 1, Preparacao e seguranca

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-001 | Confirmar workspace e Git | Confirmar diretorio Next, branch, worktree e ausencia de alteracao funcional inesperada antes do coding. | n/a | - | validation | - | `git status` mostra apenas artefatos Reversa pendentes ou worktree limpo antes de editar codigo. | baixo | 🟢 | `[X]` |
| F5-002 | Registrar guardrails de execucao | Registrar no progress da feature que coding nao deve tocar legado, secrets, deploy, push ou migration real. | `_reversa_forward/003-fase-5-carrinho/progress.jsonl` | F5-001 | docs | - | Guardrails ficam registrados antes da primeira alteracao funcional. | baixo | 🟢 | `[X]` |
| F5-003 | Mapear superficies atuais de carrinho | Ler placeholder `/carrinho`, produto, auth actions, runtime e schema para confirmar pontos de entrada. | `src/app/(storefront)/carrinho/page.tsx` | F5-001 | validation | - | Lista de pontos de entrada guia as tarefas seguintes sem alterar codigo. | baixo | 🟢 | `[X]` |
| F5-004 | Revisar contratos Forward | Revalidar requirements, roadmap, data-delta e interfaces antes de alterar arquivos funcionais. | `_reversa_forward/003-fase-5-carrinho/interfaces/*.md` | F5-001 | validation | `[//]` | Nenhuma decisao humana reaberta; inconsistencias sao anotadas antes do coding. | baixo | 🟢 | `[X]` |
| F5-005 | Definir mensagens seguras de carrinho | Especificar mensagens para fallback, indisponivel, estoque insuficiente, forbidden e unavailable. | `src/lib/runtime-mode.ts` | F5-003 | code | - | Mensagens nao expõem token, cookie, SQL, `DATABASE_URL` ou dados de outro usuario. | medio | 🟢 | `[X]` |

## Fase 2, Schema e migrations locais

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-006 | Auditar schema de carts | Comparar `src/db/schema.ts` com `data-delta.md` para identificar campos e invariantes ausentes. | `src/db/schema.ts` | F5-003, F5-004 | validation | - | Delta final de schema fica claro antes de qualquer edicao. | medio | 🟢 | `[X]` |
| F5-007 | Ajustar enum/status de carrinho se necessario | Garantir status `active`, `converted`, `abandoned`, `expired` coerentes com a Fase 5. | `src/db/schema.ts` | F5-006 | code | - | Enum suporta carrinho ativo, mesclado/convertido, abandonado e expirado. | medio | 🟢 | `[X]` |
| F5-008 | Ajustar campos de carrinho anonimo | Garantir suporte a `guestToken`/`sessionId`, expiração e conversao/merge quando necessario. | `src/db/schema.ts` | F5-007 | code | - | Carrinho anonimo pode ser associado a cookie opaco sem armazenar itens no cookie. | alto | 🟢 | `[X]` |
| F5-009 | Ajustar ownership autenticado | Garantir relacionamento `carts.userId` com `users.id` e base para carrinho ativo principal por usuario. | `src/db/schema.ts` | F5-008 | code | - | Carrinho autenticado pode persistir por `userId` e ser recuperado entre dispositivos. | alto | 🟢 | `[X]` |
| F5-010 | Ajustar itens e snapshots | Garantir `cart_items` com produto, snapshot de nome, snapshot de preco em centavos ou conversao segura e quantidade. | `src/db/schema.ts` | F5-009 | code | - | Item permite subtotal em centavos sem float no dominio. | alto | 🟢 | `[X]` |
| F5-011 | Adicionar indices e constraints locais | Planejar/implementar unique parcial de carrinho ativo e unique de produto por carrinho, se suportado. | `src/db/schema.ts` | F5-010 | code | - | Schema reduz duplicidade de carrinho ativo e item duplicado por produto. | alto | 🟡 | `[X]` |
| F5-012 | Gerar migration local de carrinho | Gerar SQL local com `pnpm db:generate` se o schema mudou. | `drizzle/` | F5-011 | config | - | Migration local existe quando necessaria; nenhuma migration real e aplicada. | alto | 🟢 | `[X]` |
| F5-013 | Revisar SQL local de carrinho | Conferir migration gerada para evitar drop destrutivo, alvo incorreto ou alteracao fora do escopo. | `drizzle/` | F5-012 | validation | - | SQL local documentado como nao aplicado e sem operacao destrutiva inesperada. | alto | 🟢 | `[X]` |

## Fase 3, Guest token e sessao anonima

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-014 | Criar tipos de ator de carrinho | Definir tipos server-only para guest, autenticado e unavailable conforme contrato. | `src/features/cart/types.ts` | F5-005 | code | - | Tipos representam actor guest/autenticado/unavailable sem aceitar owner do cliente. | medio | 🟢 | `[X]` |
| F5-015 | Criar schema de inputs de carrinho | Validar productId, itemId e quantidade minima 1 antes das actions. | `src/features/cart/schemas.ts` | F5-014 | code | - | Inputs invalidos retornam erro controlado antes de tocar repository. | medio | 🟢 | `[X]` |
| F5-016 | Implementar configuracao do cookie anonimo | Encapsular nome `guestCartToken`, atributos seguros e expiracao do cookie. | `src/features/cart/server/cart-session.ts` | F5-014 | code | - | Cookie armazena apenas identificador opaco e nao expõe itens/precos/dados sensiveis. | alto | 🟢 | `[X]` |
| F5-017 | Implementar geracao de token opaco | Criar token anonimo nao derivado de dados pessoais e sem log. | `src/features/cart/server/cart-session.ts` | F5-016 | code | - | Token e opaco, nao logado e nao usado como autorizacao critica isolada. | alto | 🟢 | `[X]` |
| F5-018 | Implementar resolvedor de ator | Resolver carrinho atual por sessao Better Auth ou cookie anonimo no servidor. | `src/features/cart/server/cart-session.ts` | F5-017 | code | - | Usuario autenticado usa `session.userId`; visitante usa token validado; cliente nao envia owner. | alto | 🟢 | `[X]` |
| F5-019 | Bloquear fallback inseguro por ambiente | Garantir que preview/producao sem banco retornem unavailable e dev/test usem fallback explicito. | `src/features/cart/server/cart-session.ts` | F5-018 | code | - | Preview/producao sem banco nao caem em fixture silenciosa. | alto | 🟢 | `[X]` |

## Fase 4, Repository e service de carrinho

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-020 | Criar repository base de carrinho | Criar modulo server-only com interface Drizzle/fallback para carrinho. | `src/features/cart/server/cart-repository.ts` | F5-013, F5-019 | code | - | Repository separa persistencia real de fallback explicito. | alto | 🟡 | `[X]` |
| F5-021 | Implementar busca de carrinho ativo | Buscar carrinho ativo por `guestToken` e por `userId`. | `src/features/cart/server/cart-repository.ts` | F5-020 | code | - | Busca ignora carrinhos `converted`, `abandoned` e `expired`. | alto | 🟢 | `[X]` |
| F5-022 | Implementar criacao de carrinho ativo | Criar carrinho guest ou autenticado quando permitido pelo actor e ambiente. | `src/features/cart/server/cart-repository.ts` | F5-021 | code | - | Cria no maximo um carrinho ativo principal por owner. | alto | 🟢 | `[X]` |
| F5-023 | Implementar listagem de itens | Listar itens ordenados e convertidos para centavos no dominio. | `src/features/cart/server/cart-repository.ts` | F5-022 | code | - | `CartView` retorna itens com `itemSubtotalCents` e `subtotalCents`. | medio | 🟢 | `[X]` |
| F5-024 | Implementar upsert de item | Inserir ou somar/substituir item sem duplicar produto no mesmo carrinho. | `src/features/cart/server/cart-repository.ts` | F5-023 | code | - | Mesmo produto nao gera linhas duplicadas. | alto | 🟢 | `[X]` |
| F5-025 | Implementar update/remove/clear | Atualizar quantidade, remover item e limpar apenas o carrinho resolvido. | `src/features/cart/server/cart-repository.ts` | F5-024 | code | - | Operacoes nao aceitam `cartId` arbitrario do cliente. | alto | 🟢 | `[X]` |
| F5-026 | Implementar mark converted | Marcar carrinho anonimo como convertido/mesclado para idempotencia. | `src/features/cart/server/cart-repository.ts` | F5-025 | code | - | Carrinho anonimo mesclado nao volta a ser ativo. | alto | 🟢 | `[X]` |
| F5-027 | Criar service de carrinho | Criar camada de orquestracao para regras, repository e actor. | `src/features/cart/server/cart-service.ts` | F5-026 | code | - | Service centraliza add/update/remove/clear/get/merge. | alto | 🟡 | `[X]` |
| F5-028 | Implementar fallback dev/test | Retornar `dev_fallback` explicito sem falsa persistencia quando nao houver banco em dev/test. | `src/features/cart/server/cart-service.ts` | F5-027 | code | - | UI/actions conseguem mostrar que alteracoes nao foram persistidas. | alto | 🟢 | `[X]` |
| F5-029 | Bloquear erro real mascarado | Garantir que erro com `DATABASE_URL` presente retorne erro controlado, nao fixture. | `src/features/cart/server/cart-service.ts` | F5-028 | code | - | Falha real de banco nao vira fallback silencioso. | alto | 🟢 | `[X]` |

## Fase 5, Validacao de produto e estoque

| ID | Titulo | Objetivo | Arquivos provaveis | Dependencias | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-030 | Expor regra de produto compravel | Reusar ou extrair regra `published`, `publishedAt <= now`, `stockQuantity > 0` para carrinho. | `src/features/products/domain.ts` | F5-027 | code | - | Carrinho e storefront usam regra coerente de produto compravel. | alto | 🟢 | `[X]` |
| F5-031 | Bloquear status indisponiveis | Bloquear `draft`, `inactive`, produto futuro e sem `publishedAt` no service. | `src/features/cart/server/cart-service.ts` | F5-030 | code | - | Produtos indisponiveis nao entram por action direta. | alto | 🟢 | `[X]` |
| F5-032 | Validar estoque positivo | Bloquear produto com `stockQuantity <= 0`. | `src/features/cart/server/cart-service.ts` | F5-031 | code | - | Produto sem estoque retorna erro controlado e nao altera carrinho. | alto | 🟢 | `[X]` |
| F5-033 | Validar quantidade maxima | Impedir quantidade total do item acima de `stockQuantity`. | `src/features/cart/server/cart-service.ts` | F5-032 | code | - | Quantidade minima 1 e maxima estoque atual. | alto | 🟢 | `[X]` |
| F5-034 | Recalcular carrinho com estoque atual | Ao visualizar/recalcular, sinalizar ou ajustar item acima do estoque atual conforme contrato. | `src/features/cart/server/cart-service.ts` | F5-033 | code | - | Carrinho nao mostra estado compravel quando estoque ficou insuficiente. | medio | 🟢 | `[X]` |

## Fase 6, Carrinho autenticado e ownership

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-035 | Resolver carrinho por userId | Usar `session.userId` para obter/criar carrinho autenticado ativo. | `src/features/cart/server/cart-service.ts` | F5-034 | code | - | Carrinho autenticado persiste por usuario quando ha banco. | alto | 🟢 | `[X]` |
| F5-036 | Aplicar ownership server-side | Bloquear acesso cruzado a carrinho autenticado usando owner resolvido no servidor. | `src/features/cart/server/cart-service.ts` | F5-035 | code | - | Usuario B nao ve nem altera carrinho do usuario A. | alto | 🟢 | `[X]` |
| F5-037 | Tratar admin/manager como comprador normal | Garantir que admin/manager nao tenham bypass de estoque/disponibilidade. | `src/features/cart/server/cart-service.ts` | F5-036 | code | - | Role administrativa segue regras iguais de carrinho. | alto | 🟢 | `[X]` |
| F5-038 | Garantir carrinho ativo principal | Resolver conflitos de multiplos carrinhos ativos por usuario sem expor dados alheios. | `src/features/cart/server/cart-service.ts` | F5-037 | code | - | Apenas um carrinho ativo principal e usado por usuario. | medio | 🟢 | `[X]` |
| F5-039 | Documentar estado sem banco cross-device | Retornar mensagem de que persistencia entre dispositivos nao existe no fallback. | `src/features/cart/server/cart-service.ts` | F5-038 | code | - | Fallback nao promete persistencia cross-device. | medio | 🟢 | `[X]` |

## Fase 7, Merge ao login

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-040 | Criar mergeGuestIntoUser | Implementar service de merge entre carrinho anonimo e autenticado. | `src/features/cart/server/cart-service.ts` | F5-039 | code | - | Metodo recebe `userId` e `guestToken` e retorna resultado controlado. | alto | 🟢 | `[X]` |
| F5-041 | Somar quantidades por produto | Consolidar itens iguais somando quantidades. | `src/features/cart/server/cart-service.ts` | F5-040 | code | - | Mesmo produto aparece uma vez no carrinho final. | alto | 🟢 | `[X]` |
| F5-042 | Limitar merge por estoque | Limitar soma ao `stockQuantity` e retornar aviso controlado. | `src/features/cart/server/cart-service.ts` | F5-041 | code | - | Merge nunca ultrapassa estoque. | alto | 🟢 | `[X]` |
| F5-043 | Remover indisponiveis no merge | Remover/bloquear `draft`, `inactive`, futuro e sem estoque durante merge. | `src/features/cart/server/cart-service.ts` | F5-042 | code | - | Carrinho final nao contem item indisponivel como compravel. | alto | 🟢 | `[X]` |
| F5-044 | Marcar anonimo convertido | Marcar carrinho anonimo como `converted`/mesclado apos sucesso. | `src/features/cart/server/cart-service.ts` | F5-043 | code | - | Carrinho anonimo nao e reutilizado apos merge. | alto | 🟢 | `[X]` |
| F5-045 | Garantir idempotencia do merge | Tratar retentativas sem duplicar item ou repetir soma. | `src/features/cart/server/cart-service.ts` | F5-044 | code | - | Reexecutar merge nao altera indevidamente quantidades. | alto | 🟢 | `[X]` |
| F5-046 | Acoplar merge ao login | Chamar merge apos login bem-sucedido sem quebrar login/logout/cadastro. | `src/features/auth/server/actions.ts` | F5-045 | code | - | Login aplica merge quando ha `guestCartToken`; sem token segue fluxo normal. | alto | 🟡 | `[X]` |

## Fase 8, Server actions

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-047 | Criar getActiveCart action | Expor action/server helper para obter carrinho atual para renderizacao. | `src/features/cart/server/cart-actions.ts` | F5-046 | code | - | Carrinho atual retorna `CartView` real, fallback ou unavailable. | medio | 🟢 | `[X]` |
| F5-048 | Criar addCartItem action | Expor action para adicionar produto validando input, actor, produto e estoque. | `src/features/cart/server/cart-actions.ts` | F5-047 | code | - | Produto valido entra; indisponivel/estoque insuficiente retorna erro controlado. | alto | 🟢 | `[X]` |
| F5-049 | Criar update quantity action | Expor action para atualizar quantidade entre 1 e `stockQuantity`. | `src/features/cart/server/cart-actions.ts` | F5-048 | code | - | Quantidade invalida nao altera estado. | alto | 🟢 | `[X]` |
| F5-050 | Criar remove item action | Expor action para remover item somente do carrinho resolvido. | `src/features/cart/server/cart-actions.ts` | F5-049 | code | - | Item de outro carrinho nao pode ser removido. | alto | 🟢 | `[X]` |
| F5-051 | Criar clear cart action | Expor action para limpar apenas carrinho resolvido. | `src/features/cart/server/cart-actions.ts` | F5-050 | code | - | Carrinho fica vazio e subtotal 0. | medio | 🟢 | `[X]` |
| F5-052 | Padronizar retorno das actions | Retornar success, validation_error, product_unavailable, insufficient_stock, forbidden, fallback, unavailable e error. | `src/features/cart/server/cart-actions.ts` | F5-051 | code | - | UI recebe estados seguros sem secrets ou detalhes internos. | medio | 🟢 | `[X]` |

## Fase 9, UI do carrinho

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-053 | Criar componentes base de carrinho | Criar UI de estado vazio, lista, item, subtotal e aviso. | `src/features/cart/components/*` | F5-052 | code | - | Componentes recebem `CartView` e estados de action sem logica sensivel no client. | medio | 🟢 | `[X]` |
| F5-054 | Implementar pagina /carrinho | Substituir placeholder por pagina que renderiza carrinho real/fallback. | `src/app/(storefront)/carrinho/page.tsx` | F5-053 | code | - | Visitante ve carrinho vazio sem login; fallback mostra aviso quando aplicavel. | medio | 🟢 | `[X]` |
| F5-055 | Integrar atualizacao de quantidade | Ligar UI de quantidade a action segura. | `src/features/cart/components/*` | F5-054 | code | - | Usuario altera quantidade e recebe erro controlado quando excede estoque. | medio | 🟢 | `[X]` |
| F5-056 | Integrar remocao e limpar carrinho | Ligar UI de remover item e limpar carrinho. | `src/features/cart/components/*` | F5-055 | code | - | Remover e limpar recalculam subtotal e preservam ownership. | medio | 🟢 | `[X]` |
| F5-057 | Exibir subtotal em moeda | Exibir subtotal derivado de centavos, sem frete/cupom/total final. | `src/features/cart/components/*` | F5-056 | code | - | UI mostra subtotal correto e nao promete total final. | baixo | 🟢 | `[X]` |
| F5-058 | Adicionar CTA placeholder de checkout | Preparar visual de checkout desabilitado/placeholder sem criar pedido. | `src/app/(storefront)/carrinho/page.tsx` | F5-057 | code | - | Nenhuma action de checkout, pedido, frete, cupom ou Stripe e chamada. | medio | 🟢 | `[X]` |
| F5-059 | Integrar adicionar ao carrinho no produto | Adicionar entrada para produto elegivel chamar addCartItem. | `src/app/(storefront)/produto/[slug]/page.tsx` | F5-048, F5-058 | code | - | Produto publico com estoque pode ser adicionado; indisponivel nao mostra/nao executa compra. | medio | 🟢 | `[X]` |
| F5-060 | Revisar catalogo publico sem login | Confirmar que home/catalogo/produto seguem anonimos apos UI de carrinho. | `src/app/(storefront)/**` | F5-059 | validation | - | Storefront publico nao exige sessao por regressao. | medio | 🟢 | `[X]` |

## Fase 10, Testes unitarios

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-061 | Testar dominio de produto compravel | Cobrir published valido, draft, inactive, futuro e sem estoque. | `src/tests/unit/cart-domain.test.ts` | F5-034 | test | `[//]` | Casos positivos e negativos de produto passam. | alto | 🟢 | `[X]` |
| F5-062 | Testar quantidade e subtotal | Cobrir minimo 1, maximo estoque, item subtotal e carrinho vazio. | `src/tests/unit/cart-domain.test.ts` | F5-034 | test | - | Subtotal em centavos sem float e quantidade invalida bloqueada. | medio | 🟢 | `[X]` |
| F5-063 | Testar cookie sem dados sensiveis | Cobrir que cookie contem apenas token opaco e nao itens/precos/userId. | `src/tests/unit/cart-session.test.ts` | F5-019 | test | `[//]` | Teste falha se cookie serializar payload sensivel. | alto | 🟢 | `[X]` |
| F5-064 | Testar repository fallback | Cobrir dev/test sem banco, preview/producao sem banco e erro real com banco. | `src/tests/unit/cart-repository.test.ts` | F5-029 | test | `[//]` | Fallback e explicito e erro real nao e mascarado. | alto | 🟢 | `[X]` |
| F5-065 | Testar ownership de carrinho | Cobrir user A vs user B e guest token A vs B. | `src/tests/unit/cart-service.test.ts` | F5-039 | test | `[//]` | Acesso cruzado retorna forbidden/erro seguro. | alto | 🟢 | `[X]` |
| F5-066 | Testar merge ao login | Cobrir soma, limite por estoque, indisponiveis e status converted. | `src/tests/unit/cart-merge.test.ts` | F5-046 | test | `[//]` | Merge produz carrinho unico e aviso controlado quando limita/remove. | alto | 🟢 | `[X]` |
| F5-067 | Testar idempotencia do merge | Cobrir retentativa de merge sem duplicar item ou somar duas vezes. | `src/tests/unit/cart-merge.test.ts` | F5-066 | test | - | Reexecutar merge nao muda indevidamente o carrinho final. | alto | 🟢 | `[X]` |
| F5-068 | Testar actions de carrinho | Cobrir add, update, remove, clear e getActiveCart com retornos seguros. | `src/tests/unit/cart-actions.test.ts` | F5-052 | test | `[//]` | Actions retornam estados esperados e nao aceitam owner do cliente. | alto | 🟢 | `[X]` |
| F5-069 | Testar admin/manager sem bypass | Cobrir roles admin/manager usando carrinho sem ignorar estoque/disponibilidade. | `src/tests/unit/cart-service.test.ts` | F5-037 | test | - | Role administrativa segue limite de estoque e status de produto. | alto | 🟢 | `[X]` |
| F5-070 | Testar checkout fora de escopo | Garantir que services/actions de carrinho nao criam pedido, frete, cupom ou Stripe. | `src/tests/unit/cart-actions.test.ts` | F5-052 | test | - | Nenhum fluxo de carrinho chama modulo de checkout/pagamento/frete/cupom. | alto | 🟢 | `[X]` |

## Fase 11, E2E

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-071 | E2E carrinho vazio visitante | Cobrir visitante abrindo `/carrinho` sem login e sem banco real. | `src/tests/e2e/cart.spec.ts` | F5-060 | test | - | Pagina carrega estado vazio e/ou fallback explicito. | medio | 🟢 | `[X]` |
| F5-072 | E2E adicionar produto valido | Cobrir adicionar produto publicado vigente com estoque em fallback/dev. | `src/tests/e2e/cart.spec.ts` | F5-071 | test | - | Item aparece e subtotal e exibido. | medio | 🟢 | `[X]` |
| F5-073 | E2E bloquear indisponivel | Cobrir tentativa de adicionar produto indisponivel. | `src/tests/e2e/cart.spec.ts` | F5-072 | test | - | Erro controlado aparece e carrinho nao adiciona item. | medio | 🟢 | `[X]` |
| F5-074 | E2E quantidade acima do estoque | Cobrir atualização acima de estoque disponivel. | `src/tests/e2e/cart.spec.ts` | F5-073 | test | - | UI mostra erro e preserva/ajusta estado controlado. | medio | 🟢 | `[X]` |
| F5-075 | E2E usuario autenticado | Cobrir usuario autenticado visualizando carrinho protegido por ownership. | `src/tests/e2e/cart-auth.spec.ts` | F5-071 | test | `[//]` | Carrinho autenticado carrega sem vazar dados de outro usuario. | alto | 🟢 | `[X]` |
| F5-076 | E2E admin manager sem bypass | Cobrir que role admin/manager nao ignora estoque/disponibilidade no carrinho. | `src/tests/e2e/cart-auth.spec.ts` | F5-075 | test | - | Admin/manager recebem mesmas restricoes de compra. | alto | 🟢 | `[X]` |
| F5-077 | E2E merge ao login | Cobrir carrinho anonimo seguido de login e merge controlado. | `src/tests/e2e/cart-auth.spec.ts` | F5-076 | test | - | Carrinho autenticado final soma/limita sem duplicar item. | alto | 🟢 | `[X]` |
| F5-078 | E2E checkout fora de escopo | Confirmar que CTA de checkout nao cria pedido/pagamento/frete/cupom. | `src/tests/e2e/cart.spec.ts` | F5-074 | test | - | Nenhum fluxo real fora de escopo e executado. | alto | 🟢 | `[X]` |

## Fase 12, Documentacao

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-079 | Criar docs funcionais de carrinho | Documentar escopo, regras, fallback e fora de escopo da Fase 5. | `docs/features/cart.md` | F5-060 | docs | `[//]` | Doc deixa claro que checkout/frete/cupom/pedido/reserva ficam fora. | baixo | 🟢 | `[X]` |
| F5-080 | Criar arquitetura de carrinho | Documentar guest token, repository/service/actions, merge e ownership. | `docs/architecture/cart.md` | F5-060 | docs | `[//]` | Arquitetura nao expõe token ou secrets e explica fallback. | medio | 🟢 | `[X]` |
| F5-081 | Atualizar docs de database | Registrar delta local de `carts`/`cart_items`, indices e migration local nao aplicada. | `docs/architecture/database.md` | F5-013 | docs | `[//]` | Documento diferencia migration local de aplicacao real. | medio | 🟢 | `[X]` |
| F5-082 | Atualizar docs de catalogo | Registrar que produto compravel alimenta carrinho e bloqueia indisponiveis. | `docs/features/catalog-products-images.md` | F5-060 | docs | `[//]` | Regras de produto publico continuam consistentes. | baixo | 🟢 | `[X]` |
| F5-083 | Atualizar docs de auth policies | Registrar ownership de carrinho e merge no login. | `docs/features/auth-policies.md` | F5-046 | docs | `[//]` | Auth docs explicam impacto sem criar privilegio especial admin/manager. | baixo | 🟢 | `[X]` |

## Fase 13, Validacoes finais e commit local opcional

| ID | Titulo | Objetivo | Arquivos provaveis | Dependências | Tipo | Paralelismo | Criterio de aceite | Risco | Confidencia | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| F5-084 | Rodar lint | Executar `pnpm lint` apos implementacao. | n/a | F5-061, F5-062, F5-063, F5-064, F5-065, F5-066, F5-067, F5-068, F5-069, F5-070, F5-079, F5-080, F5-081, F5-082, F5-083 | validation | - | Lint passa sem warnings. | medio | 🟢 | `[X]` |
| F5-085 | Rodar typecheck | Executar `pnpm typecheck`. | n/a | F5-084 | validation | - | Typecheck passa sem credenciais reais. | alto | 🟢 | `[X]` |
| F5-086 | Rodar testes unitarios | Executar `pnpm test`. | n/a | F5-085 | validation | - | Unit tests passam sem banco real obrigatorio. | alto | 🟢 | `[X]` |
| F5-087 | Rodar build | Executar `pnpm build`. | n/a | F5-086 | validation | - | Build passa sem `DATABASE_URL` real. | alto | 🟢 | `[X]` |
| F5-088 | Rodar e2e | Executar `pnpm test:e2e`. | n/a | F5-087, F5-071, F5-072, F5-073, F5-074, F5-075, F5-076, F5-077, F5-078 | validation | - | E2E passa em fallback/dev sem banco real. | alto | 🟢 | `[X]` |
| F5-089 | Revisar diff final | Conferir que nao houve checkout, pagamento, frete, cupom, pedido, reserva de estoque, secrets, deploy ou push. | n/a | F5-088 | validation | - | Diff final respeita escopo e guardrails. | alto | 🟢 | `[X]` |
| F5-090 | Commit local opcional | Criar commit local somente com autorizacao humana e validacoes verdes. | n/a | F5-089 | validation | - | Commit local e opcional; nao faz push. | baixo | 🟢 | `[X]` |

## Dependencias criticas

- F5-006 a F5-013 bloqueiam repository real, migration local e invariantes de carrinho ativo.
- F5-014 a F5-019 bloqueiam qualquer action para visitante, porque definem `guestCartToken` e actor.
- F5-020 a F5-029 bloqueiam toda persistencia, fallback e erro real com banco.
- F5-030 a F5-034 bloqueiam adicionar/atualizar item, pois validam produto e estoque.
- F5-035 a F5-039 bloqueiam carrinho autenticado e ownership.
- F5-040 a F5-046 bloqueiam merge no login.
- F5-047 a F5-052 bloqueiam a UI.
- F5-084 a F5-089 bloqueiam qualquer commit local opcional.

## Riscos principais

- Migration local alterar schema fora de `carts`/`cart_items` ou ser aplicada em banco real sem autorizacao.
- Cookie `guestCartToken` vazar em logs, testes ou UI.
- Merge ao login duplicar item ou somar duas vezes em retentativa.
- Fallback sem banco parecer persistente.
- Produto `draft`, `inactive`, futuro ou sem estoque entrar por action direta.
- Admin/manager ganhar bypass indevido de estoque/disponibilidade.
- Erro real com `DATABASE_URL` ser mascarado como fallback.
- Scope creep para checkout, frete, cupom, pagamento, pedido ou reserva/baixa de estoque.

## Notas de execucao

- Nao executar `db:migrate`, `drizzle-kit migrate` ou conexao com banco real sem validacao humana explicita.
- Nao copiar `.env` do legado e nao expor `DATABASE_URL`, cookies, tokens, senhas ou secrets.
- Nao modificar o Laravel legado.
- Nao incluir push, deploy, dominio, checkout, pagamento, frete, cupom, pedido ou reserva de estoque nesta fase.
- Tarefas de documentacao podem ser paralelizaveis apenas depois que os contratos implementados estiverem estaveis.

## Historico de alteracoes

| Data | Alteracao | Autor |
|---|---|---|
| 2026-06-08 | Versao inicial gerada por `/reversa-to-do` | reversa |
